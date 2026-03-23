import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from 'pdfmake/build/vfs_fonts'
import { getReportBuilder, getReportTypes as getTypes } from './PDFStructor'

pdfMake.vfs = pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : pdfFonts.vfs

/**
 * Generate a PDF report.
 * @param {string} reportType - Report type key (e.g. 'tuition-fee')
 * @param {object} data - Report data matching the template's expected shape
 * @returns {{ download, open, getBlob, getBase64 }}
 */
export function generateReport(reportType, data) {
    const builder = getReportBuilder(reportType)
    const docDefinition = builder(data)
    const pdfDoc = pdfMake.createPdf(docDefinition)

    return {
        download(filename) {
            const name = filename || `${reportType}-${Date.now()}.pdf`
            pdfDoc.download(name)
        },
        open() {
            pdfDoc.open()
        },
        getBlob() {
            return new Promise(resolve => {
                pdfDoc.getBlob(resolve)
            })
        },
        getBase64() {
            return new Promise(resolve => {
                pdfDoc.getBase64(resolve)
            })
        }
    }
}

export function getReportTypes() {
    return getTypes()
}
