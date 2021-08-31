import {
  GetOperationProps,
  OperationDefinition,
  GetOperationResult,
  StartOperationProps,
  LoadOperationFromDatabaseProps,
  LoadOperationFromDatabaseResult,
  SaveOperationToDatabaseProps,
  ResumeOperationProps,
  OperationRecord,
  MantellaEngine,
  MantellaClientError,
  MantellaClientOperationNotFoundError,
  MantellaLoadOperationFromDatabaseInvalidResponseError,
  MantellaLoadOperationFromDatabaseUnexpectedError,
  Client
} from 'mantella-interfaces'
import { v4 } from 'uuid'
import { RESOLVE_IMMEDIATELY } from '../consts'
import { createNewOperationRecord, executeOperation, logRecordToConsole } from '../execution'
import { ensureClient } from '../security'
import { ensureManageOperationsPermission, ensureStartOperationPermission } from '../security/ensurePermissions'

/**
 * Defines the constructor parameters of a new Mantella instance.
 */
export interface MantellaConstructorProps<Services> {
  /**
   * A function that returns false if the processing should stop.
   * This is useful for handling a graceful shutdown.
   */
  canContinueProcessing?: () => boolean

  /**
   * An array of clients that have access to the mantella engine.
   */
  clients?: Client[]

  /**
   * An array of operation definitions.
   */
  operations?: OperationDefinition<unknown, unknown>[]

  /**
   * A function that can load an existing operation based on the id.
   * Exceptions raised from this function will result in an error being
   * issued to the client and the operation not starting/resuming.
   */
  loadOperationFromDatabase?: (props: LoadOperationFromDatabaseProps) => Promise<LoadOperationFromDatabaseResult>

  /**
   * True if the result of each operation should be logged to the console.
   */
  logToConsole?: boolean

  /**
   * The retry intervals to use by default when retrying operation steps.  If not specified the
   * default is to retry using an exponential backoff strategy that reaches a maximum interval
   * of 15 seconds over the course of 1 minute.
   */
  defaultRetryIntervalsInMilliseconds?: number[]

  /**
   * A function that can save an operation to a database.
   * Exceptions raised by this function will be swallowed because we
   * don't want a failure here to prevent an operation from completing.
   */
  saveOperationToDatabase?: (props: SaveOperationToDatabaseProps) => Promise<void>

  /**
   * A set of services to be supplied to each operation.
   */
  services?: Services
}

/**
 * A class for executing operations in a fault resilient manner.
 */
export class Mantella<Services> implements MantellaEngine {
  private apiKeysLoadedFromEnv: number
  private apiKeysNotFoundInEnv: number
  private canContinueProcessing: () => boolean
  private clients: Client[]
  private defaultRetryIntervalsInMilliseconds: number[]
  private loadOperationFromDatabase: (props: LoadOperationFromDatabaseProps) => Promise<LoadOperationFromDatabaseResult>
  private logToConsole: boolean
  private operations: OperationDefinition<unknown, unknown>[]
  private saveOperationToDatabase: (props: SaveOperationToDatabaseProps) => Promise<void>
  private services: Services

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

    if (!props.loadOperationFromDatabase) {
      throw new Error('You must supply an loadOperationFromDatabase function.')
    }

    if (!props.saveOperationToDatabase) {
      throw new Error('You must supply an saveOperationToDatabase function.')
    }

    this.apiKeysLoadedFromEnv = 0
    this.apiKeysNotFoundInEnv = 0
    this.canContinueProcessing = props.canContinueProcessing || (() => true)
    this.clients = props.clients || []
    this.defaultRetryIntervalsInMilliseconds = props.defaultRetryIntervalsInMilliseconds ||
      [100, 250, 500, 1000, 2000, 4000, 8000, 15000, 15000, 15000]
    this.loadOperationFromDatabase = props.loadOperationFromDatabase
    this.logToConsole = typeof props.logToConsole === 'boolean' ? props.logToConsole : true
    this.operations = props.operations
    this.saveOperationToDatabase = props.saveOperationToDatabase
    this.services = props.services

