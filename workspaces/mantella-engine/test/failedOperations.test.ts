import { expect, jest, test } from '@jest/globals'
import { StartOperationProps, OperationFunction, MantellaOperationRejectedError } from 'mantella-interfaces'
import { createTestMantella } from './shared.test'

function createStartOpParams (): StartOperationProps {
  return {
    apiKey: 'adminKey',
    operationId: '1234',
    input: { foo: 'bar' },
    operationName: 'testOp',
    sendResponse: jest.fn()  
  }
}

test('Start a new operation that fails due to an unknown error inbetween steps.', async () => {
  const mentella = createTestMantella({
    loadedOperation: null,
    operationDefinition: {
      func: async () => {
        throw new Error('OP_FAILED')
      }
    }
  })
  const startOpParams = createStartOpParams()

  await expect(mentella.startOperation(startOpParams)).resolves.not.toThrow()
  expect(startOpParams.sendResponse).toHaveBeenCalledTimes(1)
  expect(startOpParams.sendResponse).toHaveBeenCalledWith({ operationId: '1234', operationStatus: 'failed', error: expect.stringContaining('OP_FAILED'), lastCompletedStep: '^' })
})

test('Start a new operation that fails due to an unknown error within a step.', async () => {
  const func: OperationFunction<string, string> = async ({ step }) => {
    await step({ stepName: 'step1', func: () => { throw new Error('STEP_ERROR') } })
  }

  const mentella = createTestMantella({
    loadedOperation: null,
    operationDefinition: {
      func
    }
  })

  const startOpParams = createStartOpParams()

  await expect(mentella.startOperation(startOpParams)).resolves.not.toThrow()
  expect(startOpParams.sendResponse).toHaveBeenCalledTimes(1)
  expect(startOpParams.sendResponse).toHaveBeenCalledWith({ operationId: '1234', operationStatus: 'failed', error: expect.stringContaining('STEP_ERROR'), lastCompletedStep: '^' })
})

test('Start a new operation that rejects bad input.', async () => {
  const mentella = createTestMantella({
    loadedOperation: null,
    operationDefinition: {
      inputValidator: () => { throw new Error('BAD_INPUT') }
    }
  })

  const startOpParams = createStartOpParams()

  await expect(mentella.startOperation(startOpParams)).resolves.not.toThrow()
  expect(startOpParams.sendResponse).toHaveBeenCalledTimes(1)
  expect(startOpParams.sendResponse).toHaveBeenCalledWith({ operationId: '1234', operationStatus: 'rejected', error: expect.stringContaining('BAD_INPUT'), lastCompletedStep: '^' })
})

test('Start a new operation that rejects due to invalid state/request.', async () => {
  const mentella = createTestMantella({
    loadedOperation: null,
    operationDefinition: {
      func: async () => {
        throw new MantellaOperationRejectedError('MANUALLY_REJECT')
      }
    }
  })
  const startOpParams = createStartOpParams()

  await expect(mentella.startOperation(startOpParams)).resolves.not.toThrow()
  expect(startOpParams.sendResponse).toHaveBeenCalledTimes(1)
  expect(startOpParams.sendResponse).toHaveBeenCalledWith({ operationId: '1234', operationStatus: 'rejected', error: expect.stringContaining('MANUALLY_REJECT'), lastCompletedStep: '^' })
})

test('Start a new operation that is interrupted by a shutdown.', async () => {
  const mentella = createTestMantella({
    loadedOperation: null,
    mantellaCtor: {
      canContinueProcessing: () => false
    }
  })
  const startOpParams = createStartOpParams()

  await expect(mentella.startOperation(startOpParams)).resolves.not.toThrow()
  expect(startOpParams.sendResponse).toHaveBeenCalledTimes(1)
  expect(startOpParams.sendResponse).toHaveBeenCalledWith({ operationId: '1234', operationStatus: 'interrupted', error: expect.stringContaining('interrupted'), lastCompletedStep: '^' })
})
