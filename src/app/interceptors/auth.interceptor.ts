import { Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AuthService } from '../services/auth.service';
import { rewriteLocalhostApiUrl } from '../config/api.config';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService, private router: Router) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    const rewrittenUrl = rewriteLocalhostApiUrl(request.url);
    const baseRequest =
      rewrittenUrl !== request.url
        ? request.clone({ url: rewrittenUrl })
        : request;

    const isAuthEndpoint = /\/auth\/(login|register)\b/.test(baseRequest.url);
    const token = this.authService.getToken();

    // Never attach a stale Bearer token to login/register.
    const authRequest =
      token && !isAuthEndpoint
        ? baseRequest.clone({
            setHeaders: {
              Authorization: `Bearer ${token}`,
            },
          })
        : baseRequest;

    return next.handle(authRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        if (
          error.status === 401 &&
          !isAuthEndpoint &&
          !baseRequest.url.includes('/notifications/') &&
          this.authService.isLoggedIn()
        ) {
          this.authService.logout();
          this.router.navigate(['/auth/login']);
        }

        return throwError(() => error);
      })
    );
  }
}
