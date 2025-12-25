import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { catchError, map, Observable } from 'rxjs';
import { StorageService } from './storage-service/storage.service';
import { Router } from '@angular/router';

const BASE_URL = "https://cmeapp.sarpi-dz.com/api/user/";

@Injectable({
  providedIn: 'root'
})
export class JwtService {
  private tokenExpirationTimer: any;

  constructor(
    private http: HttpClient, 
    private storage: StorageService, 
    private router: Router
  ) {
    // Vérifier le token au démarrage de l'application
    this.checkTokenOnInit();
  }

  // Vérifier si le token existe et n'est pas expiré au démarrage
  checkTokenOnInit() {
    const user = this.storage.getUser();
    if (user && user.token) {
      if (this.isTokenExpired(user.token)) {
        this.logout();
      } else {
        this.startTokenExpirationTimer(user.token);
      }
    }
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post<HttpResponse<any>>(
      `${BASE_URL}authenticate`, 
      { email, password }, 
      { observe: 'response', withCredentials: true }
    ).pipe(
      map((res: HttpResponse<any>) => {
        const userData = res.body;

        if (userData) {
          this.storage.saveUser(userData);

          // Stocker les rôles et permissions dans le localStorage
          const roles = userData.roles || [];
          this.storage.saveRoles(roles);

          const permissions = userData.permissions || [];
          this.storage.savePermissions(permissions);

          // Démarrer le timer de déconnexion automatique
          const token = userData.token || this.storage.getToken();
          if (token) {
            this.startTokenExpirationTimer(token);
          }
        }

        return res;
      }),
      catchError((error) => {
        this.router.navigate(['/login']);
        throw error;
      })
    );
  }

  // Décoder le token JWT pour obtenir la date d'expiration
  private getTokenExpirationDate(token: string): Date | null {
    try {
      // Vérifier que le token existe et a le bon format
      if (!token || typeof token !== 'string') {
        console.error('Token invalide ou manquant');
        return null;
      }

      const parts = token.split('.');
      if (parts.length !== 3) {
        console.error('Format de token invalide (doit avoir 3 parties)');
        return null;
      }

      // Nettoyer le token (supprimer "Bearer " si présent)
      let cleanToken = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      
      // Ajouter le padding si nécessaire
      while (cleanToken.length % 4) {
        cleanToken += '=';
      }

      const payload = JSON.parse(atob(cleanToken));
      
      if (payload.exp) {
        return new Date(payload.exp * 1000);
      }
      
      console.warn('Token JWT sans date d\'expiration (exp)');
      return null;
    } catch (e) {
      console.error('Erreur lors du décodage du token:', e);
      return null;
    }
  }

  // Vérifier si le token est expiré
  private isTokenExpired(token: string): boolean {
    const expirationDate = this.getTokenExpirationDate(token);
    if (!expirationDate) {
      return true;
    }
    return expirationDate <= new Date();
  }

  // Démarrer le timer pour la déconnexion automatique
  private startTokenExpirationTimer(token: string) {
    // Arrêter le timer existant s'il y en a un
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }

    const expirationDate = this.getTokenExpirationDate(token);
    if (!expirationDate) {
      this.logout();
      return;
    }

    const timeout = expirationDate.getTime() - new Date().getTime();

    // Si le token est déjà expiré
    if (timeout <= 0) {
      this.logout();
      return;
    }

    // Programmer la déconnexion automatique
    this.tokenExpirationTimer = setTimeout(() => {
      console.log('Token expiré - Déconnexion automatique');
      this.logout();
    }, timeout);

    const minutes = Math.round(timeout / 60000);
    console.log(`Déconnexion automatique programmée dans ${minutes} minutes`);
  }

  // Vérifier si le token est valide (pour les guards)
  isTokenValid(): boolean {
    const user = this.storage.getUser();
    if (!user || !user.token) {
      return false;
    }
    if (this.isTokenExpired(user.token)) {
      this.logout();
      return false;
    }
    return true;
  }

  logout(): void {
    // Arrêter le timer
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }

    // Nettoyer le storage
    this.storage.clearStorage();

    // Appeler le backend pour logout
    this.http.get(`${BASE_URL}logout`, { withCredentials: true }).subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: () => {
        // Même en cas d'erreur, rediriger vers login
        this.router.navigate(['/login']);
      }
    });
  }
}