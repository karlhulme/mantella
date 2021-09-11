import { HttpHeaderNames } from '../consts'
import { ensureHeaderApiKey, ensureHeaderResolveStep } from '../requestValidation'
import { applyErrorToHttpResponse, applyResultToHttpResponse } from '../responseGeneration'
import { determineResponseText } from './determineResponseText'
import { determineResponseStatusCode } from './determineResponseStatusCode'
import { RequestHandlerProps } from './RequestHandlerProps'
import { determineResponseJson } from './determineResponseJson'

/**
 * Handles the request to resume an existing operation and produces a response.
 * @param props Properties for handling the request.
 */
export async function resumeOperationHandler (props: RequestHandlerProps): Promise<void> {
  try {
    const apiKey = ensureHeaderApiKey(props.req.headers[HttpHeaderNames.ApiKey])
    const operationId = props.matchedResource.urlParams['id']
    const resolveStep = ensureHeaderResolveStep(props.req.headers[HttpHeaderNames.ResolveStep])

    await props.mantella.resumeOperation({
      apiKey,
      operationId,
      resolveStep,
      sendResponse: responseProps => {
        applyResultToHttpResponse(props.res, {
          headers: {
            [HttpHeaderNames.LastCompletedStep]: responseProps.lastCompletedStep
          },
          statusCode: determineResponseStatusCode(responseProps.operationStatus),
          text: determineResponseText(responseProps.operationStatus, responseProps.operationError),
          json: determineResponseJson(responseProps.operationStatus, responseProps.operationOutput)
        })
      }
    })
  } catch (err) {
    applyErrorToHttpResponse(props.req, props.res, { err: err as Error })
  }
}
