import { expect, test } from '@jest/globals'
import { OperationDefinition, OperationRecord } from 'mantella-interfaces'
import { Mantella, MantellaConstructorProps } from '../src'

interface CreateMantellaProps {
  loadedOperation?: Record<string, unknown>|null
  operationDefinition?: Record<string, unknown>
  mantellaCtor?: Record<string, unknown>
}

export function createTestMantella (props?: CreateMantellaProps): Mantella<string> {
  const record: OperationRecord = {
    id: '00000000-0000-0000-0000-000000000000',
    operationName: 'testOp',
    input: ({ foo: 'bar' }),
    started: '2021-08-27T18:01:01.000Z',
    finished: '2021-08-27T18:01:03.000Z',
    logEntries: [{
      dateTime: '2021-08-27T18:01:02.000',
      message: 'A log entry'
    }],
    stepDataEntries: [{
      name: 's1',
      data: 1234
    }],
    status: 'failed',
    durationInMs: 2000,
    error: 'previous_error_condition'
  }

  Object.assign(record, props?.loadedOperation)

  const operation: OperationDefinition<string, string> = {
    name: 'testOp',
    inputValidator: () => undefined,
    saveProgress: false,
    func: async ({ log, step }) => {
      log({ message: 'open' })
      await step({ stepName: 'step1', func: async () => 'foo' })
    }
  }

  Object.assign(operation, props?.operationDefinition)

  const ctorProps: MantellaConstructorProps<string> = {
    clients: [{
      name: 'admin',
      apiKeys: ['adminKey'],
      operations: true,
      manage: true
    }],
    loadOperationFromDatabase: async () => ({ record: props?.loadedOperation === null ? undefined : record }),
    saveOperationToDatabase: async () => undefined,
    operations: [operation as OperationDefinition<unknown, unknown>],
    services: 'theServices',
    logToConsole: false    
  }

  Object.assign(ctorProps, props?.mantellaCtor)

  const mantella = new Mantella<string>(ctorProps)

  return mantella
}

test('A Mantella can be constructed.', async () => {
  expect(createTestMantella).toBeInstanceOf(Function)
})
