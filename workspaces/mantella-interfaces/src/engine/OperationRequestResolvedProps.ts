/**
 * Defines the properties passed from the Mantella engine to a
 * web server when an operation request is resolved. 
 */
export interface OperationRequestResolvedProps {
  /**
   * The id of the operation that resolved.
   */
  operationId: string

  /**
   * True if the operation ran to completion.  This value will
   * be false if the operation was still running when the
   * request was resolved.
   */
  isComplete: boolean
}
