import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { StorageService } from './storage-service/storage.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const storage = inject(StorageService);

  // ✅ Cloner la requête et ajouter withCredentials: true
  const clonedRequest = req.clone({
    withCredentials: true
  });

  return next(clonedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Token expiré côté serveur
        storage.clearStorage();
        router.navigate(['/login']);
        alert('Votre session a expiré. Veuillez vous reconnecter.');
      } else if (error.status === 403) {
        // Accès refusé
        console.error('Accès refusé (403) :', error.url);
        alert('Vous n\'avez pas les permissions nécessaires.');
      }
      return throwError(() => error);
    })
  );
};