/**
 * Defines the properties passed from the Mantella engine to a
 * web server when an operation request is rejected. 
 */
export interface OperationRequestRejectedProps {
  /**
   * The id of the operation that has rejected.
   */
  operationId: string

  /**
   * The message associated with the rejection.
   */
  message: string

  /**
   * True if the rejection was caused by the client, suggesting
   * the input data was invalid or the state of the application
   * is such that it cannot be actioned.  If this value is false
   * then something went wrong inside the operation definition.
   */
  isClientError: boolean
}
