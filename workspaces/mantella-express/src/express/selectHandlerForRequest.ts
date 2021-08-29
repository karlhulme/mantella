import { Request } from 'express'
import { RestResourceType } from '../enums'
import {
  startOperationHandler,
  invalidEndPointVerbHandlerFactory,
  invalidPathHandler,
  RequestHandler,
  rootHandler,
  resumeOperationHandler,
  getOperationHandler,
} from '../handlers'
import { MatchedRestResource } from '../matching'

/**
 * Returns a request handler appropriate to the request and matched resource. 
 * @param req An express request.
 * @param matchedResource A matched resource.
 */
export function selectHandlerForRequest (req: Request, matchedResource: MatchedRestResource): RequestHandler {
  if (matchedResource.type === RestResourceType.CONSTRUCTOR) {
    switch (req.method) {
      case 'POST': return startOperationHandler
      default: return invalidEndPointVerbHandlerFactory(['POST'], req.method)
    }
  } else if (matchedResource.type === RestResourceType.OPERATION) {
    switch (req.method) {
      case 'GET': return getOperationHandler
      default: return invalidEndPointVerbHandlerFactory(['GET'], req.method)
    }
  } else if (matchedResource.type === RestResourceType.OPERATION_RESUME) {
    switch (req.method) {
      case 'POST': return resumeOperationHandler
      default: return invalidEndPointVerbHandlerFactory(['POST'], req.method)
    }
  } else if (matchedResource.type === RestResourceType.ROOT) {
    switch (req.method) {
      case 'GET': return rootHandler
      default: return invalidEndPointVerbHandlerFactory(['GET'], req.method)
    }
  } else {
    return invalidPathHandler
  }
}
