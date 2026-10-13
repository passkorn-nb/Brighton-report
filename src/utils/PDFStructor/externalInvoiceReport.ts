import { buildDocDefinition, formatCurrency, thaiFont, DEFAULT_FONT } from './baseTemplate'

// Hardcoded identity and banking per the Finance team's reference form -- these fields are not
// stored in the School-Info settings for the External template, so they ship as constants.
const COMPANY_LEGAL_NAME = 'HANDS MANAGEMENT CO., LTD.'
const SCHOOL_NAME_EN = 'Brighton College International School Bangkok Vibhavadi'
const ADDRESS_EN = '998/1 Viphavadi Rangsit Road, Lad Yao, Chatuchak, Bangkok 10900'
const PHONE = '0-2513-0270-1'
const EMAIL = 'finance@brightoncollegevibha.ac.th'
const TAX_ID = '0105533041892'
const LATE_FEE_PER_MONTH_PCT = 1.25

const BANKS = [
    {
        bank: 'Bangkok Bank Public Company Limited',
        branch: 'Energy Complex',
        accountNo: '045-7-05940-0',
        accountName: 'Brighton College International School Bangkok Vibhavadi',
        swift: 'BKKBTHBK'
    },
    {
        bank: 'Kasikorn Bank Public Company Limited',
        branch: 'Ramkhamhaeng 151',
        accountNo: '015-1-98113-5 (Savings Account)',
        accountName: 'Hands Management Co., Ltd.',
        swift: 'KASITHBK'
    }
]

const CELL_BORDERED = {
    hLineWidth: () => 0.8,
    vLineWidth: () => 0.8,
    hLineColor: () => '#000000',
    vLineColor: () => '#000000',
    paddingLeft: () => 5,
    paddingRight: () => 5,
    paddingTop: () => 4,
    paddingBottom: () => 4
}

const OUTER_BORDER_ONLY = {
    hLineWidth: (i: number, n: any) => (i === 0 || i === n.table.body.length ? 1 : 0),
    vLineWidth: (i: number, n: any) => (i === 0 || i === n.table.widths.length ? 1 : 0),
    hLineColor: () => '#000000',
    vLineColor: () => '#000000',
    paddingLeft: () => 6,
    paddingRight: () => 6,
    paddingTop: () => 4,
    paddingBottom: () => 4
}

const FS_LABEL = 10
const FS_VALUE = 10
const FS_HEADER = 11
const FS_CELL = 10.5
const FS_SMALL = 9.5
const FS_BANNER = 11
const FS_BANK = 8

function custInfoBlock(studentInfo: any) {
    const custCode: string = studentInfo?.studentId ?? ''
    const custName: string = studentInfo?.studentName ?? ''
    const address: string = studentInfo?.address ?? ''
    return {
        table: {
            widths: ['*', 180],
            body: [
                [
                    {
                        table: {
                            widths: ['auto', '*'],
                            body: [
                                [{ text: 'Cust. Code', bold: true, fontSize: FS_LABEL }, { text: custCode, fontSize: FS_VALUE, ...thaiFont(custCode) }],
                                [{ text: 'Cust. Name', bold: true, fontSize: FS_LABEL }, { text: custName, fontSize: FS_VALUE, ...thaiFont(custName) }],
                                [{ text: 'Address', bold: true, fontSize: FS_LABEL }, { text: address, fontSize: FS_VALUE, ...thaiFont(address) }]
                            ]
                        },
                        layout: 'noBorders'
                    },
                    {
                        table: {
                            widths: ['auto', '*'],
                            body: [
                                [{ text: 'Doc. No.', bold: true, fontSize: FS_LABEL }, { text: studentInfo?.invoiceNo ?? '', fontSize: FS_VALUE }],
                                [{ text: 'Date', bold: true, fontSize: FS_LABEL }, { text: studentInfo?.invoiceDate ?? '', fontSize: FS_VALUE }],
                                [{ text: 'Due Date', bold: true, fontSize: FS_LABEL, margin: [0, 10, 0, 0] }, { text: studentInfo?.dueDate ?? '', fontSize: FS_VALUE, bold: true, margin: [0, 10, 0, 0] }]
                            ]
                        },
                        layout: 'noBorders'
                    }
                ]
            ]
        },
        layout: OUTER_BORDER_ONLY,
        margin: [0, 0, 0, 6]
    }
}

