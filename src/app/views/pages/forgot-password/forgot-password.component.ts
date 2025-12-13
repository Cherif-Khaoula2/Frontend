import { Component } from '@angular/core';
import { AuthService } from '../../../service/auth.service';
import {FormsModule} from "@angular/forms";
import {Router} from "@angular/router";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  standalone: true,
  imports: [
    FormsModule,
    
    CommonModule
  ],
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  email: string = '';
  message: string = '';
  emailError: any;

  constructor(private authService: AuthService, private router: Router) {}
  sendOtp() {
    this.authService.sendOtp(this.email).subscribe({
      next: (response) => {
        console.log('OTP envoyé avec succès', response);

        // Vérifie si l'OTP est bien envoyé
        if (response && typeof response === 'string' && response.includes('OTP sent')) {
          // Redirection vers la page de vérification avec l’email en paramètre
          this.router.navigate(['/verify'], { queryParams: { email: this.email } });
        } else {
          this.message = "Erreur lors de l'envoi de l'OTP.";
        }
      },
      error: (error) => {
        console.error("Erreur lors de l’envoi de l’OTP", error);
        this.message = "Échec de l'envoi de l'OTP.";
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }



}

