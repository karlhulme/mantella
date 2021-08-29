/**
 * Represents the type of resource represented by a URL.
 */
export enum RestResourceType {
  /**
   * The url is not recognised.
   */
  NO_MATCH,

  /**
   * The root of the service.
   */
  ROOT,

  /**
   * The url is the end-point for creating new operations.
   */
  CONSTRUCTOR,

  /**
   * The url identifies a specific operation.
   */
  OPERATION,

  /**
   * The url is the end-point for resuming operations. 
   */
  OPERATION_RESUME
}
