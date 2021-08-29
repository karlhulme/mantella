import { applyResultToHttpResponse } from '../responseGeneration'
import { RequestHandlerProps } from './RequestHandlerProps'

/**
 * Handles a request for an invalid or unrecognised path.
 * @param props Properties for handling the request.
 */
export async function invalidPathHandler (props: RequestHandlerProps): Promise<void> {
  applyResultToHttpResponse(props.res, {
    statusCode: 404,
    text: 'Requested path does not point to a recognised resource.'
  })
}
