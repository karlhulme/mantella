import { test, expect } from '@jest/globals'
import { createRestResourceMatcherArray } from './createRestResourceMatcherArray'

test('Create an array of rest resource matchers.', () => {
  const matcherArray = createRestResourceMatcherArray()
  expect(Array.isArray(matcherArray)).toEqual(true)

  matcherArray.forEach(matcher => {
    expect(matcher.expr.test('!__no_match__%')).toEqual(false)
  })
})
