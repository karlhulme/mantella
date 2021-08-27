import { expect, jest, test } from '@jest/globals'
import { OperationDefinition, OperationStatus } from 'mantella-interfaces'
import { executeOperation } from './executeOperation'

interface TestInput {
  foo: string
}

interface TestServices {
  serviceA: number
}

const testDefinition: OperationDefinition<TestInput, TestServices> = {
  name: 'testOp',
  inputValidator: () => ({ foo: 'bar' }),
  saveProgress: false,
  func: async ({ log }) => {
    log({ message: 'hello' })
  }
}

function createTestParams () {
  return {
    canContinueProcessing: () => true,
    defaultRetryIntervalsInMilliseconds: [100, 200],
    logResult: jest.fn(),
    operation: testDefinition as OperationDefinition<unknown, unknown>,
    resolveOperation: jest.fn(),
    rejectOperation: jest.fn(),
    saveOperation: jest.fn(async () => undefined),
    record: {
      id: '00000000-0000-0000-0000-000000000000',
      operationName: 'testOp',
      input: ({ foo: 'bar' }),
      started: '2021-08-27T15:09:01.000Z',
      finished: null,
      logEntries: [],
      stepDataEntries: [],
      status: 'running' as OperationStatus,
      durationInMs: 0,
      error: null
    },
    requestIdSupplied: false,
    resolveStep: null,
    services: null
  }
}

test('An operation should be executed and the result logged.', async () => {
  const params = createTestParams()

  await expect(executeOperation(params)).resolves.not.toThrow()

  expect(params.logResult).toHaveBeenCalledTimes(1)
  expect(params.record.status).toEqual('completed')
})

// if saving then,
// test for saving upfront, and after each step, and at the end

// if not saving but error occurs,
// test for saving at point of error

// if fails due to invalid input - then status should be rejected

// if fails due to anything else - then status should be failed

// resolving can happen early but operation should still finish

// resolving should happen at the end if it didn't occur earlier
