import { test, expect } from '@jest/globals'
import { MantellaExpressInvalidResolveStepError } from '../errors'
import { ensureHeaderResolveStep } from './ensureHeaderResolveStep'

test('Use the resolve step if supplied in the request.', () => {
  expect(ensureHeaderResolveStep('1234')).toEqual('1234')
})

test('Use undefined if a resolve step is not supplied.', () => {
  expect(ensureHeaderResolveStep(undefined)).toEqual(undefined)
})

test('Reject arrays of values.', () => {
  try {
    ensureHeaderResolveStep(['5678', '6789'])
    throw new Error('fail')
  } catch (err) {
    expect(err).toBeInstanceOf(MantellaExpressInvalidResolveStepError)
  }
})
