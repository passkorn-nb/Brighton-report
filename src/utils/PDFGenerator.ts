import path from 'path'
import pdfMake from 'pdfmake'
import { getReportBuilder, getReportTypes as getTypes } from './PDFStructor'

// Server-side font setup for pdfmake (using local fonts in assets/fonts)
const fontsDir = path.resolve(process.cwd(), 'src/assets/fonts')
pdfMake.addFonts({
    Sarabun: {
        normal: path.join(fontsDir, 'Sarabun-Regular.ttf'),
        bold: path.join(fontsDir, 'Sarabun-Medium.ttf'),
        italics: path.join(fontsDir, 'Sarabun-Italic.ttf'),
        bolditalics: path.join(fontsDir, 'Sarabun-MediumItalic.ttf')
    }
})
// Block all external URL access — method exists at runtime but is missing from @types/pdfmake
;(pdfMake as any).setUrlAccessPolicy(() => false)

/**
 * Generate a PDF report buffer on the server side.
 */
export function generateReport(reportType: string, data: any) {
    const builder = getReportBuilder(reportType)
    if (!builder) {
        throw new Error(`Unknown report type: ${reportType}`)
    }

    const docDefinition = builder(data)
    const pdfDoc = pdfMake.createPdf(docDefinition)

    return {
        getBuffer(): Promise<Buffer> {
            return pdfDoc.getBuffer()
        },
        getBase64(): Promise<string> {
            return pdfDoc.getBase64()
        },
        getBufferWithProgress(onProgress: (percentage: number) => void): Promise<Buffer> {
            pdfMake.setProgressCallback(onProgress)
            const pdfDocWithProgress = pdfMake.createPdf(docDefinition)
            return (pdfDocWithProgress.getBuffer() as Promise<Buffer>).finally(() => {
                pdfMake.setProgressCallback(undefined as any)
            })
        }
    }
}

/**
 * Generate a single PDF that combines multiple invoices (one page per invoice).
 * Each invoice after the first starts on a new page via pdfmake's pageBreak.
 */
export function generateBatchReport(invoices: Array<{ reportType: string; data: any }>) {
    if (invoices.length === 0) throw new Error('invoices array must not be empty')

    const combinedContent: any[] = []

    for (let i = 0; i < invoices.length; i++) {
        const { reportType, data } = invoices[i]
        const builder = getReportBuilder(reportType)
        if (!builder) throw new Error(`Unknown report type: ${reportType}`)

        const docDef = builder(data)
        const contentItems: any[] = Array.isArray(docDef.content) ? docDef.content : [docDef.content]

        if (i > 0 && contentItems.length > 0) {
            // Force the first element of each subsequent invoice onto a new page
            const first = { ...contentItems[0], pageBreak: 'before' }
            combinedContent.push(first, ...contentItems.slice(1))
        } else {
            combinedContent.push(...contentItems)
        }
    }

    // Use the first invoice's document settings (page size, margins, styles) as the base
    const firstBuilder = getReportBuilder(invoices[0].reportType)!
    const baseDoc = firstBuilder(invoices[0].data)

    const mergedDoc = {
        ...baseDoc,
        content: combinedContent
    }

    const pdfDoc = pdfMake.createPdf(mergedDoc)

    return {
        getBuffer(): Promise<Buffer> {
            return pdfDoc.getBuffer()
        },
        getBase64(): Promise<string> {
            return pdfDoc.getBase64()
        }
    }
}

export function getReportTypes() {
    return getTypes()
}
