import { expect, jest, test } from '@jest/globals'
import { OperationInterruptedError } from 'piggle'
import { executeStepFunc } from './executeStepFunc'

test('A function for a step with an existing step result will not be executed again.', async () => {
  const stepFunc = jest.fn(async () => undefined)

  await expect(executeStepFunc({
    stepName: 'bbb',
    stepDataEntries: [{
      name: 'aaa',
      data: 'foo'
    }, {
      name: 'bbb',
      data: 'bar'
    }],
    retryableOptions: {},
    stepFunc
   })).resolves.toEqual('bar')

   expect(stepFunc).toBeCalledTimes(0)
})

test('A function for a step without an existing result will be executed.', async () => {
  const stepFunc = jest.fn(async () => 'new value')

  const stepDataEntries = [{
    name: 'aaa',
    data: 'foo'
  }, {
    name: 'bbb',
    data: 'bar'
  }]

  await expect(executeStepFunc({
    stepName: 'ccc',
    stepDataEntries,
    retryableOptions: {},
    stepFunc
   })).resolves.toEqual('new value')

   expect(stepFunc).toBeCalledTimes(1)

   expect(stepDataEntries).toHaveLength(3)
   expect(stepDataEntries[2]).toEqual({ name: 'ccc', data: 'new value' })
})

test('A function will not be executed if the operation has been cancelled.', async () => {
  const stepFunc = jest.fn(async () => 'new value')

  await expect(executeStepFunc({
    stepName: 'ccc',
    stepDataEntries: [],
    retryableOptions: { canContinueProcessing: () => false },
    stepFunc
   })).rejects.toThrow(OperationInterruptedError as unknown as Error)

   expect(stepFunc).toBeCalledTimes(0)
})

