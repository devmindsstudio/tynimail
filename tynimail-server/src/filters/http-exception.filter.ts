import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const res = ctx.getResponse<Response>();
        const status =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;
        let payload: { statusCode: number; message: string; [k: string]: unknown };
        if (exception instanceof HttpException) {
            const body = exception.getResponse();
            if (typeof body === 'string') {
                payload = { statusCode: status, message: body };
            } else if (typeof body === 'object' && body !== null) {
                const obj = body as Record<string, unknown>;
                payload = { statusCode: status, message: (obj.message as string) ?? 'Request failed.', ...obj };
            } else {
                payload = { statusCode: status, message: 'Request failed.' };
            }
        } else {
            payload = { statusCode: status, message: 'Something went wrong. Please try again.' };
            this.logger.error(exception);
        }
        res.status(status).json(payload);
    }
}
