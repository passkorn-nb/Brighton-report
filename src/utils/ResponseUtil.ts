import { Context } from 'elysia'
import { HttpStatusCode } from 'axios'
import ResponseStatus from '@constants/ResponseStatus'

export default class ResponseUtil {
    public success(ctx: Context, msg?: string, body?: any, statusCode: number = HttpStatusCode.Ok) {
        ctx.set.status = statusCode
        return {
            status: ResponseStatus.OK,
            message: msg,
            data: body || null
        }
    }

    public error(ctx: Context, msg: string, statusCode: number = HttpStatusCode.InternalServerError) {
        ctx.set.status = statusCode
        return {
            status: ResponseStatus.ERROR,
            message: msg
        }
    }

    public errors(ctx: Context, msg: string, detail: any, statusCode: number = HttpStatusCode.UnprocessableEntity) {
        ctx.set.status = statusCode
        return {
            status: ResponseStatus.ERRORS,
            message: msg,
            detail: detail
        }
    }

    public warning(ctx: Context, msg: string, statusCode: number = HttpStatusCode.Conflict) {
        ctx.set.status = statusCode
        return {
            status: ResponseStatus.WARNING,
            message: msg
        }
    }

    public svgImage(svg: string) {
        return new Response(svg, {
            headers: {
                'Content-Type': 'image/svg+xml',
                'Content-Disposition': `inline; filename="qrcode.svg"`
            }
        })
    }

    public paginate(
        ctx: Context,
        msg: string,
        items: any,
        total: number,
        optional: any = {},
        statusCode: number = HttpStatusCode.Ok
    ) {
        ctx.set.status = statusCode
        return {
            status: ResponseStatus.OK,
            message: msg,
            data: {
                items,
                total,
                optional
            }
        }
    }
}
