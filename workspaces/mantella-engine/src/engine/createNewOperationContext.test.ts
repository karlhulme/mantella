import { expect, test } from '@jest/globals'
import { createNewOperationContext } from './createNewOperationContext'

test('A new operation context can be created.', () => {
  expect(createNewOperationContext('1234', 'test', { foo: 'bar' })).toEqual({
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
