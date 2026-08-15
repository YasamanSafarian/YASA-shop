import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { from, throwError } from 'rxjs';
import { catchError, mergeMap } from 'rxjs/operators';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * Attaches the JWT access token to outgoing requests and transparently
 * refreshes the session when a request is rejected with 401 (except for
 * auth endpoints, which are handled by AuthService itself).
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);

  const token = auth.accessToken();
  if (token) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const isAuthEndpoint = req.url.includes('/auth/');
      if (error.status === 401 && !isAuthEndpoint && !req.headers.has('X-Yasa-Retry')) {
        return from(auth.refresh()).pipe(
          mergeMap((refreshed) => {
            if (!refreshed) {
              return throwError(() => error);
            }
            const retried = req.clone({
              headers: req.headers.set('X-Yasa-Retry', '1'),
              setHeaders: { Authorization: `Bearer ${auth.accessToken()}` },
            });
            return next(retried);
          }),
        );
      }
      return throwError(() => error);
    }),
  );
};
