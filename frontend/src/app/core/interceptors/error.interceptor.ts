import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface ApiError {
  status: number;
  message: string;
  details?: string[];
}

/** Normalizes backend / transport errors into a user-friendly ApiError. */
export const errorInterceptor: HttpInterceptorFn = (req, next) =>
  next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error instanceof HttpErrorResponse) {
        const body = error.error as { message?: string | string[] } | null;
        const rawMessage = body?.message;
        const message = Array.isArray(rawMessage)
          ? rawMessage.join(' ')
          : (rawMessage ?? error.message ?? 'Something went wrong.');
        const normalized: ApiError = {
          status: error.status,
          message,
          details: Array.isArray(rawMessage) ? rawMessage : undefined,
        };
        return throwError(() => normalized);
      }
      return throwError(() => error);
    }),
  );
