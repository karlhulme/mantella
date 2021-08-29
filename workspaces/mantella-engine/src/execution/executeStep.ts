import { OperationStepDataEntry } from 'mantella-interfaces'
import { executeStepFunc } from './executeStepFunc'

/**
 * Defines the properties required to execute a single
 * step of an operation.
 */
interface ExecuteStepProps<T> {
  /**
   * A parameterless function that returns data to be stored
   * at the conclusion of the step.
   */
  func: () => Promise<T>

  /**
   * A function that indicates if an error is transitory
   * or fatal.
   */
  isErrorTransient?: (err: Error) => boolean

  /**
   * A function that indicates if processing can continue.
   */
  canContinueProcessing: () => boolean

  /**
   * The retry strategy for the step that is used in the
   * event of transitory errors.
   */
  retryIntervalsInMilliseconds: number[]

  /**
   * A function that can be called if it's time to send
   * a response to the client.
   */
  sendResponse: () => void

  /**
   * The name of the step that must complete before a response
   * can be sent to the client.
   */
  resolveStepName: string|null

  /**
   * A function that can be called when the operation can be saved.
   */
  saveOperation: () => Promise<void>

  /**
   * A value that indicates if the progress of the operation is being saved.
   */
  saveProgress: boolean

  /**
   * The step data entries that have been recorded so far.
   */
  stepDataEntries: OperationStepDataEntry[]

  /**
   * The name of the step being executed.
   */
  stepName: string
}

/**
 * Executes a single step in an operation.
 * @param props A property bag.
 */
export async function executeStep<T> (props: ExecuteStepProps<T>): Promise<T> {
  const data = await executeStepFunc({
    stepDataEntries: props.stepDataEntries,
    retryableOptions: {
      isErrorTransient: props.isErrorTransient,
      retryIntervalsInMilliseconds: props.retryIntervalsInMilliseconds,
      canContinueProcessing: props.canContinueProcessing
    },
    stepFunc: props.func,
    stepName: props.stepName
  })

  if (props.saveProgress) {
    await props.saveOperation()
  }

  if (props.stepName === props.resolveStepName) {
    props.sendResponse()
  }

  return data
}
