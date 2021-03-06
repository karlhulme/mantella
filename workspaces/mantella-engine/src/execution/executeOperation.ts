import { pause } from 'piggle'
import { OperationContext, OperationDefinition, OperationRecord } from 'mantella-interfaces'
import { validateOperationInput } from './validateOperationInput'
import { executeStep } from './executeStep'
import { determineOperationStatusFromError } from './determineOperationStatusFromError'
import { RESOLVE_IMMEDIATELY } from '../consts'
import { OperationSaveStrategy } from 'mantella-interfaces/types/opDefs/OperationSaveStrategy'

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
  operation: OperationDefinition<unknown, unknown, unknown>

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

  // Determine the save strategy, which may be overriden by the client
  // supplying an operationg id.
  const saveModel: OperationSaveStrategy = props.saveProgress
    ? 'always'
    : props.operation.saveModel

  // Put the record into the running state and discard any error from the previous execution.
  props.record.status = 'running'
  props.record.error = null

  // If this operation is going to be saved after each step
  // then also save the inputs before we begin.
  if (saveModel === 'always') {
    await props.saveOperation()
  }

  // Create the context that holds all the data associated with
  // an operation while it executes.
  const context: OperationContext<unknown, unknown, unknown> = {
    input: props.record.input,
    log: ({ message }) => props.record.logEntries.push({ message, dateTime: new Date().toISOString() }),
    pause: milliseconds => pause(milliseconds),
    requestId: props.record.id,
    services: props.services,
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
        saveProgress: saveModel === 'always'
      })
    },
    output: ({ value }) => {
      props.record.output = value as Record<string, unknown>|null

      if (!props.resolveStep && !hasSentResponse) {
        hasSentResponse = true
        props.sendResponse()
      }
    }
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
    const error = err as Error
    props.record.status = determineOperationStatusFromError(error)
    props.record.error = props.record.status === 'rejected'
      ? error.message
      : `${error.message}\n${error.stack}`
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

  // Determine if we need to make a final save, which depends on both the
  // saving strategy and also how the operation ended.
  const isFinalSaveRequired = saveModel === 'always' ||
    props.record.status === 'interrupted' ||
    (saveModel === 'error' && props.record.status === 'failed') ||
    (saveModel === 'rejection' && ['failed', 'rejected'].includes(props.record.status))

  if (isFinalSaveRequired) {
    await props.saveOperation()
  }
}
