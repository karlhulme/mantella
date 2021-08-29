import { test, expect } from '@jest/globals'
import { ensureHeaderJsonContentType } from './ensureHeaderJsonContentType'

test('Accept the specific JSON MIME type for payloads.', () => {
  expect(() => ensureHeaderJsonContentType('application/json')).not.toThrow()
})

test('Accept the specific JSON MIME type for payloads even if included with other types.', () => {
  expect(() => ensureHeaderJsonContentType(['application/json', 'application/xml'])).not.toThrow()
})

test('Reject non-JSON MIME type for payloads.', () => {
  expect(() => ensureHeaderJsonContentType('application/xml')).toThrow()
  expect(() => ensureHeaderJsonContentType('application/*')).toThrow()
  expect(() => ensureHeaderJsonContentType('*/*')).toThrow()
})

test('Reject empty MIME type for payloads.', () => {
  expect(() => ensureHeaderJsonContentType()).toThrow()
})
