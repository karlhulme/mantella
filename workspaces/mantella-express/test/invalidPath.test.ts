import { test, expect } from '@jest/globals'
import supertest from 'supertest'
import { createTestableApp } from './shared.test'

test('404 - fail to access an invalid path', async () => {
  const { testableApp } = createTestableApp()
  const response = await supertest(testableApp)
    .get('/root/unknown/path')
    .set('x-api-key', 'adminKey')
    .send()

  expect(response.status).toEqual(404)
})

test('405 - fail to invoke the root end-point with an invalid verb', async () => {
  const { testableApp } = createTestableApp()
  const response = await supertest(testableApp)
    .post('/root')
    .set('x-api-key', 'adminKey')
    .send()

  expect(response.status).toEqual(405)
})

test('405 - fail to start a new operation with an invalid verb', async () => {
  const { testableApp } = createTestableApp()
  const response = await supertest(testableApp)
    .get('/root/ops:newOp')
    .set('x-api-key', 'adminKey')
    .send()

  expect(response.status).toEqual(405)
})

test('405 - fail to resume an operation with an invalid verb', async () => {
  const { testableApp } = createTestableApp()
  const response = await supertest(testableApp)
    .get('/root/ops/5678:resume')
    .set('x-api-key', 'adminKey')
    .send()

  expect(response.status).toEqual(405)
})

test('405 - fail to get an operation with an invalid verb', async () => {
  const { testableApp } = createTestableApp()
  const response = await supertest(testableApp)
    .patch('/root/ops/5678')
    .set('x-api-key', 'adminKey')
    .send()

  expect(response.status).toEqual(405)
})
