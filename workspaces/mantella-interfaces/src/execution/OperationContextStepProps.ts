/**
 * Represents the properties of the step function that is supplied
 * to an operation via the context object.
 */
export interface OperationContextStepProps<T> {
  /**
   * The name of the step being executed.
   */
  stepName: string

  /**
   * The function that typically mutates system state in some way.
   */
  func: () => Promise<T>

  /**
   * An optional retry strategy for this step.
   */
  retryIntervalsInMilliseconds?: number[]

  /**
   * An optional function for determining what the transient errors
   * for this step are.
   */
  isErrorTransient?: (err: Error) => boolean
}
