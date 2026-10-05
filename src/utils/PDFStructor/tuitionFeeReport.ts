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

// YEARLY is not a term -- it is the label a yearly invoice carries instead of one. Mapped to
// itself deliberately: the PERIOD column is sized for 'TERM 1/2026/2027', and a longer label
// like 'FULL YEAR' wraps onto a second line in every row of the table.
const TERM_LABELS: Record<string, string> = { T1: 'TERM 1', T2: 'TERM 2', T3: 'TERM 3', YEARLY: 'YEARLY' }

/**
 * Builds a Tuition Fee invoice PDF document definition.
 * Handles tuition fees, registration fee waivers, sibling discounts,
 * credit notes, and ID card charges as line items.
 */
export function buildTuitionFeeReport(data: any = {}) {
    const header = createHeader(data.header)
    const studentInfo = createStudentInfo(data.studentInfo)

    const semesterLabel = TERM_LABELS[data.semesterLabel] || data.semesterLabel || ''
    const period = semesterLabel && data.studentInfo?.schoolYear ? `${semesterLabel}/${data.studentInfo.schoolYear}` : ''

    const feeTable = createFeeTable(data.items || [], {
        amountInWords: data.amountInWords || '',
        totalAmount: data.totalAmount,
        period
    })

    const latePaymentNote = createLatePaymentNote({
        ...data.latePayment,
        annualTotal: data.appendix?.annual?.total ?? null
    })
    const paymentMethods = createSimplePaymentMethods(data.paymentDetails)
    const signature = createSignatureSection(data.signature)
    const appendix = createInstalmentAppendix(data.appendix)

    return buildDocDefinition({
        header,
        studentInfo,
        content: [feeTable, latePaymentNote, paymentMethods, signature, appendix]
    })
}
