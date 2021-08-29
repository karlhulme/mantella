import { retryable, RetryableOptions } from 'piggle'
import { OperationStepDataEntry } from 'mantella-interfaces'

/**
 * Defines the properties required to execute a step function.
 */
interface ExecuteStepFuncProps<T> {
  /**
   * An array of step data entries completed so far.
   */
  stepDataEntries: OperationStepDataEntry[]

  /**
   * The retry options for invoking the stepFunc multiple times
   * if a transitory error occurs.
   */
  retryableOptions: RetryableOptions

  /**
   * The function to invoke for the step.
   */
  stepFunc: () => Promise<T>

  /**
   * The name of the step.
   */
  stepName: string
}

/**
 * Executes a step function and records the result in the array
 * of step data entries.  If the step has already been run, then
 * the previous result is returned instead.
 * @param props A property bag.
 */
export async function executeStepFunc<T> (props: ExecuteStepFuncProps<T>): Promise<T> {
  const existingStepDataEntry = props.stepDataEntries.find(step => step.name === props.stepName)

  if (existingStepDataEntry) {
    return existingStepDataEntry.data as T
  } else {
    const data = await retryable(props.stepFunc, props.retryableOptions)
    props.stepDataEntries.push({ name: props.stepName, data })
    return data
  }
}
