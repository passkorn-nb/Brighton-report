import {
    createTaxReceiptHeader,
    createTaxReceiptTitle,
    createTaxReceiptInfo,
    createTaxReceiptItems,
    createTaxReceiptTotals,
    createTaxReceiptPayment,
    createTaxReceiptFooter,
    buildTaxReceiptDocDefinition,
    thaiBahtText,
    toThaiBuddhistDate
} from './receiptTaxInvoiceTemplate'

/**
 * Builds the bilingual "ใบเสร็จรับเงิน / ใบกำกับภาษี" (Receipt / Tax Invoice), reproducing the
 * school's pre-printed stationery.
 *
 * Both derived fields fall back to the payload when it supplies them, so a caller that has
 * already formatted a date or worded an amount keeps control:
 *   - receiptInfo.receiptDate -> Buddhist-era DD/MM/YYYY unless it is already a formatted string
 *   - amountInWordsTh         -> read from grandTotal unless supplied
 */
export function buildReceiptTaxInvoiceReport(data: any = {}) {
    const info = data.receiptInfo ?? {}
    const items: any[] = data.items ?? []

    // The form separates non-VAT from VAT-able goods. With no VAT concept upstream, an item is
    // treated as non-VAT unless it says otherwise — which matches the school's current receipts.
    const sum = (predicate: (i: any) => boolean) =>
        items.filter(predicate).reduce((s, i) => s + Number(i.amount ?? (i.unitPrice ?? 0) * (i.qty ?? 1)), 0)

    const vatable = sum((i) => String(i.taxType ?? 'N').toUpperCase() === 'V')
    const nonVat = sum((i) => String(i.taxType ?? 'N').toUpperCase() !== 'V')
    const vatAmount = Number(data.vatAmount ?? 0)
    const subTotal = Number(data.subTotal ?? nonVat + vatable)
    const grandTotal = Number(data.grandTotal ?? data.totalAmount ?? subTotal + vatAmount)

    const header = createTaxReceiptHeader(data.header)
    const title = createTaxReceiptTitle()
    const infoBlock = createTaxReceiptInfo({
        receiptNo: info.receiptNo ?? '',
        receiptDate: info.receiptDateText ?? toThaiBuddhistDate(info.receiptDate),
        pageLabel: data.pageLabel ?? '1 / 1',
        customerCode: info.customerCode ?? info.studentId ?? '',
        customerName: info.customerName ?? info.studentName ?? '',
        address: info.address ?? ''
    })
    const table = createTaxReceiptItems(items, { minRows: data.minRows ?? 7 })
    const totals = createTaxReceiptTotals({
        nonVatAmount: nonVat,
        vatableAmount: vatable,
        vatAmount,
        subTotal,
        grandTotal,
        amountInWordsTh: data.amountInWordsTh ?? thaiBahtText(grandTotal)
    })
    const payment = createTaxReceiptPayment(data.payment)
    const footer = createTaxReceiptFooter(data.signature)

    return buildTaxReceiptDocDefinition({
        content: [header, title, infoBlock, table, totals, payment, footer]
    })
}
