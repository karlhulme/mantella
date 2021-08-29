export class MantellaExpressError extends Error {
  constructor (message: string) {
    super(message)
    Object.setPrototypeOf(this, new.target.prototype)
    this.name = this.constructor.name
  }
}

export class MantellaExpressRequestError extends MantellaExpressError {
  constructor (message: string) {
    super(message)
    Object.setPrototypeOf(this, new.target.prototype)
    this.name = this.constructor.name
  }
}

export class MantellaExpressInvalidRequestIdError extends MantellaExpressRequestError {
  constructor (readonly requestId: string) {
    super(`The value of X-REQUEST-ID (${requestId}) is not valid.`)
    Object.setPrototypeOf(this, new.target.prototype)
    this.name = this.constructor.name
    this.requestId = requestId
  }
}

export class MantellaExpressInvalidResolveStepError extends MantellaExpressRequestError {
  constructor (readonly resolveStep: string) {
    super(`The value of MANTELLA-RESOLVE-STEP (${resolveStep}) is not valid.`)
    Object.setPrototypeOf(this, new.target.prototype)
    this.name = this.constructor.name
    this.resolveStep = resolveStep
  }
}

export class MantellaExpressMissingApiKeyError extends MantellaExpressRequestError {
  constructor () {
    super('The request did not specify an X-API-KEY header.')
    Object.setPrototypeOf(this, new.target.prototype)
    this.name = this.constructor.name
  }
}

export class MantellaExpressUnsupportedRequestContentTypeError extends MantellaExpressRequestError {
  constructor (readonly reqContentType: string, readonly supportedContentType: string) {
    super(`Cannot read payloads in the '${reqContentType}' format as declared in the sent Content-Type header. Try '${supportedContentType}'.`)
    Object.setPrototypeOf(this, new.target.prototype)
    this.name = this.constructor.name
    this.reqContentType = reqContentType
    this.supportedContentType = supportedContentType
  }
}

export class MantellaExpressUnsupportedResponseContentTypeError extends MantellaExpressRequestError {
  constructor (readonly reqContentType: string, readonly supportedContentType: string) {
    super(`Cannot provide responses in the '${reqContentType}' format as requested in the sent Accept header. Try '${supportedContentType}'.`)
    Object.setPrototypeOf(this, new.target.prototype)
    this.name = this.constructor.name
    this.reqContentType = reqContentType
    this.supportedContentType = supportedContentType
  }
}
