import { Context } from 'elysia'

export interface ContextV2 extends Context {
    requestId?: string
    lang?: string
    ip?: string
}
