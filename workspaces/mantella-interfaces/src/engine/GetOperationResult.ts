import { OperationRecord } from '../op'

/**
 * Defines the response after requesting the details of an operation.
 */
 export interface GetOperationResult {
  /**
   * An operation record.
   */
  record: OperationRecord
}
