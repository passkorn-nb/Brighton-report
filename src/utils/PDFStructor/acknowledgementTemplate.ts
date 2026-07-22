import fs from 'fs'
import path from 'path'
import { formatCurrency, thaiFont } from './baseTemplate'

const LOGO_PATH = path.resolve(process.cwd(), 'src/assets/images/kcis-logo.png')
let cachedLogo: string | null | undefined

const GRID_GRAY = '#ADABAB'
const HEADER_FILL = '#F2F2F2'
const COPY_LABEL_GRAY = '#808080'
const FOOTNOTE_GRAY = '#595959'

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

    // Small grey copy label anchored to the top-right corner.
    stack.push({
        text: copyLabel,
        color: COPY_LABEL_GRAY,
        fontSize: 9,
        bold: true,
        alignment: 'right',
        margin: [0, 0, 0, 2]
    })

    if (logo) {
        stack.push({ image: logo, fit: [150, 150], alignment: 'center', margin: [0, 0, 0, 6] })
    }
    stack.push({
        text: 'Acknowledgement of School Fee Payment',
        style: 'receiptTitle',
        alignment: 'center',
        margin: [0, 0, 0, 12]
    })

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
            { text: left[0] ? `${left[0]}:` : '', style: 'infoLabel', bold: true },
            { text: left[1], style: 'infoValue', ...thaiFont(left[1]) },
            { text: right[0] ? `${right[0]}:` : '', style: 'infoLabel', bold: true },
            { text: right[1], style: 'infoValue', ...thaiFont(right[1]) }
        ])
    }

    return {
        table: {
            widths: [78, '*', 72, 120],
            body
        },
        layout: {
            hLineWidth: (i: number, node: any) => (i === 0 || i === node.table.body.length ? 0.5 : 0),
            vLineWidth: (i: number, node: any) => (i === 0 || i === node.table.widths.length ? 0.5 : 0),
            hLineColor: () => GRID_GRAY,
            vLineColor: () => GRID_GRAY,
            paddingLeft: () => 6,
            paddingRight: () => 6,
            paddingTop: () => 4,
            paddingBottom: () => 4
        },
        margin: [0, 0, 0, 10]
    }
}

