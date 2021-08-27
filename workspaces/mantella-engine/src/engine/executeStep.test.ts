import { expect, jest, test } from '@jest/globals'
import { executeStep } from './executeStep'

function createTestParams () {
  return {
    retryIntervalsInMilliseconds: [100, 200],
    func: jest.fn(async () => 'hello'),
    saveOp: jest.fn(async () => undefined),
    resolveOp: jest.fn(),
    saveStepResult: false,
    stepDataEntries: [],
    stepName: 'test',
    resolveStepName: 'resolveHere'
  }
}

test('A step can be executed.', async () => {
  const params = createTestParams()

  await expect(executeStep(params)).resolves.not.toThrow()
  expect(params.func).toHaveBeenCalledTimes(1)
  expect(params.saveOp).toHaveBeenCalledTimes(0)
  expect(params.resolveOp).toHaveBeenCalledTimes(0)
})

test('A step can be executed and the result saved.', async () => {
  const params = createTestParams()
  params.saveStepResult = true

  await expect(executeStep(params)).resolves.not.toThrow()
  expect(params.func).toHaveBeenCalledTimes(1)
  expect(params.saveOp).toHaveBeenCalledTimes(1)
  expect(params.resolveOp).toHaveBeenCalledTimes(0)
})

test('A step can be executed and the result sent to the client.', async () => {
  const params = createTestParams()
  params.stepName = 'resolveHere'

  await expect(executeStep(params)).resolves.not.toThrow()
  expect(params.func).toHaveBeenCalledTimes(1)
  expect(params.saveOp).toHaveBeenCalledTimes(0)
  expect(params.resolveOp).toHaveBeenCalledTimes(1)
})
