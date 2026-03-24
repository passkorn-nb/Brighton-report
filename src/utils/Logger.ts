import { createLogger, format, LoggerOptions, transports } from 'winston'
import winstonDaily from 'winston-daily-rotate-file'
const { combine, timestamp, printf } = format

const COLORS = {
    info: '\x1b[32m',
    error: '\x1b[31m',
    debug: '\x1b[36m',
    warn: '\x1b[33m',
    verbose: '\x1b[35m',
    silly: '\x1b[37m'
}

type LogLevel = 'info' | 'error' | 'debug' | 'warn' | 'verbose' | 'silly'
type LogMessage = Record<string | symbol, unknown>

const coloredFormat = printf(({ level, message, timestamp }) => {
    const logLevel = level as LogLevel
    const space = level.length <= 5 ? 5 - level.length : 0
    const color = COLORS[logLevel] || '\x1b[37m'
    return `\x1b[37m[${timestamp}]\x1b[0m ${color}${level.toUpperCase()}\x1b[0m${' '.repeat(space)}: ${message}`
})

const stripColorsFormat = printf(({ level, message, timestamp }) => {
    let msgStr = String(message)
    if (typeof message === 'object' && message !== null) {
        const msg = message as LogMessage
        const symbolMessage = Object.getOwnPropertySymbols(msg).find(sym => sym.description === 'message')

        if (symbolMessage && symbolMessage in msg) {
            const rawMessage = String(msg[symbolMessage])
            msgStr = rawMessage.replace(/\u001b\[[0-9;]*m/g, '')
            if (msgStr.length > 29) {
                msgStr = msgStr.substring(29, msgStr.length - 1)
            }
        }
    }

    if (/\u001b\[[0-9;]*m/g.test(msgStr)) {
        msgStr = msgStr.replace(/\u001b\[[0-9;]*m/g, '')
    }

    const space = 5 - level.length > 0 ? 5 - level.length : 0
    return `[${timestamp}] ${level.toUpperCase()}${' '.repeat(space)}: ${msgStr}`
})

const loggerConfig: LoggerOptions = {
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format(info => {
            info.originalMessage = info.message
            return info
        })(),
        coloredFormat
    ),
    transports: [
        new transports.Console(),
        new winstonDaily({
            datePattern: 'YYYY-MM-DD',
            dirname: './logs',
            filename: `%DATE%.log`,
            maxFiles: 30,
            json: false,
            auditFile: './logs/.audit.json',
            zippedArchive: true,
            format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), stripColorsFormat)
        })
    ]
}

if (Bun.env.DEBUG_MODE === 'true') {
    loggerConfig.levels = { verbose: 1, debug: 1, info: 1, warn: 1, error: 1 }
} else {
    loggerConfig.level = 'info'
}

const logger = createLogger(loggerConfig)

export default logger
