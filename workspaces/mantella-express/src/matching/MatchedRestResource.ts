import { RestResourceType } from '../enums'

/**
 * Represents a rest resource that has been matched to a url
 * and a series of url params extracted.
 */
export interface MatchedRestResource {
  type: RestResourceType
  urlParams: Record<string, string>
}
