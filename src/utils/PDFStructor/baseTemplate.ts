import fs from 'fs'
import path from 'path'
import dayjs from 'dayjs'
import { formatYearGroupLabel } from '../yearGroupLabel'

const FONTS_DIR = path.resolve(process.cwd(), 'src/assets/fonts')
export const DEFAULT_FONT = fs.existsSync(path.join(FONTS_DIR, 'GillSansMT-Regular.ttf'))
    ? 'GillSansMT'
    : 'Sarabun'

const LOGO_PATH = path.resolve(process.cwd(), 'src/assets/images/brighton-logo.png')
const LOGO_BASE64: string | null = fs.existsSync(LOGO_PATH)
    ? `data:image/png;base64,${fs.readFileSync(LOGO_PATH).toString('base64')}`
    : null

const THAI_RE = /[฀-๿]/
export function thaiFont(text: unknown): { font?: string } {
    return text != null && THAI_RE.test(String(text)) ? { font: 'Sarabun' } : {}
}

// Invoices are set in a serif face to match the school's reference form. Receipts stay on
// DEFAULT_FONT — see receiptTemplate, which imports DEFAULT_FONT rather than this.
export const INVOICE_FONT = 'Times'


/**
 * Shared base template elements for all KCIS invoice report types.
 * Matches the official Brighton College Bangkok, Vibhavadi invoice format.
 * Uses pdfmake document definition format.
 */

// ---------------------------------------------------------------------------
// Header – school name / "Managed by" operator / address / contact line, then the
// "INVOICE" title. No crest: the reference form is all type.
// ---------------------------------------------------------------------------
export function createHeader(data: any = {}) {
    // Header is now rendered as pdfmake page header on every page (see buildDocDefinition).
    // This function just carries the data forward; the actual stack is built in getPageHeader().
    return { __data: data, text: '' }
}

// ---------------------------------------------------------------------------
// Student / Invoice information – two-column key-value layout
// ---------------------------------------------------------------------------
// Bordered box: a single-cell table, used to draw the same rectangle look pdfmake tables give us
// (pdfmake has no free-floating <div>-with-border primitive).
// Outer border only — the reference form's info boxes have no internal rules between the
// label and its value, so the vertical line is drawn at the box edges alone.
const BOX_LAYOUT = {
    hLineWidth: (i: number, node: any) => (i === 0 || i === node.table.body.length ? 1 : 0),
    vLineWidth: (i: number, node: any) => (i === 0 || i === node.table.widths.length ? 1 : 0),
    hLineColor: () => '#000000',
    vLineColor: () => '#000000',
    paddingLeft: () => 8,
    paddingRight: () => 8,
    paddingTop: () => 6,
    paddingBottom: () => 6
}

// Labels are bold and share a column; the fixed right margin is what lines the values up
// with each other, since there is no rule to align against.
function labelValueBox(rows: Array<[string, string, boolean?]>) {
    return {
        table: {
            widths: ['auto', '*'],
            body: rows.map(([label, value, bold]) => [
                { text: label, style: 'infoLabel', bold: true, margin: [0, 0, 18, 0] },
                { text: value, style: 'infoValue', bold: !!bold, ...thaiFont(value) }
            ])
        },
        layout: BOX_LAYOUT
    }
}

// Student box and due-date box run to 68% of the content width; the No/Date and PIN boxes
// take the remainder (~30%). Proportions calibrated to reference form.
const INFO_LEFT_WIDTH = '68%'
const INFO_GAP_WIDTH = '2%'

