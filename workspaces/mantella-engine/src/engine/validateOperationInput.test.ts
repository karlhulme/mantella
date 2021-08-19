import { expect, test } from '@jest/globals'
import { MantellaBadRequestError } from '../errors'
import { validateOperationInput } from './validateOperationInput'

test('A validator that accepts the input, does not raise', () => {
  expect(() => validateOperationInput(5, () => undefined)).not.toThrow()
})

test('A validator that raises an error is wrapped.', () => {
  expect(() => validateOperationInput(5, () => { throw new Error('custom') })).toThrow(MantellaBadRequestError as unknown as Error)
})
