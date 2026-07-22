import { describe, it, expect } from 'bun:test'
import { buildAcknowledgementReport } from '../src/utils/PDFStructor/acknowledgementReport'

const sample = {
    studentIdNo: 'KC20250276',
    studentName: 'Aria Peterson',
    contactName: 'John Peterson',
    receiptNo: 'R-CC-2026-00001',
    receiptDate: '13/07/2026',
    yearGroup: 'PRE-NURSERY',
    schoolYear: '2025/2026',
    rows: [
        { no: 1, invoiceNo: 'INV-2025-02761', invoiceAmount: 78000, cardFee: 1014, received: 78000 },
        { no: 2, invoiceNo: 'INV-2025-02762', invoiceAmount: 7500, cardFee: 97.5, received: 7500 }
    ],
    overpaymentAmount: 500,
    overpaymentFee: 6.5,
    grandTotal: 86000,
    amountInWords: 'EIGHTY-SIX THOUSAND BAHT',
    cardBankName: 'KBank EDC',
    cashierName: 'test cashier'
}

// helper: collect all string `text` values anywhere in the doc-def
const texts = (node: any, acc: string[] = []): string[] => {
    if (node == null) return acc
    if (typeof node === 'string') {
        acc.push(node)
        return acc
    }
    if (Array.isArray(node)) {
        node.forEach(n => texts(n, acc))
        return acc
    }
    if (typeof node === 'object') {
        if (typeof node.text === 'string') acc.push(node.text)
        else if (node.text) texts(node.text, acc)
        Object.values(node).forEach(v => {
            if (v !== node.text) texts(v, acc)
        })
    }
    return acc
}

describe('buildAcknowledgementReport', () => {
    const def = buildAcknowledgementReport(sample)
    const all = texts(def).join(' \n ')

    it('returns a doc definition with content', () => {
        expect(Array.isArray(def.content)).toBe(true)
    })

    it('renders two copies (Customer + Accounting) with a page break before the second', () => {
        expect(all.toUpperCase()).toContain('CUSTOMER')
        expect(all.toUpperCase()).toContain('ACCOUNTING')
        const hasPageBreak = JSON.stringify(def).includes('"pageBreak":"before"')
        expect(hasPageBreak).toBe(true)
    })

    it('has the 5 column headers', () => {
        const U = all.toUpperCase()
        ;['INVOICE NO', 'INVOICE AMOUNT', 'CREDIT CARD FEE', 'RECEIVED'].forEach(h => expect(U).toContain(h))
    })

    it('shows grand total, amount in words, cashier and credit card line', () => {
        expect(all).toContain('EIGHTY-SIX THOUSAND BAHT')
        expect(all.toUpperCase()).toContain('CASHIER')
        expect(all).toContain('test cashier')
        expect(all.toUpperCase()).toContain('CREDIT CARD')
        expect(all).toContain('KBank EDC')
    })

    it('renders pre-formatted fields as-is (no re-formatting)', () => {
        expect(all).toContain('PRE-NURSERY')
        expect(all).toContain('2025/2026')
        expect(all).toContain('13/07/2026')
    })

    it('shows the overpayment row and its ** footnote when overpaymentAmount > 0', () => {
        expect(all).toContain('Overpayment amount**')
        expect(all).toContain('** Please note that any overpayment amount is non-refundable')
    })

    it('the overpayment row carries its own base, fee share and fee-inclusive received amount', () => {
        expect(all).toContain('500.00') // base
        expect(all).toContain('6.50') // fee share
        expect(all).toContain('506.50') // received = base + fee
    })
})

describe('buildAcknowledgementReport without overpayment', () => {
    const def = buildAcknowledgementReport({ ...sample, overpaymentAmount: 0 })
    const all = texts(def).join(' \n ')

    it('hides the overpayment row and its ** footnote (matches the approved form)', () => {
        expect(all).not.toContain('Overpayment amount**')
        expect(all).not.toContain('** Please note')
        // the * card-fee footnote must remain
        expect(all).toContain('* Credit card processing fee payable to Bank')
    })
})
