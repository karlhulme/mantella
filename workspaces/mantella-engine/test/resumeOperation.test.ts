import { expect, jest, test } from '@jest/globals'
import { ResumeOperationProps, MantellaClientError, MantellaClientOperationNotFoundError } from 'mantella-interfaces'
import { createTestMantella } from './shared.test'

function createResumeOpParams (): ResumeOperationProps {
  return {
    apiKey: 'adminKey',
    operationId: '1234',
    sendResponse: jest.fn()
  }
}

test('Resume an existing operation to completion.', async () => {
  const mentella = createTestMantella()
  const resumeOpParams = createResumeOpParams()

  await expect(mentella.resumeOperation(resumeOpParams)).resolves.not.toThrow()

  expect(resumeOpParams.sendResponse).toHaveBeenCalledTimes(1)
  expect(resumeOpParams.sendResponse).toHaveBeenCalledWith({ operationStatus: 'completed', operationError: null, operationOutput: null, lastCompletedStep: 'step1' })
})

test('Resume an existing operation but resolve early.', async () => {
  const mentella = createTestMantella()
  const resumeOpParams = createResumeOpParams()
  resumeOpParams.resolveStep = 'step1'

  await expect(mentella.resumeOperation(resumeOpParams)).resolves.not.toThrow()

  expect(resumeOpParams.sendResponse).toHaveBeenCalledTimes(1)
  expect(resumeOpParams.sendResponse).toHaveBeenCalledWith({ operationStatus: 'running', operationError: null, operationOutput: null, lastCompletedStep: 'step1' })
})

test('Fail to resume an operation if an api key is not supplied.', async () => {
  const mentella = createTestMantella({ loadedOperation: null })
  const resumeOpParams = createResumeOpParams()
  delete resumeOpParams.apiKey

  await expect(mentella.resumeOperation(resumeOpParams)).rejects.toThrow(MantellaClientError as unknown as Error)
  await expect(mentella.resumeOperation(resumeOpParams)).rejects.toThrow('apiKey')
})

test('Fail to resume an operation if the operation id is not valid.', async () => {
  const mentella = createTestMantella({ loadedOperation: null })
  const resumeOpParams = createResumeOpParams()

  await expect(mentella.resumeOperation(resumeOpParams)).rejects.toThrow(MantellaClientOperationNotFoundError as unknown as Error)
})

test('Fail to resume an operation if the operation type is not recognised.', async () => {
  const mentella = createTestMantella({ loadedOperation: { operationName: 'unknownOpDef' } })
  const resumeOpParams = createResumeOpParams()

  await expect(mentella.resumeOperation(resumeOpParams)).rejects.toThrow(MantellaClientError as unknown as Error)
  await expect(mentella.resumeOperation(resumeOpParams)).rejects.toThrow('unknownOpDef')
})

test('Fail to resume an operation if an operation id is not provided.', async () => {
  const mentella = createTestMantella()
  const resumeOpParams = createResumeOpParams()
  delete resumeOpParams.operationId

  await expect(mentella.resumeOperation(resumeOpParams)).rejects.toThrow(MantellaClientError as unknown as Error)
  await expect(mentella.resumeOperation(resumeOpParams)).rejects.toThrow('operationId')
})

test('Fail to resume an operation if the sendResponse function is not provided.', async () => {
  const mentella = createTestMantella()
  const resumeOpParams = createResumeOpParams()
  delete resumeOpParams.sendResponse

  await expect(mentella.resumeOperation(resumeOpParams)).rejects.toThrow(MantellaClientError as unknown as Error)
  await expect(mentella.resumeOperation(resumeOpParams)).rejects.toThrow('sendResponse')
})
