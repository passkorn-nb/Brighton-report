import {
    createHeader,
    createStudentInfoExternal,
    createFeeTableNoNumber,
    createPaymentMethods,
    createSignatureSection,
    buildDocDefinition
} from './baseTemplate'

/**
 * Builds a Holiday Camp (external students) invoice PDF.
 * Uses a simplified student info (no Student ID, no Year group)
 * and a fee table without the No. column.
 */
export function buildHolidayCampExternalReport(data: any = {}) {
    const header = createHeader(data.header)
    const studentInfo = createStudentInfoExternal(data.studentInfo)

    const feeTable = createFeeTableNoNumber(data.items || [], {
        amountInWords: data.amountInWords || '',
        totalAmount: data.totalAmount
    })

    const paymentMethods = createPaymentMethods(data.paymentMethods)
    const signature = createSignatureSection(data.signature)

    return buildDocDefinition({
        header,
        studentInfo,
        content: [feeTable, paymentMethods, signature]
    })
}
