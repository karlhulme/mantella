import { HttpHeaderNames } from '../consts'
import { ensureHeaderApiKey, ensureHeaderJsonAcceptType } from '../requestValidation'
import { applyErrorToHttpResponse, applyResultToHttpResponse } from '../responseGeneration'
import { RequestHandlerProps } from './RequestHandlerProps'

/**
 * Handles the request to get an operation and produces a response.
 * @param props Properties for handling the request.
 */
export async function getOperationHandler (props: RequestHandlerProps): Promise<void> {
  try {
    ensureHeaderJsonAcceptType(props.req.headers[HttpHeaderNames.AcceptType])

    const apiKey = ensureHeaderApiKey(props.req.headers[HttpHeaderNames.ApiKey])
    const operationId = props.matchedResource.urlParams['id']

    const result = await props.mantella.getOperation({
      apiKey,
      operationId
    })

    applyResultToHttpResponse(props.res, {
      statusCode: 200,
      json: { record: result.record }
    })
  } catch (err) {
    applyErrorToHttpResponse(props.req, props.res, { err: err as Error })
  }
}
