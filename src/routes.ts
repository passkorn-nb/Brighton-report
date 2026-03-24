import { Elysia, status } from 'elysia'
import { HttpStatusCode } from 'axios'

import { ContextV2 } from '@interfaces/InternalService'
import timer from '@middlewares/Timer'
import { listReportTypes, generatePdfReport } from '@controllers/ReportController'

import * as Docs from '@documents'

const serviceInfo = async (ctx: ContextV2) => {
    ctx.set.status = HttpStatusCode.Ok
    return {
        status: 'ok',
        version: version,
        message: 'KCIS Report Service is running smoothly! 🧋',
        uptime: Dayjs.duration(process.uptime(), 'seconds').humanize()
    }
}

export default new Elysia()
    // [Middleware] - Request Timer & Investigate Mode
    .trace(timer({ logLevel: Bun.env.INVESTIGATE_MODE === 'true' ? 'verbose' : 'info' }))

    .get('/', serviceInfo, Docs.ServiceInfoEntity)
    .head('/heartbeat', () => status(200), Docs.HealthCheckEntity)

    // [Report Routes]
    .get('/report/types', listReportTypes, Docs.ListReportTypesEntity)
    .post('/report/generate', generatePdfReport, Docs.GenerateReportEntity)

    // [Fallback Route] - Handle all other routes
    .all('*', () => `You have no permission to access this content. | API Version (${globalThis.version}) ⛔`, {
        detail: { hide: true }
    })
    .onError(({ code }) => {
        logger.error(`[Route] Error occurred with status code: ${code}`)
        return {
            status: code,
            message: 'An error occurred while processing your request.'
        }
    })
