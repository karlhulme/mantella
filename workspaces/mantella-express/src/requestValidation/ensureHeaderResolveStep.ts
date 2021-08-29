import { MantellaExpressInvalidResolveStepError } from '../errors'

/**
 * Raises an error if the resolve step included in the request was an array,
 * otherwise it will return the singular resolve step supplied.
 * If no value was supplied, then the method will return undefined.
 * @param resolveStep A resolve step value sent with the request.
 */
export function ensureHeaderResolveStep (resolveStep?: string|string[]): string|undefined {
  if (Array.isArray(resolveStep)) {
    throw new MantellaExpressInvalidResolveStepError(resolveStep.join(', '))
  } else {
    return resolveStep
  }
}
