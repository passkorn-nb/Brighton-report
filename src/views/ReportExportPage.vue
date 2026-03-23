<script>
import { generateReport, getReportTypes } from '@/utils/PDFGenerator'
import { fetchReportData } from '@/services/reportService'

export default {
    name: 'ReportExportPage',

    data() {
        return {
            reportTypes: [],
            selectedType: '',
            selectedVariation: 'both',
            loading: false,
            error: ''
        }
    },

    mounted() {
        this.reportTypes = getReportTypes()
        if (this.reportTypes.length) {
            this.selectedType = this.reportTypes[0].value
        }
    },

    methods: {
        async handleExport() {
            if (!this.selectedType) return

            this.loading = true
            this.error = ''

            try {
                const params = this.selectedType === 'tuitionFee' ? { variation: this.selectedVariation } : {}
                const data = await fetchReportData(this.selectedType, params)
                const report = generateReport(this.selectedType, data)
                report.download()
            } catch (err) {
                this.error = err.message || 'Failed to generate report'
            } finally {
                this.loading = false
            }
        },

        async handlePreview() {
            if (!this.selectedType) return

            this.loading = true
            this.error = ''

            try {
                const params = this.selectedType === 'tuitionFee' ? { variation: this.selectedVariation } : {}
                const data = await fetchReportData(this.selectedType, params)
                const report = generateReport(this.selectedType, data)
                report.open()
            } catch (err) {
                this.error = err.message || 'Failed to generate report'
            } finally {
                this.loading = false
            }
        },

        getSelectedLabel() {
            const found = this.reportTypes.find(r => r.value === this.selectedType)
            return found ? found.label : ''
        },

        getVariationLabel() {
            const variations = {
                standard: 'Standard (No Discounts)',
                creditNote: 'With Credit Note',
                sibling: 'With Sibling Discount',
                both: 'With Credit Note & Sibling Discount'
            }
            return variations[this.selectedVariation] || 'Select variation'
        }
    }
}
</script>

<template>
    <div class="min-h-screen bg-background p-6 flex items-start justify-center">
        <LoadingOverlay :show="loading" />

        <Card class="w-full max-w-lg mt-12">
            <CardHeader>
                <CardTitle class="text-xl font-semibold text-foreground">
                    <div class="flex items-center gap-2">
                        <LucideFileText class="w-5 h-5" />
                        Export Report
                    </div>
                </CardTitle>
                <CardDescription class="text-muted-foreground">
                    Select a report type and export as PDF
                </CardDescription>
            </CardHeader>

            <CardContent class="flex flex-col gap-4">
                <div>
                    <label class="block text-sm font-medium text-foreground mb-2">Report Type</label>
                    <Select v-model="selectedType">
                        <SelectTrigger class="w-full">
                            <SelectValue :placeholder="getSelectedLabel() || 'Select report type'" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem v-for="type in reportTypes" :key="type.value" :value="type.value">
                                {{ type.label }}
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div v-if="selectedType === 'tuitionFee'">
                    <label class="block text-sm font-medium text-foreground mb-2">Mock Variation</label>
                    <Select v-model="selectedVariation">
                        <SelectTrigger class="w-full">
                            <SelectValue :placeholder="getVariationLabel()" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="standard">Standard (No Discounts)</SelectItem>
                            <SelectItem value="creditNote">With Credit Note</SelectItem>
                            <SelectItem value="sibling">With Sibling Discount</SelectItem>
                            <SelectItem value="both">With Credit Note & Sibling Discount</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div v-if="selectedType" class="rounded-lg border border-border bg-muted/30 p-3">
                    <p class="text-sm text-muted-foreground">
                        {{ reportTypes.find(r => r.value === selectedType)?.description }}
                    </p>
                </div>

                <div v-if="error" class="rounded-lg border border-red-200 bg-red-50 p-3">
                    <p class="text-sm text-red-600">{{ error }}</p>
                </div>
            </CardContent>

            <CardFooter class="flex gap-3 justify-end border-t pt-4">
                <Button variant="outline" :disabled="!selectedType || loading" @click="handlePreview">
                    <LucideEye class="w-4 h-4" />
                    Preview
                </Button>
                <Button variant="primary" :disabled="!selectedType || loading" :loading="loading" @click="handleExport">
                    <LucideDownload class="w-4 h-4" />
                    Export PDF
                </Button>
            </CardFooter>
        </Card>
    </div>
</template>
