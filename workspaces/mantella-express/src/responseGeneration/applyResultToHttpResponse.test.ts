import { test, expect, jest } from '@jest/globals'
import { Response } from 'express'
import { applyResultToHttpResponse } from './applyResultToHttpResponse'

function createMockRes (): Response {
  return {
    end: jest.fn(),
    json: jest.fn(),
    send: jest.fn(),
    set: jest.fn(),
    status: jest.fn()
  } as unknown as Response
}

test('Apply a plain text result to an http response', () => {
  const res = createMockRes()
  applyResultToHttpResponse(res, {
    text: 'plain',
    statusCode: 200
  })
  expect(res.status).toHaveProperty('mock.calls.length', 1)
  expect(res.status).toHaveProperty(['mock', 'calls', '0'], [200])
  expect(res.set).toHaveProperty('mock.calls.length', 1)
  expect(res.set).toHaveProperty(['mock', 'calls', '0'], ['content-type', 'text/plain'])
  expect(res.send).toHaveProperty('mock.calls.length', 1)
  expect(res.send).toHaveProperty(['mock', 'calls', '0'], ['plain'])
})

test('Apply an html result to an http response', () => {
  const res = createMockRes()
  applyResultToHttpResponse(res, {
    html: '<html />',
    statusCode: 200
  })
  expect(res.status).toHaveProperty('mock.calls.length', 1)
  expect(res.status).toHaveProperty(['mock', 'calls', '0'], [200])
  expect(res.set).toHaveProperty('mock.calls.length', 1)
  expect(res.set).toHaveProperty(['mock', 'calls', '0'], ['content-type', 'text/html'])
  expect(res.send).toHaveProperty('mock.calls.length', 1)
  expect(res.send).toHaveProperty(['mock', 'calls', '0'], ['<html />'])
})

test('Apply a json result to an http response', () => {
  const res = createMockRes()
  applyResultToHttpResponse(res, {
    json: { foo: 'bar' },
    statusCode: 200
  })
  expect(res.status).toHaveProperty('mock.calls.length', 1)
  expect(res.status).toHaveProperty(['mock', 'calls', '0'], [200])
  expect(res.json).toHaveProperty('mock.calls.length', 1)
  expect(res.json).toHaveProperty(['mock', 'calls', '0'], [{ foo: 'bar' }])
})

test('Apply an empty result to an http response', () => {
  const res = createMockRes()
  applyResultToHttpResponse(res, {
    statusCode: 200
  })
  expect(res.status).toHaveProperty('mock.calls.length', 1)
  expect(res.status).toHaveProperty(['mock', 'calls', '0'], [200])
  expect(res.end).toHaveProperty('mock.calls.length', 1)
  expect(res.end).toHaveProperty(['mock', 'calls', '0'], [])
})

test('Apply headers to an http response', () => {
  const res = createMockRes()
  applyResultToHttpResponse(res, {
    headers: {
      location: 'new-location'
    },
    statusCode: 200
  })
  expect(res.status).toHaveProperty('mock.calls.length', 1)
  expect(res.status).toHaveProperty(['mock', 'calls', '0'], [200])
  expect(res.set).toHaveProperty('mock.calls.length', 1)
  expect(res.set).toHaveProperty(['mock', 'calls', '0'], ['location', 'new-location'])
})
