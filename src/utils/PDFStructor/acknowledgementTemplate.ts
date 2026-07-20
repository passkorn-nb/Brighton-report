import fs from 'fs'
import path from 'path'
import { formatCurrency, thaiFont } from './baseTemplate'

const LOGO_PATH = path.resolve(process.cwd(), 'src/assets/images/kcis-logo.png')
let cachedLogo: string | null | undefined

function loadLogoBase64(): string | null {
    if (cachedLogo !== undefined) return cachedLogo
    try {
        if (fs.existsSync(LOGO_PATH)) {
            logger.info(`Loading logo from ${LOGO_PATH}`)
            const buf = fs.readFileSync(LOGO_PATH)
            cachedLogo = `data:image/png;base64,${buf.toString('base64')}`
        } else {
            logger.warn(`Logo file not found at ${LOGO_PATH}, logo will be omitted from acknowledgement`)
            cachedLogo = null
        }
    } catch {
        cachedLogo = null
    }
    return cachedLogo
}

function valueOrDash(value: any): string {
    if (value == null) return '-'
    const s = String(value).trim()
    return s === '' ? '-' : s
}

export function createAcknowledgementHeader(copyLabel = '') {
    const logo = loadLogoBase64()
    const stack: any[] = []

    if (logo) {
        stack.push({ image: logo, fit: [150, 150], alignment: 'center', margin: [0, 0, 0, 6] })
    }
    stack.push({
        text: 'ACKNOWLEDGEMENT OF SCHOOL FEE PAYMENT',
        style: 'receiptTitle',
        alignment: 'center',
        margin: [0, 0, 0, 4]
    })
    stack.push({ text: `Copy: ${copyLabel}`, style: 'infoLabel', alignment: 'center', margin: [0, 0, 0, 16] })

    return { stack }
}

export function createAcknowledgementInfoBox(data: any = {}) {
    const {
        studentIdNo = '',
        studentName = '',
        contactName = '',
        receiptNo = '',
        receiptDate = '',
        yearGroup = '',
        schoolYear = ''
    } = data

    const leftRows = [
        ['Student ID no.', studentIdNo],
        ['Student name', studentName],
        ['Contact name', contactName]
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
            { text: left[1], style: 'infoValue', ...thaiFont(left[1]) },
            { text: right[0], style: 'infoLabel' },
            { text: right[1], style: 'infoValue', alignment: 'right', noWrap: true, ...thaiFont(right[1]) }
        ])
    }

    return {
        table: {
            widths: [70, '*', 70, 85],
            body
        },
        layout: {
            hLineWidth: (i: number, node: any) => (i === 0 || i === node.table.body.length ? 0.5 : 0),
            vLineWidth: (i: number, node: any) => (i === 0 || i === node.table.widths.length ? 0.5 : 0),
            hLineColor: () => '#ADABAB',
            vLineColor: () => '#ADABAB',
            paddingLeft: () => 6,
            paddingRight: () => 6,
            paddingTop: () => 4,
            paddingBottom: () => 4
        },
        margin: [0, 0, 0, 10]
    }
}

