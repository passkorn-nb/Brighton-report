import {
    createHeader,
    createStudentInfo,
    createFeeTable,
    createTotalSection,
    createFooter,
    buildDocDefinition
} from './baseTemplate'

export function buildSchoolTripReport(data) {
    const header = createHeader({
        ...data,
        documentTitle: 'SCHOOL TRIP FEE INVOICE'
    })

    const studentInfo = createStudentInfo(data)

    const tripDetails = data.trip
        ? {
              stack: [
                  { text: 'Trip Details', style: 'sectionTitle', margin: [0, 0, 0, 5] },
                  {
                      table: {
                          widths: [100, '*'],
                          body: [
                              [
                                  { text: 'Trip Name:', style: 'infoLabel', border: [false, false, false, false] },
                                  {
                                      text: data.trip.name || '',
                                      style: 'infoValue',
                                      border: [false, false, false, false]
                                  }
                              ],
                              [
                                  { text: 'Destination:', style: 'infoLabel', border: [false, false, false, false] },
                                  {
                                      text: data.trip.destination || '',
                                      style: 'infoValue',
                                      border: [false, false, false, false]
                                  }
                              ],
                              [
                                  { text: 'Date:', style: 'infoLabel', border: [false, false, false, false] },
                                  {
                                      text: data.trip.date || '',
                                      style: 'infoValue',
                                      border: [false, false, false, false]
                                  }
                              ],
                              [
                                  { text: 'Duration:', style: 'infoLabel', border: [false, false, false, false] },
                                  {
                                      text: data.trip.duration || '',
                                      style: 'infoValue',
                                      border: [false, false, false, false]
                                  }
                              ]
                          ]
                      },
                      layout: 'noBorders'
                  }
              ],
              margin: [0, 0, 0, 15]
          }
        : null

    const feeTable = createFeeTable(data.items || [], {
        columns: ['no', 'description', 'amount']
    })

    const subtotal = (data.items || []).reduce((sum, item) => sum + (item.amount || 0), 0)

    const totalSection = createTotalSection({
        subtotal,
        netTotal: subtotal,
        amountInWords: data.amountInWords || ''
    })

    const footer = createFooter({
        paymentNotes: data.paymentNotes || [
            'Payment must be completed before the trip departure date.',
            'Cancellation after payment is subject to a cancellation fee.',
            'Please ensure your child has valid travel documents if required.'
        ],
        showSignature: true
    })

    return buildDocDefinition({
        header,
        studentInfo,
        content: [tripDetails, feeTable, totalSection],
        footer
    })
}
