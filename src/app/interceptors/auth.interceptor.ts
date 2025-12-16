import { Injectable } from '@angular/core';
import { 
  HttpInterceptor, 
  HttpRequest, 
  HttpHandler, 
  HttpEvent, 
  HttpErrorResponse 
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { StorageService } from '../service/storage-service/storage.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private router: Router,
    private storage: StorageService
  ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        // Si le cookie a expiré, le backend retourne 401
        if (error.status === 401) {
          console.log('Session expirée - Déconnexion automatique');
          
          // Nettoyer le localStorage
          this.storage.clearStorage();
          
          // Rediriger vers la page de login
          this.router.navigate(['/login'], {
            queryParams: { sessionExpired: true }
          });
        }
        
        return throwError(() => error);
      })
    );
  }
}