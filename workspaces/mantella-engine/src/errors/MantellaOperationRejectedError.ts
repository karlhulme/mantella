import { MantellaClientError } from './MantellaClientError'

/**
 * Raised if an operation is rejected.
 */
 export class MantellaOperationRejectedError extends MantellaClientError {
  /**
   * Constructs a new instance.
   * @param rejectionMessage The reason for the rejection.
   */
  constructor (readonly rejectionMessage: string) {
    super(`The operation has been rejected.  ${rejectionMessage}`)
    Object.setPrototypeOf(this, new.target.prototype)
    this.name = this.constructor.name
  }
}
