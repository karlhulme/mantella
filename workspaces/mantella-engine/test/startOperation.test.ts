import { expect, jest, test } from '@jest/globals'
import { StartOperationProps, MantellaClientError } from 'mantella-interfaces'
import { createTestMantella } from './shared.test'

function createStartOpParams (): StartOperationProps {
  return {
    operationId: '1234',
    input: { foo: 'bar' },
    operationName: 'testOp',
    sendResponse: jest.fn()  
  }
}

test('Start a new operation and run it to completion.', async () => {
  const mentella = createTestMantella({ loadedOperation: null })
  const startOpParams = createStartOpParams()

  await expect(mentella.startOperation(startOpParams)).resolves.not.toThrow()
  expect(startOpParams.sendResponse).toHaveBeenCalledTimes(1)
  expect(startOpParams.sendResponse).toHaveBeenCalledWith({ operationId: '1234', operationStatus: 'completed', error: null, lastCompletedStep: 'step1' })
})

test('Start a new operation but resolve early.', async () => {
  const mentella = createTestMantella({ loadedOperation: null })
  const startOpParams = createStartOpParams()
  startOpParams.resolveStep = 'step1'

  await expect(mentella.startOperation(startOpParams)).resolves.not.toThrow()
  expect(startOpParams.sendResponse).toHaveBeenCalledTimes(1)
  expect(startOpParams.sendResponse).toHaveBeenCalledWith({ operationId: '1234', operationStatus: 'running', error: null, lastCompletedStep: 'step1' })
})

test('Start a new operation but resolve immediately.', async () => {
  const mentella = createTestMantella({ loadedOperation: null })
  const startOpParams = createStartOpParams()
  startOpParams.resolveStep = '^'

  await expect(mentella.startOperation(startOpParams)).resolves.not.toThrow()
  expect(startOpParams.sendResponse).toHaveBeenCalledTimes(1)
  expect(startOpParams.sendResponse).toHaveBeenCalledWith({ operationId: '1234', operationStatus: 'running', error: null, lastCompletedStep: '^' })
})

test('Start a new operation but without supplying an operation id.', async () => {
  const mentella = createTestMantella({ loadedOperation: null })
  const startOpParams = createStartOpParams()
  delete startOpParams.operationId

  await expect(mentella.startOperation(startOpParams)).resolves.not.toThrow()
  expect(startOpParams.sendResponse).toHaveBeenCalledTimes(1)
  expect(startOpParams.sendResponse).toHaveBeenCalledWith({ operationId: expect.any(String), operationStatus: 'completed', error: null, lastCompletedStep: 'step1' })
})

test('Fail to start an operation if the operation id has already been used.', async () => {
  const mentella = createTestMantella()
  const startOpParams = createStartOpParams()

  await expect(mentella.startOperation(startOpParams)).rejects.toThrow(MantellaClientError as unknown as Error)
  await expect(mentella.startOperation(startOpParams)).rejects.toThrow('already exists')
})

test('Fail to start an operation if the operation name is not specified.', async () => {
  const mentella = createTestMantella({ loadedOperation: null })
  const startOpParams = createStartOpParams()
  delete startOpParams.operationName

  await expect(mentella.startOperation(startOpParams)).rejects.toThrow(MantellaClientError as unknown as Error)
  await expect(mentella.startOperation(startOpParams)).rejects.toThrow('supply an operation name')
})

test('Fail to start an operation if the operation name is not recognised.', async () => {
  const mentella = createTestMantella({ loadedOperation: null })
  const startOpParams = createStartOpParams()
  startOpParams.operationName = 'unknownOpName'

  await expect(mentella.startOperation(startOpParams)).rejects.toThrow(MantellaClientError as unknown as Error)
  await expect(mentella.startOperation(startOpParams)).rejects.toThrow('unknownOpName')
})

test('Fail to start an operation if the sendResponse function is not provided.', async () => {
  const mentella = createTestMantella({ loadedOperation: null })
  const startOpParams = createStartOpParams()
  delete startOpParams.sendResponse

  await expect(mentella.startOperation(startOpParams)).rejects.toThrow(MantellaClientError as unknown as Error)
  await expect(mentella.startOperation(startOpParams)).rejects.toThrow('sendResponse')
})

