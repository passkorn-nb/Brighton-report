import fs from 'fs'
import path from 'path'
import dayjs from 'dayjs'

const LOGO_PATH = path.resolve(process.cwd(), 'src/assets/images/kcis-logo.png')
let cachedLogo: string | null | undefined

function loadLogoBase64(): string | null {
    if (cachedLogo !== undefined) return cachedLogo
    try {
        if (fs.existsSync(LOGO_PATH)) {
            const buf = fs.readFileSync(LOGO_PATH)
            cachedLogo = `data:image/png;base64,${buf.toString('base64')}`
        } else {
            cachedLogo = null
        }
    } catch {
        cachedLogo = null
    }
    return cachedLogo
}

/**
 * Shared base template elements for all KCIS invoice report types.
 * Matches the official King's College International School Bangkok invoice format.
 * Uses pdfmake document definition format.
 */

// ---------------------------------------------------------------------------
// Header – centered logo (school name baked into logo) + big "INVOICE" title
// ---------------------------------------------------------------------------
export function createHeader(data: any = {}) {
    const { logoBase64 } = data

    const logo = logoBase64 || loadLogoBase64()
    const stack: any[] = []

    if (logo) {
        stack.push({ image: logo, fit: [90, 90], alignment: 'center', margin: [0, 0, 0, 8] })
    }
    stack.push({ text: 'INVOICE', style: 'invoiceTitle', alignment: 'center', margin: [0, 0, 0, 12] })

    return { stack }
}

// ---------------------------------------------------------------------------
// Student / Invoice information – two-column key-value layout
// ---------------------------------------------------------------------------
export function createStudentInfo(data: any = {}) {
    const {
        studentId = '',
        studentName = '',
        yearGroup = '',
        contactName = '',
        address = '',
        invoiceNo = '',
        invoiceDate = dayjs().format('DD MMMM YYYY'),
        dueDate = '',
        schoolYear = ''
    } = data

    const leftRows = [
        ['Student ID no.', studentId],
        ['Student name', studentName],
        ['Year group', yearGroup],
        ['Contact name', contactName],
        ['Address', address]
    ]

    const rightRows = [
        ['Invoice no.', invoiceNo],
        ['Invoice date', invoiceDate],
        ['Due date', dueDate],
        ['School year', schoolYear]
    ]

    // Build a table with 4 columns: label, value, label, value
    const maxRows = Math.max(leftRows.length, rightRows.length)
    const body: any[] = []
    for (let i = 0; i < maxRows; i++) {
        const left = leftRows[i] || ['', '']
        const right = rightRows[i] || ['', '']
        body.push([
            { text: left[0], style: 'infoLabel' },
            { text: left[1], style: 'infoValue' },
            { text: right[0], style: 'infoLabel' },
            { text: right[1], style: 'infoValue' }
        ])
    }

    return {
        table: {
            widths: [80, '*', 75, 'auto'],
            body
        },
        layout: {
            hLineWidth: (i: number, node: any) => (i === 0 || i === node.table.body.length ? 0.5 : 0),
            vLineWidth: (i: number, node: any) => (i === 0 || i === node.table.widths.length ? 0.5 : 0),
            hLineColor: () => '#000000',
            vLineColor: () => '#000000',
            paddingLeft: () => 6,
            paddingRight: () => 6,
            paddingTop: () => 5,
            paddingBottom: () => 5
        },
        margin: [0, 0, 0, 8]
    }
}

// ---------------------------------------------------------------------------
// Student info variant for external students (no Student ID, no Year group)
// ---------------------------------------------------------------------------
export function createStudentInfoExternal(data: any = {}) {
    const {
        studentName = '',
        contactName = '',
        invoiceNo = '',
        invoiceDate = dayjs().format('DD MMMM YYYY'),
        dueDate = '',
        schoolYear = ''
    } = data

    const leftRows = [
        ['Student name', studentName],
        ['Contact name', contactName]
    ]

    const rightRows = [
        ['Invoice no.', invoiceNo],
        ['Invoice date', invoiceDate],
        ['Due date', dueDate],
        ['School year', schoolYear]
    ]

    const maxRows = Math.max(leftRows.length, rightRows.length)
    const body: any[] = []
    for (let i = 0; i < maxRows; i++) {
        const left = leftRows[i] || ['', '']
        const right = rightRows[i] || ['', '']
        body.push([
            { text: left[0], style: 'infoLabel', border: [false, false, false, false] },
            { text: left[1], style: 'infoValue', border: [false, false, false, false] },
            { text: right[0], style: 'infoLabel', border: [false, false, false, false] },
            { text: right[1], style: 'infoValue', border: [false, false, false, false], alignment: 'right' }
        ])
    }

    return {
        table: {
            widths: [85, '*', 75, 'auto'],
            body
        },
        layout: 'noBorders',
        margin: [0, 0, 0, 8]
    }
}

