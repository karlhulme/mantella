import { MantellaError } from './baseError'

/**
 * Raised by the Mentella engine when a client makes an invalid request
 * and therefore an operation cannot be started.
 */
export class MantellaClientError extends MantellaError {
  /**
   * Constructs a new instance.
   * @param message The reason the request cannot be processed.
   */
  constructor (message: string) {
    super(message)
    Object.setPrototypeOf(this, new.target.prototype)
    this.name = this.constructor.name
  }
}

/**
 * Raised by the Mentella engine when a client requests an operation
 * that is not found in the backend.
 */
 export class MantellaClientOperationNotFoundError extends MantellaClientError {
  /**
   * Constructs a new instance.
   * @param message The reason the request cannot be processed.
   */
  constructor (message: string) {
    super(message)
    Object.setPrototypeOf(this, new.target.prototype)
    this.name = this.constructor.name
  }
}

/**
 * Raised by the Mantella engine when a client does not have permission
 * to start an operation.
 */
export class MantellaClientInsufficientPermissionToStartOperationError extends MantellaClientError {
  constructor (readonly clientName: string, readonly operationName: string) {
    super(`The '${clientName}' client does not have permission to start the operation '${operationName}'.`)
    Object.setPrototypeOf(this, new.target.prototype)
    this.name = this.constructor.name
    this.clientName = clientName
    this.operationName = operationName
  }
}

/**
 * Raised by the Mantella engine when a client does not have permission
 * to manage existing operations.
 */
 export class MantellaClientInsufficientPermissionToManageOperationsError extends MantellaClientError {
  constructor (readonly clientName: string) {
    super(`The '${clientName}' client does not have permission to manage operations.`)
    Object.setPrototypeOf(this, new.target.prototype)
    this.name = this.constructor.name
    this.clientName = clientName
  }
}

/**
 * Raised by the Mantella engine when the API key supplied with a request
 * to the Mantella engine does not match any of the API keys associated
 * with the registered clients.
 */
export class MantellaClientUnrecognisedApiKeyError extends MantellaClientError {
  constructor () {
    super(`The client supplied an invalid api key.`)
    Object.setPrototypeOf(this, new.target.prototype)
    this.name = this.constructor.name
  }
}
