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
    console.log('🔵 StorageService initialisé');
    this.checkTokenExpiry();
  }

  saveUser(user: any): void {
    console.log('💾 Sauvegarde de l\'utilisateur');
    window.localStorage.setItem(USER, JSON.stringify(user));
    
    const expiryTime = Date.now() + (60 * 60 * 1000); 
    localStorage.setItem(TOKEN_EXPIRY, expiryTime.toString());
    
    console.log('⏰ Token expire dans 60 secondes à:', new Date(expiryTime));
    
    this.startLogoutTimer();
  }

  private startLogoutTimer(): void {
    console.log('🚀 Démarrage du timer de déconnexion');
    
    if (this.logoutTimer) {
      clearTimeout(this.logoutTimer);
      console.log('🔄 Timer précédent nettoyé');
    }

    const expiryTime = localStorage.getItem(TOKEN_EXPIRY);
    if (expiryTime) {
      const timeLeft = parseInt(expiryTime) - Date.now();
      
      console.log(`⏳ Temps restant: ${Math.floor(timeLeft / 1000)} secondes`);
      
      if (timeLeft > 0) {
        this.logoutTimer = setTimeout(() => {
          console.log('⏰ Timer expiré - Déconnexion automatique');
          this.autoLogout();
        }, timeLeft);
        console.log('✅ Timer configuré pour', Math.floor(timeLeft / 1000), 'secondes');
      } else {
        console.log('❌ Token déjà expiré');
        this.autoLogout();
      }
    } else {
      console.log('❌ Pas de TOKEN_EXPIRY trouvé');
    }
  }

  private autoLogout(): void {
    console.log('🚪 Déconnexion automatique en cours...');
    this.clearStorage();
    this.router.navigate(['/login']);
    console.log('✅ Redirection vers /login');
  }

  checkTokenExpiry(): void {
    console.log('🔍 Vérification de l\'expiration du token');
    const expiryTime = localStorage.getItem(TOKEN_EXPIRY);
    
    if (expiryTime) {
      const timeLeft = parseInt(expiryTime) - Date.now();
      console.log(`⏳ Temps restant: ${Math.floor(timeLeft / 1000)} secondes`);
      
      if (timeLeft <= 0) {
        console.log('❌ Token expiré - Déconnexion');
        this.autoLogout();
      } else {
        this.startLogoutTimer();
      }
    } else {
      console.log('ℹ️ Aucun token à vérifier');
    }
  }
// Méthode temporaire pour forcer la mise à jour du token
forceUpdateExpiry(): void {
  const expiryTime = Date.now() + (60 * 1000); // 1 minute
  localStorage.setItem(TOKEN_EXPIRY, expiryTime.toString());
  console.log('🔄 Token expiré mis à jour : expire dans 60 secondes');
  this.startLogoutTimer();
}
  getUser(): any {
    const user = localStorage.getItem(USER);
    return user ? JSON.parse(user) : null;
  }

  saveRoles(roles: string[]): void {
    localStorage.setItem(ROLES, JSON.stringify(roles));
  }

  getRoles(): string[] {
    const roles = localStorage.getItem(ROLES);
    return roles ? JSON.parse(roles) : [];
  }

  savePermissions(permissions: string[]): void {
    localStorage.setItem(PERMISSIONS, JSON.stringify(permissions));
  }

  getPermissions(): string[] {
    const permissions = localStorage.getItem(PERMISSIONS);
    return permissions ? JSON.parse(permissions) : [];
  }

  clearStorage(): void {
    console.log('🧹 Nettoyage du storage');
    if (this.logoutTimer) {
      clearTimeout(this.logoutTimer);
      console.log('⏹️ Timer arrêté');
    }
    localStorage.removeItem(USER);
    localStorage.removeItem(ROLES);
    localStorage.removeItem(PERMISSIONS);
    localStorage.removeItem(TOKEN_EXPIRY);
  }

  isLoggedIn(): boolean {
    const user = localStorage.getItem(USER);
    const expiryTime = localStorage.getItem(TOKEN_EXPIRY);
    
    if (!user || !expiryTime) {
      return false;
    }
    
    if (parseInt(expiryTime) <= Date.now()) {
      this.clearStorage();
      return false;
    }
    
    return true;
  }

  getUserRole(): string {
    const roles = this.getRoles();
    return roles.length > 0 ? roles[0] : 'USER';
  }

  getUserId(): number | null {
    const user = this.getUser();
    return user?.userId ?? null;
  }
}
