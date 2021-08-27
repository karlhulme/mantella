import { OperationStepDataEntry } from 'mantella-interfaces'
import { executeStepFunc } from './executeStepFunc'

interface ExecuteStepProps<T> {
  func: () => Promise<T>
  isErrorTransient?: (err: Error) => boolean
  canContinueProcessing?: () => boolean
  retryIntervalsInMilliseconds: number[]
  resolveOp: () => void
  resolveStepName: string|null
  saveOp: () => Promise<void>
  saveStepResult: boolean
  stepDataEntries: OperationStepDataEntry[]
  stepName: string
}

export async function executeStep<T> (props: ExecuteStepProps<T>): Promise<T> {
  const data = await executeStepFunc({
    stepDataEntries: props.stepDataEntries,
    retryableOptions: {
      isErrorTransient: props.isErrorTransient,
      retryIntervalsInMilliseconds: props.retryIntervalsInMilliseconds,
      canContinueProcessing: props.canContinueProcessing
    },
    stepFunc: props.func,
    stepName: props.stepName
  })

  if (props.saveStepResult) {
    await props.saveOp()
  }

  if (props.stepName === props.resolveStepName) {
    props.resolveOp()
  }

  return data
}
