import { expect, test } from '@jest/globals'
import { createNewOperationRecord } from './createNewOperationRecord'

test('A new operation context can be created.', () => {
  expect(createNewOperationRecord('1234', 'test', { foo: 'bar' })).toEqual({
    id: '1234',
    operationName: 'test',
    input: { foo: 'bar' },
    started: expect.any(String),
    finished: null,
    logEntries: [],
    stepDataEntries: [],
    status: 'running',
    durationInMs: 0,
    error: null
  })
})
