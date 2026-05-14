import fs from 'fs'
import path from 'path'
import dayjs from 'dayjs'
import { formatCurrency, getBaseStyles } from './baseTemplate'

const LOGO_PATH = path.resolve(path.dirname(process.argv[1]), '..', 'src/assets/images/kcis-logo.png')
let cachedLogo: string | null | undefined

function loadLogoBase64(): string | null {
    if (cachedLogo !== undefined) return cachedLogo
    try {
        if (fs.existsSync(LOGO_PATH)) {
            logger.info(`Loading logo from ${LOGO_PATH}`)
            const buf = fs.readFileSync(LOGO_PATH)
            cachedLogo = `data:image/png;base64,${buf.toString('base64')}`
        } else {
            logger.warn(`Logo file not found at ${LOGO_PATH}, logo will be omitted from receipts`)
            cachedLogo = null
        }
    } catch {
        cachedLogo = null
    }
    return cachedLogo
}

function formatReceiptAmount(value: any): string {
    if (value == null || isNaN(value)) return ''
    const n = Number(value)
    return n < 0 ? `(${formatCurrency(Math.abs(n))})` : formatCurrency(n)
}

function valueOrDash(value: any): string {
    if (value == null) return '-'
    const s = String(value).trim()
    return s === '' ? '-' : s
}

export function createReceiptHeader(data: any = {}) {
    const { schoolName = "KING'S COLLEGE INTERNATIONAL SCHOOL", schoolLocation = 'BANGKOK', logoBase64 } = data

    const logo = loadLogoBase64()
    const stack: any[] = []

    if (logo) {
        stack.push({ image: logo, fit: [70, 70], alignment: 'center', margin: [0, 0, 0, 6] })
    }
    stack.push({ text: schoolName, style: 'receiptSchoolName', alignment: 'center' })
    stack.push({ text: schoolLocation, style: 'receiptSchoolLocation', alignment: 'center', margin: [0, 2, 0, 14] })
    stack.push({ text: 'RECEIPT', style: 'receiptTitle', alignment: 'center', margin: [0, 0, 0, 14] })

    return { stack }
}

export function createReceiptInfoBox(data: any = {}) {
    const {
        studentId = '',
        studentName = '',
        contactName = '',
        address = '',
        receiptNo = '',
        receiptDate = dayjs().format('DD MMMM YYYY'),
        yearGroup = '',
        schoolYear = ''
    } = data

    const leftRows = [
        ['Student ID no.', studentId],
        ['Student name', studentName],
        ['Contact name', contactName],
        ['Address', address]
    ]
    const rightRows = [
        ['Receipt no.', receiptNo],
        ['Receipt date', receiptDate],
        ['Year group', yearGroup],
        ['School year', schoolYear]
    ]

    const maxRows = Math.max(leftRows.length, rightRows.length)
    const body: any[] = []
    for (let i = 0; i < maxRows; i++) {
        const left = leftRows[i] || ['', '']
        const right = rightRows[i] || ['', '']
        body.push([
            { text: left[0], style: 'infoLabel' },
            { text: left[1], style: 'infoValue' },
            { text: right[0], style: 'infoLabel' },
            { text: right[1], style: 'infoValue', alignment: 'right', noWrap: true }
        ])
    }

    return {
        table: {
            widths: [70, '*', 70, 85],
            body
        },
        layout: {
            hLineWidth: (i: number, node: any) => (i === 0 || i === node.table.body.length ? 1 : 0),
            vLineWidth: (i: number, node: any) => (i === 0 || i === node.table.widths.length ? 1 : 0),
            hLineColor: () => '#000000',
            vLineColor: () => '#000000',
            paddingLeft: () => 6,
            paddingRight: () => 6,
            paddingTop: () => 4,
            paddingBottom: () => 4
        },
        margin: [0, 0, 0, 10]
    }
}

