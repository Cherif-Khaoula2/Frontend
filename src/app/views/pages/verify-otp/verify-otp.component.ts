import { Component } from '@angular/core';
import { AuthService } from '../../../service/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import {FormsModule} from "@angular/forms";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-verify-otp',
  templateUrl: './verify-otp.component.html',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule
  ],
  styleUrls: ['./verify-otp.component.css']
})
export class VerifyOtpComponent {
  email: string = '';
  otp: string = '';
  message: string = '';
  messageColor: any;

  constructor(private authService: AuthService, private router: Router, private route: ActivatedRoute) {
    this.email = this.route.snapshot.queryParams['email']; // Récupère l'email de l'URL
  }

  verifyOtp() {
    this.authService.verifyOtp(this.email, this.otp).subscribe({
      next: () => {
        console.log(`Vérification OTP réussie pour: ${this.email}`);
        this.router.navigate(['/reset'], { queryParams: { email: this.email } });
      },
      error: () => {
        console.error('OTP incorrect');
        this.message = 'OTP incorrect. Veuillez réessayer ou renvoyer un OTP.';
      }
    });
  }
  goToLogin() {
    this.router.navigate(['/login']);
  }
}
