import { t } from 'elysia'

export const ListReportTypesEntity = {
    detail: {
        summary: 'List Report Types',
        description: 'Returns all available PDF report types with labels and descriptions',
        tags: ['Report']
    }
}

export const GenerateReportEntity: any = {
    detail: {
        summary: 'Generate PDF Report',
        description: 'Generates a PDF invoice report based on the specified report type and data',
        tags: ['Report']
    },
    query: t.Object({
        base64: t.Optional(
            t.Boolean({ description: 'If true, returns the PDF as a base64 string instead of a file download' })
        ),
        stream: t.Optional(
            t.Boolean({ description: 'If true, returns a stream of progress updates and the final PDF as base64' })
        )
    }),
    body: t.Object({
        reportType: t.String({ description: 'Report type key (e.g. tuitionFee, examFee, schoolBus)' }),
        data: t.Optional(t.Any({ description: 'Report data matching the template shape' }))
    })
}
