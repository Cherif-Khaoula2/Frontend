import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { StorageService } from './storage-service/storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  
  constructor(
    private storage: StorageService,
    private router: Router
  ) {}

  canActivate(): boolean {
    // Vérifier si le token est toujours valide
    this.storage.checkTokenExpiry();
    
    if (this.storage.isLoggedIn()) {
      return true;
    }
    
    this.router.navigate(['/login']);
    return false;
  }
}