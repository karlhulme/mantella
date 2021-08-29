import { OperationStatus } from 'mantella-interfaces'
import { OperationInterruptedError } from 'piggle'
import { MantellaOperationRejectedError, MantellaMalformedOperationInputError } from 'mantella-interfaces'

/**
 * Determines the correct operation status as a result of an error.
 * @param err An error object thrown by a running operation.
 */
export function determineOperationStatusFromError (err: Error): OperationStatus {
  if (err instanceof OperationInterruptedError) {
    return 'interrupted'
  } else if (err instanceof MantellaOperationRejectedError || err instanceof MantellaMalformedOperationInputError) {
    return 'rejected'
  } else {
    return 'failed'
  }
}
