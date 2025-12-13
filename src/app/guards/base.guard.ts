import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { StorageService } from '../service/storage-service/storage.service';

@Injectable({
  providedIn: 'root'
})
export class baseGuard implements CanActivate {

  constructor(private storageService: StorageService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const userPermissions = this.storageService.getPermissions();
    const requiredPermissions = route.data['permissions'] as string[]; // Permissions requises pour la route

    if (!requiredPermissions || requiredPermissions.some(permission => userPermissions.includes(permission))) {
      return true; // L'utilisateur a les permissions nécessaires
    } else {
      this.router.navigate(['/home']); // Redirection si l'utilisateur n'a pas accès
      return false;
    }
  }
}
