import { MantellaExpressUnsupportedResponseContentTypeError } from '../errors'
import { MimeType } from '../enums'

/**
 * Raises an error if the given content type does not encompass JSON.
 * An undefined contentType is accepted.
 * @param contentType A MIME content type.
 */
export function ensureHeaderJsonAcceptType (acceptType?: string|string[]): void {
  if (typeof acceptType === 'undefined') {
    return
  }

  const acceptTypeArray = Array.isArray(acceptType) ? acceptType : [acceptType]

  const acceptableMimeTypes: string[] = [
    MimeType.APPLICATION_JSON_CONTENT_TYPE,
    MimeType.APPLICATION_ALL_CONTENT_TYPE,
    MimeType.ALL_CONTENT_TYPE
  ]

  const isOkay = acceptTypeArray.findIndex(a => acceptableMimeTypes.includes(a)) > -1

  if (!isOkay) {
    throw new MantellaExpressUnsupportedResponseContentTypeError(acceptTypeArray.join(', '), MimeType.APPLICATION_JSON_CONTENT_TYPE)
  }
}