export function createAcknowledgementItemsTable(rows: any[] = [], options: any = {}) {
    const { overpaymentAmount = 0, grandTotal = null, amountInWords = '', minRows = 10 } = options

    const total =
        grandTotal != null ? grandTotal : rows.reduce((sum: number, row: any) => sum + (Number(row.received) || 0), 0)

    const widths = [30, '*', 80, 90, 90]

    const headerRow: any[] = [
        { text: 'No.', style: 'tableHeader', alignment: 'center' },
        { text: 'Invoice no.', style: 'tableHeader', alignment: 'center' },
        { text: 'Invoice amount', style: 'tableHeader', alignment: 'center' },
        { text: 'Credit card fee', style: 'tableHeader', alignment: 'center' },
        { text: 'Received', style: 'tableHeader', alignment: 'center' }
    ]

    const bodyRows: any[] = rows.map((row: any, index: number) => [
        { text: String(row.no ?? index + 1), alignment: 'center', style: 'tableCell' },
        { text: row.invoiceNo || '', alignment: 'center', style: 'tableCell', ...thaiFont(row.invoiceNo) },
        { text: formatCurrency(row.invoiceAmount), alignment: 'right', style: 'tableCell' },
        { text: formatCurrency(row.cardFee), alignment: 'right', style: 'tableCell' },
        { text: formatCurrency(row.received), alignment: 'right', style: 'tableCell' }
    ])

    const emptyCount = Math.max(0, minRows - rows.length)
    const emptyRows: any[] = []
    for (let i = 0; i < emptyCount; i++) {
        emptyRows.push([
            { text: '', style: 'tableCell' },
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
                colSpan: 4,
                alignment: 'center',
                border: [true, true, true, true]
            },
            {},
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
            colSpan: 4,
            columns: [
                {
                    text: amountInWords || '',
                    style: 'receiptTotalWords',
                    width: '*'
                },
                {
                    text: 'GRAND TOTAL',
                    style: 'receiptTotalLabel',
                    width: 'auto',
                    alignment: 'right',
                    margin: [4, 0, 0, 0]
                }
            ],
            border: [true, true, true, true]
        },
        {},
        {},
        {},
        {
            text: formatCurrency(total),
            style: 'receiptTotalValue',
            alignment: 'right',
            border: [true, true, true, true]
        }
    ]

    return {
        table: {
            headerRows: 1,
            widths,
            body: [headerRow, ...bodyRows, ...emptyRows, ...extraRows, totalRow]
        },
        layout: {
            hLineWidth: (i: number, node: any) => {
                if (i === 0 || i === 1) return 0.5
                if (i === node.table.body.length) return 0.5
                if (i === node.table.body.length - 1) return 0.5
                if (overpaymentAmount && Number(overpaymentAmount) > 0 && i === node.table.body.length - 2) return 0.5
                return 0
            },
            vLineWidth: () => 0.5,
            hLineColor: () => '#ADABAB',
            vLineColor: () => '#ADABAB',
            paddingLeft: () => 6,
            paddingRight: () => 6,
            paddingTop: () => 4,
            paddingBottom: () => 4
        },
        margin: [0, 0, 0, 10]
    }
}

export function createCreditCardLine(data: any = {}) {
    const { cardBankName = '' } = data
    return {
        text: [{ text: 'Credit card: ', bold: true }, { text: valueOrDash(cardBankName) }],
        style: 'paymentMethodLine',
        margin: [0, 4, 0, 12]
    }
}

export function createAcknowledgementSignatures(data: any = {}) {
    const { cashierName = '' } = data

    const boxLayout = {
        hLineWidth: () => 0.5,
        vLineWidth: () => 0.5,
        hLineColor: () => '#ADABAB',
        vLineColor: () => '#ADABAB'
    }

    return {
        columns: [
            {
                width: '*',
                stack: [
                    {
                        table: {
                            widths: ['*'],
                            heights: [38],
                            body: [
                                [
                                    {
                                        text: cashierName || ' ',
                                        style: 'signatureName',
                                        alignment: 'center',
                                        margin: [0, 12, 0, 0],
                                        ...thaiFont(cashierName)
                                    }
                                ]
                            ]
                        },
                        layout: boxLayout,
                        margin: [40, 0, 40, 6]
                    },
                    { text: 'Cashier', style: 'signatureLabel', alignment: 'center' }
                ]
            },
            {
                width: '*',
                stack: [
                    {
                        table: {
                            widths: ['*'],
                            heights: [38],
                            body: [[{ text: ' ', style: 'signatureName', alignment: 'center', margin: [0, 8, 0, 8] }]]
                        },
                        layout: boxLayout,
                        margin: [40, 0, 40, 6]
                    },
                    { text: 'Authorised signature', style: 'signatureLabel', alignment: 'center' }
                ]
            }
        ],
        margin: [0, 24, 0, 0]
    }
}
