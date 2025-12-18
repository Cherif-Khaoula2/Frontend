import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { StorageService } from '../service/storage-service/storage.service';

@Injectable({
  providedIn: 'root'
})
export class UserGuard implements CanActivate {

  constructor(
    private router: Router,
    private storageService: StorageService
  ) {}

  canActivate(): boolean {
    if (this.storageService.isLoggedIn()) {
      return true;
    } 

    // 🔴 Pas connecté ou nouvelle fenêtre
    this.router.navigate(['/login']);
    return false;
  }
}
