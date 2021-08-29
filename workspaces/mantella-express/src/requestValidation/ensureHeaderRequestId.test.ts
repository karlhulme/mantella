import { test, expect } from '@jest/globals'
import { MantellaExpressInvalidRequestIdError } from '../errors'
import { ensureHeaderRequestId } from './ensureHeaderRequestId'

test('Use the request id if supplied in the request.', () => {
  expect(ensureHeaderRequestId('1234')).toEqual('1234')
})

test('Use undefined if a request id is not supplied.', () => {
  expect(ensureHeaderRequestId(undefined)).toEqual(undefined)
})

test('Reject arrays of values.', () => {
  try {
    ensureHeaderRequestId(['5678', '6789'])
    throw new Error('fail')
  } catch (err) {
    expect(err).toBeInstanceOf(MantellaExpressInvalidRequestIdError)
  }
})
