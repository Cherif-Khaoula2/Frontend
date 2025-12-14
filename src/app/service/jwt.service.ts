import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { catchError, map, Observable, tap } from 'rxjs';
import { StorageService } from './storage-service/storage.service';
import { Router } from '@angular/router';

const BASE_URL = "https://cmeapp.sarpi-dz.com/api/user/";

@Injectable({
  providedIn: 'root'
})
export class JwtService {

  constructor(private http: HttpClient, private storage: StorageService, private router: Router) { }

  login(email: string, password: string): Observable<any> {
    return this.http.post<HttpResponse<any>>(`${BASE_URL}authenticate`, { email, password }, { observe: 'response', withCredentials: true })
      .pipe(
        tap(() => this.logAuthentication('User Authentication')),
        map((res: HttpResponse<any>) => {
          const userData = res.body;

          if (userData) {
            this.storage.saveUser(userData);

            // Stocker les rôles et permissions dans le localStorage
            const roles = userData.roles || [];
            this.storage.saveRoles(roles);

            const permissions = userData.permissions || [];
            this.storage.savePermissions(permissions);
          } else {
            console.error('Erreur: Données utilisateur non disponibles');
          }

          return res;
        }),
        catchError((error) => {
          console.error('Authentication failed', error);
          this.router.navigate(['/login']);
          throw error;
        })
      );
  }

  logout(): void {
    this.storage.clearStorage();
    this.http.get(`${BASE_URL}logout`, { withCredentials: true }).subscribe(() => {
      this.router.navigate(['/login']);
    });
  }

  logAuthentication(message: string): void {
    console.log(message);
  }
}
