import { expect, test } from '@jest/globals'
import { MantellaClientError, MantellaClientOperationNotFoundError } from 'mantella-interfaces'
import { createTestMantella } from './shared.test'

test('Get an existing operation.', async () => {
  const mentella = createTestMantella()

  await expect(mentella.getOperation({
    apiKey: 'adminKey',
    operationId: '1234'
  })).resolves.toEqual({
    record: {
      id: '00000000-0000-0000-0000-000000000000',
      operationName: 'testOp',
      input: { foo: 'bar' },
      started: '2021-08-27T18:01:01.000Z',
      finished: '2021-08-27T18:01:03.000Z',
      logEntries: expect.anything(),
      stepDataEntries: expect.anything(),
      status: 'failed',
      durationInMs: 2000,
      error: 'previous_error_condition'
    }
  })
})

test('Fail to get an existing operation if an api key is not supplied.', async () => {
  const mentella = createTestMantella()
  await expect(mentella.getOperation({ operationId: '1234' })).rejects.toThrow(MantellaClientError as unknown as Error)
  await expect(mentella.getOperation({ operationId: '1234' })).rejects.toThrow('apiKey')
})

test('Fail to get an existing operation if an operation id is not supplied.', async () => {
  const mentella = createTestMantella()
  await expect(mentella.getOperation({ apiKey: 'adminKey' })).rejects.toThrow(MantellaClientError as unknown as Error)
  await expect(mentella.getOperation({ apiKey: 'adminKey' })).rejects.toThrow('operationId')
})

test('Fail to get an existing operation that is not found.', async () => {
  const mentella = createTestMantella({ loadedOperation: null })
  await expect(mentella.getOperation({ apiKey: 'adminKey', operationId: '1234' })).rejects.toThrow(MantellaClientOperationNotFoundError as unknown as Error)
})