function pleasePayBanner(dueDate: string) {
    return {
        table: {
            widths: ['auto', '*'],
            body: [[
                { text: 'PLEASE PAY ON OR BEFORE', bold: true, fontSize: FS_BANNER },
                { text: dueDate, bold: true, fontSize: FS_BANNER, alignment: 'left', margin: [20, 0, 0, 0] }
            ]]
        },
        layout: OUTER_BORDER_ONLY,
        margin: [0, 0, 0, 6]
    }
}

function lineItemsTable(items: any[], minRows: number) {
    const header = [
        { text: 'Description', bold: true, fontSize: FS_HEADER, alignment: 'center' },
        { text: 'Qty.', bold: true, fontSize: FS_HEADER, alignment: 'center' },
        { text: 'Unit', bold: true, fontSize: FS_HEADER, alignment: 'center' },
        { text: 'Price/Unit', bold: true, fontSize: FS_HEADER, alignment: 'center' },
        { text: 'Discount', bold: true, fontSize: FS_HEADER, alignment: 'center' },
        { text: 'Amount (Baht)', bold: true, fontSize: FS_HEADER, alignment: 'center' }
    ]
    const rows = items.map((it) => {
        const qty = Number(it.qty ?? 1)
        const unit = String(it.unit ?? 'Time')
        const price = Number(it.price ?? it.amount ?? 0)
        const discountPct = it.discountPct != null ? `${it.discountPct}%` : ''
        const amount = Number(it.amount ?? price * qty)
        return [
            { text: it.name ?? '', fontSize: FS_CELL, ...thaiFont(it.name) },
            { text: qty.toFixed(2), fontSize: FS_CELL, alignment: 'right' },
            { text: unit, fontSize: FS_CELL, alignment: 'center' },
            { text: formatCurrency(price), fontSize: FS_CELL, alignment: 'right' },
            { text: discountPct, fontSize: FS_CELL, alignment: 'center' },
            { text: formatCurrency(amount), fontSize: FS_CELL, alignment: 'right' }
        ]
    })
    const padding = Math.max(0, minRows - rows.length)
    const emptyRows = Array.from({ length: padding }, () => [' ', ' ', ' ', ' ', ' ', ' '])
    return {
        table: {
            headerRows: 1,
            widths: ['*', 36, 32, 52, 52, 88],
            body: [header, ...rows, ...emptyRows]
        },
        layout: CELL_BORDERED,
        margin: [0, 0, 0, 0]
    }
}

function totalsBlock(subtotal: number, vatPct: number, grand: number, amountInWords: string, lateFeeNote: string) {
    const vatAmount = (subtotal * vatPct) / 100
    return {
        table: {
            widths: ['*', 110, 80],
            body: [
                [
                    { text: 'Remark:', bold: true, fontSize: FS_LABEL },
                    { text: 'Total', bold: true, fontSize: FS_LABEL, alignment: 'right' },
                    { text: formatCurrency(subtotal), fontSize: FS_LABEL, alignment: 'right' }
                ],
                [
                    { text: lateFeeNote, italics: true, fontSize: FS_SMALL },
                    { text: `VAT       ${vatPct}%`, fontSize: FS_LABEL, alignment: 'left' },
                    { text: vatPct > 0 ? formatCurrency(vatAmount) : '', fontSize: FS_LABEL, alignment: 'right' }
                ],
                [
                    { text: `( ${amountInWords.toUpperCase()} )`, bold: true, fontSize: FS_LABEL },
                    { text: 'Total Amount', bold: true, fontSize: FS_LABEL, alignment: 'right' },
                    { text: formatCurrency(grand), fontSize: FS_LABEL, alignment: 'right', bold: true }
                ]
            ]
        },
        layout: {
            hLineWidth: () => 0.6,
            vLineWidth: () => 0.6,
            hLineColor: () => '#000000',
            vLineColor: () => '#000000',
            paddingLeft: () => 5,
            paddingRight: () => 5,
            paddingTop: () => 4,
            paddingBottom: () => 4
        },
        margin: [0, 0, 0, 10]
    }
}

