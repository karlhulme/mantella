import {
  OperationContext, OperationDefinition, OperationRecord,
  OperationRejectedProps, OperationResolvedProps
} from 'mantella-interfaces'
import { MantellaClientError } from '../errors'
import { logResult } from './logResult'
import { validateOperationInput } from './validateOperationInput'
import { executeStepFunc } from './executeStepFunc'

interface RunOperationProps {
  operation: OperationDefinition<unknown, unknown>
  onResolveOperation: (props: OperationResolvedProps) => void,
  onRejectOperation: (props: OperationRejectedProps) => void,
  onSaveOperation: (record: OperationRecord) => Promise<void>,
  record: OperationRecord,
  requestId?: string
  resolveStep?: string
  services: unknown
}

export async function runOperation (props: RunOperationProps): Promise<void> {
  // Init the timers, resolved status and determine if interim saving is required..
  const timerStart = process.hrtime()
  let hasResolved = false
  const isInterimSavingRequired = props.requestId || props.operation.saveProgress

  // If this operation is going to be saved after each step
  // then also save the inputs before we begin.
  if (isInterimSavingRequired) {
    await props.onSaveOperation(props.record)
  }

  // Create the context that holds all the data associated with
  // an operation while it executes.
  const context: OperationContext<unknown, unknown> = {
    input: props.record.input,
    log: message => props.record.logEntries.push({ message, dateTime: new Date().toISOString() }),
    requestId: props.record.id,
    step: async (stepName, func, retryableOptions) => {
      const data = await executeStepFunc({
        stepDataEntries: props.record.stepDataEntries,
        retryableOptions: { ...retryableOptions },
        stepFunc: func,
        stepName
      })

      if (isInterimSavingRequired) {
        await props.onSaveOperation(props.record)
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
    // Validate the input.
    validateOperationInput(props.record.input, props.operation.inputValidator)

    // Run the operation to completion, which may include resolving the client request
    // before the operation has completed running.
    await props.operation.func(context)
    props.record.status = 'completed'

    // If the client did not request the data be returned after a
    // particular step then resolve once the operation is complete.
    if (!hasResolved) {
      props.onResolveOperation({ isComplete: true })
    }
  } catch (err) {
    const isClientError = err instanceof MantellaClientError
    props.record.status = isClientError ? 'rejected' : 'failed'
    props.onRejectOperation({ requestId: props.record.id, message: err.message, isClientError })
    props.record.error = err
  }

  // Determine the time spent processing the operation.
  const duration = process.hrtime(timerStart)
  props.record.durationInMs += ((duration[0] * 1000) + Math.trunc(duration[1] / 1000000))

  // Save the final record if we're saving progress of it an error occurred.
  if (isInterimSavingRequired || props.record.error) {
    await props.onSaveOperation(props.record)
  }

  // Print the success or failure to the console.
  logResult(props.record)
}
