import { expect, jest, test } from '@jest/globals'
import { OperationRecord } from 'mantella-interfaces'
import { logRecordToConsole } from './logRecordToConsole'

function createOperationRecord (): OperationRecord {
  return {
    id: '00000000-0000-0000-0000-000000000000',
    operationName: 'testOp',
    input: ({ foo: 'bar' }),
    started: '2021-08-27T15:09:01.000Z',
    finished: '2021-08-27T15:09:04.000Z',
    logEntries: [{
      dateTime: '2021-08-27T15:09:02.000Z',
      message: 'msg1'
    }],
    stepDataEntries: [{
      name: 's1',
      data: 1234
    }],
    status: 'completed',
    durationInMs: 3000,
    error: null,
    output: null
  } 
}

test('A completed operation is logged on a single line.', async () => {
  const record = createOperationRecord()
  const consoleLog = jest.fn()

  expect(() => logRecordToConsole(consoleLog, record)).not.toThrow()

  expect(consoleLog).toBeCalledTimes(1)
  expect(consoleLog.mock.calls[0][0]).toContain('✓ testOp')
  expect(consoleLog.mock.calls[0][0]).toContain('2021-08-27 15:09:01')
})

test('A failed operation is logged over multiple lines.', async () => {
  const record = createOperationRecord()
  record.status = 'failed'
  record.error = 'ERROR_TEXT'
  const consoleLog = jest.fn()

  expect(() => logRecordToConsole(consoleLog, record)).not.toThrow()

  expect(consoleLog).toBeCalledTimes(5)
  expect(consoleLog.mock.calls[0][0]).toContain('✗ testOp')
  expect(consoleLog.mock.calls[0][0]).toContain('2021-08-27 15:09:01')
  expect(consoleLog.mock.calls[1][0]).toContain('msg1')
  expect(consoleLog.mock.calls[2][0]).toContain('15:09:04')
  expect(consoleLog.mock.calls[2][0]).toContain('Stall')
  expect(consoleLog.mock.calls[3][0]).toContain('s1')
  expect(consoleLog.mock.calls[4][0]).toContain('err:')
  expect(consoleLog.mock.calls[4][0]).toContain('ERROR_TEXT')
})
