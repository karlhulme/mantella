import { OperationContextLogProps } from './OperationContextLogProps'
import { OperationContextOutputProps } from './OperationContextOutputProps'
import { OperationContextStepProps } from './OperationContextStepProps'

/**
 * Represents the context that is passed to an operation as it executes.
 */
export interface OperationContext<Input, Services, Output> {
  /**
   * The input originally supplied to the operation.
   */
  input: Input

  /**
   * A function for logging information.
   */
  log: (props: OperationContextLogProps) => void

  /**
   * A function for delaying execution by a specified number of milliseconds.
   */
  pause: (milliseconds: number) => Promise<void>

  /**
   * The id assigned to the operation.
   */
  requestId: string

   /**
    * The services supplied to the operation by the host application.
    */
  services: Services

  /**
   * A function for executing a step in an atomic, retryable manner.
   */
  step: <T>(props: OperationContextStepProps<T>) => Promise<T>

  /**
   * A function for specifying the output of the operation.
   */
  output: (props: OperationContextOutputProps<Output>) => void
}
