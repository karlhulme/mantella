import { OperationRecord } from '../op'

/**
 * Defines the result of calling the LoadOperationFromDatabase function.
 */
export interface LoadOperationFromDatabaseResult {
  /**
   * The record that was loaded.
   */
  record?: OperationRecord
}
