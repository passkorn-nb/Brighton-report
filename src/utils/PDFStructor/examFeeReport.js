import {
    createHeader,
    createStudentInfo,
    createFeeTable,
    createTotalSection,
    createFooter,
    buildDocDefinition
} from './baseTemplate'

export function buildExamFeeReport(data) {
    const header = createHeader({
        ...data,
        documentTitle: 'EXAMINATION FEE INVOICE'
    })

    const studentInfo = createStudentInfo(data)

    const feeTable = createFeeTable(data.items || [], {
        columns: ['no', 'description', 'amount']
    })

    const subtotal = (data.items || []).reduce((sum, item) => sum + (item.amount || 0), 0)

    const totalSection = createTotalSection({
        subtotal,
        netTotal: subtotal,
        amountInWords: data.amountInWords || ''
    })

    const footer = createFooter({
        paymentNotes: data.paymentNotes || [
            'Examination fees are non-refundable.',
            'Payment must be completed before the examination date.',
            'Please present this receipt on the day of examination.'
        ],
        showSignature: true
    })

    return buildDocDefinition({
        header,
        studentInfo,
        content: [feeTable, totalSection],
        footer
    })
}
