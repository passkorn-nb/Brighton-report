import { buildTuitionFeeReport } from './tuitionFeeReport'
import { buildExamFeeReport } from './examFeeReport'
import { buildSchoolBusReport } from './schoolBusReport'
import { buildSchoolTripReport } from './schoolTripReport'
import { buildEcaReport } from './ecaReport'
import { buildHolidayCampReport } from './holidayCampReport'
import { buildHolidayCampExternalReport } from './holidayCampExternalReport'
import { buildExternalInvoiceReport } from './externalInvoiceReport'
import { buildStudentActivitiesReport } from './studentActivitiesReport'
import { buildReceiptReport } from './receiptReport'
import { buildReceiptTaxInvoiceReport } from './receiptTaxInvoiceReport'

export enum ReportType {
    TUITION_FEE = 'TUITION_FEE',
    EXAM_FEE = 'EXAM_FEE',
    SCHOOL_BUS = 'SCHOOL_BUS',
    SCHOOL_TRIP = 'SCHOOL_TRIP',
    ECA = 'ECA',
    HOLIDAY_CAMP = 'HOLIDAY_CAMP',
    HOLIDAY_CAMP_EXTERNAL = 'HOLIDAY_CAMP_EXTERNAL',
    EXTERNAL_INVOICE = 'EXTERNAL_INVOICE',
    STUDENT_ACTIVITIES = 'STUDENT_ACTIVITIES',
    RECEIPT = 'RECEIPT',
    RECEIPT_TAX_INVOICE = 'RECEIPT_TAX_INVOICE'
}

/**
 * Registry of available KCIS invoice report types.
 * Each entry maps a key to a label, description, and builder function.
 */
export const REPORT_TYPES: Record<string, { label: string; description: string; builder: (data?: any) => any }> = {
    [ReportType.TUITION_FEE]: {
        label: 'Tuition Fee',
        description:
            'Tuition fee invoice with registration waivers, sibling discounts, credit notes, and ID card charges',
        builder: buildTuitionFeeReport
    },
    [ReportType.EXAM_FEE]: {
        label: 'Examination Fee',
        description: 'Examination fee invoice',
        builder: buildExamFeeReport
    },
    [ReportType.SCHOOL_BUS]: {
        label: 'School Bus',
        description: 'School bus service fee invoice with route information',
        builder: buildSchoolBusReport
    },
    [ReportType.SCHOOL_TRIP]: {
        label: 'School Trip',
        description: 'School trip fee invoice with trip details (residential trips)',
        builder: buildSchoolTripReport
    },
    [ReportType.ECA]: {
        label: 'CCA Sport & Music',
        description: 'Extra-curricular activities invoice for sport and music (gymnastics, basketball, piano, etc.)',
        builder: buildEcaReport
    },
    [ReportType.HOLIDAY_CAMP]: {
        label: 'Holiday Camp (Enrolled Student)',
        description: 'Holiday camp invoice for Brighton College Bangkok students with early bird discounts',
        builder: buildHolidayCampReport
    },
    [ReportType.HOLIDAY_CAMP_EXTERNAL]: {
        label: 'Holiday Camp (External Student)',
        description: 'Holiday camp invoice for external students (simplified layout)',
        builder: buildHolidayCampExternalReport
    },
    [ReportType.EXTERNAL_INVOICE]: {
        label: 'External Invoice',
        description: 'External client invoice with 6-column line items, dual bank, VAT row, and Nominally signature',
        builder: buildExternalInvoiceReport
    },
    [ReportType.STUDENT_ACTIVITIES]: {
        label: 'Student Activities',
        description: 'Student activities invoice (e.g. tournaments, competitions)',
        builder: buildStudentActivitiesReport
    },
    [ReportType.RECEIPT]: {
        label: 'Receipt',
        description: 'Payment receipt with invoice/credit-note breakdown, overpayment, and signatures',
        builder: buildReceiptReport
    },
    [ReportType.RECEIPT_TAX_INVOICE]: {
        label: 'Receipt / Tax Invoice',
        description:
            'Bilingual ใบเสร็จรับเงิน / ใบกำกับภาษี on the school\'s pre-printed form — VAT breakdown, Buddhist-era date, Thai amount in words',
        builder: buildReceiptTaxInvoiceReport
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
 */
export function getReportBuilder(type: string) {
    return REPORT_TYPES[type]?.builder || null
}
