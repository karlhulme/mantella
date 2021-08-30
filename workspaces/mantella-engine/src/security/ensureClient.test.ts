import { expect, test } from '@jest/globals'
import { Client } from 'mantella-interfaces'
import { ensureClient } from './ensureClient'

const clients: Client[] = [{
  name: 'aClient',
  apiKeys: ['adminKey'],
  operations: true
}]

test('Can find a valid client.', () => {
  expect(ensureClient('adminKey', clients)).toEqual({
    name: 'aClient',
    operations: true
  })
})

test('Error raised if client cannot be found based on api key.', () => {
  expect(() => ensureClient('unknown', clients)).toThrow()
})
