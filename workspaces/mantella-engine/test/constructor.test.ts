import { expect, test } from '@jest/globals'
import { Mantella } from '../src'

test('A Mantella can be constructed with clients.', async () => {
  const mantella = new Mantella<string>({
    clients: [{
      name: 'admin',
      apiKeys: ['adminKey'],
      operations: true,
      manage: true
    }],
    loadOperationFromDatabase: async () => ({}),
    saveOperationToDatabase: async () => undefined,
    operations: [],
    services: 'theServices'
  })

  expect(mantella).toBeDefined()
})

test('A Mantella can be constructed without clients.', async () => {
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

test('Create a mantella engine with a client that uses environment variable based api keys.', () => {
  process.env.ADMIN_PRIMARY_KEY = 'aaaa'
  process.env.ADMIN_SECONDARY_KEY = 'bbbb'

  const mantella = new Mantella({
    clients: [{
      name: 'admin',
      operations: true,
      apiKeys: ['$ADMIN_PRIMARY_KEY', '$ADMIN_SECONDARY_KEY']
    }],
    loadOperationFromDatabase: async () => ({}),
    saveOperationToDatabase: async () => undefined,
    operations: [],
    services: 'theServices'
  })

  expect(mantella.getApiKeysLoadedFromEnvCount()).toEqual(2)
  expect(mantella.getApiKeysNotFoundInEnvCount()).toEqual(0)
})

test('Create a mantella engine with a client that uses environment variable based api keys that do not exist.', () => {
  const mantella = new Mantella({
    clients: [{
      name: 'admin',
      operations: true,
      apiKeys: ['$ADMIN_NON_EXISTENT_PRIMARY_KEY', '$ADMIN_NON_EXISTENT_SECONDARY_KEY']
    }],
    loadOperationFromDatabase: async () => ({}),
    saveOperationToDatabase: async () => undefined,
    operations: [],
    services: 'theServices'
  })
  
  expect(mantella.getApiKeysLoadedFromEnvCount()).toEqual(0)
  expect(mantella.getApiKeysNotFoundInEnvCount()).toEqual(2)
})
