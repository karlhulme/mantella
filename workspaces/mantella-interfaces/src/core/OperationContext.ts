import { RetryableOptions } from 'piggle'

export interface OperationContext<Input, Services> {
  input: Input
  log: (msg: string) => void
  step: <T>(stepName: string, func: () => Promise<T>, retryableOptions?: RetryableOptions) => Promise<T>
  requestId: string
  services: Services
}
