interface TimerOptions {
    ignorePaths?: string[]
    logLevel?: 'info' | 'debug' | 'verbose'
    includeUrl?: boolean
}

export default function timer(options: TimerOptions = {}) {
    const { ignorePaths = ['/favicon.ico'], logLevel = 'info', includeUrl = false } = options

    return async ({ onHandle, context }: any) => {
        const now = Date.now()
        const requestId = `${now.toString(36).slice(-6)}-${Math.random().toString(36).slice(2, 6)}`.toUpperCase()

        const request = context.request
        const method = request.method.toUpperCase()
        const url = new URL(request.url)
        const path = url.pathname
        const queryString = url.search

        context.requestId = requestId
        context.lang = request.headers.get('accept-language')?.split(',')[0] || 'th'
        context.ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'

        onHandle(({ begin, onStop }: any) => {
            context.startTime = begin

            if (ignorePaths.includes(path)) {
                return
            }

            const displayPath = includeUrl ? `${path}${queryString}` : path
            logger[logLevel](`[${requestId}] [\x1b[95mSTART\x1b[0m] ${method} ${displayPath}`)

            if (logLevel === 'debug' || logLevel === 'verbose') {
                const userAgent = request.headers.get('user-agent')
                const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
                logger.debug(`[${requestId}] IP: ${ip}, UA: ${userAgent?.slice(0, 50)}...`)
            }

            onStop(({ end, error }: any) => {
                const duration = Math.round(end - begin)
                const status = error ? '\x1b[91mERROR\x1b[0m' : '\x1b[95mEND\x1b[0m'

                let durationColor = '\x1b[32m'
                if (duration > 1000) durationColor = '\x1b[33m'
                logger[logLevel](`[${requestId}] [${status}] Time used - ${durationColor}${duration}ms\x1b[0m`)

                if (error && (logLevel === 'debug' || logLevel === 'verbose')) {
                    logger.error(`[${requestId}] Error: ${error.message}`)
                }

                if (duration > 30000) {
                    logger.warn(`[${requestId}] ⚠️  Slow request detected: ${duration}ms`)
                }
            })
        })
    }
}
