import { OperationStatus } from 'mantella-interfaces'
import { OPERATION_FAILED_ERROR_TEXT, OPERATION_INTERRUPTED_ERROR_TEXT } from '../consts'

/**
 * Returns the given error details or unknown, unless the operation
 * status is failed, in which case the error text is replace with a 
 * standard phrase to avoid leaking internal information to clients.
 * @param operationStatus The status of an operation.
 * @param error The supplied error details.
 */
export function determineResponseErrorText (operationStatus: OperationStatus, error: string|null): string|undefined {
  if (operationStatus === 'failed') {
    return OPERATION_FAILED_ERROR_TEXT
  } if (operationStatus === 'interrupted') {
    return OPERATION_INTERRUPTED_ERROR_TEXT
  } else {
    return error || undefined
  }
}