export function createAcknowledgementItemsTable(rows: any[] = [], options: any = {}) {
    const { overpaymentAmount = 0, grandTotal = null, amountInWords = '' } = options

    const invoiceTotal = rows.reduce((sum: number, row: any) => sum + (Number(row.invoiceAmount) || 0), 0)
    const cardFeeTotal = rows.reduce((sum: number, row: any) => sum + (Number(row.cardFee) || 0), 0)
    const receivedTotal =
        grandTotal != null
            ? grandTotal
            : rows.reduce((sum: number, row: any) => sum + (Number(row.received) || 0), 0) + Number(overpaymentAmount || 0)

    const widths = [30, 80, '*', '*', '*']

    const headerCell = (text: string) => ({
        text,
        style: 'tableHeader',
        bold: true,
        alignment: 'center',
        fillColor: HEADER_FILL
    })

    const headerRow: any[] = [
        headerCell('No.'),
        headerCell('Invoice no.'),
        headerCell('Invoice amount\n(THB)'),
        headerCell('Credit card fee*\n(THB)'),
        headerCell('Received amount\n(THB)')
    ]

    const bodyRows: any[] = rows.map((row: any, index: number) => [
        { text: String(row.no ?? index + 1), alignment: 'center', style: 'tableCell' },
        { text: row.invoiceNo || '', alignment: 'center', style: 'tableCell', ...thaiFont(row.invoiceNo) },
        { text: formatCurrency(row.invoiceAmount), alignment: 'right', style: 'tableCell' },
        { text: formatCurrency(row.cardFee), alignment: 'right', style: 'tableCell' },
        { text: formatCurrency(row.received), alignment: 'right', style: 'tableCell' }
    ])

    // Overpayment row appears only when the batch actually carries an overpayment — the official
    // form has no such row in the normal (exact-amount) case.
    const hasOverpayment = Number(overpaymentAmount) > 0
    const overpaymentRow: any[] = [
        {
            text: 'Overpayment amount**',
            style: 'tableCell',
            bold: true,
            colSpan: 2
        },
        {},
        { text: formatCurrency(0), alignment: 'right', style: 'tableCell', bold: true },
        { text: formatCurrency(0), alignment: 'right', style: 'tableCell', bold: true },
        { text: formatCurrency(overpaymentAmount), alignment: 'right', style: 'tableCell', bold: true }
    ]

    // GRAND TOTAL spans two rows: column totals on top, amount-in-words underneath.
    const grandTotalAmountsRow: any[] = [
        {
            text: 'GRAND TOTAL',
            style: 'receiptTotalLabel',
            colSpan: 2,
            rowSpan: 2,
            margin: [0, 6, 0, 0]
        },
        {},
        { text: formatCurrency(invoiceTotal), style: 'receiptTotalValue', alignment: 'right' },
        { text: formatCurrency(cardFeeTotal), style: 'receiptTotalValue', alignment: 'right' },
        { text: formatCurrency(receivedTotal), style: 'receiptTotalValue', alignment: 'right', decoration: 'underline' }
    ]
    const grandTotalWordsRow: any[] = [
        {},
        {},
        {
            text: amountInWords || '',
            style: 'receiptTotalWords',
            colSpan: 3,
            alignment: 'right',
            decoration: 'underline'
        },
        {},
        {}
    ]

    const body = hasOverpayment
        ? [headerRow, ...bodyRows, overpaymentRow, grandTotalAmountsRow, grandTotalWordsRow]
        : [headerRow, ...bodyRows, grandTotalAmountsRow, grandTotalWordsRow]

    return {
        table: {
            headerRows: 1,
            widths,
            body
        },
        layout: {
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => GRID_GRAY,
            vLineColor: () => GRID_GRAY,
            paddingLeft: () => 6,
            paddingRight: () => 6,
            paddingTop: () => 4,
            paddingBottom: () => 4
        },
        margin: [0, 0, 0, 8]
    }
}

export function createAcknowledgementFootnotes(options: any = {}) {
    const { showOverpaymentNote = false } = options
    const stack: any[] = [{ text: '* Credit card processing fee payable to Bank', fontSize: 8, color: FOOTNOTE_GRAY }]
    // The ** note only makes sense when the overpayment row is on the document.
    if (showOverpaymentNote) {
        stack.push({
            text: '** Please note that any overpayment amount is non-refundable and will be credited against future school fee invoices.',
            fontSize: 8,
            color: FOOTNOTE_GRAY,
            margin: [0, 1, 0, 0]
        })
    }
    return {
        stack,
        margin: [0, 0, 0, 8]
    }
}

export function createCreditCardLine(data: any = {}) {
    const { cardBankName = '' } = data
    return {
        text: [{ text: 'Credit card: ', bold: true }, { text: valueOrDash(cardBankName), bold: true }],
        style: 'paymentMethodLine',
        margin: [0, 4, 0, 12]
    }
}

export function createAcknowledgementSignatures(data: any = {}) {
    const { cashierName = '', authorisedName = '' } = data

    const dottedLine = {
        canvas: [
            { type: 'line', x1: 40, y1: 0, x2: 215, y2: 0, lineWidth: 0.5, dash: { length: 2 }, lineColor: '#000000' }
        ]
    }

    const signatureColumn = (name: string, label: string) => ({
        width: '*',
        stack: [
            {
                text: name || ' ',
                style: 'signatureName',
                alignment: 'center',
                margin: [0, 36, 0, 4],
                ...thaiFont(name)
            },
            dottedLine,
            { text: label, style: 'signatureLabel', alignment: 'center', margin: [0, 4, 0, 0] }
        ]
    })

    return {
        columns: [signatureColumn(cashierName, 'Cashier'), signatureColumn(authorisedName, 'Authorised signature')],
        margin: [0, 12, 0, 0]
    }
}
