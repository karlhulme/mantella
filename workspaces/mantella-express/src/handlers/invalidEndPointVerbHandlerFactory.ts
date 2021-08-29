import { applyResultToHttpResponse } from '../responseGeneration'
import { RequestHandler } from './RequestHandler'
import { RequestHandlerProps } from './RequestHandlerProps'

/**
 * Creates a funtion that handles the rejection of a verb
 * that is not processable for an end-point.
 * @param validVerbs An array of strings indicating the valid verbs for the end-point.
 * @param verb A string indicating the attempted verb but disallowed verb.
 */
export function invalidEndPointVerbHandlerFactory (validVerbs: string[], invalidVerb: string): RequestHandler {
  return async function (props: RequestHandlerProps): Promise<void> {
    applyResultToHttpResponse(props.res, {
      statusCode: 405,
      text: `Verb '${invalidVerb}' is not valid on this end-point.  The following verbs are acceptable: '${validVerbs.join(', ')}'.`
    })
  }
}