export function createReceiptItemsTable(items: any[] = [], options: any = {}) {
    const { overpaymentAmount = 0, totalAmount = null, amountInWords = '', minRows = 6 } = options

    const total =
        totalAmount != null
            ? totalAmount
            : items.reduce((sum: number, item: any) => sum + (Number(item.receivedAmount) || 0), 0)

    const widths = [30, '*', '*', 90]

    const headerRow: any[] = [
        { text: 'No.', style: 'tableHeader', alignment: 'center' },
        { text: 'Document no.', style: 'tableHeader', alignment: 'center' },
        { text: 'Issue date', style: 'tableHeader', alignment: 'center' },
        { text: 'Received amount (THB)', style: 'tableHeader', alignment: 'center' }
    ]

    const bodyRows: any[] = items.map((item: any, index: number) => [
        { text: String(index + 1), alignment: 'center', style: 'tableCell' },
        { text: item.documentNo || '', alignment: 'center', style: 'tableCell' },
        { text: item.issueDate || '', alignment: 'center', style: 'tableCell' },
        { text: formatReceiptAmount(item.receivedAmount), alignment: 'right', style: 'tableCell' }
    ])

    const emptyCount = Math.max(0, minRows - items.length)
    for (let i = 0; i < emptyCount; i++) {
        bodyRows.push([
            { text: '', style: 'tableCell' },
            { text: '', style: 'tableCell' },
            { text: '', style: 'tableCell' },
            { text: '', style: 'tableCell' }
        ])
    }

    const extraRows: any[] = []
    if (overpaymentAmount && Number(overpaymentAmount) > 0) {
        extraRows.push([
            {
                text: 'Overpayment amount',
                style: 'tableCell',
                colSpan: 3,
                alignment: 'center',
                border: [true, true, true, true]
            },
            {},
            {},
            {
                text: formatCurrency(overpaymentAmount),
                style: 'tableCell',
                alignment: 'right',
                border: [true, true, true, true]
            }
        ])
    }

    const totalRow: any[] = [
        {
            text: (amountInWords || '').toUpperCase(),
            style: 'totalWordsCell',
            bold: true,
            colSpan: 3,
            border: [true, true, true, true]
        },
        {},
        {},
        {
            columns: [
                { text: 'TOTAL', style: 'totalLabel', bold: true, width: 'auto' },
                { text: formatCurrency(total), style: 'totalValue', bold: true, width: '*', alignment: 'right' }
            ],
            border: [true, true, true, true]
        }
    ]

    return {
        table: {
            headerRows: 1,
            widths,
            body: [headerRow, ...bodyRows, ...extraRows, totalRow]
        },
        layout: {
            hLineWidth: (i: number, node: any) => {
                if (i === 0 || i === 1) return 1
                if (i === node.table.body.length) return 1
                if (i === node.table.body.length - 1) return 1
                if (overpaymentAmount && Number(overpaymentAmount) > 0 && i === node.table.body.length - 2) return 1
                return 0
            },
            vLineWidth: () => 1,
            hLineColor: () => '#000000',
            vLineColor: () => '#000000',
            paddingLeft: () => 6,
            paddingRight: () => 6,
            paddingTop: () => 4,
            paddingBottom: () => 4
        },
        margin: [0, 0, 0, 10]
    }
}

export function createPaymentMethodTable(data: any = {}) {
    const { paymentMethod = '', bankName = '', bankBranch = '', chequeNo = '', chequeDate = '' } = data

    const headerRow = [
        { text: 'Payment method', style: 'tableHeader', alignment: 'center' },
        { text: 'Bank name', style: 'tableHeader', alignment: 'center' },
        { text: 'Bank branch', style: 'tableHeader', alignment: 'center' },
        { text: 'Cheque no.', style: 'tableHeader', alignment: 'center' },
        { text: 'Cheque date', style: 'tableHeader', alignment: 'center' }
    ]
    const dataRow = [
        { text: valueOrDash(paymentMethod), style: 'tableCell', alignment: 'center' },
        { text: valueOrDash(bankName), style: 'tableCell', alignment: 'center' },
        { text: valueOrDash(bankBranch), style: 'tableCell', alignment: 'center' },
        { text: valueOrDash(chequeNo), style: 'tableCell', alignment: 'center' },
        { text: valueOrDash(chequeDate), style: 'tableCell', alignment: 'center' }
    ]

    return {
        table: {
            headerRows: 1,
            widths: ['*', '*', '*', '*', '*'],
            body: [headerRow, dataRow]
        },
        layout: {
            hLineWidth: () => 1,
            vLineWidth: () => 1,
            hLineColor: () => '#000000',
            vLineColor: () => '#000000',
            paddingLeft: () => 6,
            paddingRight: () => 6,
            paddingTop: () => 4,
            paddingBottom: () => 4
        },
        margin: [0, 4, 0, 6]
    }
}

