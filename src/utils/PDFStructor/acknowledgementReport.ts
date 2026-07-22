import { DEFAULT_FONT } from './baseTemplate'
import { getReceiptStyles } from './receiptTemplate'
import {
    createAcknowledgementHeader,
    createAcknowledgementInfoBox,
    createAcknowledgementItemsTable,
    createAcknowledgementFootnotes,
    createCreditCardLine,
    createAcknowledgementSignatures
} from './acknowledgementTemplate'

function buildAcknowledgementCopyContent(data: any, copyLabel: string): any[] {
    const header = createAcknowledgementHeader(copyLabel)
    const infoBox = createAcknowledgementInfoBox(data)
    const itemsTable = createAcknowledgementItemsTable(data.rows || [], {
        overpaymentAmount: data.overpaymentAmount ?? 0,
        overpaymentFee: data.overpaymentFee ?? 0,
        grandTotal: data.grandTotal,
        amountInWords: data.amountInWords
    })
    const footnotes = createAcknowledgementFootnotes({ showOverpaymentNote: Number(data.overpaymentAmount ?? 0) > 0 })
    const creditCardLine = createCreditCardLine({ cardBankName: data.cardBankName })
    const signatures = createAcknowledgementSignatures({
        cashierName: data.cashierName,
        authorisedName: data.authorisedName
    })

    return [header, infoBox, itemsTable, footnotes, creditCardLine, signatures]
}

export function buildAcknowledgementReport(data: any = {}) {
    const copy1 = buildAcknowledgementCopyContent(data, 'Customer')
    const copy2 = buildAcknowledgementCopyContent(data, 'Accounting')

    if (copy2.length > 0) {
        copy2[0] = { ...copy2[0], pageBreak: 'before' }
    }

    return {
        pageSize: 'A4' as const,
        pageMargins: [40, 40, 40, 40] as [number, number, number, number],
        content: [...copy1, ...copy2],
        styles: getReceiptStyles(),
        defaultStyle: { font: DEFAULT_FONT }
    }
}
