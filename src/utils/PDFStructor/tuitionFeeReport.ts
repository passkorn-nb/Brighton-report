import {
    createHeader,
    createStudentInfo,
    createFeeTable,
    createLatePaymentNote,
    createSimplePaymentMethods,
    createSignatureSection,
    createInstalmentAppendix,
    buildDocDefinition
} from './baseTemplate'

const TERM_LABELS: Record<string, string> = { T1: 'TERM 1', T2: 'TERM 2', T3: 'TERM 3', YEARLY: 'YEARLY' }

/**
 * Builds a Tuition Fee invoice PDF document definition.
 * Handles tuition fees, registration fee waivers, sibling discounts,
 * credit notes, and ID card charges as line items.
 */
export function buildTuitionFeeReport(data: any = {}) {
    const header = createHeader(data.header)
    const studentInfo = createStudentInfo(data.studentInfo)

    const semesterLabel = data.semesterLabel in TERM_LABELS ? TERM_LABELS[data.semesterLabel] : (data.semesterLabel ?? '')
    const schoolYear = (data.studentInfo?.schoolYear ?? '').replace(/\//g, '-')
    const period = semesterLabel && schoolYear ? `${semesterLabel}/${schoolYear}` : ''

    const feeTable = createFeeTable(data.items || [], {
        amountInWords: data.amountInWords || '',
        totalAmount: data.totalAmount,
        period
    })

    const latePaymentNote = createLatePaymentNote(data.latePayment)
    const paymentMethods = createSimplePaymentMethods(data.paymentDetails)
    const signature = createSignatureSection(data.signature)
    const appendixNodes = createInstalmentAppendix(data.appendix)

    return buildDocDefinition({
        header,
        studentInfo,
        content: [feeTable, latePaymentNote, paymentMethods, signature, ...appendixNodes]
    })
}
