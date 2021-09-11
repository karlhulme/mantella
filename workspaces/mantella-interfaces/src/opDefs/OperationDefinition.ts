import { OperationFunction } from './OperationFunction'
import { OperationSaveStrategy } from './OperationSaveStrategy'

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
   * and after each completed step.  If false, then progress is
   * only saved if an error occurs.
   */
  saveModel: OperationSaveStrategy

  /**
   * The function that defines the steps of the operation.
   */
  func: OperationFunction<Input, Services>
}
