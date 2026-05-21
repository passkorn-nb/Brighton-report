export function formatYearGroupLabel(yg?: string | null): string {
    if (!yg) return ''
    const trimmed = String(yg).trim()
    if (!trimmed) return ''
    switch (trimmed) {
        case 'PN':
            return 'Pre-nursery'
        case 'NS':
            return 'Nursery'
        case 'RC':
            return 'Reception'
    }
    const m = trimmed.match(/^Y(\d{1,2})$/)
    if (m) return `Year ${parseInt(m[1], 10)}`
    return trimmed
}
