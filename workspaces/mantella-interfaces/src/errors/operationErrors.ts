import { MantellaError } from './baseError'

/**
 * Raised by operations to communicate specific error conditions
 * to the Mantella host.
 */
 export class MantellaOperationError extends MantellaError {
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
 * Operations are expected to raise this error if they wish to reject
 * the request.  This would typically be because the request violates
 * a state condition of some kind, such as attempting to make a payment
 * when there are insufficient funds.
 */
 export class MantellaOperationRejectedError extends MantellaOperationError {
  /**
   * Constructs a new instance.
   * @param code The code for the rejection.
   * @param message The reason for the rejection.
   */
  constructor (code: string, message: string) {
    super(`${code} ${message}`)
    Object.setPrototypeOf(this, new.target.prototype)
    this.name = this.constructor.name
  }
}

/**
 * Raised when input passed to an operation is rejected
 * by the validator supplied for the corresponding operation definition.
 */
 export class MantellaMalformedOperationInputError extends MantellaOperationError {
  /**
   * Constructs a new instance.
   * @param message The reason the request cannot be processed.
   */
  constructor (message: string) {
    super('MALFORMED_INPUT ' +message)
    Object.setPrototypeOf(this, new.target.prototype)
    this.name = this.constructor.name
  }
}