// ---------------------------------------------------------------------------
// Fee table – No. | Description | Amount (THB) with total row at bottom
// ---------------------------------------------------------------------------
export function createFeeTable(items: any[] = [], options: any = {}) {
    const { showNo = true, amountInWords = '', totalAmount = null, minRows = 5 } = options

    // Calculate total if not provided
    const total =
        totalAmount != null ? totalAmount : items.reduce((sum: number, item: any) => sum + (item.amount || 0), 0)

    // Header row
    const headerRow: any[] = []
    const widths: any[] = []

    if (showNo) {
        headerRow.push({ text: 'No.', style: 'tableHeader', alignment: 'center' })
        widths.push(30)
    }
    headerRow.push({ text: 'Description', style: 'tableHeader' })
    widths.push('*')
    headerRow.push({ text: 'Amount\n(THB)', style: 'tableHeader', alignment: 'right' })
    widths.push(90)

    // Data rows
    const bodyRows: any[] = items.map((item: any, index: number) => {
        const row: any[] = []
        if (showNo) {
            row.push({ text: String(index + 1), alignment: 'center', style: 'tableCell' })
        }
        const cellStack: any[] = []
        if (item.name) cellStack.push({ text: item.name, style: 'tableCell' })
        if (item.description) cellStack.push({ text: item.description, style: 'tableCellSubtext', margin: [0, 1, 0, 0] })
        row.push(cellStack.length === 0 ? { text: '', style: 'tableCell' } : { stack: cellStack })
        row.push({ text: formatCurrency(item.amount), alignment: 'right', style: 'tableCell' })
        return row
    })

    // Empty rows to fill minimum height
    const emptyCount = Math.max(0, minRows - items.length)
    for (let i = 0; i < emptyCount; i++) {
        const emptyRow: any[] = []
        if (showNo) emptyRow.push({ text: '', style: 'tableCell' })
        emptyRow.push({ text: '', style: 'tableCell' })
        emptyRow.push({ text: '', style: 'tableCell' })
        bodyRows.push(emptyRow)
    }

    // Total row
    const totalRow: any[] = []
    if (showNo) {
        // Span the amount-in-words across No. + Description columns
        totalRow.push({
            text: amountInWords || '',
            style: 'totalWordsCell',
            colSpan: 2
        })
        totalRow.push({}) // empty cell consumed by colSpan
    } else {
        totalRow.push({
            text: amountInWords || '',
            style: 'totalWordsCell'
        })
    }
    totalRow.push({
        columns: [
            { text: 'TOTAL', style: 'totalLabel', width: 'auto' },
            { text: formatCurrency(total), style: 'totalValue', width: '*', alignment: 'right' }
        ]
    })

    return {
        table: {
            headerRows: 1,
            widths,
            body: [headerRow, ...bodyRows, totalRow]
        },
        layout: {
            hLineWidth: (i: number, node: any) => {
                const rows = node.table.body.length
                return i === 0 || i === 1 || i === rows - 1 || i === rows ? 1 : 0
            },
            vLineWidth: (i: number, node: any) => {
                const cols = node.table.widths.length
                return i === 0 || i === cols - 1 || i === cols ? 1 : 0
            },
            hLineColor: () => '#000000',
            vLineColor: () => '#000000',
            paddingLeft: () => 6,
            paddingRight: () => 6,
            paddingTop: () => 4,
            paddingBottom: () => 4
        },
        margin: [0, 0, 0, 3]
    }
}

// ---------------------------------------------------------------------------
// Fee table variant without No. column (for external students)
// ---------------------------------------------------------------------------
export function createFeeTableNoNumber(items: any[] = [], options: any = {}) {
    return createFeeTable(items, { ...options, showNo: false })
}

