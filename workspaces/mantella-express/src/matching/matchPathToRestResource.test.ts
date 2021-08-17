import { test, expect } from '@jest/globals'
import { createRestResourceMatcherArray } from './createRestResourceMatcherArray'
import { matchPathToRestResource } from './matchPathToRestResource'
import { RestResourceType } from '../enums'

test('Find no match.', () => {
  const pathMatchArray = createRestResourceMatcherArray()
  expect(matchPathToRestResource('unknown', pathMatchArray)).toEqual({ type: RestResourceType.NO_MATCH, urlParams: {} })
  expect(matchPathToRestResource('unknown/', pathMatchArray)).toEqual({ type: RestResourceType.NO_MATCH, urlParams: {} })
  expect(matchPathToRestResource('unkno:wn/', pathMatchArray)).toEqual({ type: RestResourceType.NO_MATCH, urlParams: {} })
})

test('Find the root.', () => {
  const pathMatchArray = createRestResourceMatcherArray()
  expect(matchPathToRestResource('', pathMatchArray)).toEqual({ type: RestResourceType.ROOT, urlParams: {} })
  expect(matchPathToRestResource('/', pathMatchArray)).toEqual({ type: RestResourceType.ROOT, urlParams: {} })
})

test('Find a constructor.', () => {
  const pathMatchArray = createRestResourceMatcherArray()
  expect(matchPathToRestResource('/ops:launchOp', pathMatchArray)).toEqual({ type: RestResourceType.CONSTRUCTOR, urlParams: { operationName: 'launchOp' } })
})

test('Find an operation.', () => {
  const pathMatchArray = createRestResourceMatcherArray()
  expect(matchPathToRestResource('/ops/1234-5678', pathMatchArray)).toEqual({ type: RestResourceType.OPERATION, urlParams: { id: '1234-5678' } })
})

test('Find an operation resume.', () => {
  const pathMatchArray = createRestResourceMatcherArray()
  expect(matchPathToRestResource('/ops/1234-5678:resume', pathMatchArray)).toEqual({ type: RestResourceType.OPERATION_RESUME, urlParams: { id: '1234-5678' } })
})
