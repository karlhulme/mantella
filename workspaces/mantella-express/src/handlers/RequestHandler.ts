import { RequestHandlerProps } from './RequestHandlerProps'

export type RequestHandler = (props: RequestHandlerProps) => Promise<void>
