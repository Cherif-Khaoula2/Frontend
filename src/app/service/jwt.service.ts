import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { catchError, map, Observable, tap } from 'rxjs';
import { StorageService } from './storage-service/storage.service';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

const BASE_URL = "https://cmeapp.sarpi-dz.com/api/user/";

interface DecodedToken {
  sub: string;
  exp: number;
  iat: number;
  userId: number;
  roles: string[];
  permissions: string[];
}

@Injectable({
  providedIn: 'root'
})
export class JwtService {

  constructor(
    private http: HttpClient, 
    private storage: StorageService, 
    private router: Router
  ) { }

  login(email: string, password: string): Observable<any> {
    return this.http.post<HttpResponse<any>>(
      `${BASE_URL}authenticate`, 
      { email, password }, 
      { observe: 'response', withCredentials: true }
    ).pipe(
      tap(() => this.logAuthentication('User Authentication')),
      map((res: HttpResponse<any>) => {
        const userData = res.body;

        if (userData) {
          // Décoder le JWT depuis le cookie (si nécessaire)
          // Note: Le JWT est dans le cookie, donc on peut extraire les infos du body
          this.storage.saveUser(userData);

          // Stocker les rôles et permissions
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
        
        // Afficher un message d'erreur si c'est une session expirée
        if (error.status === 401) {
          console.error('Session expirée');
        }
        
        this.router.navigate(['/login']);
        throw error;
      })
    );
  }

  logout(): void {
    this.storage.clearStorage();
    this.http.get(`${BASE_URL}logout`, { withCredentials: true }).subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Erreur lors de la déconnexion:', error);
        // Rediriger quand même vers login
        this.router.navigate(['/login']);
      }
    });
  }

  /**
   * Vérifie si le token est toujours valide
   */
  isTokenValid(): boolean {
    const user = this.storage.getUser();
    if (!user) {
      return false;
    }

    // Si vous avez l'expiration dans userData
    if (user.exp) {
      const expirationTime = user.exp * 1000;
      return Date.now() < expirationTime;
    }

    return true;
  }

  logAuthentication(message: string): void {
    // Log d'authentification
  }
}