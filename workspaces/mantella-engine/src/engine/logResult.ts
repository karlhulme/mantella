import chalk from 'chalk'
import { OperationRecord, OperationStatus } from 'mantella-interfaces'

export function logResult (record: OperationRecord): void {
  console.log(`${logDateTime(true, record.started)} ${logRequestId(record.id)} ${logOperationName(record.status, record.operationName)} ${logDuration(record.durationInMs)}`)

  if (record.error && record.finished) {
    record.logEntries.forEach(entry => console.log(`${logDateTime(false, entry.dateTime)} ${chalk.gray(entry.message)}`))

    console.log(`${logDateTime(false, record.finished)} ${chalk.grey('Stalled')}`)

    record.stepDataEntries.forEach(entry => {
      console.log(`${chalk.magenta(entry.name + ':')} ${chalk.grey(JSON.stringify(entry.data, null, 2))}`)
    })

    console.log(`${chalk.magenta('err:')} ${chalk.grey(record.error.message)}`)
  }
}

function logDateTime (prominent: boolean, dt: string) {
  if (prominent) {
    return chalk.blue(dt)
  } else {
    return chalk.grey(dt)
  }
}

function logRequestId (id: string) {
  return chalk.white(id)
}

function logOperationName (status: OperationStatus, operationName: string) {
  if (status ==='completed') {
    return chalk.green('✓ ' + operationName)
  } else {
    return chalk.red('✗ ' + operationName)
  }
}

function logDuration (durationInMs: number) {
  return chalk.yellow(durationInMs + ' ms')
}
