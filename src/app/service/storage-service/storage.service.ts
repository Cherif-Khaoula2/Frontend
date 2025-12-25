import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

const USER = "c_user";
const ROLES = "c_roles";
const PERMISSIONS = "c_permissions";
const LAST_ACTIVITY = "c_last_activity";

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private inactivityTimer: any;
  private readonly INACTIVITY_TIMEOUT = 60 * 1000; // 1 minute d'inactivité

  constructor(private router: Router) {
    console.log('🔵 StorageService initialisé');
    this.setupActivityListeners();
    this.checkInactivity();
  }

  private setupActivityListeners(): void {
    console.log('👂 Configuration des listeners d\'activité');
    
    // Liste des événements qui indiquent l'activité de l'utilisateur
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, () => this.resetInactivityTimer(), true);
    });
  }

  private resetInactivityTimer(): void {
    // Sauvegarder le timestamp de la dernière activité
    const now = Date.now();
    localStorage.setItem(LAST_ACTIVITY, now.toString());
    
    // Nettoyer l'ancien timer
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
    }

    // Créer un nouveau timer
    this.inactivityTimer = setTimeout(() => {
      console.log('⏰ Inactivité détectée - Déconnexion automatique');
      this.autoLogout();
    }, this.INACTIVITY_TIMEOUT);
    
    console.log('🔄 Timer d\'inactivité réinitialisé');
  }

  saveUser(user: any): void {
    console.log('💾 Sauvegarde de l\'utilisateur');
    window.localStorage.setItem(USER, JSON.stringify(user));
    
    // Initialiser le timer d'inactivité
    this.resetInactivityTimer();
  }

  private autoLogout(): void {
    console.log('🚪 Déconnexion automatique en cours...');
    this.clearStorage();
    this.router.navigate(['/login']);
    console.log('✅ Redirection vers /login');
  }

  checkInactivity(): void {
    console.log('🔍 Vérification de l\'inactivité');
    const lastActivity = localStorage.getItem(LAST_ACTIVITY);
    
    if (lastActivity && this.isLoggedIn()) {
      const timeSinceActivity = Date.now() - parseInt(lastActivity);
      const timeLeft = this.INACTIVITY_TIMEOUT - timeSinceActivity;
      
      console.log(`⏳ Temps depuis dernière activité: ${Math.floor(timeSinceActivity / 1000)} secondes`);
      
      if (timeLeft <= 0) {
        console.log('❌ Inactivité dépassée - Déconnexion');
        this.autoLogout();
      } else {
        console.log(`✅ Temps restant avant déconnexion: ${Math.floor(timeLeft / 1000)} secondes`);
        this.resetInactivityTimer();
      }
    } else {
      console.log('ℹ️ Aucune session active');
    }
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
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
      console.log('⏹️ Timer arrêté');
    }
    localStorage.removeItem(USER);
    localStorage.removeItem(ROLES);
    localStorage.removeItem(PERMISSIONS);
    localStorage.removeItem(LAST_ACTIVITY);
  }

  isLoggedIn(): boolean {
    const user = localStorage.getItem(USER);
    const lastActivity = localStorage.getItem(LAST_ACTIVITY);
    
    if (!user || !lastActivity) {
      return false;
    }
    
    const timeSinceActivity = Date.now() - parseInt(lastActivity);
    if (timeSinceActivity > this.INACTIVITY_TIMEOUT) {
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