import { OperationDefinition, OperationRecord, OperationRejectedProps, OperationResolvedProps } from 'mantella-interfaces'
import { startOperation } from './startOperation'

export interface MantellaConstructorProps<Services> {
  operations?: Record<string, OperationDefinition<unknown, unknown>>
  onLoadOperation?: (id: string) => Promise<OperationRecord|null>
  onSaveOperation?: (record: OperationRecord) => Promise<void>
  services?: Services
}

export interface StartOperationProps {
  input?: unknown
  operationName?: string
  requestId?: string
  resolveStep?: string
  onResolveOperation?: (props: OperationResolvedProps) => void
  onRejectOperation?: (props: OperationRejectedProps) => void
}

export class Mantella<Services> {
  private operations: Record<string, OperationDefinition<unknown, unknown>>
  private services: Services
  private onLoadOperation: (requestId: string) => Promise<OperationRecord|null>
  private onSaveOperation: (record: OperationRecord) => Promise<void>

  /**
   * Creates a new Mantella engine based on a set of services and
   * a set of callbacks for retrieving and saving operations to
   * a database.
   * @param props The constructor properties.
   */
  constructor (props: MantellaConstructorProps<Services>) {
    if (!props.operations) {
      throw new Error('You must supply an operations property.')
    }

    if (!props.services) {
      throw new Error('You must supply a services property.')
    }

    if (!props.onLoadOperation) {
      throw new Error('You must supply an onLoadOperation function.')
    }

    if (!props.onSaveOperation) {
      throw new Error('You must supply an onSaveOperation function.')
    }

    this.operations = props.operations
    this.services = props.services
    this.onLoadOperation = props.onLoadOperation
    this.onSaveOperation = props.onSaveOperation
  }

  async startOperation (props: StartOperationProps): Promise<void> {
    if (!props.operationName) {
      throw new Error('You must supply an operationN name.')
    }

    const operation = this.operations[props.operationName]

    if (!operation) {
      throw new Error(`Operation '${props.operationName}' was not recognised.`)
    }

    if (!props.onResolveOperation) {
      throw new Error('You must supply an onResolveOperation function.')
    }

    if (!props.onRejectOperation) {
      throw new Error('You must supply an onRejectOperation function.')
    }

    await startOperation({
      input: props.input || null,
      operationName: props.operationName,
      operation,
      onLoadOperation: this.onLoadOperation,
      onResolveOperation: props.onResolveOperation,
      onRejectOperation: props.onRejectOperation,
      onSaveOperation: this.onSaveOperation,
      requestId: props.requestId,
      resolveStep: props.resolveStep,
      services: this.services
    })
  }
}
