import { OperationRecord } from 'mantella-interfaces'

/**
 * Creates a new operation context.
 * @param requestId The id of he request.
 * @param operationName The name of the operation.
 * @param input The input payload passed to the operation.
 */
export function createNewOperationContext (requestId: string, operationName: string, input: unknown): OperationRecord {
  return ({
    id: requestId,
    operationName: operationName,
    input: input,
    started: new Date().toISOString(),
    finished: null,
    logEntries: [],
    stepDataEntries: [],
    status: 'running',
    durationInMs: 0,
    error: null
  })
}
