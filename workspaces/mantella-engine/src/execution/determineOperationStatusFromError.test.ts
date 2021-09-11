import { expect, test } from '@jest/globals'
import { OperationInterruptedError } from 'piggle'
import { MantellaMalformedOperationInputError, MantellaOperationRejectedError } from 'mantella-interfaces'
import { determineOperationStatusFromError } from './determineOperationStatusFromError'

test('An unrecognised error means the new status is failed.', () => {
  expect(determineOperationStatusFromError(new Error())).toEqual('failed')
})

test('An error about a malformed input means the new status is rejected.', () => {
  expect(determineOperationStatusFromError(new MantellaMalformedOperationInputError('some reason'))).toEqual('rejected')
})

test('An error about the operation rejecting means the new status is rejected.', () => {
  expect(determineOperationStatusFromError(new MantellaOperationRejectedError('ERROR', 'some reason'))).toEqual('rejected')
})

test('An error about the operation being interrupted means the new status is interrupted.', () => {
  expect(determineOperationStatusFromError(new OperationInterruptedError())).toEqual('interrupted')
})
