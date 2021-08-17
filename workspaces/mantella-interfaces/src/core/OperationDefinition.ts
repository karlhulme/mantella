import { ArrayOfErrorTypes } from 'piggle'
import { OperationFunction } from './OperationFunction'

export interface OperationDefinition<Input, Services> {
  inputValidator: (input: unknown) => Input
  transientErrorTypes?: ArrayOfErrorTypes
  saveProgress?: boolean
  func: OperationFunction<Input, Services>
}
