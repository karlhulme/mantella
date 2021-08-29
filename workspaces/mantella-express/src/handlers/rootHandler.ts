import { applyResultToHttpResponse } from '../responseGeneration'
import { RequestHandlerProps } from './RequestHandlerProps'

/**
 * Handles a request on the mount point.
 */
export async function rootHandler (props: RequestHandlerProps): Promise<void> {
  applyResultToHttpResponse(props.res, {
    statusCode: 200,
    html: `
      <html>
        <body>
          The service is running.
        </body>
      </html>
    `
  })
}
