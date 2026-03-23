import { buildTuitionFeeReport } from './tuitionFeeReport'
import { buildExamFeeReport } from './examFeeReport'
import { buildSchoolBusReport } from './schoolBusReport'
import { buildSchoolTripReport } from './schoolTripReport'
import { buildEcaReport } from './ecaReport'
import { buildHolidayCampReport } from './holidayCampReport'
import { buildHolidayCampExternalReport } from './holidayCampExternalReport'
import { buildStudentActivitiesReport } from './studentActivitiesReport'

/**
 * Registry of available KCIS invoice report types.
 * Each entry maps a key to a label, description, and builder function.
 */
export const REPORT_TYPES = {
    tuitionFee: {
        label: 'Tuition Fee',
        description: 'Tuition fee invoice with registration waivers, sibling discounts, credit notes, and ID card charges',
        builder: buildTuitionFeeReport
    },
    examFee: {
        label: 'Examination Fee',
        description: 'Examination fee invoice',
        builder: buildExamFeeReport
    },
    schoolBus: {
        label: 'School Bus',
        description: 'School bus service fee invoice with route information',
        builder: buildSchoolBusReport
    },
    schoolTrip: {
        label: 'School Trip',
        description: 'School trip fee invoice with trip details (residential trips)',
        builder: buildSchoolTripReport
    },
    eca: {
        label: 'ECA Sport & Music',
        description: 'Extra-curricular activities invoice for sport and music (gymnastics, basketball, piano, etc.)',
        builder: buildEcaReport
    },
    holidayCamp: {
        label: 'Holiday Camp (King\'s Student)',
        description: 'Holiday camp invoice for King\'s College students with early bird discounts',
        builder: buildHolidayCampReport
    },
    holidayCampExternal: {
        label: 'Holiday Camp (External Student)',
        description: 'Holiday camp invoice for external students (simplified layout)',
        builder: buildHolidayCampExternalReport
    },
    studentActivities: {
        label: 'Student Activities',
        description: 'Student activities invoice (e.g. tournaments, competitions)',
        builder: buildStudentActivitiesReport
    }
}

/**
 * Returns all available report types as an array of { key, label, description }.
 */
export function getReportTypes() {
    return Object.entries(REPORT_TYPES).map(([key, config]) => ({
        key,
        label: config.label,
        value: key,
        description: config.description
    }))
}

/**
 * Returns the builder function for a given report type key.
 * @param {string} type - The report type key.
 * @returns {Function|null} The builder function or null if not found.
 */
export function getReportBuilder(type) {
    return REPORT_TYPES[type]?.builder || null
}
