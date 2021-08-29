/**
 * Represents a log entry for a running operation.
 */
export interface OperationLogEntry {
  /**
   * The contents of the log entry.
   */
  message: string

  /**
   * The date and time of the entry in ISO format.
   */
  dateTime: string
}
