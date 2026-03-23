/**
 * Mock data service for report generation.
 * Replace these with real API calls when the backend is ready.
 * All functions are async to match future API shape.
 */

const mockData = {
    'tuition-fee': {
        schoolName: "King's College International School",
        schoolNameTh: 'โรงเรียนนานาชาติคิงส์คอลเลจ',
        address: '999 Moo 1, Tambon Nong Prue, Amphoe Bang Lamung, Chonburi 20150',
        phone: '038-123456',
        documentNo: 'TF-2026-001234',
        documentDate: '23/03/2026',
        studentName: 'John Smith',
        studentId: 'STU-20260012',
        grade: 'Year 10',
        section: 'A',
        academicYear: '2025-2026',
        term: 'Term 2',
        parentName: 'Mr. David Smith',
        items: [
            { description: 'Tuition Fee - Term 2', amount: 185000 },
            { description: 'Registration Fee', amount: 15000 },
            { description: 'Technology Fee', amount: 8500 },
            { description: 'Library & Resources Fee', amount: 3500 },
            { description: 'Student Welfare Fee', amount: 5000 }
        ],
        adjustments: [
            { description: 'Registration Fee Waiver (100%)', amount: -15000 },
            { description: 'Sibling Discount (10% on Tuition)', amount: -18500 },
            { description: 'ID Card Charge', amount: 350 }
        ],
        amountInWords: 'One Hundred Eighty-Three Thousand Eight Hundred and Fifty Baht Only',
        paymentNotes: [
            'Payment is due within 30 days of invoice date.',
            'Please make payment via bank transfer or at the school cashier.',
            'Bank: Bangkok Bank, Account: 123-4-56789-0, Name: KCIS Ltd.'
        ]
    },

    'exam-fee': {
        schoolName: "King's College International School",
        schoolNameTh: 'โรงเรียนนานาชาติคิงส์คอลเลจ',
        address: '999 Moo 1, Tambon Nong Prue, Amphoe Bang Lamung, Chonburi 20150',
        phone: '038-123456',
        documentNo: 'EX-2026-000567',
        documentDate: '23/03/2026',
        studentName: 'Emily Johnson',
        studentId: 'STU-20260034',
        grade: 'Year 11',
        section: 'B',
        academicYear: '2025-2026',
        term: 'Term 2',
        parentName: 'Mrs. Sarah Johnson',
        items: [
            { description: 'IGCSE English Language (0500)', amount: 12500 },
            { description: 'IGCSE Mathematics (0580)', amount: 12500 },
            { description: 'IGCSE Physics (0625)', amount: 13000 },
            { description: 'IGCSE Chemistry (0620)', amount: 13000 },
            { description: 'IGCSE Biology (0610)', amount: 13000 },
            { description: 'IGCSE Thai Language (0518)', amount: 10000 }
        ],
        amountInWords: 'Seventy-Four Thousand Baht Only',
        paymentNotes: [
            'Examination fees are non-refundable.',
            'Payment must be completed before 15 April 2026.',
            'Late registration may incur additional fees.'
        ]
    },

    'school-bus': {
        schoolName: "King's College International School",
        schoolNameTh: 'โรงเรียนนานาชาติคิงส์คอลเลจ',
        address: '999 Moo 1, Tambon Nong Prue, Amphoe Bang Lamung, Chonburi 20150',
        phone: '038-123456',
        documentNo: 'SB-2026-000089',
        documentDate: '23/03/2026',
        studentName: 'Sophia Chen',
        studentId: 'STU-20260056',
        grade: 'Year 7',
        section: 'C',
        academicYear: '2025-2026',
        term: 'Term 2',
        parentName: 'Mr. Wei Chen',
        route: {
            name: 'Route 5 - Pattaya South',
            pickupPoint: 'Central Pattaya, Fountain Roundabout',
            period: 'January - April 2026'
        },
        items: [
            { description: 'School Bus Service - Term 2 (Round Trip)', amount: 28000 },
            { description: 'Bus Insurance Fee', amount: 1500 }
        ],
        amountInWords: 'Twenty-Nine Thousand Five Hundred Baht Only',
        paymentNotes: [
            'School bus fees are charged per term.',
            'Changes to bus routes must be requested at least 2 weeks in advance.',
            'Bus service operates on school days only.'
        ]
    },

    'school-trip': {
        schoolName: "King's College International School",
        schoolNameTh: 'โรงเรียนนานาชาติคิงส์คอลเลจ',
        address: '999 Moo 1, Tambon Nong Prue, Amphoe Bang Lamung, Chonburi 20150',
        phone: '038-123456',
        documentNo: 'ST-2026-000045',
        documentDate: '23/03/2026',
        studentName: 'Lucas Park',
        studentId: 'STU-20260078',
        grade: 'Year 9',
        section: 'A',
        academicYear: '2025-2026',
        term: 'Term 2',
        parentName: 'Mrs. Min-Ji Park',
        trip: {
            name: 'Year 9 Geography Field Trip',
            destination: 'Khao Yai National Park, Nakhon Ratchasima',
            date: '15 - 17 April 2026',
            duration: '3 Days / 2 Nights'
        },
        items: [
            { description: 'Transportation (Coach Bus)', amount: 3500 },
            { description: 'Accommodation (2 nights)', amount: 4800 },
            { description: 'Meals (3 days)', amount: 2400 },
            { description: 'National Park Entry Fee', amount: 400 },
            { description: 'Activity & Guide Fees', amount: 1900 },
            { description: 'Travel Insurance', amount: 500 }
        ],
        amountInWords: 'Thirteen Thousand Five Hundred Baht Only',
        paymentNotes: [
            'Payment must be completed before 1 April 2026.',
            'Cancellation after 5 April 2026 is subject to a 50% cancellation fee.',
            'Please ensure your child brings required items as per the trip checklist.'
        ]
    }
}

/**
 * Fetch report data for generation. Currently returns mock data.
 * @param {string} reportType - Report type key
 * @param {object} _params - Query parameters (unused with mock data)
 * @returns {Promise<object>} Report data
 */
export async function fetchReportData(reportType, _params = {}) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300))

    const data = mockData[reportType]
    if (!data) {
        throw new Error(`No mock data available for report type: ${reportType}`)
    }

    return structuredClone(data)
}

/**
 * Get available report types.
 * @returns {Promise<Array>} List of report type options
 */
export async function fetchReportTypes() {
    const { getReportTypes } = await import('@/utils/PDFGenerator')
    return getReportTypes()
}
