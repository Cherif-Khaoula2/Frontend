import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { JwtService } from '../../../service/jwt.service';
import { StorageService } from '../../../service/storage-service/storage.service';
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
  AccordionItemComponent, AccordionComponent
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

  constructor(
    private service: JwtService,
    private fb: FormBuilder,
    private router: Router,  // Injection du service snackbar
    private storageService: StorageService  // Injection du service de stockage
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  login() {
    console.log(this.loginForm.value);
    this.service.login(
      this.loginForm.get(['email'])!.value,
      this.loginForm.get(['password'])!.value,
    ).subscribe((response) => {
        console.log(response);

          this.router.navigateByUrl("dashboard");

      },
      error => {
        if (error.status == 406) {
          alert("User is not active"); // ✅ Remplacement par alert()
        } else {
          alert("Bad credentials"); // ✅ Remplacement par alert()
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