export function createReceiptNotes() {
    return {
        stack: [
            {
                text: 'In case of payment made by cheque, this receipt will not be valid until the cheque has been honoured by the bank.',
                style: 'noteText'
            },
            {
                text: 'Please note that any overpayment amount is non-refundable and will be credited against future school fee invoices.',
                style: 'noteText',
                margin: [0, 2, 0, 0]
            }
        ],
        margin: [0, 0, 0, 12]
    }
}

export function createReceiptSignatures(data: any = {}) {
    const { collectorName = '', authorisedSignature = '', authorisedTitle = 'Head of Finance and Accounting' } = data

    return {
        columns: [
            {
                width: '*',
                stack: [
                    {
                        table: {
                            widths: ['*'],
                            body: [
                                [
                                    {
                                        text: collectorName || ' ',
                                        style: 'signatureName',
                                        alignment: 'center',
                                        margin: [0, 4, 0, 4]
                                    }
                                ]
                            ]
                        },
                        layout: {
                            hLineWidth: () => 1,
                            vLineWidth: () => 1,
                            hLineColor: () => '#000000',
                            vLineColor: () => '#000000'
                        },
                        margin: [40, 0, 40, 4]
                    },
                    { text: 'Collector', style: 'signatureLabel', alignment: 'center' }
                ]
            },
            {
                width: '*',
                stack: [
                    {
                        text: authorisedSignature || ' ',
                        style: 'signatureName',
                        alignment: 'center',
                        margin: [0, 0, 0, 4]
                    },
                    {
                        canvas: [{ type: 'line', x1: 40, y1: 0, x2: 200, y2: 0, lineWidth: 1, lineColor: '#000000' }],
                        margin: [0, 0, 0, 4]
                    },
                    { text: 'Authorised signature', style: 'signatureLabel', alignment: 'center' },
                    { text: authorisedTitle, style: 'signatureLabel', alignment: 'center' }
                ]
            }
        ],
        margin: [0, 8, 0, 0]
    }
}

export function createReceiptFooter(data: any = {}) {
    const {
        addressLine = "King's College International School Bangkok  727 Ratchadaphisek Road, Bang Phongphang, Yannawa, Bangkok 10120 Thailand",
        contactLine = '+66 (0) 2481 9955, finance@kingsbangkok.ac.th, www.kingsbangkok.ac.th'
    } = data

    return () => ({
        stack: [
            { text: addressLine, style: 'footerText', alignment: 'center' },
            { text: contactLine, style: 'footerText', alignment: 'center' }
        ],
        margin: [40, 0, 40, 20]
    })
}

export function getReceiptStyles() {
    return {
        ...getBaseStyles(),
        receiptSchoolName: {
            fontSize: 13,
            characterSpacing: 2,
            color: '#000000'
        },
        receiptSchoolLocation: {
            fontSize: 8.5,
            characterSpacing: 3,
            color: '#000000'
        },
        receiptTitle: {
            fontSize: 26,
            bold: true,
            color: '#000000'
        },
        footerText: {
            fontSize: 6.5,
            color: '#333333'
        }
    }
}

export function buildReceiptDocDefinition({ header, infoBox, content, footer }: any) {
    return {
        pageSize: 'A4' as const,
        pageMargins: [40, 40, 40, 70] as [number, number, number, number],
        content: [header, infoBox, ...content].filter(Boolean),
        footer: footer || createReceiptFooter(),
        styles: getReceiptStyles(),
        defaultStyle: { font: 'Roboto' }
    }
}
