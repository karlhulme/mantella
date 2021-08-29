import { expect, jest, test } from '@jest/globals'
import { OperationInterruptedError } from 'piggle'
import { executeStep } from './executeStep'

function createTestParams () {
  return {
    canContinueProcessing: () => true,
    retryIntervalsInMilliseconds: [100, 200],
    func: jest.fn(async () => 'hello'),
    saveOperation: jest.fn(async () => undefined),
    sendResponse: jest.fn(),
    saveProgress: false,
    stepDataEntries: [],
    stepName: 'test',
    resolveStepName: 'resolveHere'
  }
}

test('A step can be executed.', async () => {
  const params = createTestParams()

  await expect(executeStep(params)).resolves.not.toThrow()
  expect(params.func).toHaveBeenCalledTimes(1)
  expect(params.saveOperation).toHaveBeenCalledTimes(0)
  expect(params.sendResponse).toHaveBeenCalledTimes(0)
})

test('A step can be executed and the result saved.', async () => {
  const params = createTestParams()
  params.saveProgress = true

  await expect(executeStep(params)).resolves.not.toThrow()
  expect(params.func).toHaveBeenCalledTimes(1)
  expect(params.saveOperation).toHaveBeenCalledTimes(1)
  expect(params.sendResponse).toHaveBeenCalledTimes(0)
})

test('A step can be executed and the result sent to the client.', async () => {
  const params = createTestParams()
  params.stepName = 'resolveHere'

  await expect(executeStep(params)).resolves.not.toThrow()
  expect(params.func).toHaveBeenCalledTimes(1)
  expect(params.saveOperation).toHaveBeenCalledTimes(0)
  expect(params.sendResponse).toHaveBeenCalledTimes(1)
})

test('A step can be interrupted.', async () => {
  const params = createTestParams()
  params.canContinueProcessing = () => false

  await expect(executeStep(params)).rejects.toThrow(OperationInterruptedError as unknown as Error)
  expect(params.func).toHaveBeenCalledTimes(0)
  expect(params.saveOperation).toHaveBeenCalledTimes(0)
  expect(params.sendResponse).toHaveBeenCalledTimes(0)
})
