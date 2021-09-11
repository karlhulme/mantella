import { expect, jest, test } from '@jest/globals'
import {
  OperationDefinition, OperationRecord, OperationStatus,
  MantellaMalformedOperationInputError, MantellaOperationRejectedError
} from 'mantella-interfaces'
import { executeOperation } from './executeOperation'

interface TestInput {
  foo: string
}

interface TestServices {
  serviceA: number
}

function createTestDefinition (): OperationDefinition<TestInput, TestServices> {
  return {
    name: 'testOp',
    inputValidator: () => ({ foo: 'bar' }),
    saveModel: 'error',
    func: async ({ log, output, pause, step }) => {
      log({ message: 'hello' })
      pause(100)
      output({ value: { out: 'put' } })
      await step({ stepName: 's1', func: async () => 's1result' })
    }
  }
}

function createTestParams () {
  return {
    canContinueProcessing: () => true,
    defaultRetryIntervalsInMilliseconds: [100, 200],
    operation: createTestDefinition() as OperationDefinition<unknown, unknown>,
    sendResponse: jest.fn(),
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
      error: null,
      output: null
    } as OperationRecord,
    saveProgress: false,
    resolveStep: null as string|null,
    services: null
  }
}

test('An operation can be executed and the result logged.', async () => {
  const params = createTestParams()

  await expect(executeOperation(params)).resolves.not.toThrow()

  expect(params.record.status).toEqual('completed')
  expect(params.record.output).toEqual({ out: 'put' })
  expect(params.saveOperation).toHaveBeenCalledTimes(0)
  expect(params.sendResponse).toHaveBeenCalledTimes(1)
})

test('Am operation that previously failed will have the error removed and can be re-run successfully.', async () => {
  const params = createTestParams()
  params.record.status = 'failed'
  params.record.error = 'PREVIOUS ERROR'
  await expect(executeOperation(params)).resolves.not.toThrow()
  
  expect(params.record.status).toEqual('completed')
  expect(params.record.error).toEqual(null)
  expect(params.saveOperation).toHaveBeenCalledTimes(0)
  expect(params.sendResponse).toHaveBeenCalledTimes(1)
})

test('An operation can be executed with the data saved before, after each step, and upon completion, if instructed to save progress.', async () => {
  const params = createTestParams()
  params.operation.saveModel = 'always'
  await expect(executeOperation(params)).resolves.not.toThrow()
  
  expect(params.record.status).toEqual('completed')
  expect(params.saveOperation).toHaveBeenCalledTimes(3) // one at the start, one for s1, then again at the end.
  expect(params.sendResponse).toHaveBeenCalledTimes(1)
})

test('An operation can be executed with the data saved before, after each step, and upon completion, if instructed to save progress.', async () => {
  const params = createTestParams()
  params.saveProgress = true
  await expect(executeOperation(params)).resolves.not.toThrow()
  
  expect(params.record.status).toEqual('completed')
  expect(params.saveOperation).toHaveBeenCalledTimes(3) // one at the start, one for s1, then again at the end.
  expect(params.sendResponse).toHaveBeenCalledTimes(1)
})

test('An operation can be executed with the resolution occurring immediately.', async () => {
  const params = createTestParams()
  params.resolveStep = '^'
  let earlyStatus = ''
  params.sendResponse = jest.fn(() => { earlyStatus = params.record.status })
  await expect(executeOperation(params)).resolves.not.toThrow()
  
  expect(earlyStatus).toEqual('running')
  expect(params.record.status).toEqual('completed')
  expect(params.saveOperation).toHaveBeenCalledTimes(0)
  expect(params.sendResponse).toHaveBeenCalledTimes(1)
})

