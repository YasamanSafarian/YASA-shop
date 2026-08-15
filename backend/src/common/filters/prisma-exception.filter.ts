import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

interface DriverAdapterError {
  cause?: {
    originalCode?: string;
  };
}

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(
    exception: Prisma.PrismaClientKnownRequestError,
    host: ArgumentsHost,
  ): void {
    const response = host.switchToHttp().getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'internal server error';

    if (exception.code === 'P2002') {
      status = HttpStatus.CONFLICT;
      message = 'duplicate value already exists';
    } else if (exception.code === 'P2003') {
      status = HttpStatus.BAD_REQUEST;
      message = 'invalid reference';
    } else if (exception.code === 'P2025') {
      status = HttpStatus.NOT_FOUND;
      message = 'record not found';
    }

    const driverError = exception.meta?.driverAdapterError as
      DriverAdapterError | undefined;
    if (driverError?.cause?.originalCode === '23514') {
      status = HttpStatus.BAD_REQUEST;
      message =
        'value violates a database constraint (e.g. compare price must not exceed price)';
    }

    response.status(status).json({
      statusCode: status,
      message,
    });
  }
}
