import { Component } from '@angular/core';
import { CommonModule, NgStyle } from '@angular/common';
import { IconDirective } from '@coreui/icons-angular';
import { ContainerComponent, RowComponent, ColComponent, CardGroupComponent, TextColorDirective, CardComponent, CardBodyComponent, FormDirective, InputGroupComponent, InputGroupTextDirective, FormControlDirective, ButtonDirective } from '@coreui/angular';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LdapService } from 'src/app/service/ldap.service';

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss'],
   imports: [ContainerComponent,CommonModule  ,ReactiveFormsModule  ,RowComponent, ColComponent, CardGroupComponent, TextColorDirective, CardComponent, CardBodyComponent,InputGroupComponent, InputGroupTextDirective, IconDirective, FormControlDirective, ButtonDirective, NgStyle]
   })
export class RegisterComponent {
  loginForm: FormGroup;
  errorMessage: string | null = null;

  constructor(
    private router: Router,
    private ldapService: LdapService,
    private fb: FormBuilder
  ) {
    // Création du formulaire avec validation
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;

      this.ldapService.login(username, password).subscribe({
        next: (response) => {
          console.log('Connexion réussie :', response);
          this.router.navigate(['/dashboard']); // Redirection après connexion
        },
        error: (error) => {
          console.error('Erreur de connexion :', error);
          this.errorMessage = 'Échec de l’authentification. Vérifiez vos identifiants.';
        }
      });
    }
  }
  goToLogin() {
    this.router.navigate(['/login']);
  }
}
