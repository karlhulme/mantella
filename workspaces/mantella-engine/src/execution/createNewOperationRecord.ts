import { OperationRecord } from 'mantella-interfaces'

/**
 * Creates a new operation context.
 * @param operationId The id to be assigned to the operation.
 * @param operationName The name of the operation.
 * @param input The input payload passed to the operation.
 */
export function createNewOperationRecord (operationId: string, operationName: string, input: unknown): OperationRecord {
  return ({
    id: operationId,
    operationName: operationName,
    input: input,
    started: new Date().toISOString(),
    finished: null,
    logEntries: [],
    stepDataEntries: [],
    status: 'running',
    durationInMs: 0,
    error: null,
    output: null
  })
}
