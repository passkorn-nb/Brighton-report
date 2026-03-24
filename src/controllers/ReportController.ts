import { ContextV2 } from '@interfaces/InternalService'
import { generateReport, getReportTypes } from '@utils/PDFGenerator'
import { getReportBuilder } from '@utils/PDFStructor'
import { HttpStatusCode } from 'axios'

export const listReportTypes = async (ctx: ContextV2) => {
    const tag = `[${ctx.requestId}] (RC-01)`
    try {
        const types = getReportTypes()
        return ResponseSend.success(ctx, 'Report types retrieved successfully', types)
    } catch (error: any) {
        const msg = `Something went wrong: ${error}`
        logger.error(`${tag} error: ${error.message}`)
        return ResponseSend.error(ctx, msg, HttpStatusCode.InternalServerError)
    }
}

export const generatePdfReport = async (ctx: ContextV2) => {
    const tag = `[${ctx.requestId}] (RC-02)`
    try {
        const { reportType, data } = ctx.body as { reportType: string; data: any }
        const base64 = (ctx.query as Record<string, string>)?.base64 === 'true'

        if (!reportType) {
            return ResponseSend.error(ctx, 'reportType is required', 400)
        }

        if (!getReportBuilder(reportType)) {
            return ResponseSend.error(ctx, `Unknown report type: ${reportType}`, 400)
        }

        const report = generateReport(reportType, data || {})

        if (base64) {
            const b64 = await report.getBase64()
            return ResponseSend.success(ctx, 'Report generated successfully', { base64: b64 })
        }

        const buffer = await report.getBuffer()

        return new Response(buffer as unknown as ReadableStream, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${reportType}-${Date.now()}.pdf"`
            }
        })
    } catch (error: any) {
        const msg = `Failed to generate report: ${error}`
        logger.error(`${tag} error: ${error.message}`)
        return ResponseSend.error(ctx, msg, HttpStatusCode.InternalServerError)
    }
}
