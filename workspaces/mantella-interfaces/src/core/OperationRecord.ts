import { OperationStepDataEntry } from './OperationStepDataEntry'
import { OperationLogEntry } from './OperationLogEntry'
import { OperationStatus } from './OperationStatus'

export interface OperationRecord {
  id: string
  operationName: string
  input: unknown
  started: string
  finished: string|null
  logEntries: OperationLogEntry[]
  stepDataEntries: OperationStepDataEntry[]
  status: OperationStatus
  durationInMs: number
  error: Error|null
}
