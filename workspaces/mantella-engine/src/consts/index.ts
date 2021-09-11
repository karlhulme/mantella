/**
 * The value to use for resolveStep if the sendResponse function
 * should be invoked as soon as the input validation is complete.
 */
export const RESOLVE_IMMEDIATELY = '^'

/**
 * The value to use for resolveStep if the sendResponse function
 * should be invoked only when the operation is complete.
 * This is convention, it is not checked by the engine, because
 * any unrecognised step name will cause the response to be sent
 * only when the operation is complete.
 */
export const RESOLVE_ON_COMPLETION = '.'
