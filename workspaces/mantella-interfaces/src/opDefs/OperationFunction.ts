import { OperationContext } from '../execution'

/**
 * A function that defines an operation as a series of steps.
 * This function is passed a context which allows it to access the
 * operation input, interact with the host and invoke actions on
 * services.
 */
export type OperationFunction<Input, Services, Output> = (context: OperationContext<Input, Services, Output>) => Promise<void>
