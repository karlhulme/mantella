import { expect, test } from '@jest/globals'
import { MantellaMalformedOperationInputError } from 'mantella-interfaces'
import { validateOperationInput } from './validateOperationInput'

test('A validator that accepts the input, does not raise', () => {
  expect(() => validateOperationInput(5, () => undefined)).not.toThrow()
})

test('A validator that raises an error is wrapped.', () => {
  expect(() => validateOperationInput(5, () => { throw new Error('custom') })).toThrow(MantellaMalformedOperationInputError as unknown as Error)
})
