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
    this.checkTokenExpiry();
  }

  saveUser(user: any): void {
    window.localStorage.setItem(USER, JSON.stringify(user));
    
    const expiryTime = Date.now() + (60 * 60 * 1000); 
    localStorage.setItem(TOKEN_EXPIRY, expiryTime.toString());
    
    
    this.startLogoutTimer();
  }

  private startLogoutTimer(): void {
    
    if (this.logoutTimer) {
      clearTimeout(this.logoutTimer);
    }

    const expiryTime = localStorage.getItem(TOKEN_EXPIRY);
    if (expiryTime) {
      const timeLeft = parseInt(expiryTime) - Date.now();
      
      
      if (timeLeft > 0) {
        this.logoutTimer = setTimeout(() => {
          this.autoLogout();
        }, timeLeft);
      } else {
        this.autoLogout();
      }
    } else {
    }
  }

  private autoLogout(): void {
    this.clearStorage();
    this.router.navigate(['/login']);
  }

  checkTokenExpiry(): void {
    const expiryTime = localStorage.getItem(TOKEN_EXPIRY);
    
    if (expiryTime) {
      const timeLeft = parseInt(expiryTime) - Date.now();
      if (timeLeft <= 0) {
        this.autoLogout();
      } else {
        this.startLogoutTimer();
      }
    } else {
    }
  }
// Méthode temporaire pour forcer la mise à jour du token
forceUpdateExpiry(): void {
  const expiryTime = Date.now() + (60 * 60 * 1000); // 
  localStorage.setItem(TOKEN_EXPIRY, expiryTime.toString());
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
    if (this.logoutTimer) {
      clearTimeout(this.logoutTimer);
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
