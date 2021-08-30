/**
 * Represents a client that has been authenticated.
 */
export interface AuthenticatedClient {
  /**
   * The name of the client.
   */
  name: string

  /**
   * The array of operations that this client can start.  A value of true indicates
   * all operations can be started.
   */
  operations: string[]|boolean

  /**
   * A value that indicates if the client can perform management functions such
   * as retrieving, resuming and deleting operations.
   */
  manage?: boolean
}
