import {
  LoadOperationProps, LoadOperationResult, SaveOperationProps, SaveOperationResult,
  OperationDefinition, OperationRejectedProps, OperationResolvedProps
} from 'mantella-interfaces'
import { v4 } from 'uuid'
import { createNewOperationContext } from './createNewOperationContext'
import { runOperation } from './runOperation'

export interface MantellaConstructorProps<Services> {
  operations?: OperationDefinition<unknown, unknown>[]
  loadOperation?: (props: LoadOperationProps) => Promise<LoadOperationResult>
  saveOperation?: (props: SaveOperationProps) => Promise<SaveOperationResult>
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

export interface ResumeOperationProps {
  requestId?: string
  resolveStep?: string
  onResolveOperation?: (props: OperationResolvedProps) => void
  onRejectOperation?: (props: OperationRejectedProps) => void
}

export class Mantella<Services> {
  private operations: OperationDefinition<unknown, unknown>[]
  private services: Services
  private loadOperation: (props: LoadOperationProps) => Promise<LoadOperationResult>
  private saveOperation: (props: SaveOperationProps) => Promise<SaveOperationResult>

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

    if (!props.loadOperation) {
      throw new Error('You must supply an onLoadOperation function.')
    }

    if (!props.saveOperation) {
      throw new Error('You must supply an onSaveOperation function.')
    }

    this.operations = props.operations
    this.services = props.services
    this.loadOperation = props.loadOperation
    this.saveOperation = props.saveOperation
  }

  async startOperation (props: StartOperationProps): Promise<void> {
    if (!props.operationName) {
      throw new Error('You must supply an operationN name.')
    }

    if (props.requestId) {
      const loadResult = await this.loadOperation({ id: props.requestId })

      if (loadResult.record) {
        throw new Error(`Operation with id ${props.requestId} already exists.`)
      }
    }

    const operation = this.operations.find(op => op.name === props.operationName)

    if (!operation) {
      throw new Error(`Operation name '${props.operationName}' was not recognised.`)
    }

    if (!props.onResolveOperation) {
      throw new Error('You must supply an onResolveOperation function.')
    }

    if (!props.onRejectOperation) {
      throw new Error('You must supply an onRejectOperation function.')
    }

    await runOperation({
      operation,
      onResolveOperation: props.onResolveOperation,
      onRejectOperation: props.onRejectOperation,
      onSaveOperation: async record => { await this.saveOperation({ record }) },
      record: createNewOperationContext(props.requestId || v4(), operation.name, props.input),
      requestId: props.requestId,
      resolveStep: props.resolveStep,
      services: this.services
    })
  }

  async resumeOperation (props: ResumeOperationProps): Promise<void> {
    if (!props.requestId) {
      throw new Error('You must supply a request id.')
    }

    const loadResult = await this.loadOperation({ id: props.requestId })
    
    if (!loadResult?.record) {
      throw new Error(`Operation '${props.requestId}' was not found.`)
    }

    const record = loadResult.record

    const operation = this.operations.find(op => op.name === record.operationName)

    if (!operation) {
      throw new Error(`Operation '${props.requestId}' uses unknown operation definition '${record.operationName}'.`)
    }

    if (!props.onResolveOperation) {
      throw new Error('You must supply an onResolveOperation function.')
    }

    if (!props.onRejectOperation) {
      throw new Error('You must supply an onRejectOperation function.')
    }

    await runOperation({
      operation,
      onResolveOperation: props.onResolveOperation,
      onRejectOperation: props.onRejectOperation,
      onSaveOperation: async record => { await this.saveOperation({ record }) },
      record,
      requestId: props.requestId,
      resolveStep: props.resolveStep,
      services: this.services
    })
  }
}
