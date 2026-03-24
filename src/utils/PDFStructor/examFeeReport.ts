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
 * Builds an Examination Fee invoice PDF document definition.
 */
export function buildExamFeeReport(data: any = {}) {
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
