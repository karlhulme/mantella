import { OperationStatus } from '../op'

/**
 * Defines the properties that are provided by Mantella to the
 * sendResponse delegate function of the ResumeOperationProps object.
 */
export interface ResumeOperationSendResponseProps {
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
   * The details of the last error experienced by the operation.
   */
  error: string|null

  /**
   * The name of the last completed step, or the caret/hat symbol
   * to indicate the input validation has completed but no processing
   * has begun.
   */
  lastCompletedStep: string
}
