import { Request, Response } from 'express'
import { MantellaEngine } from 'mantella-interfaces'
import { MatchedRestResource } from '../matching'

export interface RequestHandlerProps {
  baseUrl: string
  matchedResource: MatchedRestResource
  req: Request
  res: Response
  mantella: MantellaEngine
}
