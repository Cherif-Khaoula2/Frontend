import { Component } from '@angular/core';
import { AuthService } from '../../../service/auth.service';
import { Router } from '@angular/router';
import {FormsModule} from "@angular/forms";
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule
  ],
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent {
  newPassword: string = '';
  confirmPassword: string = '';
  message: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  resetPassword() {
    if (this.newPassword !== this.confirmPassword) {
      this.message = 'Les mots de passe ne correspondent pas.';
      return;
    }

    this.authService.resetPassword(this.newPassword, this.confirmPassword).subscribe({
      next: () => {
        console.log('Mot de passe réinitialisé avec succès');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Erreur lors de la réinitialisation du mot de passe', err);
        this.message = err.error?.message || 'Une erreur est survenue.';
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
