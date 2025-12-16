import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { JwtService } from '../../../service/jwt.service';
import { StorageService } from '../../../service/storage-service/storage.service';
import { TokenMonitorService } from '../../../service/token-monitor.service';
import { CommonModule } from '@angular/common';
import { NgStyle } from '@angular/common';
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
  ButtonDirective,
  AccordionItemComponent,
  AccordionComponent
} from '@coreui/angular';

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
    InputGroupComponent,
    InputGroupTextDirective,
    IconDirective,
    ButtonDirective,
    NgStyle
  ]
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  sessionExpiredMessage: string = '';
  errorMessage: string = '';

  constructor(
    private service: JwtService,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private storageService: StorageService,
    private tokenMonitor: TokenMonitorService
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });

    // 🔹 Vérifier si l'utilisateur a été déconnecté pour expiration de session
    this.route.queryParams.subscribe(params => {
      if (params['sessionExpired'] === 'true') {
        this.sessionExpiredMessage = 'Votre session a expiré. Veuillez vous reconnecter.';
        
        // Effacer le message après 5 secondes
        setTimeout(() => {
          this.sessionExpiredMessage = '';
        }, 5000);
      }
    });

    // Arrêter la surveillance du token sur la page de login
    this.tokenMonitor.stopMonitoring();
  }

  login() {
    // Réinitialiser les messages
    this.errorMessage = '';
    this.sessionExpiredMessage = '';

    this.service.login(
      this.loginForm.get(['email'])!.value,
      this.loginForm.get(['password'])!.value,
    ).subscribe({
      next: (response) => {
        console.log('✅ Connexion réussie');
        
        // 🔹 Démarrer la surveillance du token après connexion réussie
        this.tokenMonitor.startMonitoring();
        
        this.router.navigateByUrl("dashboard");
      },
      error: (error) => {
        console.error('❌ Erreur de connexion', error);
        
        if (error.status == 406) {
          this.errorMessage = "Utilisateur non actif";
        } else if (error.status == 401) {
          this.errorMessage = "Email ou mot de passe incorrect";
        } else {
          this.errorMessage = "Une erreur est survenue";
        }
      }
    });
  }

  goToLDAP() {
    this.router.navigate(['/register']);
  }

  goToForgetPassword() {
    this.router.navigate(['/forgot']);
  }
}