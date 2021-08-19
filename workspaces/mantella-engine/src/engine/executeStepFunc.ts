import { retryable, RetryableOptions } from 'piggle'
import { OperationStepDataEntry } from 'mantella-interfaces'

interface ExecuteStepFuncProps<T> {
  stepDataEntries: OperationStepDataEntry[]
  retryableOptions: RetryableOptions
  stepFunc: () => Promise<T>
  stepName: string
}

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
