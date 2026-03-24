import {
    createHeader,
    createStudentInfo,
    createFeeTable,
    createLatePaymentNote,
    createPaymentMethods,
    createSignatureSection,
    buildDocDefinition
} from './baseTemplate'

/**
 * Builds an ECA (Extra-Curricular Activities) sport+music invoice PDF.
 * Each activity (gymnastics, basketball, tennis, piano, etc.) is a line item.
 */
export function buildEcaReport(data: any = {}) {
    const header = createHeader(data.header)
    const studentInfo = createStudentInfo(data.studentInfo)

    const feeTable = createFeeTable(data.items || [], {
        amountInWords: data.amountInWords || '',
        totalAmount: data.totalAmount
    })

    const latePaymentNote = createLatePaymentNote(data.latePayment)
    const paymentMethods = createPaymentMethods(data.paymentMethods)
    const signature = createSignatureSection(data.signature)

    return buildDocDefinition({
        header,
        studentInfo,
        content: [feeTable, latePaymentNote, paymentMethods, signature]
    })
}
