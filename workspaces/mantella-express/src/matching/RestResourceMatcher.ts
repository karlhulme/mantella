import { RestResourceType } from '../enums'

/**
 * Represents a type of Rest resource and it's corresponding
 * regular expression for recognising urls targetting that
 * resoure type.
 */
export interface RestResourceMatcher {
  type: RestResourceType
  expr: RegExp
}
