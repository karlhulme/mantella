import { HttpHeaderNames } from '../consts'
import { ensureHeaderApiKey, ensureHeaderJsonContentType, ensureHeaderRequestId, ensureHeaderResolveStep } from '../requestValidation'
import { applyErrorToHttpResponse, applyResultToHttpResponse } from '../responseGeneration'
import { determineResponseErrorText } from './determineResponseErrorText'
import { determineResponseStatusCode } from './determineResponseStatusCode'
import { RequestHandlerProps } from './RequestHandlerProps'

/**
 * Handles the request to start a new operation and produces a response.
 * @param props Properties for handling the request.
 */
export async function startOperationHandler (props: RequestHandlerProps): Promise<void> {
  try {
    ensureHeaderJsonContentType(props.req.headers[HttpHeaderNames.ContentType])

    /* const apiKey = */ensureHeaderApiKey(props.req.headers[HttpHeaderNames.ApiKey])
    const operationName = props.matchedResource.urlParams['operationName']
    const requestId = ensureHeaderRequestId(props.req.headers[HttpHeaderNames.RequestId])
    const resolveStep = ensureHeaderResolveStep(props.req.headers[HttpHeaderNames.ResolveStep])

    await props.mantella.startOperation({
      input: props.req.body,
      operationId: requestId,
      operationName,
      resolveStep,
      sendResponse: responseProps => {
        applyResultToHttpResponse(props.res, {
          headers: {
            location: `${props.baseUrl}ops/${responseProps.operationId}`,
            'mantella-last-completed-step': responseProps.lastCompletedStep
          },
          statusCode: determineResponseStatusCode(responseProps.operationStatus),
          text: determineResponseErrorText(responseProps.operationStatus, responseProps.error)
        })
      }
    })
  } catch (err) {
    applyErrorToHttpResponse(props.req, props.res, { err })
  }
}
