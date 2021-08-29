import { OperationContextLogProps } from './OperationContextLogProps'
import { OperationContextStepProps } from './OperationContextStepProps'

/**
 * Represents the context that is passed to an operation as it executes.
 */
export interface OperationContext<Input, Services> {
  /**
   * The input originally supplied to the operation.
   */
  input: Input

  /**
   * A function for logging information.
   */
  log: (props: OperationContextLogProps) => void

  /**
   * A function for executing a step in an atomic, retryable manner.
   */
  step: <T>(props: OperationContextStepProps<T>) => Promise<T>

  /**
   * The id assigned to the operation.
   */
  requestId: string

  /**
   * The services supplied to the operation by the host application.
   */
  services: Services
}
