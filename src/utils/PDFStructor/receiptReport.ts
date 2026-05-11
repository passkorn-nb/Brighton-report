import {
    createReceiptHeader,
    createReceiptInfoBox,
    createReceiptItemsTable,
    createPaymentMethodTable,
    createReceiptNotes,
    createReceiptSignatures,
    createReceiptFooter,
    buildReceiptDocDefinition
} from './receiptTemplate'

export function buildReceiptReport(data: any = {}) {
    const header = createReceiptHeader(data.header)
    const infoBox = createReceiptInfoBox(data.receiptInfo)

    const itemsTable = createReceiptItemsTable(data.items || [], {
        overpaymentAmount: data.overpaymentAmount ?? 0,
        totalAmount: data.totalAmount,
        amountInWords: data.amountInWords || ''
    })

    const paymentTable = createPaymentMethodTable(data.payment || {})
    const notes = createReceiptNotes()
    const signatures = createReceiptSignatures(data.signature || {})
    const footer = createReceiptFooter(data.footer)

    return buildReceiptDocDefinition({
        header,
        infoBox,
        content: [itemsTable, paymentTable, notes, signatures],
        footer
    })
}
