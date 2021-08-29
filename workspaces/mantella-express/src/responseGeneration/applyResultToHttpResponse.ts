import { Response } from 'express'
import { HttpHeaderNames } from '../consts'

interface ResultForHttpResponseProps {
  headers?: Record<string, string>
  html?: string
  json?: Record<string, unknown>
  statusCode: number
  text?: string
}

/**
 * Applies a result to an express response.
 * @param res An express response.
 * @param props A set of properties to be placed into the express response.
 */
export function applyResultToHttpResponse (res: Response, props: ResultForHttpResponseProps): void {
  if (props.headers) {
    for (const headerName in props.headers) {
      res.set(headerName, props.headers[headerName])
    }
  }

  res.status(props.statusCode)

  if (props.text) {
    res.set(HttpHeaderNames.ContentType, 'text/plain')
    res.send(props.text)
  } else if (props.html) {
    res.set(HttpHeaderNames.ContentType, 'text/html')
    res.send(props.html)
  } else if (props.json) {
    res.json(props.json)
  } else {
    res.end()
  }
}
