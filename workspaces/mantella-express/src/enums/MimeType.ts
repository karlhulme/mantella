/**
 * Represents a MimeType used to define the type of content
 * that can be accepted or is included with a request.
 */
export enum MimeType {
  APPLICATION_JSON_CONTENT_TYPE = 'application/json',
  APPLICATION_ALL_CONTENT_TYPE = 'application/*',
  ALL_CONTENT_TYPE = '*/*'
}