// ---------------------------------------------------------------------------
// Late payment note
// ---------------------------------------------------------------------------
export function createLatePaymentNote(data: any = {}) {
    const { lateChargeRate = '1.5%', schoolNameFull = "King's College International School Bangkok" } = data

    return {
        stack: [
            {
                text: `Late payment charges of ${lateChargeRate} per month or part thereof will be applied to payments made after the invoice due date.`,
                style: 'noteText'
            },
            {
                text: `The condition for refund of the security deposit is subject to the terms and conditions of ${schoolNameFull}.`,
                style: 'noteText',
                margin: [0, 2, 0, 0]
            }
        ],
        margin: [0, 3, 0, 8]
    }
}

// ---------------------------------------------------------------------------
// Payment methods section
// ---------------------------------------------------------------------------
export function createPaymentMethods(data: any = {}) {
    const {
        accountName = "King's College International School Bangkok",
        accountNumber = '041-1-12977-2',
        bankName = 'Kasikorn Bank (bank code 004)',
        branch = 'Sathu Pradit (branch code 0041)',
        swiftCode = 'KASITHBK',
        bankAddress = '1 Soi Rat Burana 22/1, Rat Burana Road, Bangkok 10140',
        billerIdNo = '099-4-00259063-3',
        referenceNo1 = '',
        referenceNo2 = '',
        qrCodeBase64 = '',
        financeEmail = 'finance@kingsbangkok.ac.th',
        bankFeeRate = '1.3%'
    } = data

    const stack: any[] = [{ text: 'Payment methods', style: 'paymentTitle', margin: [0, 0, 0, 5] }]

    // 1. Cheque
    stack.push({
        text: [
            { text: '-  Cheque: ', bold: false },
            {
                text: `Cheques must be made payable to ${accountName} and marked A/C Payee Only. Please deliver cheques to the Finance & Accounting Department.`,
                bold: false
            }
        ],
        style: 'paymentText',
        margin: [0, 0, 0, 5]
    })

    // 2. Bank Transfer
    stack.push({
        text: [
            { text: '-  Bank Transfer: ', bold: false },
            {
                text: `Further bank details are provided below. Kindly email your child's name, ID number, and invoice number to ${financeEmail} with proof of payment attached upon completion of the transfer process. Please ensure that your payment covers all bank charges.`,
                bold: false
            }
        ],
        style: 'paymentText',
        margin: [0, 0, 0, 3]
    })

    // Bank details table
    const bankDetails = [
        ['Account name', accountName],
        ['Account number', accountNumber],
        ['Bank name', bankName],
        ['Branch', branch],
        ['Swift code', swiftCode],
        ['Bank address', bankAddress]
    ]

    stack.push({
        table: {
            widths: [100, '*'],
            body: bankDetails.map(([label, value]) => [
                { text: label, style: 'bankDetailLabel', border: [false, false, false, false] },
                { text: value, style: 'bankDetailValue', border: [false, false, false, false] }
            ])
        },
        layout: 'noBorders',
        margin: [80, 0, 0, 5]
    })

    // 3. Bill Payment
    const billPaymentText = `Bill Payment via Mobile Banking, Internet Banking, ATM or Bank Counter: Please use the QR code provided below to scan for payment. Kindly note that bank charges will apply to payments made via ATM or at the bank counter.`
    stack.push({
        text: [{ text: '-  ' }, { text: billPaymentText }],
        style: 'paymentText',
        margin: [0, 0, 0, 3]
    })

    // Bill payment details + QR code
    const billRows = [
        ['Biller ID no.', billerIdNo],
        ['Reference no. (Ref 1)', referenceNo1],
        ['Reference no. (Ref 2)', referenceNo2]
    ]

    const billContent: any = {
        columns: [
            {
                width: '*',
                table: {
                    widths: [120, '*'],
                    body: billRows.map(([label, value]) => [
                        { text: label, style: 'bankDetailLabel', border: [false, false, false, false] },
                        { text: value, style: 'bankDetailValue', border: [false, false, false, false] }
                    ])
                },
                layout: 'noBorders',
                margin: [80, 0, 0, 0]
            }
        ]
    }

    // Add QR code image (base64)
    if (qrCodeBase64) {
        billContent.columns.push({
            width: 90,
            stack: [
                {
                    image: qrCodeBase64,
                    fit: [50, 50],
                    alignment: 'center'
                }
            ],
            margin: [-300, -8, 0, 0]
        })
    }

    stack.push({ ...billContent, margin: [0, 0, 0, 5] })

    // 4. Credit card
    stack.push({
        text: [
            { text: '-  ' },
            {
                text: `Credit card: The online payment link will be provided on the parent portal. Visa & Mastercard issued by local banks in Thailand are accepted. Kindly note that a ${bankFeeRate} bank fee will be applied to individual online payment transaction.`
            }
        ],
        style: 'paymentText',
        margin: [0, 0, 0, 5]
    })

    // 5. On-site credit card payment
    stack.push({
        text: [
            { text: '-  ' },
            {
                text: 'On-site credit card payment: Credit cards issued by both local and overseas banks (VISA, Mastercard, JCB, UnionPay, and Alipay) are accepted. Please note that a bank fee may be applied, subject to your bank. The applicable rate can be viewed at the Cashier.'
            }
        ],
        style: 'paymentText',
        margin: [0, 0, 0, 0]
    })

    return { stack, margin: [0, 0, 0, 10] }
}