test('An operation can be executed with the resolution occurring once the output is available.', async () => {
  const params = createTestParams()
  params.resolveStep = '?'
  let earlyStatus = ''
  let earlyOutput: unknown = null
  params.sendResponse = jest.fn(() => { earlyStatus = params.record.status, earlyOutput = params.record.output })
  await expect(executeOperation(params)).resolves.not.toThrow()
  
  expect(earlyStatus).toEqual('running')
  expect(earlyOutput).toEqual({ out: 'put' })
  expect(params.record.status).toEqual('completed')
  expect(params.saveOperation).toHaveBeenCalledTimes(0)
  expect(params.sendResponse).toHaveBeenCalledTimes(1)
})

test('An operation can be executed with the resolution occurring early.', async () => {
  const params = createTestParams()
  params.resolveStep = 's1'
  let earlyStatus = ''
  params.sendResponse = jest.fn(() => { earlyStatus = params.record.status })
  await expect(executeOperation(params)).resolves.not.toThrow()
  
  expect(earlyStatus).toEqual('running')
  expect(params.record.status).toEqual('completed')
  expect(params.record.error).toEqual(null)
  expect(params.saveOperation).toHaveBeenCalledTimes(0)
  expect(params.sendResponse).toHaveBeenCalledTimes(1)
})

test('A failed operation can be executed and error details saved.', async () => {
  const params = createTestParams()
  params.operation.func = () => { throw new Error('FAIL') }
  await expect(executeOperation(params)).resolves.not.toThrow()
  
  expect(params.record.status).toEqual('failed')
  expect(params.record.error).toContain('FAIL')
  expect(params.record.error).toContain('at executeOperation')
  expect(params.saveOperation).toHaveBeenCalledTimes(1)
  expect(params.sendResponse).toHaveBeenCalledTimes(1)
})

test('A rejected operation (due to bad input) can be executed.', async () => {
  const params = createTestParams()
  params.operation.inputValidator = () => { throw new MantellaMalformedOperationInputError('some input failing') }
  await expect(executeOperation(params)).resolves.not.toThrow()
  
  expect(params.record.status).toEqual('rejected')
  expect(params.record.error).toContain('MALFORMED_INPUT some input failing')
  expect(params.record.error).not.toContain('at executeOperation')
  expect(params.saveOperation).toHaveBeenCalledTimes(0)
  expect(params.sendResponse).toHaveBeenCalledTimes(1)
})

test('A rejected operation (due to bad input) can be executed and error details saved.', async () => {
  const params = createTestParams()
  params.operation.saveModel = 'rejection'
  params.operation.inputValidator = () => { throw new MantellaMalformedOperationInputError('some input failing') }
  await expect(executeOperation(params)).resolves.not.toThrow()
  expect(params.saveOperation).toHaveBeenCalledTimes(1)
})

test('A rejected operation (that is operation-specific) can be executed.', async () => {
  const params = createTestParams()
  params.operation.inputValidator = () => { throw new MantellaOperationRejectedError('OP-FAIL', 'some message') }
  await expect(executeOperation(params)).resolves.not.toThrow()
  
  expect(params.record.status).toEqual('rejected')
  expect(params.record.error).toContain('OP-FAIL some message')
  expect(params.record.error).not.toContain('at executeOperation')
  expect(params.saveOperation).toHaveBeenCalledTimes(0)
  expect(params.sendResponse).toHaveBeenCalledTimes(1)
})

test('A rejected operation (that is operation-specific) can be executed and error details saved.', async () => {
  const params = createTestParams()
  params.operation.saveModel = 'rejection'
  params.operation.inputValidator = () => { throw new MantellaOperationRejectedError('OP-FAIL', 'some message') }
  await expect(executeOperation(params)).resolves.not.toThrow()
  expect(params.saveOperation).toHaveBeenCalledTimes(1)
})

test('An operation that is interrupted will be saved.', async () => {
  const params = createTestParams()
  params.canContinueProcessing = () => false

  await expect(executeOperation(params)).resolves.not.toThrow()

  expect(params.record.status).toEqual('interrupted')
  expect(params.saveOperation).toHaveBeenCalledTimes(1)
  expect(params.sendResponse).toHaveBeenCalledTimes(1)
})
