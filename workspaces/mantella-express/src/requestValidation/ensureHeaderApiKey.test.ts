import { test, expect } from '@jest/globals'
import { ensureHeaderApiKey } from './ensureHeaderApiKey'

test('Accept a valid api key.', () => {
  expect(ensureHeaderApiKey('aaaa')).toEqual('aaaa')
})

test('Reject an undefined api key.', () => {
  expect(() => ensureHeaderApiKey()).toThrow()
})

test('Reject an array of api keys.', () => {
  expect(() => ensureHeaderApiKey([])).toThrow()
  expect(() => ensureHeaderApiKey(['aaaa', 'bbbb'])).toThrow()
})

test('Reject empty api keys.', () => {
  expect(() => ensureHeaderApiKey('')).toThrow()
})
