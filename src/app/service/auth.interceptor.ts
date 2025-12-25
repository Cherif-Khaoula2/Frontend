import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { StorageService } from './storage-service/storage.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const storage = inject(StorageService);

  // Ajouter withCredentials à toutes les requêtes
  const clonedRequest = req.clone({
    withCredentials: true
  });

  return next(clonedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      // Déconnexion automatique en cas d'erreur 401 ou 403
      if (error.status === 401 || error.status === 403) {
        storage.clearStorage();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};