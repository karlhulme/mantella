import { Request, Response } from 'express'
import { HttpHeaderNames, INTERNAL_ERROR_TEXT } from '../consts'
import {
  MantellaClientError,
  MantellaClientInsufficientPermissionToManageOperationsError,
  MantellaClientInsufficientPermissionToStartOperationError,
  MantellaClientOperationNotFoundError,
  MantellaClientUnrecognisedApiKeyError
} from 'mantella-interfaces'
import {
  MantellaExpressRequestError,
  MantellaExpressUnsupportedRequestContentTypeError,
  MantellaExpressUnsupportedResponseContentTypeError
} from '../errors'

interface ErrorForHttpResponseProps {
  err: Error
}

/**
 * Determine the appropriate status code for the given error.
 * @param err An error object.
 */
function determineStatusFromError (err: Error): number {
  if (err instanceof MantellaExpressUnsupportedRequestContentTypeError) {
    return 415
  }

  if (err instanceof MantellaExpressUnsupportedResponseContentTypeError) {
    return 406
  }

  if (err instanceof MantellaClientOperationNotFoundError) {
    return 404
  }

  if (err instanceof MantellaClientInsufficientPermissionToManageOperationsError ||
    err instanceof MantellaClientInsufficientPermissionToStartOperationError) {
    return 403
  }

  if (err instanceof MantellaClientUnrecognisedApiKeyError) {
    return 401
  }

  if (err instanceof MantellaClientError ||
    err instanceof MantellaExpressRequestError) {
    return 400
  }

  return 500
}

/**
 * Applies an error to an express response.
 * @param res An express response.
 * @param err An Error object.
 */
export function applyErrorToHttpResponse (req: Request, res: Response, props: ErrorForHttpResponseProps): void {
  const statusCode = determineStatusFromError(props.err)

  res.status(statusCode)

  res.set(HttpHeaderNames.ContentType, 'text/plain')
  res.send(statusCode < 500 ? props.err.message : INTERNAL_ERROR_TEXT)

  /* istanbul ignore next */
  if (process.env.NODE_ENV !== 'test') {
    console.log(' ')
    console.log(new Date().toISOString())
    console.log(req.url)
    console.log(req.body)
    console.log(props.err)
  }
}