export function createStudentInfo(data: any = {}) {
    const {
        studentId = '',
        pin = '',
        studentName = '',
        yearGroup = '',
        contactName = '',
        address = '',
        invoiceNo = '',
        invoiceDate = dayjs().format('DD-MM-YYYY'),
        dueDate = '',
        isExternal = false
    } = data

    const nameLabel = isExternal ? 'Client name' : 'Student name'
    const leftStack: any[] = [
        { text: [{ text: `${nameLabel} : `, bold: true }, { text: studentName, ...thaiFont(studentName) }], style: 'infoValue', margin: [0, 0, 0, 10] }
    ]
    if (isExternal && contactName) {
        leftStack.push({
            text: [{ text: 'Contact name : ', bold: true }, { text: contactName, ...thaiFont(contactName) }],
            style: 'infoValue',
            margin: [0, 0, 0, 4]
        })
    }
    leftStack.push({
        text: [{ text: 'Address : ', bold: true }, { text: address, ...thaiFont(address) }],
        style: 'infoValue'
    })
    // The reference form leaves room under the address for a second wrapped line, so the box
    // keeps its height whether the address is one line or two.
    leftStack.push({ text: '', margin: [0, 0, 0, 12] })

    const leftBox = {
        table: { widths: ['*'], body: [[{ stack: leftStack }]] },
        layout: BOX_LAYOUT
    }

    const invoiceBox = labelValueBox([
        ['No', invoiceNo],
        ['Date', invoiceDate]
    ])

    const rightStackItems: any[] = [invoiceBox]

    // PIN/Classroom moves to the right column of the due-date row (Row 2), so it is NOT
    // stacked here in Row 1.

    // Same width as the student box above it, matching the reference form — not a full-page banner.
    const pinBox = !isExternal
        ? labelValueBox([
              ['PIN', pin || studentId],
              ['Classroom', formatYearGroupLabel(yearGroup).toUpperCase()]
          ])
        : null

    const dueDateBox = {
        columns: [
            { width: INFO_LEFT_WIDTH, ...labelValueBox([['PLEASE PAY ON OR BEFORE', dueDate, true]]) },
            { width: INFO_GAP_WIDTH, text: '' },
            { width: '*', ...(pinBox ?? { text: '' }) }
        ],
        margin: [0, 8, 0, 0]
    }

    return {
        stack: [
            {
                columns: [
                    { width: INFO_LEFT_WIDTH, stack: [leftBox] },
                    { width: INFO_GAP_WIDTH, text: '' },
                    { width: '*', stack: rightStackItems }
                ]
            },
            dueDateBox
        ],
        margin: [0, 0, 0, 10]
    }
}

// ---------------------------------------------------------------------------
// Fee table – No. | Description | Amount (THB) with total row at bottom
// ---------------------------------------------------------------------------
export function createFeeTable(items: any[] = [], options: any = {}) {
    // Floor, not a cap: the reference form keeps the table at a fixed height on a short
    // invoice, and it simply grows past this once there are more line items.
    const { amountInWords = '', totalAmount = null, minRows = 10, period = '' } = options

    const total =
        totalAmount != null ? totalAmount : items.reduce((sum: number, item: any) => sum + (item.amount || 0), 0)

    const showPeriod = !!period
    const headerRow: any[] = [
        { text: 'NO.', style: 'tableHeader', alignment: 'center' },
        { text: 'DESCRIPTION', style: 'tableHeader', alignment: 'center' },
        ...(showPeriod ? [{ text: 'PERIOD', style: 'tableHeader', alignment: 'center' }] : []),
        { text: 'AMOUNT', style: 'tableHeader', alignment: 'center' }
    ]
    const widths: any[] = showPeriod ? [30, '*', 90, 90] : [30, '*', 90]

    const bodyRows: any[] = items.map((item: any, index: number) => {
        const cellStack: any[] = []
        if (item.name) cellStack.push({ text: item.name, style: 'tableCell', ...thaiFont(item.name) })
        if (item.description)
            cellStack.push({
                text: item.description,
                style: 'tableCellSubtext',
                margin: [0, 1, 0, 0],
                ...thaiFont(item.description)
            })
        if (item.tripActivity) {
            const dateRange = item.tripStartDate
                ? item.tripEndDate && !dayjs(item.tripEndDate).isSame(item.tripStartDate, 'day')
                    ? `${dayjs(item.tripStartDate).format('DD MMM YYYY')} – ${dayjs(item.tripEndDate).format('DD MMM YYYY')}`
                    : dayjs(item.tripStartDate).format('DD MMM YYYY')
                : ''
            const tripText = dateRange ? `${item.tripActivity} — ${dateRange}` : item.tripActivity
            cellStack.push({
                text: tripText,
                style: 'tableCellSubtext',
                margin: [0, 1, 0, 0],
                ...thaiFont(tripText)
            })
        }
        return [
            { text: String(index + 1), alignment: 'center', style: 'tableCell' },
            cellStack.length === 0 ? { text: '', style: 'tableCell' } : { stack: cellStack },
            ...(showPeriod ? [{ text: period, alignment: 'center', style: 'tableCell' }] : []),
            { text: formatCurrency(item.amount), alignment: 'right', style: 'tableCell' }
        ]
    })

    const emptyCount = Math.max(0, minRows - items.length)
    for (let i = 0; i < emptyCount; i++) {
        bodyRows.push(widths.map(() => ({ text: '', style: 'tableCell' })))
    }

    const totalLabelColSpan = widths.length - 1
    const totalRow: any[] = [
        { text: 'GRAND TOTAL', style: 'totalLabel', colSpan: totalLabelColSpan, alignment: 'right' },
        ...Array(totalLabelColSpan - 1).fill({}),
        {
            text: formatCurrency(total),
            style: 'totalValue',
            alignment: 'right'
        }
    ]

    const table = {
        table: {
            headerRows: 1,
            widths,
            body: [headerRow, ...bodyRows, totalRow]
        },
        layout: {
            // Horizontal rules only where the reference form has them: around the header,
            // and above/below the GRAND TOTAL row. The filler rows stay open.
            hLineWidth: (i: number, node: any) => {
                const rows = node.table.body.length
                return i === 0 || i === 1 || i === rows - 1 || i === rows ? 1 : 0
            },
            // Every column rule runs the full height of the table, filler rows included.
            vLineWidth: () => 1,
            hLineColor: () => '#000000',
            vLineColor: () => '#000000',
            paddingLeft: () => 8,
            paddingRight: () => 8,
            paddingTop: () => 6,
            paddingBottom: () => 6
        },
        margin: [0, 0, 0, 0]
    }

    // "Amount in words" is its own boxed line below the table (not inlined into the total row).
    const amountInWordsBox = {
        table: {
            widths: ['*'],
            body: [
                [
                    {
                        text: [
                            { text: 'Amount in words  ', bold: true },
                            { text: amountInWords ? `(${amountInWords})` : '' }
                        ],
                        style: 'totalWordsCell'
                    }
                ]
            ]
        },
        layout: BOX_LAYOUT,
        margin: [0, 6, 0, 0]
    }

    return { stack: [table, amountInWordsBox] }
}

