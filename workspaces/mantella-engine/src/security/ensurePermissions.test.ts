import { expect, test } from '@jest/globals'
import { AuthenticatedClient } from './AuthenticatedClient'
import { ensureStartOperationPermission, ensureManageOperationsPermission } from './ensurePermissions'

const adminAuthenticatedClient: AuthenticatedClient = {
  name: 'admin',
  operations: true,
  manage: true
}

const specificAuthenticatedClient: AuthenticatedClient = {
  name: 'admin',
  operations: ['testOp']
}

const guestAuthenticatedClient: AuthenticatedClient = {
  name: 'guest',
  operations: false
}

test('Can verify startOperation permission.', () => {
  expect(() => ensureStartOperationPermission(adminAuthenticatedClient, 'testOp')).not.toThrow()

  expect(() => ensureStartOperationPermission(specificAuthenticatedClient, 'testOp')).not.toThrow()
  expect(() => ensureStartOperationPermission(specificAuthenticatedClient, 'unknownOp')).toThrow()

  expect(() => ensureStartOperationPermission(guestAuthenticatedClient, 'testOp')).toThrow()
})

test('Can verify manageOperations permission.', () => {
  expect(() => ensureManageOperationsPermission(adminAuthenticatedClient)).not.toThrow()
  expect(() => ensureManageOperationsPermission(specificAuthenticatedClient)).toThrow()
  expect(() => ensureManageOperationsPermission(guestAuthenticatedClient)).toThrow()
})
