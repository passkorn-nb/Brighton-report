import {
    createHeader,
    createLatePaymentNote,
    createSignatureSection,
    buildDocDefinition,
    formatCurrency,
    thaiFont
} from './baseTemplate'

/**
 * External Invoice — formal business-invoice layout.
 *
 * This is the template every Category.EXTERNAL invoice preview/pdf renders through
 * (keeping the ReportType.HOLIDAY_CAMP_EXTERNAL key wires it in). Layout is modelled
 * on the Hands Management reference invoice: paired boxed client/doc sections,
 * a formal itemised table with Qty/Unit/Price-per-Unit/Discount columns, a right-
 * aligned totals block, Amount-in-words line, REMARKS late-payment note, two side-
 * by-side bank-transfer cells, and Prepared-by/Verified-by signatures.
 *
 * No qty / unit / discountPct fields on external items today — those columns use
 * placeholder defaults (1.00 / Time / blank).
 */

// All rules in the reference form are drawn in Brighton navy at a thin single weight.
const RULE_WIDTH = 0.5
const RULE_COLOR = '#1F3864'

const BOX_LAYOUT = {
    hLineWidth: (i: number, node: any) => (i === 0 || i === node.table.body.length ? RULE_WIDTH : 0),
    vLineWidth: (i: number, node: any) => (i === 0 || i === node.table.widths.length ? RULE_WIDTH : 0),
    hLineColor: () => RULE_COLOR,
    vLineColor: () => RULE_COLOR,
    paddingLeft: () => 8,
    paddingRight: () => 8,
    paddingTop: () => 6,
    paddingBottom: () => 6
}

const INFO_LEFT_WIDTH = '62%'
const INFO_GAP_WIDTH = '2%'

function renderClientAndDocBoxes(info: any = {}) {
    const {
        studentId = '',
        studentName = '',
        contactName = '',
        address = '',
        invoiceNo = '',
        invoiceDate = '',
        dueDate = ''
    } = info

    const leftStack: any[] = [
        {
            text: [{ text: 'Client name : ', bold: true }, { text: studentName, ...thaiFont(studentName) }],
            style: 'infoValue',
            margin: [0, 0, 0, 6]
        }
    ]
    if (contactName) {
        leftStack.push({
            text: [{ text: 'Contact name : ', bold: true }, { text: contactName, ...thaiFont(contactName) }],
            style: 'infoValue',
            margin: [0, 0, 0, 6]
        })
    }
    leftStack.push({
        text: [{ text: 'Address : ', bold: true }, { text: address, ...thaiFont(address) }],
        style: 'infoValue'
    })
    // Keep the box tall enough for a wrapped address — otherwise a one-line value
    // leaves the right-hand box looking lopsided.
    leftStack.push({ text: '', margin: [0, 0, 0, 12] })

    const leftBox = {
        table: { widths: ['*'], body: [[{ stack: leftStack }]] },
        layout: BOX_LAYOUT
    }

    const rightRows: Array<[string, string]> = [
        ['No', invoiceNo],
        ['Date', invoiceDate]
    ]
    if (studentId) rightRows.unshift(['Cust. Code', studentId])

    const rightBox = {
        table: {
            widths: ['auto', '*'],
            body: rightRows.map(([label, value]) => [
                { text: label, style: 'infoLabel', bold: true, margin: [0, 0, 18, 0] },
                { text: value, style: 'infoValue', ...thaiFont(value) }
            ])
        },
        layout: BOX_LAYOUT
    }

    const dueDateBox = {
        table: {
            widths: ['*'],
            body: [
                [
                    {
                        text: [
                            { text: 'PLEASE PAY ON OR BEFORE   ', bold: true },
                            { text: dueDate, bold: true }
                        ],
                        style: 'infoValue'
                    }
                ]
            ]
        },
        layout: BOX_LAYOUT,
        margin: [0, 8, 0, 0]
    }

    return {
        stack: [
            {
                columns: [
                    { width: INFO_LEFT_WIDTH, stack: [leftBox] },
                    { width: INFO_GAP_WIDTH, text: '' },
                    { width: '*', stack: [rightBox] }
                ]
            },
            dueDateBox
        ],
        margin: [0, 0, 0, 10]
    }
}

