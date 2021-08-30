import {
  MantellaClientInsufficientPermissionToStartOperationError,
  MantellaClientInsufficientPermissionToManageOperationsError
} from 'mantella-interfaces'
import { AuthenticatedClient } from './AuthenticatedClient'

/**
 * Raises an error if the given client does not have permission to invoke getOperation.
 * @param client An authenticated client.
 * @param operationName The name of an operation.
 */
export function ensureManageOperationsPermission (client: AuthenticatedClient): void {
  if (client.manage !== true) {
    throw new MantellaClientInsufficientPermissionToManageOperationsError(client.name)
  }
}

/**
 * Raises an error if the given client does not have permission to invoke startOperation.
 * @param client An authenticated client.
 * @param operationName The name of an operation.
 */
export function ensureStartOperationPermission (client: AuthenticatedClient, operationName: string): void {
  const hasPermission = client.operations === true || (Array.isArray(client.operations) && client.operations.includes(operationName))

  if (!hasPermission) {
    throw new MantellaClientInsufficientPermissionToStartOperationError(client.name, operationName)
  }
}
