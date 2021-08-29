import { OperationStatus } from 'mantella-interfaces'

/**
 * Returns the HTTP status code to send in response to the client
 * based on the given operation status.
 * @param operationStatus An operation status.
 */
export function determineResponseStatusCode (operationStatus: OperationStatus): number {
  switch (operationStatus) {
    case 'completed': return 200
    case 'running': return 202
    case 'rejected': return 400
    case 'interrupted':
    case 'failed':
    default: return 500
  }
}
