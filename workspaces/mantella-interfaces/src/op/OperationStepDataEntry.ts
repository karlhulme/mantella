/**
 * Defines the data that was saved by an operation step.
 */
export interface OperationStepDataEntry {
  /**
   * The name of the step that generated the data.
   */
  name: string

  /**
   * The data itself.
   */
  data: unknown
}
