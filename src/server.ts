import { Elysia, t } from 'elysia'
import { Logger } from 'winston'
import { cors } from '@elysiajs/cors'
import logger from '@utils/Logger'
import ResponseUtil from '@utils/ResponseUtil'
import { openapi } from '@elysiajs/openapi'
import routes from '@routes'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(duration)
dayjs.extend(relativeTime)

declare global {
    var logger: Logger
    var version: string
    var ResponseSend: ResponseUtil
    var Dayjs: typeof dayjs
}

const initialize = async () => {
    logger.info('---------------- | Starting KCIS Report Service | ----------------')
    global.logger = logger
    global.ResponseSend = new ResponseUtil()
    global.version = `${require('../package.json').version}`
    global.Dayjs = dayjs

    try {
        const apiDocs = openapi({
            path: '/api-docs',
            documentation: {
                info: {
                    title: 'KCIS Report Service API',
                    description: 'API documentation for KCIS Report Service',
                    version: global.version
                }
            }
        })

        new Elysia({
            serve: {
                idleTimeout: 120
            }
        })
            .use(cors())
            .use(routes)
            .use(apiDocs)
            .listen(Bun.env.PORT || 9500, server => {
                logger.info(
                    `[Server] Service (${globalThis.version}) is running at ${server?.hostname}:${server?.port} 🧋`
                )
            })

        process.on('SIGINT', async () => {
            logger.info('[Server] Gracefully shutting down... 🧊')
        })
    } catch (error: any) {
        logger.error(`[Server] Failed to start service: ${error.message}`)
        logger.error(error.stack)
        process.exit(1)
    }
}

initialize()
