import fs from 'fs'
import path from 'path'
import dayjs from 'dayjs'
import { formatCurrency, getBaseStyles, DEFAULT_FONT, thaiFont } from './baseTemplate'
import { formatYearGroupLabel } from '../yearGroupLabel'

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
            logger.warn(`Logo file not found at ${LOGO_PATH}, logo will be omitted from receipts`)
            cachedLogo = null
        }
    } catch {
        cachedLogo = null
    }
    return cachedLogo
}

const SIGNATURE_PATH = path.resolve(process.cwd(), 'src/assets/images/signature.png')
let cachedSignature: string | null | undefined

function loadSignatureBase64(): string | null {
    if (cachedSignature !== undefined) return cachedSignature
    try {
        if (fs.existsSync(SIGNATURE_PATH)) {
            logger.info(`Loading signature from ${SIGNATURE_PATH}`)
            const buf = fs.readFileSync(SIGNATURE_PATH)
            cachedSignature = `data:image/png;base64,${buf.toString('base64')}`
        } else {
            logger.warn(`Signature file not found at ${SIGNATURE_PATH}, falling back to blank`)
            cachedSignature = null
        }
    } catch {
        cachedSignature = null
    }
    return cachedSignature
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
    const logo = loadLogoBase64()
    const stack: any[] = []

    if (logo) {
        stack.push({ image: logo, fit: [170, 170], alignment: 'center', margin: [0, 0, 0, 6] })
    }
    stack.push({ text: 'RECEIPT', style: 'receiptTitle', alignment: 'center', margin: [0, 0, 0, 24] })

    return { stack }
}

export function createReceiptInfoBox(data: any = {}, isExternal = false) {
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

    const leftRows = isExternal
        ? [
              ['Client ID', studentId],
              ['Client Name', studentName],
              ['Contact name', contactName],
              ['Address', address]
          ]
        : [
              ['Student ID no.', studentId],
              ['Student name', studentName],
              ['Contact name', contactName],
              ['Address', address]
          ]
    const rightRows = isExternal
        ? [
              ['Receipt no.', receiptNo],
              ['Receipt date', receiptDate]
          ]
        : [
              ['Receipt no.', receiptNo],
              ['Receipt date', receiptDate],
              ['Year group', formatYearGroupLabel(yearGroup)],
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
    const { overpaymentAmount = 0, totalAmount = null, amountInWords = '', minRows = 10, creditNotes = [] } = options

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
        { text: item.documentNo || '', alignment: 'center', style: 'tableCell', ...thaiFont(item.documentNo) },
        { text: item.issueDate || '', alignment: 'center', style: 'tableCell', ...thaiFont(item.issueDate) },
        { text: formatReceiptAmount(item.receivedAmount), alignment: 'right', style: 'tableCell' }
    ])

    const cnRows: any[] = (creditNotes as any[]).map((cn: any, idx: number) => [
        { text: String(items.length + idx + 1), style: 'tableCell', alignment: 'center' },
        { text: cn.cnNumber || '', style: 'tableCell', alignment: 'center', ...thaiFont(cn.cnNumber) },
        {
            text: cn.issueDate || 'Credit note applied',
            style: 'tableCell',
            alignment: 'center',
            ...thaiFont(cn.issueDate)
        },
        { text: `(${formatCurrency(Math.abs(Number(cn.amount || 0)))})`, style: 'tableCell', alignment: 'right' }
    ])

    const emptyCount = Math.max(0, minRows - items.length - creditNotes.length)
    const emptyRows: any[] = []
    for (let i = 0; i < emptyCount; i++) {
        emptyRows.push([
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
            colSpan: 3,
            columns: [
                {
                    text: (amountInWords || '').toUpperCase(),
                    style: 'receiptTotalWords',
                    width: '*'
                },
                {
                    text: 'TOTAL',
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
            body: [headerRow, ...bodyRows, ...cnRows, ...emptyRows, ...extraRows, totalRow]
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

export function createPaymentMethodLine(data: any = {}) {
    const { paymentMethod = '' } = data
    return {
        text: [{ text: 'Payment method : ', bold: true }, { text: valueOrDash(paymentMethod) }],
        style: 'paymentMethodLine',
        margin: [0, 4, 0, 12]
    }
}

export function createReceiptNotes() {
    return {
        stack: [
            {
                text: 'In case of payment made by cheque, this receipt will not be valid until the cheque has been honoured by the bank.',
                style: 'receiptNoteText'
            },
            {
                text: 'Please note that any overpayment amount is non-refundable and will be credited against future school fee invoices.',
                style: 'receiptNoteText',
                margin: [0, 10, 0, 0]
            }
        ],
        margin: [0, 4, 0, 12]
    }
}

export function createReceiptSignatures(data: any = {}) {
    const { collectorName = '', authorisedTitle = 'Head of Finance and Accounting' } = data
    const signatureImg = loadSignatureBase64()

    const boxLayout = {
        hLineWidth: () => 0.5,
        vLineWidth: () => 0.5,
        hLineColor: () => '#000000',
        vLineColor: () => '#000000'
    }

    const authorisedCell: any = signatureImg
        ? { image: signatureImg, fit: [70, 30], alignment: 'center', margin: [0, 4, 0, 4] }
        : { text: ' ', style: 'signatureName', alignment: 'center', margin: [0, 8, 0, 8] }

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
                                        text: collectorName || ' ',
                                        style: 'signatureName',
                                        alignment: 'center',
                                        margin: [0, 12, 0, 0],
                                        ...thaiFont(collectorName)
                                    }
                                ]
                            ]
                        },
                        layout: boxLayout,
                        margin: [40, 0, 40, 6]
                    },
                    { text: 'Collector', style: 'signatureLabel', alignment: 'center' }
                ]
            },
            {
                width: '*',
                stack: [
                    {
                        table: { widths: ['*'], heights: [38], body: [[authorisedCell]] },
                        layout: boxLayout,
                        margin: [40, 0, 40, 6]
                    },
                    { text: 'Authorised signature', style: 'signatureLabel', alignment: 'center' },
                    { text: authorisedTitle, style: 'signatureLabel', alignment: 'center' }
                ]
            }
        ],
        margin: [0, 24, 0, 0]
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
        margin: [40, 0, 40, 0]
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
            fontSize: 22,
            bold: true,
            color: '#000000'
        },
        paymentMethodLine: {
            fontSize: 10,
            color: '#000000'
        },
        receiptTotalWords: {
            fontSize: 9,
            bold: true,
            color: '#000000'
        },
        receiptTotalLabel: {
            fontSize: 10,
            bold: true,
            color: '#000000'
        },
        receiptTotalValue: {
            fontSize: 10,
            bold: true,
            color: '#000000'
        },
        receiptNoteText: {
            fontSize: 9,
            color: '#000000'
        },
        infoLabel: {
            fontSize: 10,
            color: '#000000'
        },
        infoValue: {
            fontSize: 10,
            color: '#000000'
        },
        tableHeader: {
            fontSize: 10,
            bold: false,
            color: '#000000'
        },
        tableCell: {
            fontSize: 10,
            color: '#000000'
        },
        signatureName: {
            fontSize: 11,
            color: '#000000'
        },
        signatureLabel: {
            fontSize: 9,
            color: '#000000'
        },
        footerText: {
            fontSize: 7,
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
        defaultStyle: { font: DEFAULT_FONT }
    }
}
