import { OperationRecord } from './OperationRecord'

/**
 * Defines the result of calling the SaveOperation function.
 */
export interface SaveOperationResult {
  /**
   * The record that was loaded.
   */
  record?: OperationRecord
}
