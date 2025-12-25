// auth.interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { JwtService } from './jwt.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const jwtService = inject(JwtService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si le serveur retourne 401 ou 403, déconnecter automatiquement
      if (error.status === 401 || error.status === 403) {
        console.log('Session expirée - Code:', error.status);
        jwtService.logout();
      }
      return throwError(() => error);
    })
  );
};