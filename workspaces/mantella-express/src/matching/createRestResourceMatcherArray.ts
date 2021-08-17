import { RestResourceType } from '../enums'
import { RestResourceMatcher } from './RestResourceMatcher'

/**
 * Returns an array of rest resource matchers.
 */
export function createRestResourceMatcherArray (): RestResourceMatcher[] {
  return [
    { type: RestResourceType.ROOT, expr: /^\/?$/ },
    { type: RestResourceType.CONSTRUCTOR, expr: new RegExp(`^/ops:(?<operationName>[a-zA-Z0-9_.]+)/?$`) },
    { type: RestResourceType.OPERATION, expr: new RegExp(`^/ops/(?<id>[a-zA-Z0-9_-]+)$`) },
    { type: RestResourceType.OPERATION_RESUME, expr: new RegExp(`^/ops/(?<id>[a-zA-Z0-9_-]+):resume$`) }
  ]
}
