import dayjs from 'dayjs'

/**
 * Shared base template elements for all KCIS report types.
 * Uses pdfmake document definition format.
 */

const COLORS = {
    primary: '#1a3a5c',
    secondary: '#4a6fa5',
    headerBg: '#1a3a5c',
    headerText: '#ffffff',
    lightGray: '#f5f5f5',
    borderColor: '#cccccc',
    textDark: '#333333',
    textMuted: '#666666'
}

export function createHeader(data = {}) {
    const {
        schoolName = "King's College International School",
        schoolNameTh = 'โรงเรียนนานาชาติคิงส์คอลเลจ',
        address = '999 Moo 1, Tambon Nong Prue, Amphoe Bang Lamung, Chonburi 20150',
        phone = '038-123456',
        documentTitle = 'INVOICE / RECEIPT',
        documentNo = '',
        documentDate = dayjs().format('DD/MM/YYYY')
    } = data

    return {
        stack: [
            {
                columns: [
                    {
                        width: '*',
                        stack: [
                            { text: schoolName, style: 'schoolName' },
                            { text: schoolNameTh, style: 'schoolNameTh' },
                            { text: address, style: 'addressText' },
                            { text: `Tel: ${phone}`, style: 'addressText' }
                        ]
                    },
                    {
                        width: 'auto',
                        stack: [
                            { text: documentTitle, style: 'documentTitle' },
                            {
                                columns: [
                                    { text: 'No:', width: 30, style: 'docInfo' },
                                    { text: documentNo, width: '*', style: 'docInfoValue' }
                                ]
                            },
                            {
                                columns: [
                                    { text: 'Date:', width: 30, style: 'docInfo' },
                                    { text: documentDate, width: '*', style: 'docInfoValue' }
                                ]
                            }
                        ],
                        alignment: 'right'
                    }
                ],
                margin: [0, 0, 0, 10]
            },
            {
                canvas: [
                    {
                        type: 'line',
                        x1: 0,
                        y1: 0,
                        x2: 515,
                        y2: 0,
                        lineWidth: 2,
                        lineColor: COLORS.primary
                    }
                ],
                margin: [0, 0, 0, 10]
            }
        ]
    }
}

export function createStudentInfo(data = {}) {
    const {
        studentName = '',
        studentId = '',
        grade = '',
        section = '',
        academicYear = '',
        term = '',
        parentName = ''
    } = data

    const rows = [
        ['Student Name:', studentName, 'Student ID:', studentId],
        ['Grade / Class:', `${grade}${section ? ' / ' + section : ''}`, 'Academic Year:', academicYear],
        ['Term:', term, 'Parent / Guardian:', parentName]
    ]

    return {
        table: {
            widths: [90, '*', 100, '*'],
            body: rows.map(row =>
                row.map((cell, i) => ({
                    text: cell,
                    style: i % 2 === 0 ? 'infoLabel' : 'infoValue',
                    border: [false, false, false, false]
                }))
            )
        },
        layout: 'noBorders',
        margin: [0, 0, 0, 15]
    }
}

