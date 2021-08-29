/**
 * Raised by the Mentella engine when an error is encountered.
 */
 export class MantellaError extends Error {
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