// ---------------------------------------------------------------------------
// Signature section – "Prepared by" (left) and "Authorised officer" (right)
// ---------------------------------------------------------------------------
export function createSignatureSection(data: any = {}) {
    const { preparedBy = '', authorisedOfficer = '', authorisedTitle = 'Head of Finance and Accounting' } = data

    return {
        columns: [
            {
                width: '*',
                stack: [
                    { text: preparedBy || '', style: 'signatureName', alignment: 'center', margin: [0, 0, 0, 5] },
                    {
                        canvas: [{ type: 'line', x1: 20, y1: 0, x2: 200, y2: 0, lineWidth: 1, lineColor: '#000000' }]
                    },
                    { text: 'Prepared by', style: 'signatureLabel', alignment: 'center', margin: [0, 5, 0, 0] }
                ],
                alignment: 'center'
            },
            {
                width: '*',
                stack: [
                    {
                        text: authorisedOfficer || '',
                        style: 'signatureName',
                        alignment: 'center',
                        margin: [0, 0, 0, 5]
                    },
                    {
                        canvas: [{ type: 'line', x1: 20, y1: 0, x2: 200, y2: 0, lineWidth: 1, lineColor: '#000000' }]
                    },
                    {
                        text: 'Authorised officer',
                        style: 'signatureLabel',
                        alignment: 'center',
                        margin: [0, 5, 0, 0]
                    },
                    {
                        text: authorisedTitle,
                        style: 'signatureLabel',
                        alignment: 'center',
                        margin: [0, 1, 0, 0]
                    }
                ],
                alignment: 'center'
            }
        ],
        margin: [0, 20, 0, 0]
    }
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
export function getBaseStyles() {
    return {
        schoolName: {
            fontSize: 9,
            bold: false,
            characterSpacing: 1.5,
            color: '#000000'
        },
        schoolLocation: {
            fontSize: 8,
            bold: false,
            characterSpacing: 1,
            color: '#000000'
        },
        addressText: {
            fontSize: 6.5,
            color: '#333333'
        },
        invoiceTitle: {
            fontSize: 22,
            bold: true,
            color: '#000000'
        },
        infoLabel: {
            fontSize: 8.5,
            color: '#000000'
        },
        infoValue: {
            fontSize: 8.5,
            color: '#000000'
        },
        tableHeader: {
            fontSize: 8.5,
            bold: false,
            color: '#000000'
        },
        tableCell: {
            fontSize: 8.5,
            color: '#000000'
        },
        tableCellSubtext: {
            fontSize: 7.5,
            italics: true,
            color: '#666666'
        },
        totalWordsCell: {
            fontSize: 8,
            color: '#000000'
        },
        totalLabel: {
            fontSize: 8.5,
            bold: false,
            color: '#000000'
        },
        totalValue: {
            fontSize: 8.5,
            bold: false,
            color: '#000000'
        },
        noteText: {
            fontSize: 6.5,
            color: '#333333'
        },
        paymentTitle: {
            fontSize: 9,
            bold: true,
            color: '#000000'
        },
        paymentText: {
            fontSize: 7.5,
            color: '#000000'
        },
        bankDetailLabel: {
            fontSize: 7.5,
            color: '#000000'
        },
        bankDetailValue: {
            fontSize: 7.5,
            color: '#000000'
        },
        signatureName: {
            fontSize: 8.5,
            color: '#000000'
        },
        signatureLabel: {
            fontSize: 8.5,
            color: '#000000'
        }
    }
}

// ---------------------------------------------------------------------------
// Page footer – school address + contact line, rendered on every page
// ---------------------------------------------------------------------------
export function createPageFooter(data: any = {}) {
    const {
        schoolName = "King's College International School Bangkok",
        address = '727 Ratchadapisek Road, Bang Phongphang, Yannawa, Bangkok 10120, Thailand',
        contactLine = '+66 (0) 2481 9955, finance@kingsbangkok.ac.th, www.kingsbangkok.ac.th'
    } = data

    return () => ({
        stack: [
            { text: `${schoolName}  ${address}`, style: 'addressText', alignment: 'center' },
            { text: contactLine, style: 'addressText', alignment: 'center', margin: [0, 1, 0, 0] }
        ],
        margin: [40, 15, 40, 0]
    })
}

// ---------------------------------------------------------------------------
// Page settings
// ---------------------------------------------------------------------------
export function getDefaultPageSettings() {
    return {
        pageSize: 'A4' as const,
        pageMargins: [40, 40, 40, 60] as [number, number, number, number]
    }
}

// ---------------------------------------------------------------------------
// Currency formatter
// ---------------------------------------------------------------------------
export function formatCurrency(value: any): string {
    if (value == null || isNaN(value)) return '-'
    return Number(value).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })
}

