import { Request, Response } from 'express'
import { Mantella } from 'mantella-engine'
import { OperationDefinition, OperationRecord } from 'mantella-interfaces'

interface CreateMantellaExpressProps {
  operations: Record<string, OperationDefinition<unknown, unknown>>
  onLoadOperation: (requestId: string) => Promise<OperationRecord|null>
  onSaveOperation: (record: OperationRecord) => Promise<void>
  services: unknown
}

export function createMantellaExpress (props: CreateMantellaExpressProps): (req: Request, res: Response) => void {
  const mantella = new Mantella({
    operations: props.operations,
    services: props.services,
    onLoadOperation: props.onLoadOperation,
    onSaveOperation: props.onSaveOperation
  })

  // url handling
  // POST /ops:registerGroup  (start a new registerGroup, complain if request-id header matches an existing operation)
  // GET /ops/1234 (get the operation record with id 1234)
  // POST /ops/1234:resume  (resume op with id 1234, complain if completed or id not found)

  return async function (req: Request, res: Response) {
    if (Array.isArray(req.headers['x-request-id'])) {
      res.status(400).send('Header X-REQUEST-ID must be a single value or not supplied, it cannot be an array.')
      return
    }

    if (Array.isArray(req.headers['x-resolve-step'])) {
      res.status(400).send('Header X-RESOLVE-STEP must be a single value or not supplied, it cannot be an array.')
      return
    }

    await mantella.startOperation({
      input: req.body,
      operationName: req.url.substring(1),
      onResolveOperation: props => {
        if (props.isComplete) {
          res.status(204).end()
        } else {
          res.status(202).end()
        }
      },
      onRejectOperation: props => {
        res.set('x-request-id', props.requestId)

        if (props.isClientError) {
          res.status(400).send(`Operation ${props.requestId} was rejected.\n${props.message}`)
        } else {
          res.status(500).send(`Operation ${props.requestId} failed due to an internal error.`)
        }
      },
      requestId: req.headers['x-request-id'] as string|undefined,
      resolveStep: req.headers['x-resolve-step'] as string|undefined
    })
  }
}
