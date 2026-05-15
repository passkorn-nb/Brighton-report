import { ContextV2 } from '@interfaces/InternalService'
import { generateReport, generateBatchReport, getReportTypes } from '@utils/PDFGenerator'
import { getReportBuilder, ReportType } from '@utils/PDFStructor'
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
        const { reportType, data } = ctx.body as { reportType: ReportType; data: any }

        if (!reportType) {
            return ResponseSend.error(ctx, 'reportType is required', 400)
        }

        if (!getReportBuilder(reportType)) {
            return ResponseSend.error(ctx, `Unknown report type: ${reportType}`, 400)
        }

        const report = generateReport(reportType, data || {})

        if (ctx.query.stream) {
            const encoder = new TextEncoder()
            const readable = new ReadableStream({
                async start(controller) {
                    const send = (event: object) => {
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`))
                    }
                    try {
                        const buffer = await report.getBufferWithProgress(percentage => {
                            send({ type: 'progress', percentage: Math.round(percentage * 100) })
                        })
                        send({ type: 'done', base64: buffer.toString('base64') })
                    } catch (e: any) {
                        send({ type: 'error', message: e.message })
                    }
                    controller.close()
                }
            })
            return new Response(readable, {
                headers: {
                    'Content-Type': 'text/event-stream',
                    'Cache-Control': 'no-cache',
                    Connection: 'keep-alive'
                }
            })
        }

        if (ctx.query.base64) {
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

export const generateBatchPdfReport = async (ctx: ContextV2) => {
    const tag = `[${ctx.requestId}] (RC-03)`
    try {
        const { invoices } = ctx.body as { invoices: Array<{ reportType: ReportType; data: any }> }

        if (!Array.isArray(invoices) || invoices.length === 0) {
            return ResponseSend.error(ctx, 'invoices array is required and must not be empty', 400)
        }

        for (const inv of invoices) {
            if (!inv.reportType) {
                return ResponseSend.error(ctx, 'Each invoice must have a reportType', 400)
            }
            if (!getReportBuilder(inv.reportType)) {
                return ResponseSend.error(ctx, `Unknown report type: ${inv.reportType}`, 400)
            }
        }

        const report = generateBatchReport(invoices)
        const buffer = await report.getBuffer()

        return new Response(buffer as unknown as ReadableStream, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `inline; filename="invoice-preview-batch-${Date.now()}.pdf"`
            }
        })
    } catch (error: any) {
        const msg = `Failed to generate batch report: ${error}`
        logger.error(`${tag} error: ${error.message}`)
        return ResponseSend.error(ctx, msg, HttpStatusCode.InternalServerError)
    }
}
