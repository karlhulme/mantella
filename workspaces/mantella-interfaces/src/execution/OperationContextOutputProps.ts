/**
 * Represents the properties of the output function that is supplied
 * to an operation via the context object.
 */
 export interface OperationContextOutputProps<T> {
  /**
   * The output value.
   */
  value: T|null
}