// ---------------------------------------------------------------------------
// Late payment note
// ---------------------------------------------------------------------------
// The reference form runs "REMARKS" inline with the first numbered remark, and boxes the
// annual figure inside the second one. This column width keeps remark 2 aligned under remark 1.
const REMARKS_LABEL_WIDTH = 60

// Tight border box for the inline annual total — BOX_LAYOUT's padding is sized for the
// info boxes and would swamp a figure sitting mid-sentence.
const INLINE_BOX_LAYOUT = {
    hLineWidth: () => 0.5,
    vLineWidth: () => 0.5,
    hLineColor: () => '#000000',
    vLineColor: () => '#000000',
    paddingLeft: () => 4,
    paddingRight: () => 4,
    paddingTop: () => 1,
    paddingBottom: () => 1
}

export function createLatePaymentNote(data: any = {}) {
    const { lateChargeRate = '1.25%', annualTotal = null } = data

    const rows: any[] = [
        {
            columns: [
                { width: REMARKS_LABEL_WIDTH, text: 'REMARKS', style: 'noteTitle' },
                {
                    width: '*',
                    text: `1. Late payment charges of ${lateChargeRate} per month will begin from the first day after due date until payment date.`,
                    style: 'noteText'
                }
            ]
        }
    ]

    if (annualTotal != null) {
        rows.push({
            columns: [
                { width: REMARKS_LABEL_WIDTH, text: '' },
                {
                    width: 'auto',
                    text: '2. If you wish to pay for the annual school fees total charges will be BHT',
                    style: 'noteText',
                    margin: [0, 2, 4, 0]
                },
                {
                    width: 'auto',
                    table: {
                        widths: ['auto'],
                        body: [[{ text: formatCurrency(annualTotal), style: 'noteText', bold: true }]]
                    },
                    layout: INLINE_BOX_LAYOUT
                },
                { width: '*', text: '* See Appendix', style: 'noteText', margin: [4, 2, 0, 0] }
            ],
            margin: [0, 2, 0, 0]
        })
    }

    return {
        stack: rows,
        margin: [0, 6, 0, 6]
    }
}

