import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

const USER = "c_user";
const ROLES = "c_roles";
const PERMISSIONS = "c_permissions";
const TOKEN_EXPIRY = "c_token_expiry";

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private logoutTimer: any;

  constructor(private router: Router) {
    this.checkTokenExpiry(); // Vérifier au démarrage
  }

  // Méthode pour enregistrer l'utilisateur
  saveUser(user: any): void {
    window.localStorage.setItem(USER, JSON.stringify(user));
    
    // Enregistrer le temps d'expiration (timestamp actuel + 3600 secondes)
    const expiryTime = Date.now() + (3600 * 1000); // 1 heure en millisecondes
    localStorage.setItem(TOKEN_EXPIRY, expiryTime.toString());
    
    // Démarrer le timer de déconnexion automatique
    this.startLogoutTimer();
  }

  // Démarrer le timer de déconnexion
  private startLogoutTimer(): void {
    // Nettoyer le timer existant s'il y en a un
    if (this.logoutTimer) {
      clearTimeout(this.logoutTimer);
    }

    const expiryTime = localStorage.getItem(TOKEN_EXPIRY);
    if (expiryTime) {
      const timeLeft = parseInt(expiryTime) - Date.now();
      
      if (timeLeft > 0) {
        // Définir un timer pour déconnecter automatiquement
        this.logoutTimer = setTimeout(() => {
          this.autoLogout();
        }, timeLeft);
      } else {
        // Le token a déjà expiré
        this.autoLogout();
      }
    }
  }

  // Déconnexion automatique
  private autoLogout(): void {
    this.clearStorage();
    this.router.navigate(['/login']);
    alert('Votre session a expiré. Veuillez vous reconnecter.');
  }

  // Vérifier si le token a expiré
  checkTokenExpiry(): void {
    const expiryTime = localStorage.getItem(TOKEN_EXPIRY);
    if (expiryTime) {
      const timeLeft = parseInt(expiryTime) - Date.now();
      
      if (timeLeft <= 0) {
        this.autoLogout();
      } else {
        this.startLogoutTimer();
      }
    }
  }

  // Récupérer l'utilisateur
  getUser(): any {
    const user = localStorage.getItem(USER);
    return user ? JSON.parse(user) : null;
  }

  // Enregistrer les rôles
  saveRoles(roles: string[]): void {
    localStorage.setItem(ROLES, JSON.stringify(roles));
  }

  // Récupérer les rôles
  getRoles(): string[] {
    const roles = localStorage.getItem(ROLES);
    return roles ? JSON.parse(roles) : [];
  }

  // Enregistrer les permissions
  savePermissions(permissions: string[]): void {
    localStorage.setItem(PERMISSIONS, JSON.stringify(permissions));
  }

  // Récupérer les permissions
  getPermissions(): string[] {
    const permissions = localStorage.getItem(PERMISSIONS);
    return permissions ? JSON.parse(permissions) : [];
  }

  // Effacer toutes les données de l'utilisateur (déconnexion)
  clearStorage(): void {
    if (this.logoutTimer) {
      clearTimeout(this.logoutTimer);
    }
    localStorage.removeItem(USER);
    localStorage.removeItem(ROLES);
    localStorage.removeItem(PERMISSIONS);
    localStorage.removeItem(TOKEN_EXPIRY);
  }

  // Vérifie si l'utilisateur est connecté
  isLoggedIn(): boolean {
    const user = localStorage.getItem(USER);
    const expiryTime = localStorage.getItem(TOKEN_EXPIRY);
    
    if (!user || !expiryTime) {
      return false;
    }
    
    // Vérifier si le token n'a pas expiré
    if (parseInt(expiryTime) <= Date.now()) {
      this.clearStorage();
      return false;
    }
    
    return true;
  }

  // Récupérer le rôle de l'utilisateur
  getUserRole(): string {
    const roles = this.getRoles();
    return roles.length > 0 ? roles[0] : 'USER';
  }

  getUserId(): number | null {
    const user = this.getUser();
    return user?.userId ?? null;
  }
}