import { MantellaError } from './baseError'

/**
 * Raised by the Mentella engine.
 */
 export class MantellaEngineError extends MantellaError {
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
 * Raised by the engine when the delegate supplied for loading operations
 * does not return a valid response.
 */
 export class MantellaLoadOperationFromDatabaseInvalidResponseError extends MantellaEngineError {
  /**
   * Constructs a new instance.
   * @param innerError The error raised by the loadOperationFromDatabase delegate.
   */
  constructor (message: string) {
    super(message)
    Object.setPrototypeOf(this, new.target.prototype)
    this.name = this.constructor.name
  }
}

/**
 * Raised by the engine when the delegate supplied for loading operations
 * raises an error.
 */
export class MantellaLoadOperationFromDatabaseUnexpectedError extends MantellaEngineError {
  /**
   * Constructs a new instance.
   * @param innerError The error raised by the loadOperationFromDatabase delegate.
   */
  constructor (innerError: Error) {
    super('Unable to load operation from database.\n' + innerError.toString())
    Object.setPrototypeOf(this, new.target.prototype)
    this.name = this.constructor.name
  }
}