// ---------------------------------------------------------------------------
// Document builder
// ---------------------------------------------------------------------------
export function buildDocDefinition({ header, studentInfo, content, styles = {}, headerData = {} }: any) {
    const docDef: any = {
        ...getDefaultPageSettings(),
        content: [header, studentInfo, ...content].filter(Boolean),
        footer: createPageFooter(headerData),
        styles: {
            ...getBaseStyles(),
            ...styles
        },
        defaultStyle: {
            font: 'Roboto'
        }
    }

    return docDef
}

// ===========================================================================
// LEGACY VARIANTS – preserve pre-redesign behavior for HOLIDAY_CAMP_EXTERNAL.
// Do not modify these; they pin External Invoice to its original look.
// ===========================================================================

export function createHeaderLegacy(data: any = {}) {
    const {
        schoolName = "KING'S COLLEGE INTERNATIONAL SCHOOL",
        schoolLocation = 'BANGKOK',
        address = '727 Ratchadapisek Road, Bang Phongphang, Yannawa, Bangkok 10120, Thailand',
        contactLine = '+66 (0) 2481 9955, finance@kingsbangkok.ac.th, www.kingsbangkok.ac.th',
        logoBase64
    } = data

    const logo = logoBase64 || loadLogoBase64()
    const stack: any[] = []

    if (logo) {
        stack.push({ image: logo, fit: [70, 70], alignment: 'center', margin: [0, 0, 0, 6] })
    }
    stack.push({ text: schoolName, style: 'schoolName', alignment: 'center' })
    stack.push({ text: schoolLocation, style: 'schoolLocation', alignment: 'center', margin: [0, 0, 0, 1] })
    stack.push({ text: address, style: 'addressText', alignment: 'center' })
    stack.push({ text: contactLine, style: 'addressText', alignment: 'center', margin: [0, 0, 0, 8] })
    stack.push({ text: 'INVOICE', style: 'invoiceTitle', alignment: 'center', margin: [0, 0, 0, 8] })

    return { stack }
}

