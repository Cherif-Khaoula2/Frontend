import { Injectable } from '@angular/core';

const USER = "c_user";
const ROLES = "c_roles";
const PERMISSIONS = "c_permissions";
const SESSION_FLAG = "c_session_flag"; // flag temporaire pour session active

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor() { }

  // -------------------- USER --------------------
  saveUser(user: any): void {
    localStorage.setItem(USER, JSON.stringify(user));
    sessionStorage.setItem(SESSION_FLAG, "active"); // marque la session
  }

  getUser(): any {
    const user = localStorage.getItem(USER);
    return user ? JSON.parse(user) : null;
  }

  getUserId(): number | null {
    const user = this.getUser();
    return user?.userId ?? null;
  }

  // -------------------- ROLES --------------------
  saveRoles(roles: string[]): void {
    localStorage.setItem(ROLES, JSON.stringify(roles));
  }

  getRoles(): string[] {
    const roles = localStorage.getItem(ROLES);
    return roles ? JSON.parse(roles) : [];
  }

  getUserRole(): string {
    const roles = this.getRoles();
    return roles.length > 0 ? roles[0] : 'USER';
  }

  // -------------------- PERMISSIONS --------------------
  savePermissions(permissions: string[]): void {
    localStorage.setItem(PERMISSIONS, JSON.stringify(permissions));
  }

  getPermissions(): string[] {
    const permissions = localStorage.getItem(PERMISSIONS);
    return permissions ? JSON.parse(permissions) : [];
  }

  // -------------------- SESSION --------------------
  clearStorage(): void {
    localStorage.removeItem(USER);
    localStorage.removeItem(ROLES);
    localStorage.removeItem(PERMISSIONS);
    sessionStorage.removeItem(SESSION_FLAG);
  }

  isLoggedIn(): boolean {
    // vérifier que user existe et que la session actuelle est active
    return !!localStorage.getItem(USER) && !!sessionStorage.getItem(SESSION_FLAG);
  }
}
