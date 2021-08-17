import { RestResourceType } from '../enums'
import { RestResourceMatcher } from './RestResourceMatcher'
import { MatchedRestResource } from './MatchedRestResource'

/**
 * Returns an object { type, urlParams } that identifies the
 * matching type of path and contains any url parameters supplied.
 * @param path A request path.
 * @param matchers An array of rest resource matchers.
 */
export function matchPathToRestResource (path: string, matchers: RestResourceMatcher[] ): MatchedRestResource {
  for (let i = 0; i < matchers.length; i++) {
    const result = matchers[i].expr.exec(path)

    if (result) {
      return {
        type: matchers[i].type,
        urlParams: { ...result.groups } // spread to drop the [Object: null prototype]
      }
    }
  }

  return { type: RestResourceType.NO_MATCH, urlParams: {} }
}
