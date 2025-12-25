// auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { JwtService } from './jwt.service';

export const authGuard: CanActivateFn = (route, state) => {
  const jwtService = inject(JwtService);
  const router = inject(Router);

  // Vérifier si le token est valide
  if (jwtService.isTokenValid()) {
    return true;
  } else {
    console.log('Accès refusé - Token invalide ou expiré');
    router.navigate(['/login'], { 
      queryParams: { returnUrl: state.url } 
    });
    return false;
  }
};