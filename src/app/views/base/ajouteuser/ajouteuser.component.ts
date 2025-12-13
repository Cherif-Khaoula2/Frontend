import { CommonModule } from '@angular/common';

import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

import { Router } from '@angular/router';

import { UserService } from '../../../service/user.service';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectChange, MatSelectModule } from "@angular/material/select";
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule } from '@angular/material/chips';




@Component({

  selector: 'app-ajouteuser',

  templateUrl: './ajouteuser.component.html',

  styleUrls: ['./ajouteuser.component.scss'],

  imports: [

    CommonModule,

    ReactiveFormsModule,

    MatFormFieldModule,

    MatSelectModule,


    MatChipsModule,

    MatIconModule,

    MatButtonModule,

    MatSlideToggleModule,


  ],

  changeDetection: ChangeDetectionStrategy.OnPush,

  standalone: true
})

export class AppajouteuserComponent implements OnInit {

  userForm: FormGroup;

  roles$: Observable<string[]> | undefined; // Liste des rôles disponibles

  selectedRoles: string[] = []; // Liste des rôles sélectionnés

  loading = false;



  constructor(private fb: FormBuilder, private userService: UserService, private router: Router) {

    this.userForm = this.fb.group({

      email: ['', [Validators.required, Validators.email]],

      password: ['', [Validators.required, Validators.minLength(8)]],

      confirmPassword: ['', Validators.required],

      name: ['', [Validators.required]],

      roles: [[]] // Liste des rôles sélectionnés

    }, { validators: this.passwordsMatchValidator });

  }



  ngOnInit() {

    this.roles$ = this.userService.getAllRoles().pipe(

      map((roles: { id: number; name: string }[]) => {

        return roles.map(role => role.name);

      })

    );

  }





// Valide si les mots de passe correspondent

  passwordsMatchValidator(group: FormGroup) {

    const password = group.get('password')?.value;

    const confirmPassword = group.get('confirmPassword')?.value;

    return password === confirmPassword ? null : { passwordMismatch: true };

  }



  addFromSelect(event: MatSelectChange): void {

    const selected = event.value;



    if (Array.isArray(selected)) {

      this.selectedRoles = [...new Set([...this.selectedRoles, ...selected])];

    } else {

      if (!this.selectedRoles.includes(selected)) {

        this.selectedRoles.push(selected);

      }

    }



    this.userForm.get('roles')?.setValue(this.selectedRoles);

  }





  removeRole(role: string) {

    this.selectedRoles = this.selectedRoles.filter(r => r !== role);

    this.userForm.get('roles')?.setValue(this.selectedRoles);



// 🔥 Mise à jour manuelle de la sélection

    this.userForm.get('roles')?.updateValueAndValidity();

  }





  ajouterEmp() {

    if (this.userForm.valid) {

      const userData = {

        ...this.userForm.value,

        roles: this.selectedRoles.map(role => ({ name: role })) // Transformer en objets

      };



      this.userService.createUser(userData).subscribe(

        (data) => {


          this.router.navigate(['/base/users']);

        },

        (error) => {

          console.error("Erreur lors de la création de l'utilisateur:", error);

        }

      );

    } 

  }

  onCancel(): void {

    this.router.navigate(['/base/users']);

  }

}