// ---------------------------------------------------------------------------
// Payment methods section
// ---------------------------------------------------------------------------
// Condensed variant matching the reference tuition-invoice layout: just "Payment via Bank Transfer
// or Credit Card" plus a bank-details box, sourced from School Info settings — no cheque/QR/bill-pay
// blocks (those stay on the elaborate default variant used by other invoice categories).
export function createSimplePaymentMethods(data: any = {}) {
    const {
        accountName = 'Brighton College Bangkok, Vibhavadi',
        accountNumber = '',
        bankName = '',
        bankAddress = '',
        swiftCode = ''
    } = data

    const bankDetails = [
        ['Bank Name', bankName],
        ['Bank Account Name', accountName],
        ['Account No', accountNumber],
        ...(bankAddress || swiftCode
            ? [['Bank Address', [bankAddress, swiftCode ? `  Swift Code : ${swiftCode}` : ''].join('')]]
            : [])
    ].filter(([, value]) => !!value)

    // Nothing configured yet — drop the whole block. pdfmake reads body[0] to size a table and
    // throws on an empty one, so an unconfigured School Info would otherwise fail the PDF.
    if (bankDetails.length === 0) return null

    return {
        stack: [
            { text: 'Payment via Bank Transfer or Credit Card', style: 'paymentTitle', margin: [0, 0, 0, 5] },
            {
                table: {
                    widths: [110, '*'],
                    body: bankDetails.map(([label, value]) => [
                        { text: label, style: 'bankDetailLabel', border: [false, false, false, false] },
                        { text: value, style: 'bankDetailValue', border: [false, false, false, false], ...thaiFont(value) }
                    ])
                },
                layout: {
                    ...{ hLineWidth: () => 0, vLineWidth: () => 0 },
                    paddingLeft: () => 0,
                    paddingRight: () => 0,
                    paddingTop: () => 2,
                    paddingBottom: () => 2
                }
            }
        ],
        margin: [0, 0, 0, 4]
    }
}

