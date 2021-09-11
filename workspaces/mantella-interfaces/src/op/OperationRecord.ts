import { OperationStepDataEntry } from './OperationStepDataEntry'
import { OperationLogEntry } from './OperationLogEntry'
import { OperationStatus } from './OperationStatus'

/**
 * Represents an operation.  This is the format of an operation
 * that has been saved to a datbase. 
 */
export interface OperationRecord {
  /**
   * The id of the operation.
   */
  id: string

  /**
   * The name of the operation definition that governs that steps
   * that need to be run.
   */
  operationName: string

  /**
   * The payload that was passed to the operation when it started.
   */
  input: unknown

  /**
   * The optional output that is being produced by the operation.
   */
  output: Record<string, unknown>|null

  /**
   * The ISO date and time when the operation started.
   */
  started: string

  /**
   * The ISO date and time when the operation last stopped running.
   */
  finished: string|null

  /**
   * An array of log entries generated as the operation ran.
   */
  logEntries: OperationLogEntry[]

  /**
   * An array of step data generated as the operation ran.
   */
  stepDataEntries: OperationStepDataEntry[]

  /**
   * The status of the operation.
   */
  status: OperationStatus

  /**
   * The duration in milliseconds that the operation has been active.
   * including any resumes that have taken place.
   */
  durationInMs: number

  /**
   * The last error experienced which caused the operation to stop.
   */
  error: string|null
}
