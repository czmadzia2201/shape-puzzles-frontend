import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError, switchMap } from 'rxjs';
import { AuthService } from '../services/auth-service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  const shouldSkipAuth =
    req.url.includes('/auth/login') ||
    req.url.includes('/auth/refresh');

  if (shouldSkipAuth) {
    return next(req);
  }

  const accessToken = authService.getAccessToken();

  const requestToSend = accessToken
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${accessToken}`
        }
      })
    : req;

  return next(requestToSend).pipe(
    catchError(error => {
      if (error.status !== 401) {
        return throwError(() => error);
      }

      const refreshToken = authService.getRefreshToken();

      if (!refreshToken) {
        authService.clearTokens();
        return throwError(() => error);
      }

      return authService.refresh({ refreshToken }).pipe(
        switchMap(response => {
          const retriedRequest = req.clone({
            setHeaders: {
              Authorization: `Bearer ${response.accessToken}`
            }
          });

          return next(retriedRequest);
        }),
        catchError(refreshError => {
          authService.clearTokens();
          return throwError(() => refreshError);
        })
      );
    })
  );
};
