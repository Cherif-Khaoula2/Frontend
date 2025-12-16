// src/app/services/token-monitor.service.ts

import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from './storage-service/storage.service';
import { interval, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TokenMonitorService {
  private checkInterval?: Subscription;
  private readonly CHECK_INTERVAL = 10000; // Vérifier toutes les 10 secondes
  
  private router = inject(Router);
  private storage = inject(StorageService);

  /**
   * Démarre la surveillance du token JWT
   * Vérifie toutes les 10 secondes si le token est expiré
   */
  startMonitoring(): void {
    // Arrêter toute surveillance existante
    this.stopMonitoring();
    
    console.log('🔍 Surveillance du token JWT activée');
    
    this.checkInterval = interval(this.CHECK_INTERVAL).subscribe(() => {
      this.checkTokenExpiration();
    });
  }

  /**
   * Arrête la surveillance du token
   */
  stopMonitoring(): void {
    if (this.checkInterval) {
      this.checkInterval.unsubscribe();
      console.log('⏹️ Surveillance du token JWT arrêtée');
    }
  }

  /**
   * Vérifie si le token stocké est expiré
   */
  private checkTokenExpiration(): void {
    const user = this.storage.getUser();
    
    if (!user) {
      console.log('⚠️ Aucun utilisateur trouvé - Arrêt de la surveillance');
      this.stopMonitoring();
      return;
    }

    try {
      // Si vous avez stocké l'expiration dans le user object (exp en secondes)
      const expirationTime = user.exp ? user.exp * 1000 : null;
      
      if (expirationTime) {
        const now = Date.now();
        const timeUntilExpiration = expirationTime - now;
        
        if (timeUntilExpiration <= 0) {
          console.warn('🔴 Token expiré détecté lors de la vérification');
          this.handleExpiredToken();
        } else {
          // Log le temps restant (optionnel)
          const secondsRemaining = Math.floor(timeUntilExpiration / 1000);
          console.log(`⏱️ Token valide - Expire dans ${secondsRemaining} secondes`);
        }
      } else {
        console.warn('⚠️ Pas d\'information d\'expiration dans le token');
      }
    } catch (error) {
      console.error('❌ Erreur lors de la vérification du token:', error);
    }
  }

  /**
   * Gère la déconnexion en cas de token expiré
   */
  private handleExpiredToken(): void {
    console.warn('🚪 Déconnexion automatique - Token expiré');
    
    this.stopMonitoring();
    this.storage.clearStorage();
    
    this.router.navigate(['/login'], {
      queryParams: { sessionExpired: 'true' }
    });
  }
}