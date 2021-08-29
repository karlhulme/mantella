import { test, expect } from '@jest/globals'
import supertest from 'supertest'
import { createTestableApp } from './shared.test'

test('200 - access the root of the service', async () => {
  const { testableApp } = createTestableApp()
  const response = await supertest(testableApp)
    .get('/root')
    .set('x-api-key', 'adminKey')
    .send()

  expect(response.status).toEqual(200)
  expect(response.text).toContain('service is running')
})
