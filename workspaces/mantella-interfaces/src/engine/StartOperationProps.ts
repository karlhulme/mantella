import { StartOperationSendResponseProps } from './StartOperationSendResponseProps'

/**
 * Defines the properties required to start a new operation running.
 */
export interface StartOperationProps {
  /**
   * The api key associated with the request.
   */
  apiKey?: string

  /**
   * The payload used to initialise the operation.
   */
  input?: unknown

  /**
   * The name of the operation to start.
   */
  operationName?: string

  /**
   * The id to be assigned to the new operation.  If not supplied
   * then one will be generated.  Note that if an operation id is
   * supplied then the operation will be saved on each step.
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
  sendResponse?: (props: StartOperationSendResponseProps) => void
}
