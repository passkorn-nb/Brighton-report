import path from 'path'
import pdfMake from 'pdfmake'
import { getReportBuilder, getReportTypes as getTypes } from './PDFStructor'

// Server-side font setup for pdfmake (using local fonts in assets/fonts)
const fontsDir = path.resolve(process.cwd(), 'src/assets/fonts')
pdfMake.addFonts({
    Roboto: {
        normal: path.join(fontsDir, 'Roboto-Regular.ttf'),
        bold: path.join(fontsDir, 'Roboto-Medium.ttf'),
        italics: path.join(fontsDir, 'Roboto-Italic.ttf'),
        bolditalics: path.join(fontsDir, 'Roboto-MediumItalic.ttf')
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

export function getReportTypes() {
    return getTypes()
}
