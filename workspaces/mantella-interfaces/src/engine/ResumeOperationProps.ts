import { ResumeOperationSendResponseProps } from './ResumeOperationSendResponseProps'

/**
 * Defines the properties required to resume an operation.
 */
export interface ResumeOperationProps {
  /**
   * The api key associated with the request.
   */
  apiKey?: string

  /**
   * The id of the operation to resume.
   */
  operationId?: string

  /**
   * The name of the step to complete before reporting success
   * back to the client.  If this value is not specified then
   * the operation will run to completion before resolving.
   */
  resolveStep?: string

  /**
   * A function that is invoked when a response can be sent to
   * the client.  This function will not be invoked if an exception
   * is raised.
   */
  sendResponse?: (props: ResumeOperationSendResponseProps) => void
}