export function createPaymentMethodsLegacy(data: any = {}) {
    const {
        accountName = "King's College International School Bangkok",
        accountNumber = '041-1-12977-2',
        bankName = 'Kasikorn Bank (bank code 004)',
        branch = 'Sathu Pradit (branch code 0041)',
        swiftCode = 'KASITHBK',
        bankAddress = '1 Soi Rat Burana 22/1, Rat Burana Road, Bangkok 10140',
        billerIdNo = '099-4-00259063-3',
        referenceNo1 = '',
        referenceNo2 = '',
        qrCodeBase64 = '',
        financeEmail = 'finance@kingsbangkok.ac.th',
        bankFeeRate = '1.3%'
    } = data

    const stack: any[] = [{ text: 'Payment methods', style: 'paymentTitle', margin: [0, 0, 0, 5] }]

    stack.push({
        text: [
            { text: '-  Cheque: ', bold: false },
            {
                text: `Cheques must be made payable to ${accountName} and marked A/C Payee Only. Please deliver cheques to the Finance & Accounting Department.`,
                bold: false
            }
        ],
        style: 'paymentText',
        margin: [0, 0, 0, 5]
    })

    stack.push({
        text: [
            { text: '-  Bank Transfer: ', bold: false },
            {
                text: `Further bank details are provided below. Kindly email your child's name, ID number, and invoice number to ${financeEmail} with proof of payment attached upon completion of the transfer process. Please ensure that your payment covers all bank charges.`,
                bold: false
            }
        ],
        style: 'paymentText',
        margin: [0, 0, 0, 3]
    })

    const bankDetails = [
        ['Account name', accountName],
        ['Account number', accountNumber],
        ['Bank name', bankName],
        ['Branch', branch],
        ['Swift code', swiftCode],
        ['Bank address', bankAddress]
    ]

    stack.push({
        table: {
            widths: [100, '*'],
            body: bankDetails.map(([label, value]) => [
                { text: label, style: 'bankDetailLabel', border: [false, false, false, false] },
                { text: value, style: 'bankDetailValue', border: [false, false, false, false] }
            ])
        },
        layout: 'noBorders',
        margin: [80, 0, 0, 5]
    })

    const billPaymentText = `Bill Payment via Mobile Banking, Internet Banking, ATM or Bank Counter: Please use the QR code provided below to scan for payment. Kindly note that bank charges will apply to payments made via ATM or at the bank counter.`
    stack.push({
        text: [{ text: '-  ' }, { text: billPaymentText }],
        style: 'paymentText',
        margin: [0, 0, 0, 3]
    })

    const billRows = [
        ['Biller ID no.', billerIdNo],
        ['Reference no. (Ref 1)', referenceNo1],
        ['Reference no. (Ref 2)', referenceNo2]
    ]

    const billContent: any = {
        columns: [
            {
                width: '*',
                table: {
                    widths: [120, '*'],
                    body: billRows.map(([label, value]) => [
                        { text: label, style: 'bankDetailLabel', border: [false, false, false, false] },
                        { text: value, style: 'bankDetailValue', border: [false, false, false, false] }
                    ])
                },
                layout: 'noBorders',
                margin: [80, 0, 0, 0]
            }
        ]
    }

    if (qrCodeBase64) {
        billContent.columns.push({
            width: 90,
            stack: [
                {
                    image: qrCodeBase64,
                    fit: [50, 50],
                    alignment: 'center'
                }
            ],
            margin: [-300, -8, 0, 0]
        })
    }

    stack.push({ ...billContent, margin: [0, 0, 0, 5] })

    stack.push({
        text: [
            { text: '-  ' },
            {
                text: `Credit card: The online payment link will be provided on the parent portal. Visa & Mastercard issued by local banks in Thailand are accepted. Kindly note that a ${bankFeeRate} bank fee will be applied to individual online payment transaction.`
            }
        ],
        style: 'paymentText',
        margin: [0, 0, 0, 0]
    })

    return { stack, margin: [0, 0, 0, 10] }
}

export function createSignatureSectionLegacy(data: any = {}) {
    const { preparedBy = '', authorisedOfficer = '' } = data

    return {
        columns: [
            {
                width: '*',
                stack: [
                    { text: preparedBy || '', style: 'signatureName', alignment: 'center', margin: [0, 0, 0, 5] },
                    {
                        canvas: [{ type: 'line', x1: 20, y1: 0, x2: 200, y2: 0, lineWidth: 1, lineColor: '#000000' }]
                    },
                    { text: 'Prepared by', style: 'signatureLabel', alignment: 'center', margin: [0, 5, 0, 0] }
                ],
                alignment: 'center'
            },
            {
                width: '*',
                stack: [
                    {
                        text: authorisedOfficer || '',
                        style: 'signatureName',
                        alignment: 'center',
                        margin: [0, 0, 0, 5]
                    },
                    {
                        canvas: [{ type: 'line', x1: 20, y1: 0, x2: 200, y2: 0, lineWidth: 1, lineColor: '#000000' }]
                    },
                    {
                        text: 'Authorised officer',
                        style: 'signatureLabel',
                        alignment: 'center',
                        margin: [0, 5, 0, 0]
                    }
                ],
                alignment: 'center'
            }
        ],
        margin: [0, 20, 0, 0]
    }
}

export function buildDocDefinitionLegacy({ header, studentInfo, content, styles = {} }: any) {
    return {
        pageSize: 'A4' as const,
        pageMargins: [40, 40, 40, 40] as [number, number, number, number],
        content: [header, studentInfo, ...content].filter(Boolean),
        styles: {
            ...getBaseStyles(),
            ...styles
        },
        defaultStyle: {
            font: 'Roboto'
        }
    }
}