function renderFormalItemsTable(items: any[] = [], totalAmount: number | null, options: { minRows?: number } = {}) {
    const { minRows = 12 } = options

    const total =
        totalAmount != null ? totalAmount : items.reduce((sum: number, item: any) => sum + (item.amount || 0), 0)

    const headerRow: any[] = [
        { text: 'NO.', style: 'tableHeader', alignment: 'center' },
        { text: 'DESCRIPTION', style: 'tableHeader', alignment: 'center' },
        { text: 'QTY.', style: 'tableHeader', alignment: 'center' },
        { text: 'UNIT', style: 'tableHeader', alignment: 'center' },
        { text: 'PRICE/UNIT', style: 'tableHeader', alignment: 'center' },
        { text: 'DISCOUNT', style: 'tableHeader', alignment: 'center' },
        { text: 'AMOUNT (BAHT)', style: 'tableHeader', alignment: 'center' }
    ]
    const widths: any[] = [26, '*', 36, 40, 68, 50, 78]

    const bodyRows: any[] = items.map((item: any, index: number) => {
        const descStack: any[] = []
        if (item.name) descStack.push({ text: item.name, style: 'tableCell', ...thaiFont(item.name) })
        if (item.description)
            descStack.push({
                text: item.description,
                style: 'tableCellSubtext',
                italics: true,
                margin: [0, 1, 0, 0],
                ...thaiFont(item.description)
            })

        return [
            { text: String(index + 1), alignment: 'center', style: 'tableCell' },
            descStack.length === 0 ? { text: '', style: 'tableCell' } : { stack: descStack },
            { text: '1.00', alignment: 'right', style: 'tableCell' },
            { text: 'Time', alignment: 'center', style: 'tableCell' },
            { text: formatCurrency(item.amount), alignment: 'right', style: 'tableCell' },
            { text: '', alignment: 'center', style: 'tableCell' },
            { text: formatCurrency(item.amount), alignment: 'right', style: 'tableCell' }
        ]
    })

    // Pad short invoices so the body matches the reference form's reserved whitespace.
    const emptyCount = Math.max(0, minRows - items.length)
    for (let i = 0; i < emptyCount; i++) {
        bodyRows.push(widths.map(() => ({ text: '', style: 'tableCell' })))
    }

    // Drop the bottom border — the totals table underneath carries its own top border, and
    // drawing both at the same y stacks into a visibly thicker rule.
    const itemsTable = {
        table: {
            headerRows: 1,
            widths,
            body: [headerRow, ...bodyRows]
        },
        layout: {
            hLineWidth: (i: number) => (i === 0 || i === 1 ? RULE_WIDTH : 0),
            vLineWidth: () => RULE_WIDTH,
            hLineColor: () => RULE_COLOR,
            vLineColor: () => RULE_COLOR,
            paddingLeft: () => 6,
            paddingRight: () => 6,
            paddingTop: () => 4,
            paddingBottom: () => 4
        }
    }

    // Right-aligned Total / VAT 0% / Total Amount. The left column spans all three rows as the
    // reference's single Remark cell; no per-cell border overrides, so the layout draws one
    // hairline per edge instead of two overlapping ones.
    const totalsTable = {
        table: {
            widths: ['*', 100, 90],
            body: [
                [
                    {
                        rowSpan: 3,
                        stack: [
                            { text: 'Remark:', style: 'noteTitle', bold: true, margin: [0, 0, 0, 4] },
                            {
                                text: '*Please note that invoices unpaid by the above due date will incur a late fee of 1.25% per month*',
                                style: 'noteText'
                            }
                        ]
                    },
                    { text: 'Total', style: 'totalLabel', alignment: 'right' },
                    { text: formatCurrency(total), style: 'totalValue', alignment: 'right' }
                ],
                [
                    {},
                    { text: 'VAT', style: 'totalLabel', alignment: 'right' },
                    { text: '0%', style: 'totalValue', alignment: 'right' }
                ],
                [
                    {},
                    { text: 'Total Amount', style: 'totalLabel', alignment: 'right' },
                    { text: formatCurrency(total), style: 'totalValue', alignment: 'right', bold: true }
                ]
            ]
        },
        layout: {
            hLineWidth: () => RULE_WIDTH,
            vLineWidth: () => RULE_WIDTH,
            hLineColor: () => RULE_COLOR,
            vLineColor: () => RULE_COLOR,
            paddingLeft: () => 6,
            paddingRight: () => 6,
            paddingTop: () => 4,
            paddingBottom: () => 4
        }
    }

    return { stack: [itemsTable, totalsTable] }
}

