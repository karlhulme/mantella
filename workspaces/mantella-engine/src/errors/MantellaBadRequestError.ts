import { MantellaClientError } from './MantellaClientError'

/**
 * Raised when input passed to an operation is rejected
 * by the validator supplied for the corresponding operation definition.
 */
export class MantellaBadRequestError extends MantellaClientError {
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
