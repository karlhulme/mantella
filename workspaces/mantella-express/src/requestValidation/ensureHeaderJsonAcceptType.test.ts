import { test, expect } from '@jest/globals'
import { ensureHeaderJsonAcceptType } from './ensureHeaderJsonAcceptType'

test('Accept an undefined MIME type for responses, because we can assume JSON.', () => {
  expect(() => ensureHeaderJsonAcceptType()).not.toThrow()
})

test('Accept any JSON MIME type for responses.', () => {
  expect(() => ensureHeaderJsonAcceptType('application/json')).not.toThrow()
  expect(() => ensureHeaderJsonAcceptType('application/*')).not.toThrow()
  expect(() => ensureHeaderJsonAcceptType('*/*')).not.toThrow()
})

test('Accept any JSON MIME type if included with other types.', () => {
  expect(() => ensureHeaderJsonAcceptType(['application/xml', 'application/json'])).not.toThrow()
})

test('Reject a non JSON MIME type for responses.', () => {
  expect(() => ensureHeaderJsonAcceptType('application/xml')).toThrow()
})
