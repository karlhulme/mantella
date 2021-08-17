import { MantellaError } from './MantellaError'

/**
 * Raised by the Mentella engine when a client makes an invalid request.
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
