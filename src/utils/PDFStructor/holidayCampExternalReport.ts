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
 * Builds a Holiday Camp (external students) invoice PDF.
 * Uses the standard KCIS invoice layout with external label variant
 * (Client ID/Name, no Year group / School year rows).
 */
export function buildHolidayCampExternalReport(data: any = {}) {
    const header = createHeader(data.header)
    const studentInfo = createStudentInfo({ ...data.studentInfo, isExternal: true })

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
        content: [feeTable, latePaymentNote, paymentMethods, signature],
        headerData: data.header
    })
}
