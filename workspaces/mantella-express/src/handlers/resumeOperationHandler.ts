import { HttpHeaderNames } from '../consts'
import { ensureHeaderApiKey, ensureHeaderResolveStep } from '../requestValidation'
import { applyErrorToHttpResponse, applyResultToHttpResponse } from '../responseGeneration'
import { determineResponseErrorText } from './determineResponseErrorText'
import { determineResponseStatusCode } from './determineResponseStatusCode'
import { RequestHandlerProps } from './RequestHandlerProps'

/**
 * Handles the request to resume an existing operation and produces a response.
 * @param props Properties for handling the request.
 */
export async function resumeOperationHandler (props: RequestHandlerProps): Promise<void> {
  try {
    /* const apiKey = */ensureHeaderApiKey(props.req.headers[HttpHeaderNames.ApiKey])
    const operationId = props.matchedResource.urlParams['id']
    const resolveStep = ensureHeaderResolveStep(props.req.headers[HttpHeaderNames.ResolveStep])

    await props.mantella.resumeOperation({
      operationId,
      resolveStep,
      sendResponse: responseProps => {
        applyResultToHttpResponse(props.res, {
          headers: {
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
