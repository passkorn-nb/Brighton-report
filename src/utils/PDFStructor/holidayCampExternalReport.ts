import {
    createHeaderLegacy,
    createStudentInfoExternal,
    createFeeTableNoNumber,
    createPaymentMethodsLegacy,
    createSignatureSectionLegacy,
    buildDocDefinitionLegacy
} from './baseTemplate'

/**
 * Builds a Holiday Camp (external students) invoice PDF.
 * Pinned to the legacy (pre-redesign) layout — does not adopt the new
 * KCIS invoice design used by other report types.
 */
export function buildHolidayCampExternalReport(data: any = {}) {
    const header = createHeaderLegacy(data.header)
    const studentInfo = createStudentInfoExternal(data.studentInfo)

    const feeTable = createFeeTableNoNumber(data.items || [], {
        amountInWords: data.amountInWords || '',
        totalAmount: data.totalAmount
    })

    const paymentMethods = createPaymentMethodsLegacy(data.paymentMethods)
    const signature = createSignatureSectionLegacy(data.signature)

    return buildDocDefinitionLegacy({
        header,
        studentInfo,
        content: [feeTable, paymentMethods, signature]
    })
}
