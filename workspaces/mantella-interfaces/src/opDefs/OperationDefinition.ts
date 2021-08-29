import { OperationFunction } from './OperationFunction'

/**
 * Defines an operation.
 */
export interface OperationDefinition<Input, Services> {
  /**
   * The name of the operation.
   */
  name: string

  /**
   * A function that can validate the operation input.
   */
  inputValidator: (input: unknown) => void

  /**
   * True if operations should be saved when the input is received
   * and after each completed step.
   */
  saveProgress?: boolean

  /**
   * The function that defines the steps of the operation.
   */
  func: OperationFunction<Input, Services>
}
