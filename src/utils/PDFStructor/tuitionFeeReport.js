import {
    createHeader,
    createStudentInfo,
    createFeeTable,
    createAdjustmentsSection,
    createTotalSection,
    createFooter,
    buildDocDefinition
} from './baseTemplate'

export function buildTuitionFeeReport(data) {
    const header = createHeader({
        ...data,
        documentTitle: 'TUITION FEE INVOICE'
    })

    const studentInfo = createStudentInfo(data)

    const feeTable = createFeeTable(data.items || [], {
        columns: ['no', 'description', 'amount']
    })

    const adjustments = createAdjustmentsSection(data.adjustments || [])

    const subtotal = (data.items || []).reduce((sum, item) => sum + (item.amount || 0), 0)
    const adjustmentsTotal = (data.adjustments || []).reduce((sum, adj) => sum + (adj.amount || 0), 0)
    const netTotal = subtotal + adjustmentsTotal

    const totalSection = createTotalSection({
        subtotal,
        adjustmentsTotal,
        netTotal,
        amountInWords: data.amountInWords || ''
    })

    const footer = createFooter({
        paymentNotes: data.paymentNotes || [
            'Payment is due within 30 days of invoice date.',
            'Please make payment via bank transfer or at the school cashier.',
            'This is a computer-generated document. No signature is required for amounts below 10,000 THB.'
        ],
        showSignature: true
    })

    return buildDocDefinition({
        header,
        studentInfo,
        content: [feeTable, adjustments, totalSection],
        footer
    })
}
