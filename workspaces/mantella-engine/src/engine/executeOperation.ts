import {
  OperationContext, OperationDefinition, OperationRecord,
  OperationRejectedProps, OperationResolvedProps
} from 'mantella-interfaces'
import { MantellaClientError } from '../errors'
import { validateOperationInput } from './validateOperationInput'
import { executeStep } from './executeStep'

interface RunOperationProps {
  canContinueProcessing: () => boolean
  defaultRetryIntervalsInMilliseconds: number[]
  logResult: (record: OperationRecord) => void
  operation: OperationDefinition<unknown, unknown>
  resolveOperation: (props: OperationResolvedProps) => void,
  rejectOperation: (props: OperationRejectedProps) => void,
  saveOperation: (record: OperationRecord) => Promise<void>,
  record: OperationRecord,
  requestIdSupplied: boolean
  resolveStep: string|null
  services: unknown
}

export async function executeOperation (props: RunOperationProps): Promise<void> {
  // Init the timers, resolved status and determine if interim saving is required..
  const timerStart = process.hrtime()
  let hasResolved = false
  const isInterimSavingRequired = Boolean(props.requestIdSupplied || props.operation.saveProgress)

  // If this operation is going to be saved after each step
  // then also save the inputs before we begin.
  if (isInterimSavingRequired) {
    await props.saveOperation(props.record)
  }

  // Create the context that holds all the data associated with
  // an operation while it executes.
  const context: OperationContext<unknown, unknown> = {
    input: props.record.input,
    log: ({ message }) => props.record.logEntries.push({ message, dateTime: new Date().toISOString() }),
    requestId: props.record.id,
    step: async ({ func, stepName, isErrorTransient, retryIntervalsInMilliseconds }) => executeStep({
      stepDataEntries: props.record.stepDataEntries,
      resolveStepName: props.resolveStep,
      stepName,
      func,
      isErrorTransient,
      retryIntervalsInMilliseconds: retryIntervalsInMilliseconds || props.defaultRetryIntervalsInMilliseconds,
      canContinueProcessing: props.canContinueProcessing,
      resolveOp: () => { props.resolveOperation({ isComplete: false }); hasResolved = true },
      saveOp: async () => props.saveOperation(props.record),
      saveStepResult: isInterimSavingRequired
    }),
    services: props.services
  }

  try {
    // Validate the input.
    validateOperationInput(props.record.input, props.operation.inputValidator)

    // Run the operation to completion, which may include resolving the client request
    // before the operation has completed running.
    await props.operation.func(context)
    props.record.status = 'completed'

    // If the client did not request the data be returned after a
    // particular step then resolve once the operation is complete.
    if (!hasResolved) {
      props.resolveOperation({ isComplete: true })
    }
  } catch (err) {
    const isClientError = err instanceof MantellaClientError
    props.record.status = isClientError ? 'rejected' : 'failed'
    props.rejectOperation({ requestId: props.record.id, message: err.message, isClientError })
    props.record.error = err
  }

  // Determine the time spent processing the operation.
  const duration = process.hrtime(timerStart)
  props.record.durationInMs += ((duration[0] * 1000) + Math.trunc(duration[1] / 1000000))

  // Save the final record if we're saving progress or if an error occurred.
  // This will save processes that fail due to invalid input.
  if (isInterimSavingRequired || props.record.error) {
    await props.saveOperation(props.record)
  }

  // Print the success or failure to the console.
  props.logResult(props.record)
}
