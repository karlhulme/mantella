/**
 * Represents the strategy for when the operation
 * should be saved during it's execution.  Regardless of this setting,
 * an interrupted operation will always be saved so that it can be restarted.
 * Never - means the operation is never saved regardless of outcome.  This
 * is the fastest setting but offers no auditability.
 * Error - this is the most common, as it doesn't spend time saving unless
 * an internal error occurs.
 * Rejection - the operation is saved if the input is rejected.  Use this
 * for transactions where you need to audit any failures, such as user sign ups.
 * Always - the operation is saved at every point of progress.  Use this for
 * transactions that cannot be lost, such as payments.
 */
export type OperationSaveStrategy = 'never'|'error'|'rejection'|'always'