export function createFeeTable(items = [], options = {}) {
    const { showDiscount = false, columns = ['no', 'description', 'amount'] } = options

    const headerRow = []
    const widths = []

    if (columns.includes('no')) {
        headerRow.push({ text: 'No.', style: 'tableHeader', alignment: 'center' })
        widths.push(30)
    }
    if (columns.includes('description')) {
        headerRow.push({ text: 'Description', style: 'tableHeader' })
        widths.push('*')
    }
    if (columns.includes('quantity')) {
        headerRow.push({ text: 'Qty', style: 'tableHeader', alignment: 'center' })
        widths.push(40)
    }
    if (columns.includes('unitPrice')) {
        headerRow.push({ text: 'Unit Price', style: 'tableHeader', alignment: 'right' })
        widths.push(70)
    }
    if (columns.includes('discount') || showDiscount) {
        headerRow.push({ text: 'Discount', style: 'tableHeader', alignment: 'right' })
        widths.push(70)
    }
    if (columns.includes('amount')) {
        headerRow.push({ text: 'Amount (THB)', style: 'tableHeader', alignment: 'right' })
        widths.push(90)
    }

    const bodyRows = items.map((item, index) => {
        const row = []
        if (columns.includes('no')) {
            row.push({ text: String(index + 1), alignment: 'center', style: 'tableCell' })
        }
        if (columns.includes('description')) {
            row.push({ text: item.description || '', style: 'tableCell' })
        }
        if (columns.includes('quantity')) {
            row.push({
                text: item.quantity != null ? String(item.quantity) : '',
                alignment: 'center',
                style: 'tableCell'
            })
        }
        if (columns.includes('unitPrice')) {
            row.push({ text: formatCurrency(item.unitPrice), alignment: 'right', style: 'tableCell' })
        }
        if (columns.includes('discount') || showDiscount) {
            row.push({
                text: item.discount ? formatCurrency(item.discount) : '-',
                alignment: 'right',
                style: 'tableCell'
            })
        }
        if (columns.includes('amount')) {
            row.push({ text: formatCurrency(item.amount), alignment: 'right', style: 'tableCell' })
        }
        return row
    })

    return {
        table: {
            headerRows: 1,
            widths,
            body: [headerRow, ...bodyRows]
        },
        layout: {
            hLineWidth: (i, node) => (i === 0 || i === 1 || i === node.table.body.length ? 1 : 0.5),
            vLineWidth: () => 0.5,
            hLineColor: (i, node) => (i === 0 || i === 1 ? COLORS.primary : COLORS.borderColor),
            vLineColor: () => COLORS.borderColor,
            fillColor: rowIndex => (rowIndex === 0 ? COLORS.headerBg : rowIndex % 2 === 0 ? COLORS.lightGray : null),
            paddingLeft: () => 6,
            paddingRight: () => 6,
            paddingTop: () => 4,
            paddingBottom: () => 4
        },
        margin: [0, 0, 0, 10]
    }
}

export function createAdjustmentsSection(adjustments = []) {
    if (!adjustments.length) return null

    const rows = adjustments.map(adj => [
        { text: adj.description, style: 'tableCell' },
        {
            text: (adj.amount < 0 ? '(' : '') + formatCurrency(Math.abs(adj.amount)) + (adj.amount < 0 ? ')' : ''),
            alignment: 'right',
            style: 'tableCell',
            color: adj.amount < 0 ? '#c0392b' : COLORS.textDark
        }
    ])

    return {
        stack: [
            { text: 'Adjustments / Discounts', style: 'sectionTitle', margin: [0, 5, 0, 5] },
            {
                table: {
                    widths: ['*', 100],
                    body: rows
                },
                layout: {
                    hLineWidth: () => 0.5,
                    vLineWidth: () => 0,
                    hLineColor: () => COLORS.borderColor,
                    paddingLeft: () => 6,
                    paddingRight: () => 6,
                    paddingTop: () => 3,
                    paddingBottom: () => 3
                }
            }
        ],
        margin: [0, 0, 0, 10]
    }
}

export function createTotalSection(data = {}) {
    const { subtotal = 0, adjustmentsTotal = 0, netTotal = 0, amountInWords = '' } = data

    const rows = [
        [
            { text: 'Subtotal', style: 'totalLabel', alignment: 'right' },
            { text: formatCurrency(subtotal), style: 'totalValue', alignment: 'right' }
        ]
    ]

    if (adjustmentsTotal !== 0) {
        rows.push([
            { text: 'Total Adjustments', style: 'totalLabel', alignment: 'right' },
            {
                text:
                    (adjustmentsTotal < 0 ? '(' : '') +
                    formatCurrency(Math.abs(adjustmentsTotal)) +
                    (adjustmentsTotal < 0 ? ')' : ''),
                style: 'totalValue',
                alignment: 'right',
                color: adjustmentsTotal < 0 ? '#c0392b' : COLORS.textDark
            }
        ])
    }

    rows.push([
        { text: 'Net Total (THB)', style: 'grandTotalLabel', alignment: 'right' },
        { text: formatCurrency(netTotal), style: 'grandTotalValue', alignment: 'right' }
    ])

    const stack = [
        {
            table: {
                widths: ['*', 120],
                body: rows
            },
            layout: {
                hLineWidth: (i, node) => (i === node.table.body.length ? 2 : 0.5),
                vLineWidth: () => 0,
                hLineColor: (i, node) => (i === node.table.body.length ? COLORS.primary : COLORS.borderColor),
                paddingLeft: () => 6,
                paddingRight: () => 6,
                paddingTop: () => 4,
                paddingBottom: () => 4
            }
        }
    ]

    if (amountInWords) {
        stack.push({
            text: [{ text: 'Amount in Words: ', bold: true }, { text: amountInWords }],
            style: 'amountWords',
            margin: [0, 8, 0, 0]
        })
    }

    return { stack, margin: [0, 0, 0, 15] }
}