function paymentAndSignatureRow() {
    const bankCol = (b: typeof BANKS[number]) => ({
        stack: [
            { text: `Bank: ${b.bank}`, fontSize: FS_BANK },
            { text: `Branch: ${b.branch}`, fontSize: FS_BANK },
            { text: `Account No: ${b.accountNo}`, fontSize: FS_BANK },
            { text: `Account Name: ${b.accountName}`, fontSize: FS_BANK },
            { text: `Swift Code: ${b.swift}`, fontSize: FS_BANK }
        ]
    })

    return {
        table: {
            widths: ['*', 10, 180],
            body: [[
                {
                    stack: [
                        { text: 'Payment via Bank Transfer or Credit Card', bold: true, fontSize: FS_LABEL },
                        { columns: [bankCol(BANKS[0]), bankCol(BANKS[1])], margin: [0, 4, 0, 0] }
                    ],
                    border: [true, true, true, true]
                },
                { text: '', border: [false, false, false, false] },
                {
                    stack: [
                        {
                            text: [
                                { text: 'Nominally  ', bold: true, fontSize: 8 },
                                { text: COMPANY_LEGAL_NAME, bold: true, fontSize: 8 }
                            ]
                        },
                        { text: '', margin: [0, 30, 0, 0] },
                        {
                            columns: [
                                {
                                    stack: [
                                        { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 75, y2: 0, lineWidth: 0.6 }] },
                                        { text: 'Prepared By', bold: true, fontSize: FS_LABEL, alignment: 'center', margin: [0, 2, 0, 0] }
                                    ]
                                },
                                {
                                    stack: [
                                        { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 75, y2: 0, lineWidth: 0.6 }] },
                                        { text: 'Verified By', bold: true, fontSize: FS_LABEL, alignment: 'center', margin: [0, 2, 0, 0] }
                                    ]
                                }
                            ]
                        }
                    ],
                    border: [true, true, true, true]
                }
            ]]
        },
        layout: {
            hLineWidth: () => 0.6,
            vLineWidth: () => 0.6,
            hLineColor: () => '#000000',
            vLineColor: () => '#000000',
            paddingLeft: () => 6,
            paddingRight: () => 6,
            paddingTop: () => 4,
            paddingBottom: () => 4
        },
        margin: [0, 0, 0, 6]
    }
}

export function buildExternalInvoiceReport(data: any = {}) {
    const si = data.studentInfo ?? {}
    const items = (data.items ?? []).map((it: any) => ({
        name: it.name ?? '',
        qty: it.qty ?? 1,
        unit: it.unit ?? 'Time',
        price: it.price ?? it.amount,
        discountPct: it.discountPct,
        amount: Number(it.amount ?? 0)
    }))
    const subtotal = items.reduce((s: number, it: any) => s + Number(it.amount || 0), 0)
    const vatPct = 0
    const grand = Number(data.totalAmount ?? subtotal + (subtotal * vatPct) / 100)
    const amountInWords: string = data.amountInWords ?? ''
    const lateFeeNote = `*Please note that invoices unpaid by the above due date will incur a late fee of ${LATE_FEE_PER_MONTH_PCT}% per month*`

    // The page header carries the hardcoded school identity; __data goes to getPageHeader via buildDocDefinition.
    const header = {
        __data: {
            nameEn: SCHOOL_NAME_EN,
            managedBy: COMPANY_LEGAL_NAME,
            addressEn: ADDRESS_EN,
            phone: PHONE,
            email: `${EMAIL}   TAX ID ${TAX_ID}`
        },
        text: ''
    }

    const studentInfo = custInfoBlock(si)

    const content = [
        lineItemsTable(items, 10),
        totalsBlock(subtotal, vatPct, grand, amountInWords, lateFeeNote),
        paymentAndSignatureRow()
    ]

    return buildDocDefinition({ header, studentInfo, content, font: DEFAULT_FONT })
}
