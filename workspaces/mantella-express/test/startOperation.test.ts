import { test, jest, expect } from '@jest/globals'
import { StartOperationProps } from 'mantella-interfaces'
import supertest from 'supertest'
import { createTestableApp } from './shared.test'

test('200 - start a new operation', async () => {
  const { testableApp, mockMantellaEngine } = createTestableApp()
  const response = await supertest(testableApp)
    .post('/root/ops:testOp')
    .set('x-api-key', 'adminKey')
    .send({ foo: 'bar' })

  expect(response.status).toEqual(200)
  expect(response.header['mantella-last-completed-step']).toEqual('step1')

  expect(mockMantellaEngine.startOperation).toHaveBeenCalledWith({
    apiKey: 'adminKey',
    input: { foo: 'bar' },
    operationName: 'testOp',
    sendResponse: expect.any(Function)
  })
})

test('200 - start a new operation that generates output', async () => {
  const { testableApp } = createTestableApp({
    mantellaEngine: {
      startOperation: jest.fn(async (startProps: StartOperationProps) => {
        startProps && startProps.sendResponse && startProps.sendResponse({
          operationId: startProps.operationId || '1234',
          operationStatus: 'completed',
          lastCompletedStep: 'step1',
          operationError: null,
          operationOutput: { out: 'put'}
        })
      })
    }
  })

  const response = await supertest(testableApp)
    .post('/root/ops:testOp')
    .set('x-api-key', 'adminKey')
    .send({ foo: 'bar' })

  expect(response.status).toEqual(200)
  expect(response.body).toEqual({ out: 'put' })
})

test('200 - start a new operation with an explicit request/operation id', async () => {
  const { testableApp, mockMantellaEngine } = createTestableApp()
  const response = await supertest(testableApp)
    .post('/root/ops:testOp')
    .set('x-api-key', 'adminKey')
    .set('x-request-id', '5678')
    .send({ foo: 'bar' })

  expect(response.status).toEqual(200)
  expect(response.header['mantella-last-completed-step']).toEqual('step1')

  expect(mockMantellaEngine.startOperation).toHaveBeenCalledWith({
    apiKey: 'adminKey',
    input: { foo: 'bar' },
    operationId: '5678',
    operationName: 'testOp',
    sendResponse: expect.any(Function)
  })
})

test('202 - start a new operation with a resolve step', async () => {
  const { testableApp, mockMantellaEngine } = createTestableApp({
    mantellaEngine: {
      startOperation: jest.fn(async (startProps: StartOperationProps) => {
        startProps && startProps.sendResponse && startProps.sendResponse({
          operationId: startProps.operationId || '1234',
          operationStatus: 'running',
          lastCompletedStep: 'step1',
          operationError: null,
          operationOutput: null
        })
      })
    }
  }) 

  const response = await supertest(testableApp)
    .post('/root/ops:testOp')
    .set('x-api-key', 'adminKey')
    .set('mantella-resolve-step', 'targetStep')
    .send({ foo: 'bar' })

  expect(response.status).toEqual(202)
  expect(response.header['mantella-last-completed-step']).toEqual('step1')

  expect(mockMantellaEngine.startOperation).toHaveBeenCalledWith({
    apiKey: 'adminKey',
    input: { foo: 'bar' },
    operationName: 'testOp',
    resolveStep: 'targetStep',
    sendResponse: expect.any(Function)
  })
})

test('400 - start a new operation that fails due to a client input error', async () => {
  const { testableApp } = createTestableApp({
    mantellaEngine: {
      startOperation: jest.fn(async (startProps: StartOperationProps) => {
        startProps && startProps.sendResponse && startProps.sendResponse({
          operationId: startProps.operationId || '1234',
          operationStatus: 'rejected',
          lastCompletedStep: 'step1',
          operationError: 'BAD_INPUT',
          operationOutput: null
        })
      })
    }
  })  

  const response = await supertest(testableApp)
    .post('/root/ops:testOp')
    .set('x-api-key', 'adminKey')
    .send({ foo: 'bar' })

  expect(response.status).toEqual(400)
  expect(response.text).toContain('BAD_INPUT')
})

test('500 - start a new operation that fails due to the service shutting down', async () => {
  const { testableApp } = createTestableApp({
    mantellaEngine: {
      startOperation: jest.fn(async (startProps: StartOperationProps) => {
        startProps && startProps.sendResponse && startProps.sendResponse({
          operationId: startProps.operationId || '1234',
          operationStatus: 'interrupted',
          lastCompletedStep: 'step1',
          operationError: 'INTERRUPT',
          operationOutput: null
        })
      })
    }
  })  

  const response = await supertest(testableApp)
    .post('/root/ops:testOp')
    .set('x-api-key', 'adminKey')
    .send({ foo: 'bar' })

  expect(response.status).toEqual(500)
  expect(response.text).toContain('Operation Interrupted')
})

test('500 - start a new operation that fails due to a failed operation', async () => {
  const { testableApp } = createTestableApp({
    mantellaEngine: {
      startOperation: jest.fn(async (startProps: StartOperationProps) => {
        startProps && startProps.sendResponse && startProps.sendResponse({
          operationId: startProps.operationId || '1234',
          operationStatus: 'failed',
          lastCompletedStep: 'step1',
          operationError: 'FAILED',
          operationOutput: null
        })
      })
    }
  })  

  const response = await supertest(testableApp)
    .post('/root/ops:testOp')
    .set('x-api-key', 'adminKey')
    .send({ foo: 'bar' })

  expect(response.status).toEqual(500)
  expect(response.text).toContain('Operation Execution Error')
})

test('500 - start a new operation that fails due to a service error', async () => {
  const { testableApp } = createTestableApp({
    mantellaEngine: {
      startOperation: async () => { throw new Error('SERVICE_FAILURE') }
    }
  })  

  const response = await supertest(testableApp)
    .post('/root/ops:testOp')
    .set('x-api-key', 'adminKey')
    .send({ foo: 'bar' })

  expect(response.status).toEqual(500)
  expect(response.text).toContain('Internal Error')
})
