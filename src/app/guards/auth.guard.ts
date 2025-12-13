import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { StorageService } from '../service/storage-service/storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router, private storageService: StorageService) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const isLoggedIn = this.storageService.isLoggedIn();  // Vérifie si l'utilisateur est connecté

    if (isLoggedIn) {
      
      
        this.router.navigate(['/dashboard']); // Rediriger vers le tableau de bord 
      return false; // Empêche l'accès à la page de login
    } else {
      return true; // Si l'utilisateur n'est pas connecté, il peut accéder à la page login
    }
  }
}
