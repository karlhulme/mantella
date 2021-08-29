import { GetOperationProps } from './GetOperationProps'
import { GetOperationResult } from './GetOperationResult'
import { ResumeOperationProps } from './ResumeOperationProps'
import { StartOperationProps } from './StartOperationProps'

/**
 * The interface of Mantella engine.
 */
 export interface MantellaEngine {
  /**
   * Retrieves a previously saved operation using an operation id.
   * @param props A property bag.
   */
  getOperation (props: GetOperationProps): Promise<GetOperationResult>

  /**
   * Starts a new operation.
   * @param props A property bag.
   */
  startOperation (props: StartOperationProps): Promise<void>

  /**
   * Resumes a previously stalled operation.
   * @param props A property bag.
   */
  resumeOperation (props: ResumeOperationProps): Promise<void>
}
