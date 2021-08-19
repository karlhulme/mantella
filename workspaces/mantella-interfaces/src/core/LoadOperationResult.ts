import { OperationRecord } from './OperationRecord'

/**
 * Defines the result of calling the LoadOperation function.
 */
export interface LoadOperationResult {
  /**
   * The record that was loaded.
   */
  record?: OperationRecord
}
