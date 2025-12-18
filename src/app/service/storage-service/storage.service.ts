import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

const USER = "c_user";
const ROLES = "c_roles";
const PERMISSIONS = "c_permissions";

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor() { }

  // Méthode pour enregistrer l'utilisateur
  saveUser(user: any): void {
    window.localStorage.setItem(USER, JSON.stringify(user));
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
    localStorage.removeItem(USER);
    localStorage.removeItem(ROLES);
    localStorage.removeItem(PERMISSIONS);
  }

  // Vérifie si l'utilisateur est connecté
  isLoggedIn(): boolean {
    return !!localStorage.getItem(USER);
  }

  // Récupérer le rôle de l'utilisateur
  getUserRole(): string {
    const roles = this.getRoles();
    return roles.length > 0 ? roles[0] : 'USER';
  }
  // StorageService.ts

  getUserId(): number | null {
    const user = this.getUser();
    return user?.userId ?? null;
  }

}
