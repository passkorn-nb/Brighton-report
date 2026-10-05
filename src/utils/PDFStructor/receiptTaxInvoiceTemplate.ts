import fs from 'fs'
import path from 'path'
import { formatCurrency } from './baseTemplate'

/**
 * Building blocks for the bilingual "ใบเสร็จรับเงิน / ใบกำกับภาษี" (Receipt / Tax Invoice) form,
 * reproducing the school's pre-printed stationery.
 *
 * Set in Sarabun throughout — every label on this form has a Thai half, and the standard-14
 * Times face used by the invoice carries no Thai glyphs at all.
 */
export const TAX_RECEIPT_FONT = 'Sarabun'

const LOGO_PATH = path.resolve(process.cwd(), 'src/assets/images/kcis-logo.png')
let cachedLogo: string | null | undefined

function loadLogoBase64(): string | null {
    if (cachedLogo !== undefined) return cachedLogo
    try {
        cachedLogo = fs.existsSync(LOGO_PATH)
            ? `data:image/png;base64,${fs.readFileSync(LOGO_PATH).toString('base64')}`
            : null
    } catch {
        cachedLogo = null
    }
    return cachedLogo
}

// ---------------------------------------------------------------------------
// Thai formatting
// ---------------------------------------------------------------------------
const THAI_DIGITS = ['ศูนย์', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า']
// Up to แสน only: ล้าน is handled by splitting the number into six-digit blocks, so that the
// เอ็ด rule sees just the block it belongs to.
const THAI_PLACES = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน']

// Reads a block of at most 6 digits (up to แสน) the way Thai is spoken: a leading "หนึ่ง" is
// dropped before สิบ, twenty is ยี่สิบ, and a trailing one becomes เอ็ด — but only when some
// higher place in the same group is non-zero. 2,000,001 is สองล้านหนึ่ง, not สองล้านเอ็ด, so the
// test is on the digits actually spoken, not on the padded string length.
function readThaiGroup(digits: string): string {
    let out = ''
    const len = digits.length
    for (let i = 0; i < len; i++) {
        const n = Number(digits[i])
        const place = len - i - 1
        if (n === 0) continue
        const hasHigherDigit = /[1-9]/.test(digits.slice(0, i))
        if (place === 1 && n === 1) out += THAI_PLACES[1]
        else if (place === 1 && n === 2) out += 'ยี่' + THAI_PLACES[1]
        else if (place === 0 && n === 1 && hasHigherDigit) out += 'เอ็ด'
        else out += THAI_DIGITS[n] + THAI_PLACES[place]
    }
    return out
}

function readThaiInteger(value: number): string {
    if (value === 0) return THAI_DIGITS[0]
    const s = String(value)
    // Anything past a million repeats the same reading with "ล้าน" between the blocks.
    if (s.length > 6) {
        const head = Number(s.slice(0, s.length - 6))
        const tail = s.slice(s.length - 6)
        const tailText = Number(tail) ? readThaiGroup(tail) : ''
        return readThaiInteger(head) + 'ล้าน' + tailText
    }
    return readThaiGroup(s)
}

/** e.g. 700000 -> "เจ็ดแสนบาทถ้วน", 1234.50 -> "หนึ่งพันสองร้อยสามสิบสี่บาทห้าสิบสตางค์" */
export function thaiBahtText(amount: number): string {
    const safe = Number.isFinite(amount) ? Math.abs(amount) : 0
    const baht = Math.floor(safe)
    const satang = Math.round((safe - baht) * 100)
    const bahtText = readThaiInteger(baht) + 'บาท'
    return satang === 0 ? `${bahtText}ถ้วน` : `${bahtText}${readThaiInteger(satang)}สตางค์`
}

/**
 * DD/MM/YYYY in the Buddhist era, as the printed form shows it (30/06/2569).
 * A value that cannot be parsed as a date is passed through untouched, so a caller that
 * already formatted the string keeps control.
 */
export function toThaiBuddhistDate(value: Date | string | null | undefined): string {
    if (!value) return ''
    const d = value instanceof Date ? value : new Date(value)
    if (isNaN(d.getTime())) return String(value)
    const parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Bangkok',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }).formatToParts(d)
    const get = (t: string) => parts.find((p) => p.type === t)!.value
    return `${get('day')}/${get('month')}/${Number(get('year')) + 543}`
}

// ---------------------------------------------------------------------------
// Shared layouts
// ---------------------------------------------------------------------------
const NO_BORDER = {
    hLineWidth: () => 0,
    vLineWidth: () => 0,
    paddingLeft: () => 0,
    paddingRight: () => 0,
    paddingTop: () => 0,
    paddingBottom: () => 0
}

// A value written onto a printed rule: the underline is the cell's bottom edge, so it stretches
// with the column instead of being a fixed-length canvas.
function ruledValue(text: string, opts: { alignment?: string; bold?: boolean } = {}) {
    return {
        table: {
            widths: ['*'],
            body: [[{ text: text || ' ', style: 'trValue', alignment: opts.alignment ?? 'center', bold: !!opts.bold }]]
        },
        layout: {
            hLineWidth: (i: number) => (i === 1 ? 0.7 : 0),
            vLineWidth: () => 0,
            hLineColor: () => '#000000',
            paddingLeft: () => 2,
            paddingRight: () => 2,
            paddingTop: () => 0,
            paddingBottom: () => 1
        }
    }
}

// ---------------------------------------------------------------------------
// Header — English block | crest | Thai block
// ---------------------------------------------------------------------------
export function createTaxReceiptHeader(data: any = {}) {
    const {
        logoBase64,
        nameEn = '',
        managedByEn = '',
        addressEn = [],
        emailEn = '',
        taxIdEn = '',
        nameTh = '',
        managedByTh = '',
        addressTh = [],
        emailTh = '',
        taxIdTh = ''
    } = data

    const logo = logoBase64 || loadLogoBase64()
    const line = (text: string, bold = false) => ({ text, style: 'trOrg', bold })

    const left: any[] = []
    if (nameEn) left.push(line(nameEn, true))
    if (managedByEn) left.push(line(managedByEn, true))
    for (const l of addressEn) left.push(line(l))
    if (emailEn) left.push(line(emailEn))
    if (taxIdEn) left.push(line(taxIdEn))

    const right: any[] = []
    if (nameTh) right.push({ ...line(nameTh, true), alignment: 'right' })
    if (managedByTh) right.push({ ...line(managedByTh, true), alignment: 'right' })
    for (const l of addressTh) right.push({ ...line(l), alignment: 'right' })
    if (emailTh) right.push({ ...line(emailTh), alignment: 'right' })
    if (taxIdTh) right.push({ ...line(taxIdTh), alignment: 'right' })

    return {
        columns: [
            { width: '38%', stack: left },
            {
                width: '24%',
                stack: logo ? [{ image: logo, fit: [170, 115], alignment: 'center' }] : [{ text: '' }]
            },
            { width: '38%', stack: right }
        ],
        margin: [0, 0, 0, 6]
    }
}

export function createTaxReceiptTitle() {
    return {
        stack: [
            { text: 'ใบเสร็จรับเงิน / ใบกำกับภาษี', style: 'trTitleTh', alignment: 'center' },
            { text: 'RECEIPT / TAX INVOICE', style: 'trTitleEn', alignment: 'center' }
        ],
        margin: [0, 0, 0, 6]
    }
}

// ---------------------------------------------------------------------------
// No. / Date / page, then the customer block
// ---------------------------------------------------------------------------
export function createTaxReceiptInfo(data: any = {}) {
    const {
        receiptNo = '',
        receiptDate = '',
        pageLabel = '1 / 1',
        customerCode = '',
        customerName = '',
        address = ''
    } = data

    const labelled = (label: string, value: string, valueWidth: any = '*') => ({
        columns: [
            { width: 'auto', text: label, style: 'trLabel', margin: [0, 1, 6, 0] },
            { width: valueWidth, ...ruledValue(value) }
        ],
        columnGap: 0
    })

    return {
        stack: [
            {
                columns: [
                    { width: '42%', ...labelled('เลขที่/ No.', receiptNo) },
                    { width: '6%', text: '' },
                    { width: '38%', ...labelled('วันที่/Date', receiptDate) },
                    { width: '*', text: pageLabel, style: 'trLabel', alignment: 'right', margin: [0, 1, 0, 0] }
                ],
                columnGap: 0
            },
            { ...labelled('Customer Code :', customerCode), margin: [0, 4, 0, 0] },
            { ...labelled('Customer Name :', customerName), margin: [0, 4, 0, 0] },
            { ...labelled('Address :', address), margin: [0, 4, 0, 0] }
        ],
        margin: [0, 0, 0, 8]
    }
}

// ---------------------------------------------------------------------------
// Item table
// ---------------------------------------------------------------------------
const GRID = {
    hLineWidth: () => 0.7,
    vLineWidth: () => 0.7,
    hLineColor: () => '#000000',
    vLineColor: () => '#000000',
    paddingLeft: () => 5,
    paddingRight: () => 5,
    paddingTop: () => 4,
    paddingBottom: () => 4
}

const bilingualHead = (th: string, en: string) => ({
    stack: [
        { text: th, style: 'trHeadTh', alignment: 'center' },
        { text: en, style: 'trHeadEn', alignment: 'center' }
    ]
})

export function createTaxReceiptItems(items: any[] = [], options: any = {}) {
    const { minRows = 7 } = options

    const body: any[] = [
        [
            bilingualHead('ลำดับ', 'Item'),
            bilingualHead('รายการ', 'Description'),
            bilingualHead('จำนวน', 'Qty.'),
            bilingualHead('ราคา/หน่วย', 'Price/Unit'),
            bilingualHead('จำนวนเงิน (บาท)', 'Amount (Baht)')
        ]
    ]

    items.forEach((item, i) => {
        const qty = item.qty ?? 1
        const unit = item.unitPrice ?? item.amount ?? 0
        body.push([
            { text: String(i + 1), style: 'trCell', alignment: 'center' },
            { text: item.description ?? '', style: 'trCell' },
            { text: String(qty), style: 'trCell', alignment: 'center' },
            { text: formatCurrency(unit), style: 'trCell', alignment: 'right' },
            {
                // Tax marker beside the figure, as on the printed form: N = non-VAT, V = VAT-able.
                text: `${formatCurrency(item.amount ?? unit * qty)}${item.taxType ? '  ' + item.taxType : ''}`,
                style: 'trCell',
                alignment: 'right'
            }
        ])
    })

    for (let i = items.length; i < minRows; i++) {
        body.push(Array.from({ length: 5 }, () => ({ text: ' ', style: 'trCell' })))
    }

    return {
        table: { headerRows: 1, widths: [34, '*', 46, 78, 92], body },
        layout: GRID,
        margin: [0, 0, 0, 0]
    }
}

// ---------------------------------------------------------------------------
// Totals — the tax breakdown on the left, the document totals on the right
// ---------------------------------------------------------------------------
export function createTaxReceiptTotals(data: any = {}) {
    const {
        nonVatAmount = 0,
        vatableAmount = 0,
        vatAmount = 0,
        subTotal = 0,
        grandTotal = 0,
        amountInWordsTh = ''
    } = data

    const pair = (label: string, value: number, bold = false) => [
        { text: label, style: 'trTotalLabel', bold },
        { ...ruledValue(formatCurrency(value), { alignment: 'right', bold }) }
    ]

    return {
        stack: [
            {
                table: {
                    widths: ['*', '*'],
                    body: [
                        [
                            {
                                table: {
                                    widths: ['*', 96],
                                    body: [
                                        pair('ยอดสินค้าไม่มีภาษี (N)', nonVatAmount),
                                        pair('ยอดสินค้ามีภาษี (V)', vatableAmount),
                                        pair('ภาษีมูลค่าเพิ่ม', vatAmount)
                                    ]
                                },
                                layout: NO_BORDER,
                                margin: [0, 2, 0, 2]
                            },
                            {
                                table: {
                                    widths: ['*', 96],
                                    body: [
                                        pair('มูลค่าสินค้า / Sub Total', subTotal),
                                        pair('ภาษีมูลค่าเพิ่ม / Vat', vatAmount),
                                        pair('จำนวนเงินรวม / Grand Total', grandTotal, true)
                                    ]
                                },
                                layout: NO_BORDER,
                                margin: [0, 2, 0, 2]
                            }
                        ]
                    ]
                },
                layout: GRID
            },
            {
                table: {
                    widths: [110, '*'],
                    body: [
                        [
                            { text: 'จำนวนเงิน / Amount', style: 'trTotalLabel' },
                            { text: amountInWordsTh, style: 'trWords', alignment: 'center' }
                        ]
                    ]
                },
                layout: GRID
            }
        ]
    }
}

// ---------------------------------------------------------------------------
// Payment method row — the printed form's tick boxes
// ---------------------------------------------------------------------------
const checkbox = (ticked: boolean) => ({
    // Drawn rather than typed: no tick glyph is guaranteed present in the embedded Thai face.
    canvas: [
        { type: 'rect', x: 0, y: 2, w: 8, h: 8, lineWidth: 0.7, lineColor: '#000000' },
        ...(ticked
            ? [
                  { type: 'line', x1: 1.5, y1: 6, x2: 3.5, y2: 8.5, lineWidth: 1.2, lineColor: '#000000' },
                  { type: 'line', x1: 3.5, y1: 8.5, x2: 7, y2: 3, lineWidth: 1.2, lineColor: '#000000' }
              ]
            : [])
    ],
    width: 10
})

export function createTaxReceiptPayment(data: any = {}) {
    const { method = '', othersText = '' } = data
    const is = (m: string) => String(method).toUpperCase() === m

    return {
        table: {
            widths: ['*'],
            body: [
                [
                    {
                        columns: [
                            checkbox(is('CREDIT_CARD')),
                            { width: 'auto', text: 'บัตรเครดิต/Credit Card', style: 'trTiny', noWrap: true, margin: [3, 1, 6, 0] },
                            checkbox(is('BANK_TRANSFER')),
                            { width: 'auto', text: 'เงินโอน/Bank Transfer', style: 'trTiny', noWrap: true, margin: [3, 1, 6, 0] },
                            checkbox(is('OTHERS')),
                            { width: 'auto', text: 'Others', style: 'trTiny', noWrap: true, margin: [3, 1, 3, 0] },
                            { width: '*', ...ruledValue(othersText) }
                        ],
                        columnGap: 0
                    }
                ]
            ]
        },
        layout: GRID
    }
}

// ---------------------------------------------------------------------------
// Remark + signatures
// ---------------------------------------------------------------------------
export function createTaxReceiptFooter(data: any = {}) {
    const { authorisedName = '', receivedBy = '', serialNo = '' } = data

    return {
        stack: [
            {
                margin: [0, 14, 0, 0],
                columns: [
                    {
                        width: '*',
                        columns: [
                            {
                                width: 'auto',
                                stack: [
                                    { text: 'ลายเซ็นผู้รับมอบอำนาจ', style: 'trSmall' },
                                    { text: 'Authorised Signature', style: 'trSmall' }
                                ],
                                margin: [0, 0, 6, 0]
                            },
                            { width: '*', ...ruledValue(authorisedName) }
                        ],
                        columnGap: 0
                    },
                    { width: 16, text: '' },
                    {
                        width: '*',
                        columns: [
                            {
                                width: 'auto',
                                stack: [
                                    { text: 'ผู้รับเงิน', style: 'trSmall' },
                                    { text: 'Received By', style: 'trSmall' }
                                ],
                                margin: [0, 0, 6, 0]
                            },
                            { width: '*', ...ruledValue(receivedBy) }
                        ],
                        columnGap: 0
                    },
                    // Pre-printed serial on the stationery; blank when the run has no number to show.
                    { width: 78, text: serialNo, style: 'trSerial', alignment: 'right' }
                ],
                columnGap: 0
            }
        ]
    }
}

// ---------------------------------------------------------------------------
// Styles + document builder
// ---------------------------------------------------------------------------
export function getTaxReceiptStyles() {
    return {
        trOrg: { fontSize: 7.5, color: '#000000', lineHeight: 1.15 },
        trTitleTh: { fontSize: 12, bold: true, color: '#000000' },
        trTitleEn: { fontSize: 9, bold: true, color: '#000000' },
        trLabel: { fontSize: 8.5, bold: true, color: '#000000' },
        trValue: { fontSize: 8.5, color: '#000000' },
        trHeadTh: { fontSize: 8, bold: true, color: '#000000' },
        trHeadEn: { fontSize: 7.5, bold: true, color: '#000000' },
        trCell: { fontSize: 8.5, color: '#000000' },
        trTotalLabel: { fontSize: 8.5, color: '#000000' },
        trWords: { fontSize: 9, color: '#000000' },
        trSmall: { fontSize: 7.5, color: '#000000' },
        trTiny: { fontSize: 7, color: '#000000' },
        trSerial: { fontSize: 15, bold: true, color: '#000000' }
    }
}

export function buildTaxReceiptDocDefinition({ content, styles = {} }: any) {
    return {
        pageSize: 'A4' as const,
        pageMargins: [30, 26, 30, 30] as [number, number, number, number],
        content: content.filter(Boolean),
        styles: { ...getTaxReceiptStyles(), ...styles },
        defaultStyle: { font: TAX_RECEIPT_FONT }
    }
}
