import { expect, jest, test } from '@jest/globals'
import {
  ResumeOperationProps, StartOperationProps,
  MantellaLoadOperationFromDatabaseInvalidResponseError, MantellaLoadOperationFromDatabaseUnexpectedError
} from 'mantella-interfaces'
import { createTestMantella } from './shared.test'

test('An unexpected error loading an operation is handled.', async () => {
  const mantella = createTestMantella({
    mantellaCtor: {
      loadOperationFromDatabase: () => { throw new Error('BAD_LOADING') }
    }
  })

  const resumeOpParams: ResumeOperationProps = {
    apiKey: 'adminKey',
    operationId: '1234',
    sendResponse: jest.fn()
  }

  await expect(mantella.resumeOperation(resumeOpParams)).rejects.toThrow(MantellaLoadOperationFromDatabaseUnexpectedError as unknown as Error)
  await expect(mantella.resumeOperation(resumeOpParams)).rejects.toThrow('BAD_LOADING')
})

test('A failure to return an object result when loading an operation is handled.', async () => {
  const mantella = createTestMantella({
    mantellaCtor: {
      loadOperationFromDatabase: () => undefined
    }
  })

  const resumeOpParams: ResumeOperationProps = {
    apiKey: 'adminKey',
    operationId: '1234',
    sendResponse: jest.fn()
  }

  await expect(mantella.resumeOperation(resumeOpParams)).rejects.toThrow(MantellaLoadOperationFromDatabaseInvalidResponseError as unknown as Error)
  await expect(mantella.resumeOperation(resumeOpParams)).rejects.toThrow('must return an object')
})

test('An error saving an operation is swallowed.', async () => {
  let saveAttempts = 0

  const mantella = createTestMantella({
    loadedOperation: null,
    mantellaCtor: {
      saveOperationToDatabase: () => { saveAttempts++; throw new Error('BAD_SAVING') }
    }
  })

  const startOpParams: StartOperationProps = {
    apiKey: 'adminKey',
    operationId: '1234', // using an operationId forces saving
    input: { foo: 'bar' },
    operationName: 'testOp',
    sendResponse: jest.fn()  
  }

  await expect(mantella.startOperation(startOpParams)).resolves.not.toThrow()
  expect(startOpParams.sendResponse).toHaveBeenCalledTimes(1)
  expect(startOpParams.sendResponse).toHaveBeenCalledWith({ operationId: '1234', operationStatus: 'completed', operationError: null, operationOutput: null, lastCompletedStep: 'step1' })
  expect(saveAttempts).toBeGreaterThan(0)
})
