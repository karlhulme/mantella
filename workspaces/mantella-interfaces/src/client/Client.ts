/**
 * Represents a client that is permitted to execute operations on the mantella engine.
 */
 export interface Client {
  /**
   * The name of the client.
   */
  name: string

  /**
   * The api keys assigned to the client.  Each key can be a string literal
   * or it can be an environment variable by prefixing it with a dollar ($) sign.
   */
  apiKeys: string[]

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
