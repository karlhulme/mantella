import { MantellaExpressInvalidRequestIdError } from '../errors'

/**
 * Raises an error if the request id included in the request was an array,
 * otherwise it will return the singular request id supplied.
 * If no value was supplied, then the method will return undefined.
 * @param requestId A request id sent with the request.
 */
export function ensureHeaderRequestId (requestId?: string|string[]): string|undefined {
  if (Array.isArray(requestId)) {
    throw new MantellaExpressInvalidRequestIdError(requestId.join(', '))
  } else {
    return requestId
  }
}