export function createPaymentMethods(data: any = {}) {
    const {
        accountName = 'Brighton College Bangkok, Vibhavadi',
        accountNumber = '041-1-12977-2',
        bankName = 'Kasikorn Bank (bank code 004)',
        branch = 'Sathu Pradit (branch code 0041)',
        swiftCode = 'KASITHBK',
        bankAddress = '1 Soi Rat Burana 22/1, Rat Burana Road, Bangkok 10140',
        billerIdNo = '099-4-00259063-3',
        referenceNo1 = '',
        referenceNo2 = '',
        qrCodeBase64 = '',
        financeEmail = 'admission@brightoncollegevibha.ac.th',
        bankFeeRate = '1.3%',
        isExternal = false
    } = data

    const stack: any[] = [{ text: 'Payment methods', style: 'paymentTitle', margin: [0, 0, 0, 5] }]

    // 1. Cheque
    stack.push({
        text: [
            { text: '-  Cashier Cheque: ', bold: false },
            {
                text: `Cashier cheques must be made payable to ${accountName} and marked A/C Payee Only. Please deliver cashier cheques to the Finance & Accounting Department.`,
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

    if (!isExternal) {
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
    }

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

    return { stack, margin: [0, 0, 0, 4] }
}

// ---------------------------------------------------------------------------
// Signature section – "Prepared by" (Accounting Officer) and "Verified by" (Finance & Accounting
// Manager), both globally configurable (System.signatureSettings — see GeneralController) rather
// than one hardcoded name + a text-only left column.
// ---------------------------------------------------------------------------
function signatureColumn(signatory: any, fallbackLabel: string, defaultTitle: string) {
    // Back-compat: older callers may still pass a plain string for `preparedBy`.
    const { name = '', title = '', signatureBase64 = null } =
        typeof signatory === 'string' ? { name: signatory, title: '', signatureBase64: null } : signatory || {}

    const roleTitle = title || defaultTitle

    // The signature image sits just above the label: the negative bottom margin pulls the label
    // row back up so the two overlap slightly instead of stacking with a gap.
    const imageNode: any = signatureBase64
        ? { image: signatureBase64, fit: [80, 28], alignment: 'center', margin: [0, 0, 0, -16] }
        : { text: '', margin: [0, 0, 0, 12] }

    return {
        width: '*',
        stack: [
            imageNode,
            // Label and name on one line (no dotted signature rule): "Prepared by" on the left, the name
            // centred in the rest of the column.
            {
                columnGap: 8,
                columns: [
                    { width: 'auto', text: fallbackLabel, style: 'signatureLabel' },
                    { width: '*', text: name, style: 'signatureName', alignment: 'center', ...thaiFont(name) }
                ]
            },
            // An empty title prints no position line ("Prepared by" shows the creator's name only).
            ...(roleTitle ? [{ text: roleTitle, style: 'signatureTitle', alignment: 'center', margin: [0, 3, 0, 0] }] : [])
        ]
        // No alignment here: it is inherited. The label stays left-aligned; the name, title and any
        // signature image set their own centring.
    }
}

export function createSignatureSection(data: any = {}) {
    const { preparedBy = {}, verifiedBy = {} } = data

    return {
        columns: [
            // No default position under either signatory: both print the full name only.
            signatureColumn(preparedBy, 'Prepared by', ''),
            signatureColumn(verifiedBy, 'Verified by', '')
        ],
        columnGap: 24,
        margin: [0, 16, 0, 0]
    }
}

// ---------------------------------------------------------------------------
// Appendix page — Instalment (per-term, as invoiced) vs Annual breakdown.
// The annual figures are a practical approximation computed on the backend (term × terms-in-year,
// discounts re-run against that base) — see InvoiceReportMapper.buildAppendixData for the source.
// ---------------------------------------------------------------------------
const APPENDIX_AMOUNT_COL = 78
const APPENDIX_TOTAL_INDENT = 96

// An amount with a rule under it, the way a hand-kept ledger marks a figure that is about to be
// subtotalled. The rule is the bottom edge of a nested full-width table rather than a canvas line:
// a canvas needs its length hard-coded, which cannot track the column's real inner width, and the
// rule then stops short of the right-aligned figure. `widths: ['*']` measures itself.
// The double rule for a total is a second, near-zero-height row underneath.
function ruledAmount(value: number, opts: { bold?: boolean; double?: boolean } = {}) {
    const body: any[] = [
        [{ text: formatCurrency(value), alignment: 'right', style: 'tableCell', bold: !!opts.bold }]
    ]
    if (opts.double) body.push([{ text: '', fontSize: 2 }])

    return {
        table: { widths: ['*'], body },
        layout: {
            hLineWidth: (i: number) => (i === 0 ? 0 : 0.7),
            vLineWidth: () => 0,
            hLineColor: () => '#000000',
            paddingLeft: () => 0,
            paddingRight: () => 0,
            paddingTop: () => 0,
            paddingBottom: () => 1
        }
    }
}

// Stair-step ledger, as on the reference Appendix: the opening fee sits in the first amount
// column, every "Deduct" row puts its (negative) figure in the current column and the resulting
// balance one column to the right, and any remaining fees land in the final column alongside the
// total. The number of amount columns therefore follows the number of deductions.
// Conservative inner width for dynamic cascade columns — keeps amount cols within page bounds
const INNER_BOX_WIDTH = 440
// Minimum description column width to keep labels readable
const MIN_DESC_WIDTH = 100

function appendixBreakdownTable(section: { items?: any[]; discountRows?: any[]; total?: number } = {}) {
    const { items = [], discountRows = [], total = 0 } = section

    const [openingItem, ...remainingItems] = items

    // ── Cascade layout: staircase running totals ──
    const rows = [...(openingItem ? [openingItem] : []), ...discountRows, ...remainingItems]

    const amountCols = discountRows.length + 1
    // Dynamic column width — shrinks when there are many deductions to avoid overflow
    const dynamicAmountCol = Math.max(55, Math.floor((INNER_BOX_WIDTH - MIN_DESC_WIDTH) / amountCols))
    const blank = () => ({ text: '', style: 'tableCell' })

    let col = 0
    let running = 0
    const body = rows.map((row: any) => {
        const isDeduction = row.amount < 0
        const cells: any[] = Array.from({ length: amountCols }, blank)

        if (isDeduction) {
            running += row.amount
            cells[col] = ruledAmount(row.amount)
            col += 1
            cells[col] = { text: formatCurrency(running), alignment: 'right', style: 'tableCell' }
        } else {
            running += row.amount
            cells[col] = { text: formatCurrency(row.amount), alignment: 'right', style: 'tableCell' }
        }

        return [
            {
                text: isDeduction
                    ? [{ text: 'Deduct', bold: true, decoration: 'underline' }, { text: ` ${row.name}` }]
                    : row.name,
                style: 'tableCell',
                ...thaiFont(row.name)
            },
            ...cells
        ]
    })

    const spacerRow: any[] = Array.from({ length: amountCols + 1 }, () => ({ text: ' ', style: 'tableCell' }))
    const totalRow: any[] = [
        { text: 'Total', style: 'totalLabel', alignment: 'left', margin: [APPENDIX_TOTAL_INDENT, 0, 0, 0] },
        ...Array.from({ length: amountCols - 1 }, blank),
        ruledAmount(total, { bold: true, double: true })
    ]

    return {
        table: {
            widths: ['*', ...Array(amountCols).fill(dynamicAmountCol)],
            body: [...body, spacerRow, totalRow]
        },
        layout: {
            hLineWidth: () => 0,
            vLineWidth: () => 0,
            paddingLeft: () => 2,
            paddingRight: () => 2,
            paddingTop: () => 5,
            paddingBottom: () => 5
        }
    }
}

export function createInstalmentAppendix(data: any = null) {
    if (!data) return null
    const { yearGroup = '', instalment = {}, annual = {} } = data

    // The section name sits above its box on the reference form; only the year group and the
    // ledger are enclosed.
    const section = (title: string, breakdown: any) => ({
        stack: [
            { text: title, style: 'appendixSectionTitle', margin: [0, 0, 0, 3] },
            {
                table: {
                    widths: ['*'],
                    body: [
                        [
                            {
                                stack: [
                                    {
                                        text: `Year ${yearGroup}`.replace('Year Year', 'Year'),
                                        style: 'appendixYearTitle',
                                        margin: [0, 0, 0, 10]
                                    },
                                    appendixBreakdownTable(breakdown)
                                ],
                                margin: [4, 4, 4, 10]
                            }
                        ]
                    ]
                },
                layout: BOX_LAYOUT
            }
        ],
        margin: [0, 0, 0, 18]
    })

    return {
        pageBreak: 'before',
        stack: [
            // Boxed, right-aligned label — a tab-like marker rather than a page heading.
            {
                columns: [
                    { width: '*', text: '' },
                    {
                        width: 'auto',
                        table: { widths: ['auto'], body: [[{ text: 'Appendix', style: 'appendixTitle' }]] },
                        layout: BOX_LAYOUT
                    }
                ],
                margin: [0, 0, 0, 10]
            },
            section('Instalment', instalment),
            section('Annual', annual)
        ]
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
            fontSize: 6,
            color: '#333333'
        },
        invoiceTitle: {
            fontSize: 20,
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
        noteTitle: {
            fontSize: 8,
            bold: true,
            color: '#000000'
        },
        noteText: {
            fontSize: 6,
            color: '#333333'
        },
        appendixTitle: {
            fontSize: 12,
            bold: true,
            color: '#000000'
        },
        appendixSectionTitle: {
            fontSize: 9,
            bold: true,
            color: '#000000'
        },
        appendixYearTitle: {
            fontSize: 8.5,
            bold: true,
            italics: true,
            decoration: 'underline',
            color: '#000000'
        },
        paymentTitle: {
            fontSize: 9,
            bold: true,
            color: '#000000'
        },
        paymentText: {
            fontSize: 8.5,
            color: '#000000'
        },
        bankDetailLabel: {
            fontSize: 8.5,
            color: '#000000'
        },
        bankDetailValue: {
            fontSize: 8.5,
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
// Invoice styles – getBaseStyles() re-sized for the serif reference form.
// Kept separate so receipts, which share getBaseStyles(), are unaffected.
// ---------------------------------------------------------------------------
export function getInvoiceStyles() {
    return {
        ...getBaseStyles(),
        schoolName: { fontSize: 16, bold: true, color: '#000000' },
        managedByLabel: { fontSize: 10, color: '#000000' },
        schoolLocation: { fontSize: 13, bold: true, color: '#000000' },
        addressText: { fontSize: 10, color: '#000000' },
        invoiceTitle: { fontSize: 20, bold: true, color: '#000000' },
        infoLabel: { fontSize: 10, color: '#000000' },
        infoValue: { fontSize: 10, color: '#000000' },
        tableHeader: { fontSize: 11, bold: true, color: '#000000' },
        tableCell: { fontSize: 10.5, color: '#000000' },
        totalWordsCell: { fontSize: 10, color: '#000000' },
        totalLabel: { fontSize: 11, bold: true, color: '#000000' },
        totalValue: { fontSize: 11, color: '#000000' },
        noteTitle: { fontSize: 9.5, bold: true, color: '#000000' },
        noteText: { fontSize: 9.5, color: '#000000' },
        paymentTitle: { fontSize: 10, bold: true, color: '#000000' },
        bankDetailLabel: { fontSize: 9.5, color: '#000000' },
        bankDetailValue: { fontSize: 9.5, color: '#000000' },
        signatureLabel: { fontSize: 10, color: '#000000' },
        signatureName: { fontSize: 10, color: '#000000' },
        signatureTitle: { fontSize: 10, bold: true, color: '#000000' },
        appendixTitle: { fontSize: 12, bold: true, color: '#000000' },
        appendixSectionTitle: { fontSize: 11, bold: true, color: '#000000' },
        appendixYearTitle: { fontSize: 11, bold: true, decoration: 'underline', color: '#000000' }
    }
}

// ---------------------------------------------------------------------------
// Page settings
// ---------------------------------------------------------------------------
export function getDefaultPageSettings() {
    return {
        pageSize: 'A4' as const,
        // Extra top margin on page 2+ for the repeated small logo header
        pageMargins: [40, 28, 40, 40] as [number, number, number, number]
    }
}

/**
 * Page header function — renders a compact Brighton header
 * (logo + school name + managed-by + address) at the top of every page.
 */
export function getPageHeader(data: any = {}) {
    const { nameEn = '', managedBy = '', addressEn = '', phone = '', email = '' } = data
    return () => {
        const textStack: any[] = []
        if (nameEn) textStack.push({ text: nameEn, style: 'schoolName', alignment: 'center', margin: [0, 0, 0, 3] })
        if (managedBy) {
            textStack.push({ text: 'Managed by', style: 'managedByLabel', alignment: 'center' })
            textStack.push({ text: managedBy, style: 'schoolLocation', alignment: 'center', margin: [0, 0, 0, 3] })
        }
        if (addressEn) textStack.push({ text: addressEn, style: 'addressText', alignment: 'center' })
        const contactLine = [phone, email].filter(Boolean).join('  Email : ')
        if (contactLine) textStack.push({ text: contactLine, style: 'addressText', alignment: 'center' })

        return {
            margin: [40, 15, 40, 0],
            stack: [
                LOGO_BASE64
                    ? { image: LOGO_BASE64, width: 110, alignment: 'left', margin: [0, 0, 0, 4] }
                    : null,
                ...textStack
            ].filter(Boolean)
        }
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
export function buildDocDefinition({ header, studentInfo, content, styles = {} }: any) {
    // Extract header data (passed as the output of createHeader — a stack with text items)
    // and reuse it as page header on every page.
    const headerData = (header && (header as any).__data) || {}
    const pageHeader = getPageHeader(headerData)
    // Append INVOICE title to content (used to be inside createHeader)
    const invoiceTitle = { text: 'INVOICE', style: 'invoiceTitle', alignment: 'center', margin: [0, 0, 0, 10] }
    const docDef: any = {
        // Larger top margin to accommodate the repeating header block
        pageSize: 'A4' as const,
        pageMargins: [40, 150, 40, 40],
        header: pageHeader,
        content: [invoiceTitle, studentInfo, ...content].filter(Boolean),
        styles: {
            ...getInvoiceStyles(),
            ...styles
        },
        defaultStyle: {
            font: INVOICE_FONT
        }
    }

    return docDef
}
