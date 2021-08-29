import { OperationContext, OperationDefinition, OperationRecord } from 'mantella-interfaces'
import { validateOperationInput } from './validateOperationInput'
import { executeStep } from './executeStep'
import { determineOperationStatusFromError } from './determineOperationStatusFromError'
import { RESOLVE_IMMEDIATELY } from '../consts'

/**
 * Defines the properties required to execute an operation.
 */
interface ExecuteOperationProps {
  /**
   * A function that indicates if processing can continue.
   */
  canContinueProcessing: () => boolean

  /**
   * The retry interval to use for step retries if the step
   * does not provide a strategy.
   */
  defaultRetryIntervalsInMilliseconds: number[]

  /**
   * The operation definition that defines the operation to be run.
   */
  operation: OperationDefinition<unknown, unknown>

  /**
   * A function that can be called when it is time to send a
   * response to the client.
   */
  sendResponse: () => void,

  /**
   * A function that can be called when it is time to save
   * the current state of the operation.
   */
  saveOperation: () => Promise<void>,

  /**
   * The operation record that will be mutated by the operation
   * as it is executed.
   */
  record: OperationRecord,

  /**
   * True if the operation should be saved at each stage.
   */
  saveProgress: boolean

  /**
   * The name of the step that should be completed when the
   * sendResponse function should be invoked.
   */
  resolveStep: string|null

  /**
   * The services object that should be provided to the operation.
   */
  services: unknown
}

/**
 * Executes an operation.
 * @param props A property bag.
 */
export async function executeOperation (props: ExecuteOperationProps): Promise<void> {
  // Init the timers, resolved status and determine if saving is required.
  const timerStart = process.hrtime()
  let hasSentResponse = false
  const isSavingRequired = Boolean(props.saveProgress || props.operation.saveProgress)

  // Put the record into the running state and discard any error from the previous execution.
  props.record.status = 'running'
  props.record.error = null

  // If this operation is going to be saved after each step
  // then also save the inputs before we begin.
  if (isSavingRequired) {
    await props.saveOperation()
  }

  // Create the context that holds all the data associated with
  // an operation while it executes.
  const context: OperationContext<unknown, unknown> = {
    input: props.record.input,
    log: ({ message }) => props.record.logEntries.push({ message, dateTime: new Date().toISOString() }),
    requestId: props.record.id,
    step: async ({ func, stepName, isErrorTransient, retryIntervalsInMilliseconds }) => {
      return await executeStep({
        stepDataEntries: props.record.stepDataEntries,
        resolveStepName: props.resolveStep,
        stepName,
        func,
        isErrorTransient,
        retryIntervalsInMilliseconds: retryIntervalsInMilliseconds || props.defaultRetryIntervalsInMilliseconds,
        canContinueProcessing: props.canContinueProcessing,
        sendResponse: () => { hasSentResponse = true; props.sendResponse(); },
        saveOperation: async () => props.saveOperation(),
        saveProgress: isSavingRequired
      })
    },
    services: props.services
  }

  try {
    // Validate the input.
    validateOperationInput(props.record.input, props.operation.inputValidator)

    // Check to see if we need to return immediately
    if (props.resolveStep === RESOLVE_IMMEDIATELY) {
      hasSentResponse = true
      props.sendResponse()
    }

    // Run the operation to completion, which may include resolving the client request
    // before the operation has completed running.
    await props.operation.func(context)
    props.record.status = 'completed'

  } catch (err) {
    props.record.status = determineOperationStatusFromError(err)
    props.record.error = err.toString()
  }

  // Determine the time spent processing the operation.
  props.record.finished = new Date().toISOString()
  const duration = process.hrtime(timerStart)
  props.record.durationInMs += ((duration[0] * 1000) + Math.trunc(duration[1] / 1000000))

  // If the client did not request the data be returned after a
  // particular step then return a response now.
  if (!hasSentResponse) {
    props.sendResponse()
  }

  // Save the final record if we're saving progress or if an error occurred.
  // This will save processes that fail due to invalid input.
  if (isSavingRequired || props.record.error) {
    await props.saveOperation()
  }
}
