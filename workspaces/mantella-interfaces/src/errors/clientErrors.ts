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
