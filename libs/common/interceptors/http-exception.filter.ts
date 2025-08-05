import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import mongoose from 'mongoose';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        console.log('🔥 AllExceptionsFilter called with:', exception);

        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message: any = 'Internal server error';
        let errors: any = null;

        // Handle known HTTP exceptions
        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const responseMessage = exception.getResponse();
            message =
                typeof responseMessage === 'string'
                    ? responseMessage
                    : (responseMessage as any).message || responseMessage;
        }

        // Handle Mongoose ValidationError
        else if (exception instanceof mongoose.Error.ValidationError) {
            console.log('🔥 ValidationError caught:', exception);
            status = HttpStatus.BAD_REQUEST;
            message = 'Validation failed';
            errors = Object.entries(exception.errors).map(([field, error]) => ({
                field,
                kind: (error as any).kind,
                message: (error as any).message,
                path: (error as any).path,
                value: (error as any).value,
            }));
        }

        // Handle Mongoose CastError (invalid ObjectId, etc.)
        else if (exception instanceof mongoose.Error.CastError) {
            status = HttpStatus.BAD_REQUEST;
            message = 'Invalid data format';
            errors = [{
                field: (exception as any).path,
                message: (exception as any).message,
                value: (exception as any).value,
            }];
        }

        // Log full details for debugging
        console.error('Exception caught by AllExceptionsFilter:', {
            name: (exception as any)?.name,
            message: (exception as any)?.message,
            stack: (exception as any)?.stack,
        });

        const responseBody: any = {
            success: false,
            message,
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
        };

        // Add errors array if validation errors exist
        if (errors) {
            responseBody.errors = errors;
        }

        response.status(status).json(responseBody);
    }
}
