import { buildTuitionFeeReport } from './tuitionFeeReport'
import { buildExamFeeReport } from './examFeeReport'
import { buildSchoolBusReport } from './schoolBusReport'
import { buildSchoolTripReport } from './schoolTripReport'

export const REPORT_TYPES = {
    'tuition-fee': {
        label: 'Tuition Fee',
        description: 'Tuition fee invoice with registration fee, waivers, and discounts',
        builder: buildTuitionFeeReport
    },
    'exam-fee': {
        label: 'Exam Fee',
        description: 'Examination fee invoice',
        builder: buildExamFeeReport
    },
    'school-bus': {
        label: 'School Bus',
        description: 'School bus service fee invoice',
        builder: buildSchoolBusReport
    },
    'school-trip': {
        label: 'School Trip',
        description: 'School trip fee invoice',
        builder: buildSchoolTripReport
    }
}

export function getReportTypes() {
    return Object.entries(REPORT_TYPES).map(([key, value]) => ({
        value: key,
        label: value.label,
        description: value.description
    }))
}

export function getReportBuilder(reportType) {
    const report = REPORT_TYPES[reportType]
    if (!report) {
        throw new Error(`Unknown report type: ${reportType}`)
    }
    return report.builder
}

export { buildTuitionFeeReport, buildExamFeeReport, buildSchoolBusReport, buildSchoolTripReport }
