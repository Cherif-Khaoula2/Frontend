import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { JwtService } from '../../../service/jwt.service';
import { CommonModule, NgStyle } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { IconDirective } from '@coreui/icons-angular';
import {
  ContainerComponent,
  RowComponent,
  ColComponent,
  CardGroupComponent,
  TextColorDirective,
  CardComponent,
  CardBodyComponent,
  FormDirective,
  InputGroupComponent,
  InputGroupTextDirective,
  ButtonDirective
} from '@coreui/angular';

interface Toast {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ContainerComponent,
    RowComponent,
    ColComponent,
    CardGroupComponent,
    CardComponent,
    CardBodyComponent,
    FormDirective,
    InputGroupComponent,
    InputGroupTextDirective,
    IconDirective,
    ButtonDirective,
    NgStyle,
    TextColorDirective
  ],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(400px)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ transform: 'translateX(400px)', opacity: 0 }))
      ])
    ])
  ]
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  toasts: Toast[] = [];
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private jwtService: JwtService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  showToast(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info'): void {
    const toast: Toast = { message, type };
    this.toasts.push(toast);

    setTimeout(() => {
      this.removeToast(0);
    }, 3000);
  }

  removeToast(index: number): void {
    this.toasts.splice(index, 1);
  }

  login(): void {
    if (this.loginForm.invalid) {
      this.showToast('Veuillez remplir tous les champs correctement', 'warning');
      return;
    }

    const email = this.loginForm.get('email')!.value;
    const password = this.loginForm.get('password')!.value;

    this.jwtService.login(email, password).subscribe({
      next: (response) => {
        const userData = response.body;

        if (userData?.token) {
          console.log('🔑 Token reçu:', userData.token);
          const parts = userData.token.split('.');
          if (parts.length === 3) {
            console.log('✅ Format JWT valide');
          } else {
            console.error('❌ Format JWT invalide! Attendu 3 parties');
          }
        } else {
          console.error('❌ Aucun token dans la réponse!');
        }

        this.showToast('Connexion réussie', 'success');
        setTimeout(() => this.router.navigate(['/dashboard']), 1000);
      },
      error: (error) => {
        console.error('❌ Erreur de connexion:', error);
        if (error.status === 406) {
          this.showToast("Votre compte n'est pas actif", 'error');
        } else {
          this.showToast('Email ou mot de passe incorrect', 'error');
        }
      }
    });
  }
  goToLDAP(): void {
    this.router.navigate(['/register']);
  }

  goToForgetPassword(): void {
    this.router.navigate(['/forgot']);
  }
}