export function createFooter(data = {}) {
    const { paymentNotes = [], showSignature = true } = data

    const stack = []

    if (paymentNotes.length) {
        stack.push({
            stack: [
                { text: 'Notes / Payment Information', style: 'sectionTitle', margin: [0, 0, 0, 5] },
                ...paymentNotes.map(note => ({
                    text: `• ${note}`,
                    style: 'noteText',
                    margin: [10, 0, 0, 2]
                }))
            ],
            margin: [0, 0, 0, 20]
        })
    }

    if (showSignature) {
        stack.push({
            columns: [
                {
                    width: '*',
                    stack: [
                        {
                            canvas: [
                                {
                                    type: 'line',
                                    x1: 0,
                                    y1: 0,
                                    x2: 150,
                                    y2: 0,
                                    lineWidth: 1,
                                    lineColor: COLORS.textMuted
                                }
                            ]
                        },
                        { text: 'Received by', style: 'signatureLabel', margin: [0, 5, 0, 0] },
                        { text: 'Date: ____/____/________', style: 'signatureLabel', margin: [0, 5, 0, 0] }
                    ],
                    alignment: 'center'
                },
                { width: 50, text: '' },
                {
                    width: '*',
                    stack: [
                        {
                            canvas: [
                                {
                                    type: 'line',
                                    x1: 0,
                                    y1: 0,
                                    x2: 150,
                                    y2: 0,
                                    lineWidth: 1,
                                    lineColor: COLORS.textMuted
                                }
                            ]
                        },
                        { text: 'Authorized Signature', style: 'signatureLabel', margin: [0, 5, 0, 0] },
                        { text: 'Date: ____/____/________', style: 'signatureLabel', margin: [0, 5, 0, 0] }
                    ],
                    alignment: 'center'
                }
            ],
            margin: [0, 30, 0, 0]
        })
    }

    return { stack }
}

export function getBaseStyles() {
    return {
        schoolName: {
            fontSize: 16,
            bold: true,
            color: COLORS.primary
        },
        schoolNameTh: {
            fontSize: 12,
            color: COLORS.secondary,
            margin: [0, 2, 0, 2]
        },
        addressText: {
            fontSize: 8,
            color: COLORS.textMuted
        },
        documentTitle: {
            fontSize: 14,
            bold: true,
            color: COLORS.primary,
            margin: [0, 0, 0, 8]
        },
        docInfo: {
            fontSize: 9,
            color: COLORS.textMuted
        },
        docInfoValue: {
            fontSize: 9,
            color: COLORS.textDark
        },
        infoLabel: {
            fontSize: 9,
            bold: true,
            color: COLORS.textMuted
        },
        infoValue: {
            fontSize: 9,
            color: COLORS.textDark
        },
        sectionTitle: {
            fontSize: 10,
            bold: true,
            color: COLORS.primary
        },
        tableHeader: {
            fontSize: 9,
            bold: true,
            color: COLORS.headerText
        },
        tableCell: {
            fontSize: 9,
            color: COLORS.textDark
        },
        totalLabel: {
            fontSize: 9,
            color: COLORS.textMuted
        },
        totalValue: {
            fontSize: 9,
            color: COLORS.textDark
        },
        grandTotalLabel: {
            fontSize: 11,
            bold: true,
            color: COLORS.primary
        },
        grandTotalValue: {
            fontSize: 11,
            bold: true,
            color: COLORS.primary
        },
        amountWords: {
            fontSize: 9,
            italics: true,
            color: COLORS.textMuted
        },
        noteText: {
            fontSize: 8,
            color: COLORS.textMuted
        },
        signatureLabel: {
            fontSize: 8,
            color: COLORS.textMuted
        }
    }
}

export function getDefaultPageSettings() {
    return {
        pageSize: 'A4',
        pageMargins: [40, 40, 40, 40]
    }
}

export function formatCurrency(value) {
    if (value == null || isNaN(value)) return '-'
    return Number(value).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })
}

export function buildDocDefinition({ header, studentInfo, content, footer, styles = {} }) {
    const docDef = {
        ...getDefaultPageSettings(),
        content: [header, studentInfo, ...content].filter(Boolean),
        styles: {
            ...getBaseStyles(),
            ...styles
        },
        defaultStyle: {
            font: 'Roboto'
        }
    }

    if (footer) {
        docDef.content.push(footer)
    }

    return docDef
}
