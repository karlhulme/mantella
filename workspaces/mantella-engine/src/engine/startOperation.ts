import { v4 } from 'uuid'
import { retryable } from 'piggle'
import {
  OperationContext, OperationDefinition, OperationRecord,
  OperationRejectedProps, OperationResolvedProps
} from 'mantella-interfaces'
import { MantellaClientError } from '../errors'
import { logResult } from './logResult'
import { validateOperationInput } from './validateOperationInput'

interface StartOperationProps {
  input: unknown
  operationName: string
  operation: OperationDefinition<unknown, unknown>
  onLoadOperation: (id: string) => Promise<OperationRecord|null>,
  onResolveOperation: (props: OperationResolvedProps) => void,
  onRejectOperation: (props: OperationRejectedProps) => void,
  onSaveOperation: (record: OperationRecord) => Promise<void>,
  requestId?: string
  resolveStep?: string
  services: unknown
}

export async function startOperation (props: StartOperationProps): Promise<void> {
  // Start the operation timer.
  const timerStart = process.hrtime()

  if (props.requestId) {
    const preExistingOperation = await props.onLoadOperation(props.requestId)

    if (preExistingOperation) {
      props.onRejectOperation({ requestId: props.requestId, message: 'Operation already exists with given id.', isClientError: true })
      return
    }
  }

  // Create the record that will be updated and periodically saved
  // as the operation progresses.
  const record: OperationRecord = {
    id: props.requestId || v4(),
    operationName: props.operationName,
    input: props.input,
    started: new Date(),
    finished: null,
    logEntries: [],
    stepDataEntries: [],
    status: 'running',
    durationInMs: -1,
    error: null
  }

  let hasResolved = false
  const isInterimSavingRequired = props.requestId || props.operation.saveProgress

  // If this operation is going to be saved after each step
  // then also save the inputs before we begin.
  if (isInterimSavingRequired) {
    await props.onSaveOperation(record)
  }

  // Create the context that holds all the data associated with
  // an operation while it executes.
  const context: OperationContext<unknown, unknown> = {
    input: props.input,
    log: message => record.logEntries.push({ message, dateTime: new Date() }),
    requestId: record.id,
    step: async (stepName, func, retryableOptions) => {
      const data = await retryable(func, retryableOptions)

      record.stepDataEntries.push({ name: stepName, data })

      if (isInterimSavingRequired) {
        await props.onSaveOperation(record)
      }

      if (stepName === props.resolveStep) {
        hasResolved = true
        props.onResolveOperation({ isComplete: false })
      }

      return data
    },
    services: props.services
  }

  try {
    // Validate the input and run the operation to completion.
    // This includes delivering any final payload to the client.
    validateOperationInput(props.input, props.operation.inputValidator)
    await props.operation.func(context)
    record.status = 'completed'

    // If the client did not request the data be returned after a
    // particular step then resolve once the operation is complete.
    if (!hasResolved) {
      props.onResolveOperation({ isComplete: true })
    }
  } catch (err) {
    const isClientError = err instanceof MantellaClientError
    record.status = isClientError ? 'rejected' : 'failed'
    props.onRejectOperation({ requestId: record.id, message: err.message, isClientError })
    record.error = err
  }

  const duration = process.hrtime(timerStart)
  record.durationInMs = ((duration[0] * 1000) + Math.trunc(duration[1] / 1000000))

  if (isInterimSavingRequired || record.error) {
    await props.onSaveOperation(record)
  }

  logResult(props.operationName, record)
}
