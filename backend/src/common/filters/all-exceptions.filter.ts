import {
  ExceptionFilter, Catch, ArgumentsHost,
  HttpException, HttpStatus, Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorDetail: any = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || message;
        errorDetail = (exceptionResponse as any).error;
      }
    }
    // TypeORM database errors
    else if (exception && typeof exception === 'object' && 'code' in exception) {
      const typeormError = exception as any;
      switch (typeormError.code) {
        case '23505': // postgres unique constraint
          status = HttpStatus.CONFLICT;
          message = 'Record with unique field already exists';
          errorDetail = typeormError.detail;
          break;
        case '23503': // postgres foreign key constraint
          status = HttpStatus.BAD_REQUEST;
          message = 'Foreign key constraint violation';
          errorDetail = typeormError.detail;
          break;
        default:
          message = 'Database error';
          errorDetail = typeormError.message;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    if (status >= 500) {
      this.logger.error(
        `[${request.method}] ${request.url} - ${status}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    } else {
      this.logger.warn(`[${request.method}] ${request.url} - ${status} - ${message}`);
    }

    response.status(status).json({
      statusCode: status,
      message: Array.isArray(message) ? message[0] : message,
      error: errorDetail || message,
      timestamp: new Date().toISOString(),
      path: request.url,
      ...(process.env.NODE_ENV !== 'production' && exception instanceof Error
        ? { stack: exception.stack }
        : {}),
    });
  }
}
