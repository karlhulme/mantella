import { Request, Response } from 'express'
import { MantellaEngine } from 'mantella-interfaces'
import { RequestHandlerProps } from '../handlers'
import { createRestResourceMatcherArray, matchPathToRestResource } from '../matching'
import { selectHandlerForRequest } from './selectHandlerForRequest'

/**
 * Defines the properties required to construct a mantella express.
 */
interface CreateMantellaExpressProps {
  mantella: MantellaEngine
}

/**
 * Returns an express route handler that can process Mantella style
 * requests for starting and managing operations.
 * @param props A property bag.
 */
export function createMantellaExpress (props: CreateMantellaExpressProps): (req: Request, res: Response) => void {
  const matchers = createRestResourceMatcherArray()

  return async (req: Request, res: Response): Promise<void> => {
    const matchedResource = matchPathToRestResource(req.path, matchers)

    const handler = selectHandlerForRequest(req, matchedResource)

    const handlerParams: RequestHandlerProps = {
      baseUrl: req.baseUrl,
      matchedResource,
      req,
      res,
      mantella: props.mantella
    }

    return handler(handlerParams)
  }
}
