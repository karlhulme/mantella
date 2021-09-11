import { MantellaMalformedOperationInputError } from 'mantella-interfaces'

/**
 * Raises a MantellaMalformedOperationInputError if the given validator raises an error when invoked
 * with the given input object.
 * @param input An input object.
 * @param validator A validator that raises an error if the input object is not valid.
 */
export function validateOperationInput (input: unknown, validator: (obj: unknown) => void): void {
  try {
    validator(input)
  } catch (err) {
    throw new MantellaMalformedOperationInputError((err as Error).message)
  }
}