function renderAmountInWords(amountInWords: string) {
    return {
        table: {
            widths: ['*'],
            body: [
                [
                    {
                        text: [
                            { text: 'Amount in words  ', bold: true },
                            { text: amountInWords ? `(${amountInWords})` : '' }
                        ],
                        style: 'totalWordsCell',
                        alignment: 'center'
                    }
                ]
            ]
        },
        layout: BOX_LAYOUT,
        margin: [0, 6, 0, 0]
    }
}

function renderDualBankAccounts(payment: any = {}) {
    const primary = {
        bankName: payment.bankName || '',
        branch: payment.branch || '',
        accountNumber: payment.accountNumber || '',
        accountName: payment.accountName || 'Brighton College Bangkok, Vibhavadi',
        swiftCode: payment.swiftCode || ''
    }
    const sec = payment.secondaryAccount || {}
    const secondary = {
        bankName: sec.bankName || '',
        branch: sec.branch || '',
        accountNumber: sec.accountNumber || '',
        accountName: sec.accountName || '',
        swiftCode: sec.swiftCode || ''
    }

    const cellStack = (acc: typeof primary) => {
        const rows: Array<[string, string]> = [
            ['Bank', acc.bankName],
            ['Branch', acc.branch],
            ['Account No', acc.accountNumber],
            ['Account Name', acc.accountName],
            ['Swift Code', acc.swiftCode]
        ]
        return {
            table: {
                widths: [86, '*'],
                body: rows.map(([label, value]) => [
                    { text: `${label}:`, style: 'bankDetailLabel', border: [false, false, false, false] },
                    { text: value, style: 'bankDetailValue', border: [false, false, false, false], ...thaiFont(value) }
                ])
            },
            layout: {
                hLineWidth: () => 0,
                vLineWidth: () => 0,
                paddingLeft: () => 0,
                paddingRight: () => 0,
                paddingTop: () => 1,
                paddingBottom: () => 1
            }
        }
    }

    return {
        stack: [
            {
                text: 'Payment via Bank Transfer or Credit Card',
                style: 'paymentTitle',
                bold: true,
                margin: [0, 0, 0, 4]
            },
            {
                table: {
                    widths: ['*', '*'],
                    body: [[cellStack(primary), cellStack(secondary)]]
                },
                layout: {
                    hLineWidth: (i: number, node: any) => (i === 0 || i === node.table.body.length ? RULE_WIDTH : 0),
                    vLineWidth: (i: number, node: any) => (i === 0 || i === node.table.widths.length ? RULE_WIDTH : 0),
                    hLineColor: () => RULE_COLOR,
                    vLineColor: () => RULE_COLOR,
                    paddingLeft: () => 8,
                    paddingRight: () => 8,
                    paddingTop: () => 6,
                    paddingBottom: () => 6
                }
            }
        ],
        margin: [0, 8, 0, 0]
    }
}

export function buildHolidayCampExternalReport(data: any = {}) {
    const header = createHeader(data.header)
    const infoBoxes = renderClientAndDocBoxes(data.studentInfo || {})
    const itemsAndTotals = renderFormalItemsTable(data.items || [], data.totalAmount)
    const amountInWords = renderAmountInWords(data.amountInWords || '')
    const latePayment = createLatePaymentNote(data.latePayment)
    const dualBanks = renderDualBankAccounts(data.paymentDetails || data.paymentMethods || {})
    const signature = createSignatureSection(data.signature)

    return buildDocDefinition({
        header,
        studentInfo: infoBoxes,
        content: [itemsAndTotals, amountInWords, latePayment, dualBanks, signature]
    })
}
