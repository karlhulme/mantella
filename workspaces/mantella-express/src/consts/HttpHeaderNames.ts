/**
 * Represents the HTTP headers used by the service.
 */
export const HttpHeaderNames = {
  /**
   * The clients desired payload type to be included in the response.
   */
  AcceptType: 'accept',

  /**
   * The type of the payload sent by the client in the request.
   */
  ContentType: 'content-type',

  /**
   * The clients id for the request that is used to set an operation id.
   */
  RequestId: 'x-request-id',

  /**
   * The name of the last step that should complete before the request is resolved
   * and returned to the client, even if the operation is still running.
   */
  ResolveStep: 'mantella-resolve-step',

  /**
   * The client api key.
   */
  ApiKey: 'x-api-key',

  /**
   * The hydrated user object.
   */
  User: 'x-user'
}
