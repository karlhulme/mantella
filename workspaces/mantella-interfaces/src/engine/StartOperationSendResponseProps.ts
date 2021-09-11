import { OperationStatus } from '../op'

/**
 * Defines the properties that are provided by Mantella to the
 * sendResponse delegate function of the StartOperationProps object.
 */
export interface StartOperationSendResponseProps {
  /**
   * The id assigned to the operation.
   * Please note that this id can only be used to retrieve the operation
   * if the operation is saved to the database, such as would happen
   * if the operation did not complete successfully.  A successful operation
   * may never be saved to the database.
   */
  operationId: string

  /**
   * The last status of the operation.  If a resolveStep was specified
   * then the operation may still be running.
   * A status of rejected indicates a client-centric error.
   * A status of failed indicates a server-centric or operation definition error.
   * A status of interrupted indicates the server was shutting down.
   * A status of completed indicates the operation has completed successfully.
   */
  operationStatus: OperationStatus

  /**
   * The details of any error attached to the operation.
   */
  operationError: string|null

  /**
   * The details of any output data attached to the operation.
   */
  operationOutput: Record<string, unknown>|null

  /**
   * The name of the last completed step, or the caret/hat symbol
   * to indicate the input validation has completed but no processing
   * has begun.
   */
  lastCompletedStep: string
}
