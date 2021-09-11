import { OperationStatus } from 'mantella-interfaces'
import { OPERATION_FAILED_ERROR_TEXT, OPERATION_INTERRUPTED_ERROR_TEXT } from '../consts'

/**
 * Determines the text portion of the response, which will only be
 * defined if the status is failed, interrupted or rejected.
 * @param operationStatus The status of an operation.
 * @param operationError The error details attached to an operation.
 */
export function determineResponseText (operationStatus: OperationStatus, operationError: string|null): string|undefined {
  if (operationStatus === 'failed') {
    return OPERATION_FAILED_ERROR_TEXT
  } if (operationStatus === 'interrupted') {
    return OPERATION_INTERRUPTED_ERROR_TEXT
  } else if (operationStatus === 'rejected') {
    /* istanbul ignore next - if status is rejected then operationError will be a valid string */
    return operationError || undefined
  } else {
    return undefined
  }
}
