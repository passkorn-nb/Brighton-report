import { t } from 'elysia'

export const HealthCheckEntity = {
    detail: {
        summary: 'Health Check Endpoint',
        description: 'Heartbeat for monitor service status',
        tags: ['Health Check']
    }
}

export const ServiceInfoEntity = {
    detail: {
        summary: 'Service Information Endpoint',
        description: 'Service Info',
        tags: ['Health Check'],
        responses: {
            200: {
                description: 'OK',
                content: {
                    'application/json': {
                        schema: t.Object({
                            status: t.String({ default: 'ok' }),
                            version: t.String({ default: '1.0.0' }),
                            message: t.String({ default: 'Service is running' }),
                            database: t.String({ default: 'Database healthy' }),
                            uptime: t.String({ default: 0 })
                        })
                    }
                }
            }
        }
    }
}
