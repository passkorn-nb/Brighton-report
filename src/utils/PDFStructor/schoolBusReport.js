import {
    createHeader,
    createStudentInfo,
    createFeeTable,
    createTotalSection,
    createFooter,
    buildDocDefinition
} from './baseTemplate'

export function buildSchoolBusReport(data) {
    const header = createHeader({
        ...data,
        documentTitle: 'SCHOOL BUS FEE INVOICE'
    })

    const studentInfo = createStudentInfo(data)

    const feeTable = createFeeTable(data.items || [], {
        columns: ['no', 'description', 'amount']
    })

    const subtotal = (data.items || []).reduce((sum, item) => sum + (item.amount || 0), 0)

    const totalSection = createTotalSection({
        subtotal,
        netTotal: subtotal,
        amountInWords: data.amountInWords || ''
    })

    const routeInfo = data.route
        ? {
              stack: [
                  { text: 'Route Information', style: 'sectionTitle', margin: [0, 0, 0, 5] },
                  {
                      table: {
                          widths: [100, '*'],
                          body: [
                              [
                                  { text: 'Route:', style: 'infoLabel', border: [false, false, false, false] },
                                  {
                                      text: data.route.name || '',
                                      style: 'infoValue',
                                      border: [false, false, false, false]
                                  }
                              ],
                              [
                                  { text: 'Pick-up Point:', style: 'infoLabel', border: [false, false, false, false] },
                                  {
                                      text: data.route.pickupPoint || '',
                                      style: 'infoValue',
                                      border: [false, false, false, false]
                                  }
                              ],
                              [
                                  { text: 'Service Period:', style: 'infoLabel', border: [false, false, false, false] },
                                  {
                                      text: data.route.period || '',
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

    const footer = createFooter({
        paymentNotes: data.paymentNotes || [
            'School bus fees are charged per term.',
            'Changes to bus routes must be requested at least 2 weeks in advance.',
            'Refunds are not available after the first week of the term.'
        ],
        showSignature: true
    })

    return buildDocDefinition({
        header,
        studentInfo,
        content: [routeInfo, feeTable, totalSection],
        footer
    })
}
