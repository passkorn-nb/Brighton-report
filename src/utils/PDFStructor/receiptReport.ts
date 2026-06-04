import {
    createReceiptHeader,
    createReceiptInfoBox,
    createReceiptItemsTable,
    createPaymentMethodLine,
    createReceiptNotes,
    createReceiptSignatures,
    createReceiptFooter,
    buildReceiptDocDefinition
} from './receiptTemplate'

export function buildReceiptReport(data: any = {}) {
    const isExternal = data.category === 'EXT'
    const header = createReceiptHeader(data.header)
    const infoBox = createReceiptInfoBox(data.receiptInfo, isExternal)

    const itemsTable = createReceiptItemsTable(data.items || [], {
        overpaymentAmount: data.overpaymentAmount ?? 0,
        totalAmount: data.totalAmount,
        amountInWords: String(data.amountInWords || '').toUpperCase(),
        creditNotes: data.creditNotes || []
    })

    const paymentLine = createPaymentMethodLine(data.payment || {})
    const notes = createReceiptNotes()
    const signatures = createReceiptSignatures(data.signature || {})
    const footer = createReceiptFooter(data.footer)

    return buildReceiptDocDefinition({
        header,
        infoBox,
        content: [itemsTable, paymentLine, notes, signatures],
        footer
    })
}
