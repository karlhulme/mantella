import { test, jest, expect } from '@jest/globals'
import express, { json, Request, Response } from 'express'
import { MantellaEngine } from 'mantella-interfaces'
import { createMantellaExpress } from '../src'

interface CreateTestableAppProps {
  mantellaEngine: Record<string, unknown>
}

export function createTestableApp (props?: CreateTestableAppProps): { testableApp: (req: Request, res: Response) => void, mockMantellaEngine: MantellaEngine } {
  const mockMantellaEngine: MantellaEngine = {
    getOperation: async () => ({
      record: {
        id: '00000000-0000-0000-0000-000000000000',
        operationName: 'testOp',
        input: ({ foo: 'bar' }),
        started: '2021-08-29T18:01:01.000Z',
        finished: '2021-08-29T18:01:03.000Z',
        logEntries: [{
          dateTime: '2021-08-29T18:01:02.000',
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
    }),
    resumeOperation: jest.fn(async resumeProps => {
      resumeProps && resumeProps.sendResponse && resumeProps.sendResponse({
        operationStatus: 'completed',
        lastCompletedStep: 'step1',
        error: null
      })
    }),
    startOperation: jest.fn(async startProps => {
      startProps && startProps.sendResponse && startProps.sendResponse({
        operationId: startProps.operationId || '1234',
        operationStatus: 'completed',
        lastCompletedStep: 'step1',
        error: null
      })
    })
  }

  Object.assign(mockMantellaEngine, props?.mantellaEngine)

  const mantellaExpress = createMantellaExpress({
    mantella: mockMantellaEngine
  })

  const testableApp = express()
  testableApp.use(json())
  testableApp.use('/root', mantellaExpress)

  return { testableApp, mockMantellaEngine }
}

test('A testable Mantella express can be constructed.', async () => {
  expect(createTestableApp).toBeInstanceOf(Function)
})
