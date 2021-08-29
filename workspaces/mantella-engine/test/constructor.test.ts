import { expect, test } from '@jest/globals'
import { Mantella } from '../src'

test('A Mantella can be constructed.', async () => {
  const mantella = new Mantella<string>({
    loadOperationFromDatabase: async () => ({}),
    saveOperationToDatabase: async () => undefined,
    operations: [],
    services: 'theServices'
  })

  expect(mantella).toBeDefined()
})

test('A Mantella cannot be constructed without a loadOperationFromDatabase function.', async () => {
  expect(() => new Mantella<string>({
    saveOperationToDatabase: async () => undefined,
    operations: [],
    services: 'theServices'
  })).toThrow('loadOperationFromDatabase')
})

test('A Mantella cannot be constructed without a saveOperationToDatabase function.', async () => {
  expect(() => new Mantella<string>({
    loadOperationFromDatabase: async () => ({}),
    operations: [],
    services: 'theServices'
  })).toThrow('saveOperationToDatabase')
})

test('A Mantella cannot be constructed without an operations array.', async () => {
  expect(() => new Mantella<string>({
    loadOperationFromDatabase: async () => ({}),
    saveOperationToDatabase: async () => undefined,
    services: 'theServices'
  })).toThrow('operations')
})

test('A Mantella cannot be constructed without a services property.', async () => {
  expect(() => new Mantella<string>({
    loadOperationFromDatabase: async () => ({}),
    saveOperationToDatabase: async () => undefined,
    operations: []
  })).toThrow('services')
})
