import chalk from 'chalk'
import { OperationRecord, OperationStatus } from 'mantella-interfaces'

/**
 * Logs the status of a record to the console.
 * @param consoleLog A function for logging to the console.
 * @param record An operation record.
 */
export function logRecordToConsole (consoleLog: (msg: string) => void, record: OperationRecord): void {
  consoleLog(`${formatDateTime(true, record.started)} ${chalk.white(record.id)} ${formatOperationName(record.status, record.operationName)} ${chalk.yellow(record.durationInMs)} ms`)

  if (record.error && record.finished) {
    record.logEntries.forEach(entry => consoleLog(`${formatDateTime(false, entry.dateTime)} ${chalk.gray(entry.message)}`))

    consoleLog(`${formatDateTime(false, record.finished)} ${chalk.grey('Stall')}`)

    record.stepDataEntries.forEach(entry => {
      consoleLog(`${chalk.magenta(entry.name + ':')} ${chalk.grey(JSON.stringify(entry.data, null, 2))}`)
    })

    consoleLog(`${chalk.magenta('err:')} ${chalk.grey(record.error)}`)
  }
}

/**
 * Formats a date time for display.
 * @param full True if the full date and time should be displayed.
 * Otherwise only the time component is shown.
 * @param dt An ISO date/time string.
 */
function formatDateTime (full: boolean, dt: string) {
  if (full) {
    return chalk.blue(dt.substring(0, 10) + ' ' + dt.substring(11, 19))
  } else {
    return chalk.grey(dt.substring(11, 19))
  }
}

/**
 * Format the operation by prefixing an icon and colouring
 * the result red/green to indicate the status.
 * @param status The status of the operation.
 * @param operationName The name of the operation.
 */
function formatOperationName (status: OperationStatus, operationName: string) {
  if (status ==='completed') {
    return chalk.green('✓ ' + operationName)
  } else {
    return chalk.red('✗ ' + operationName)
  }
}
