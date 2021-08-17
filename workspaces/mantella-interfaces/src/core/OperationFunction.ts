import { OperationContext } from './OperationContext'

export type OperationFunction<Input, Services> = (context: OperationContext<Input, Services>) => Promise<void>