    this.hydrateClientApiKeys()
  }

  /**
   * Retrieves a previously saved operation using an operation id.
   * @param props A property bag.
   */
  async getOperation (props: GetOperationProps): Promise<GetOperationResult> {
    if (!props.apiKey) {
      throw new MantellaClientError('You must supply an apiKey.')
    }

    const client = ensureClient(props.apiKey, this.clients)
    ensureManageOperationsPermission(client)

    if (!props.operationId) {
      throw new MantellaClientError('You must supply an operationId.')
    }

    const loadResult = await this.loadOperationFromDatabase({ id: props.operationId })

    if (!loadResult.record) {
      throw new MantellaClientOperationNotFoundError(`Operation with id '${props.operationId}' was not found.`)
    }

    return {
      record: loadResult.record
    }
  }

  /**
   * Starts a new operation.
   * @param props A property bag.
   */
  async startOperation (props: StartOperationProps): Promise<void> {
    if (!props.apiKey) {
      throw new MantellaClientError('You must supply an apiKey.')
    }

    const client = ensureClient(props.apiKey, this.clients)

    if (!props.operationName) {
      throw new MantellaClientError('You must supply an operation name.')
    }

    if (props.operationId) {
      const loadResult = await this.loadOperationFromDatabase({ id: props.operationId })

      if (loadResult.record) {
        throw new MantellaClientError(`Operation with id ${props.operationId} already exists.`)
      }
    }

    const operation = this.operations.find(op => op.name === props.operationName)

    if (!operation) {
      throw new MantellaClientError(`Operation name '${props.operationName}' was not recognised.`)
    }

    ensureStartOperationPermission(client, props.operationName)

    if (!props.sendResponse) {
      throw new MantellaClientError('You must supply a sendResponse function.')
    }

    const record = createNewOperationRecord(props.operationId || v4(), operation.name, props.input)

    await executeOperation({
      canContinueProcessing: this.canContinueProcessing,
      defaultRetryIntervalsInMilliseconds: this.defaultRetryIntervalsInMilliseconds,
      operation,
      sendResponse: () => props.sendResponse && props.sendResponse({
        operationId: record.id,
        operationStatus: record.status,
        error: record.error,
        lastCompletedStep: this.getLastCompletedStep(record)
      }),
      saveOperation: async () => { await this.invokeSaveOperationToDatabase(record) },
      record,
      saveProgress: Boolean(props.operationId),
      resolveStep: props.resolveStep || null,
      services: this.services
    })

    /* istanbul ignore next */
    if (this.logToConsole) {
      logRecordToConsole(console.log, record)
    }
  }

  /**
   * Resumes a previously stalled operation.
   * @param props A property bag.
   */
  async resumeOperation (props: ResumeOperationProps): Promise<void> {
    if (!props.apiKey) {
      throw new MantellaClientError('You must supply an apiKey.')
    }

    const client = ensureClient(props.apiKey, this.clients)
    ensureManageOperationsPermission(client)

    if (!props.operationId) {
      throw new MantellaClientError('You must supply an operationId.')
    }

    const record = await this.invokeLoadOperationFromDatabase(props.operationId)
    
    if (!record) {
      throw new MantellaClientOperationNotFoundError(`Operation '${props.operationId}' was not found.`)
    }

    const operation = this.operations.find(op => op.name === record.operationName)

    if (!operation) {
      throw new MantellaClientError(`Operation '${props.operationId}' uses unknown operation definition '${record.operationName}'.`)
    }

    if (!props.sendResponse) {
      throw new MantellaClientError('You must supply a sendResponse function.')
    }

    await executeOperation({
      canContinueProcessing: this.canContinueProcessing,
      defaultRetryIntervalsInMilliseconds: this.defaultRetryIntervalsInMilliseconds,
      operation,
      sendResponse: () => props.sendResponse && props.sendResponse({
        operationStatus: record.status,
        error: record.error,
        lastCompletedStep: this.getLastCompletedStep(record)
      }),
      saveOperation: async () => { await this.invokeSaveOperationToDatabase(record) },
      record,
      saveProgress: true,
      resolveStep: props.resolveStep || null,
      services: this.services
    })

    /* istanbul ignore next */
    if (this.logToConsole) {
      logRecordToConsole(console.log, record)
    }
  }

  /**
   * Returns the number of api keys that were replaced
   * when hydrating the clients.
   */
  getApiKeysLoadedFromEnvCount (): number {
    return this.apiKeysLoadedFromEnv
  }

  /**
   * Returns the number of api keys that were dropped
   * when hydrating the clients because references were
   * made to non-existent environment variables.
   */
  getApiKeysNotFoundInEnvCount (): number {
    return this.apiKeysNotFoundInEnv
  }

  /**
   * Saves the given record to the database by invoking the delegate
   * provided when the Mantella was constructed.  If the delegate
   * raises an exception then it is written to the error log but
   * otherwise swallowed so that we don't affect a running operation.
   * @param record An operation record.
   */
  private async invokeSaveOperationToDatabase (record: OperationRecord) {
    try {
      await this.saveOperationToDatabase({ record })
    } catch (err) {
      /* istanbul ignore next */
      if (this.logToConsole) {
        console.error('Unable to save operation.')
        console.error(record)
        console.error(err)
      }
    }
  }

  /**
   * Loads the operation with the given id from the database.
   * If the delegate that loads operations raises an error then this is
   * wrapped with an engine error.
   * @param operationId The id of an operation.
   */
  private async invokeLoadOperationFromDatabase (operationId: string): Promise<OperationRecord|null> {
    let loadResult

    try {
      loadResult = await this.loadOperationFromDatabase({ id: operationId })
    } catch (err) {
      throw new MantellaLoadOperationFromDatabaseUnexpectedError(err)
    }

    if (typeof loadResult !== 'object') {
      throw new MantellaLoadOperationFromDatabaseInvalidResponseError('The loadOperationFromDatabase delegate must return an object.')
    }

    return loadResult.record || null
  }

  /**
   * Returns the name of the last completed step, or the hat/caret symbol.
   * @param record An operation record.
   */
  private getLastCompletedStep (record: OperationRecord): string {
    if (record.stepDataEntries.length === 0) {
      return RESOLVE_IMMEDIATELY
    } else {
      return record.stepDataEntries[record.stepDataEntries.length - 1].name
    }
  }

  /**
   * Replaces the apiKeys elements of any client that reference environment variables
   * with the actual value loaded from 'process.env'.
   */
  private hydrateClientApiKeys (): void {
    for (const client of this.clients) {
      for (let index = client.apiKeys.length - 1; index >= 0; index--) {
        if (client.apiKeys[index].startsWith('$')) {
          const loadedApiKey = process.env[client.apiKeys[index].substring(1)]

          if (loadedApiKey) {
            this.apiKeysLoadedFromEnv++
            client.apiKeys[index] = loadedApiKey
          } else {
            this.apiKeysNotFoundInEnv++
            client.apiKeys.splice(index, 1)
          }
        }
      }
    }
  }
}
