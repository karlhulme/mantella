import { test, jest, expect } from '@jest/globals'
import { ResumeOperationProps } from 'mantella-interfaces'
import supertest from 'supertest'
import { createTestableApp } from './shared.test'

test('200 - resume an new operation', async () => {
  const { testableApp, mockMantellaEngine } = createTestableApp()
  const response = await supertest(testableApp)
    .post('/root/ops/5678:resume')
    .set('x-api-key', 'adminKey')
    .send()

  expect(response.status).toEqual(200)
  expect(response.header['mantella-last-completed-step']).toEqual('step1')

  expect(mockMantellaEngine.resumeOperation).toHaveBeenCalledWith({
    apiKey: 'adminKey',
    operationId: '5678',
    sendResponse: expect.any(Function)
  })
})

test('202 - resume an operation with a resolve step', async () => {
  const { testableApp, mockMantellaEngine } = createTestableApp({
    mantellaEngine: {
      resumeOperation: jest.fn(async (resumeProps: ResumeOperationProps) => {
        resumeProps && resumeProps.sendResponse && resumeProps.sendResponse({
          operationStatus: 'running',
          lastCompletedStep: 'step1',
          error: null
        })
      })
    }
  })

  const response = await supertest(testableApp)
    .post('/root/ops/5678:resume')
    .set('x-api-key', 'adminKey')
    .set('mantella-resolve-step', 'targetStep')
    .send()

  expect(response.status).toEqual(202)
  expect(response.header['mantella-last-completed-step']).toEqual('step1')

  expect(mockMantellaEngine.resumeOperation).toHaveBeenCalledWith({
    apiKey: 'adminKey',
    operationId: '5678',
    resolveStep: 'targetStep',
    sendResponse: expect.any(Function)
  })
})

test('400 - resume an operation that fails due to a client input error', async () => {
  const { testableApp } = createTestableApp({
    mantellaEngine: {
      resumeOperation: jest.fn(async (resumeProps: ResumeOperationProps) => {
        resumeProps && resumeProps.sendResponse && resumeProps.sendResponse({
          operationStatus: 'rejected',
          lastCompletedStep: 'step1',
          error: 'BAD_INPUT'
        })
      })
    }
  })  

  const response = await supertest(testableApp)
    .post('/root/ops/5678:resume')
    .set('x-api-key', 'adminKey')
    .send()

  expect(response.status).toEqual(400)
  expect(response.text).toContain('BAD_INPUT')
})

test('500 - resume an operation that fails due to the service shutting down', async () => {
  const { testableApp } = createTestableApp({
    mantellaEngine: {
      resumeOperation: jest.fn(async (resumeProps: ResumeOperationProps) => {
        resumeProps && resumeProps.sendResponse && resumeProps.sendResponse({
          operationStatus: 'interrupted',
          lastCompletedStep: 'step1',
          error: 'INTERRUPT'
        })
      })
    }
  })  

  const response = await supertest(testableApp)
    .post('/root/ops/5678:resume')
    .set('x-api-key', 'adminKey')
    .send()

  expect(response.status).toEqual(500)
  expect(response.text).toContain('Operation Interrupted')
})

test('500 - resume an operation that fails due to a failed operation', async () => {
  const { testableApp } = createTestableApp({
    mantellaEngine: {
      resumeOperation: jest.fn(async (resumeProps: ResumeOperationProps) => {
        resumeProps && resumeProps.sendResponse && resumeProps.sendResponse({
          operationStatus: 'failed',
          lastCompletedStep: 'step1',
          error: 'FAILED'
        })
      })
    }
  })

  const response = await supertest(testableApp)
    .post('/root/ops/5678:resume')
    .set('x-api-key', 'adminKey')
    .send()

  expect(response.status).toEqual(500)
  expect(response.text).toContain('Operation Execution Error')
})

test('500 - resume an operation that fails due to a service error', async () => {
  const { testableApp } = createTestableApp({
    mantellaEngine: {
      resumeOperation: async () => { throw new Error('SERVICE_FAILURE') }
    }
  })  

  const response = await supertest(testableApp)
    .post('/root/ops/5678:resume')
    .set('x-api-key', 'adminKey')
    .send()

  expect(response.status).toEqual(500)
  expect(response.text).toContain('Internal Error')
})
