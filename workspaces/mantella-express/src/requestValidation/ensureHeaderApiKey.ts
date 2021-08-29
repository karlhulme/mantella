import { MantellaExpressMissingApiKeyError } from '../errors'

/**
 * Raises an error if the given api key can not be converted
 * to a single string
 * @param apiKey The value of an X-API-KEY header.
 */
export function ensureHeaderApiKey (apiKey?: string|string[]): string {
  if (typeof apiKey === 'string' && apiKey.length > 0) {
    return apiKey
  } else {
    throw new MantellaExpressMissingApiKeyError()
  }
}
