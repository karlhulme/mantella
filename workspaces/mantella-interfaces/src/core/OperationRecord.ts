import { OperationStepDataEntry } from './OperationStepDataEntry'
import { OperationLogEntry } from './OperationLogEntry'
import { OperationStatus } from './OperationStatus'

export interface OperationRecord {
  id: string
  operationName: string
  input: unknown
  started: Date
  finished: Date|null
  logEntries: OperationLogEntry[]
  stepDataEntries: OperationStepDataEntry[]
  status: OperationStatus
  durationInMs: number
  error: Error|null
}
