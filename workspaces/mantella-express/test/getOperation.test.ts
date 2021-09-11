import { test, expect } from '@jest/globals'
import { MantellaClientOperationNotFoundError } from 'mantella-interfaces'
import supertest from 'supertest'
import { createTestableApp } from './shared.test'

test('200 - get an operation that exists', async () => {
  const { testableApp } = createTestableApp()
  const response = await supertest(testableApp)
    .get('/root/ops/1234')
    .set('x-api-key', 'adminKey')
    .send()

  expect(response.status).toEqual(200)
  expect(response.body).toEqual({
    record: {
      id: '00000000-0000-0000-0000-000000000000',
      operationName: 'testOp',
      input: ({ foo: 'bar' }),
      started: '2021-08-29T18:01:01.000Z',
      finished: '2021-08-29T18:01:03.000Z',
      logEntries: [{
        dateTime: '2021-08-29T18:01:02.000',
        message: 'A log entry'
      }],
      stepDataEntries: [{
        name: 's1',
        data: 1234
      }],
      status: 'failed',
      durationInMs: 2000,
      error: 'previous_error_condition',
      output: null
    }
  })
})

test('404 - fail to get an operation that does not exist', async () => {
  const { testableApp } = createTestableApp({
    mantellaEngine: {
      getOperation: async () => { throw new MantellaClientOperationNotFoundError('NOT_FOUND') }
    }
  })

  const response = await supertest(testableApp)
    .get('/root/ops/1234')
    .set('x-api-key', 'adminKey')
    .send()

  expect(response.status).toEqual(404)
})
