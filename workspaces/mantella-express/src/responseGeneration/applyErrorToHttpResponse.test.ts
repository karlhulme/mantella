import { test, expect, jest } from '@jest/globals'
import { Request, Response } from 'express'
import { MantellaClientOperationNotFoundError } from 'mantella-interfaces'
import { MantellaExpressRequestError, MantellaExpressUnsupportedRequestContentTypeError, MantellaExpressUnsupportedResponseContentTypeError } from '../errors'
import { applyErrorToHttpResponse } from './applyErrorToHttpResponse'

function createMockReq (): Request {
  return {
    url: 'http://server/path',
    body: 'some content'
  } as unknown as Request
}

function createMockRes (): Response {
  return {
    send: jest.fn(),
    set: jest.fn(),
    status: jest.fn()
  } as unknown as Response
}

test('Apply a internal (unrecognised) error to an http response', () => {
  const req = createMockReq()
  const res = createMockRes()
  applyErrorToHttpResponse(req, res, { err: new Error('secret error') })
  expect(res.status).toHaveProperty('mock.calls.length', 1)
  expect(res.status).toHaveProperty(['mock', 'calls', '0'], [500])
  expect(res.set).toHaveProperty('mock.calls.length', 1)
  expect(res.set).toHaveProperty(['mock', 'calls', '0'], ['content-type', 'text/plain'])
  expect(res.send).toHaveProperty('mock.calls.length', 1)
  expect(res.send).toHaveProperty(['mock', 'calls', '0'], ['Internal Error'])
})

test('Apply a request error to an http response', () => {
  const req = createMockReq()
  const res = createMockRes()
  applyErrorToHttpResponse(req, res, { err: new MantellaExpressRequestError('problem') })
  expect(res.status).toHaveProperty('mock.calls.length', 1)
  expect(res.status).toHaveProperty(['mock', 'calls', '0'], [400])
  expect(res.send).toHaveProperty('mock.calls.length', 1)
  expect(res.send).toHaveProperty(['mock', 'calls', '0'], ['problem'])
})

test('Apply an unsupported request type error to an http response', () => {
  const req = createMockReq()
  const res = createMockRes()
  applyErrorToHttpResponse(req, res, { err: new MantellaExpressUnsupportedRequestContentTypeError('a', 'b') })
  expect(res.status).toHaveProperty('mock.calls.length', 1)
  expect(res.status).toHaveProperty(['mock', 'calls', '0'], [415])
})

test('Apply an unsupported content type error to an http response', () => {
  const req = createMockReq()
  const res = createMockRes()
  applyErrorToHttpResponse(req, res, { err: new MantellaExpressUnsupportedResponseContentTypeError('a', 'b') })
  expect(res.status).toHaveProperty('mock.calls.length', 1)
  expect(res.status).toHaveProperty(['mock', 'calls', '0'], [406])
})

test('Apply a doc not found error to an http response', () => {
  const req = createMockReq()
  const res = createMockRes()
  applyErrorToHttpResponse(req, res, { err: new MantellaClientOperationNotFoundError('could not find operation.') })
  expect(res.status).toHaveProperty('mock.calls.length', 1)
  expect(res.status).toHaveProperty(['mock', 'calls', '0'], [404])
})

// test('Apply an action forbidden error to an http response', () => {
//   const req = createMockReq()
//   const res = createMockRes()
//   applyErrorToHttpResponse(req, res, { err: new MantellaActionForbiddenByPolicyError('film', 'delete') })
//   expect(res.status).toHaveProperty('mock.calls.length', 1)
//   expect(res.status).toHaveProperty(['mock', 'calls', '0'], [403])
// })

// test('Apply an api key not supplied error to an http response', () => {
//   const req = createMockReq()
//   const res = createMockRes()
//   applyErrorToHttpResponse(req, res, { err: new MantellaActionForbiddenByPolicyError('film', 'delete') })
//   expect(res.status).toHaveProperty('mock.calls.length', 1)
//   expect(res.status).toHaveProperty(['mock', 'calls', '0'], [401])
// })