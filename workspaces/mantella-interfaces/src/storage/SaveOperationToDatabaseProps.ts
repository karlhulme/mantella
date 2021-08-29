import { OperationRecord } from '../op'

/**
 * Defines the properties passed to the save operation function.
 */
export interface SaveOperationToDatabaseProps {
  /**
   * The operation record to save.
   */
  record: OperationRecord
}
