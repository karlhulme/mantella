import { OperationStatus } from 'mantella-interfaces'

/**
 * Determines the json portion of the response, which will only be
 * defined if the status is running or completed.
 * @param operationStatus The status of an operation.
 * @param operationOutput The output attached to an operation.
 */
export function determineResponseJson (operationStatus: OperationStatus, operationOutput: Record<string, unknown>|null): Record<string, unknown>|undefined {
  if (operationStatus === 'running' || operationStatus === 'completed') {
    return operationOutput || undefined
  } else {
    return undefined
  }
}
