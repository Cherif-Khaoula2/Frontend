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
  ) { 
    console.log('🔵 AuthInterceptor initialisé');
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log('🟢 Requête interceptée:', req.url, req.method);
    
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        console.log('═══════════════════════════════════════');
        console.log('🔴 ERREUR INTERCEPTÉE');
        console.log('Status:', error.status);
        console.log('Message:', error.message);
        console.log('URL:', error.url);
        console.log('Error object:', error);
        console.log('═══════════════════════════════════════');
        
        if (error.status === 401) {
          console.log('⚠️⚠️⚠️ DÉCONNEXION EN COURS ⚠️⚠️⚠️');
          this.storage.clearStorage();
          console.log('✅ localStorage nettoyé');
          this.router.navigate(['/login'], {
            queryParams: { sessionExpired: true }
          });
          console.log('✅ Navigation vers /login lancée');
        } else {
          console.log('❌ Status n\'est pas 401, c\'est:', error.status);
        }
        
        return throwError(() => error);
      })
    );
  }
}