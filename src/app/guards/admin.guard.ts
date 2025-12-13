import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { StorageService } from '../service/storage-service/storage.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(private router: Router, private storageService: StorageService) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const role = this.storageService.getUserRole(); // Récupérer le rôle de l'utilisateur
    const isLoggedIn = this.storageService.isLoggedIn(); // Vérifier si l'utilisateur est connecté

    if (isLoggedIn) {
      if (role === 'ADMIN') {
        return true; // ✅ Si c'est un admin, accès autorisé
      } else {
        this.router.navigate(['/404']); // 🚫 Si ce n'est pas un admin, redirige vers la page 404
        return false;
      }
    } else {
      this.router.navigate(['/login']); // 🚫 Si non connecté, redirige vers la page de login
      return false;
    }
  }
}
