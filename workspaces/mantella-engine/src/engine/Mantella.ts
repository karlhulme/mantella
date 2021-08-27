import {
  LoadOperationProps, LoadOperationResult, SaveOperationProps, SaveOperationResult,
  OperationDefinition, OperationRejectedProps, OperationResolvedProps
} from 'mantella-interfaces'
import { v4 } from 'uuid'
import { createNewOperationRecord } from './createNewOperationRecord'
import { executeOperation } from './executeOperation'
import { logResult } from './logResult'

export interface MantellaConstructorProps<Services> {
  operations?: OperationDefinition<unknown, unknown>[]
  loadOperation?: (props: LoadOperationProps) => Promise<LoadOperationResult>
  defaultRetryIntervalsInMilliseconds?: number[]
  saveOperation?: (props: SaveOperationProps) => Promise<SaveOperationResult>
  services?: Services
}

export interface StartOperationProps {
  input?: unknown
  operationName?: string
  requestId?: string
  resolveStep?: string
  resolveOperation?: (props: OperationResolvedProps) => void
  rejectOperation?: (props: OperationRejectedProps) => void
}

export interface ResumeOperationProps {
  requestId?: string
  resolveStep?: string
  resolveOperation?: (props: OperationResolvedProps) => void
  rejectOperation?: (props: OperationRejectedProps) => void
}

export class Mantella<Services> {
  private operations: OperationDefinition<unknown, unknown>[]
  private services: Services
  private loadOperation: (props: LoadOperationProps) => Promise<LoadOperationResult>
  private saveOperation: (props: SaveOperationProps) => Promise<SaveOperationResult>
  private defaultRetryIntervalsInMilliseconds: number[]

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
      throw new Error('You must supply an loadOperation function.')
    }

    if (!props.saveOperation) {
      throw new Error('You must supply an saveOperation function.')
    }

    this.operations = props.operations
    this.services = props.services
    this.loadOperation = props.loadOperation
    this.saveOperation = props.saveOperation
    this.defaultRetryIntervalsInMilliseconds = props.defaultRetryIntervalsInMilliseconds || [100, 250, 500, 1000, 2000, 4000, 8000, 15000, 30000]
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

    if (!props.resolveOperation) {
      throw new Error('You must supply an resolveOperation function.')
    }

    if (!props.rejectOperation) {
      throw new Error('You must supply an rejectOperation function.')
    }

    await executeOperation({
      canContinueProcessing: () => true,
      defaultRetryIntervalsInMilliseconds: this.defaultRetryIntervalsInMilliseconds,
      logResult,
      operation,
      resolveOperation: props.resolveOperation,
      rejectOperation: props.rejectOperation,
      saveOperation: async record => { await this.saveOperation({ record }) },
      record: createNewOperationRecord(props.requestId || v4(), operation.name, props.input),
      requestIdSupplied: Boolean(props.requestId),
      resolveStep: props.resolveStep || null,
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

    if (!props.resolveOperation) {
      throw new Error('You must supply an resolveOperation function.')
    }

    if (!props.rejectOperation) {
      throw new Error('You must supply an rejectOperation function.')
    }

    await executeOperation({
      canContinueProcessing: () => true,
      defaultRetryIntervalsInMilliseconds: this.defaultRetryIntervalsInMilliseconds,
      logResult,
      operation,
      resolveOperation: props.resolveOperation,
      rejectOperation: props.rejectOperation,
      saveOperation: async record => { await this.saveOperation({ record }) },
      record,
      requestIdSupplied: Boolean(props.requestId),
      resolveStep: props.resolveStep || null,
      services: this.services
    })
  }
}
