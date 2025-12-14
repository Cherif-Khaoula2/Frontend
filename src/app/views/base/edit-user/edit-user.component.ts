// edit-user.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../service/user.service';
import { RoleService } from '../../../service/role.service';
import { NgClass, CommonModule } from "@angular/common";
import { forkJoin } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectChange, MatSelectModule } from "@angular/material/select";
import { MatChipsModule } from "@angular/material/chips";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";


interface Role {
  id?: number;
  name: string;
}

interface User {
  id?: number;
  name: string;
  email: string;
  roles?: Role[];
}

@Component({
  selector: 'app-edit-user',
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgClass,
    MatFormFieldModule,
    MatSelectModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule
  ],
})
export class EditUserComponent implements OnInit {
  userId: number | null = null;
  editForm: FormGroup;
  currentUser: User | null = null;
  availableRoles: Role[] = [];
  selectedRoles: string[] = []; // To manage selected roles for the chips
  loading = true;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    protected router: Router,
    private userService: UserService,
    private roleService: RoleService,
    private fb: FormBuilder
  ) {
    this.editForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      roles: [[]] // This will hold the array of selected role names
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      this.userId = idParam ? +idParam : null;
      if (this.userId) {
        forkJoin([
          this.userService.getUserById(this.userId),
          this.roleService.getAllRoles()
        ]).pipe(
          tap(([user, roles]) => {
            this.currentUser = user;
            this.availableRoles = roles;
            this.selectedRoles = user.roles ? user.roles.map((role: Role) => role.name) : [];
            this.editForm.patchValue({
              name: user.name,
              email: user.email,
              roles: this.selectedRoles // Initialize form control with selected roles
            });
            this.loading = false;
          })
        ).subscribe(
          () => {},
          (error) => {
            console.error('Erreur lors du chargement des données', error);
            this.errorMessage = 'Erreur lors du chargement des informations de l\'utilisateur.';
            this.loading = false;
          }
        );
      } else {
        this.roleService.getAllRoles().subscribe(
          (roles) => {
            this.availableRoles = roles;
            this.loading = false;
          },
          (error) => {
            console.error('Erreur lors du chargement des rôles disponibles', error);
            this.errorMessage = 'Erreur lors du chargement des rôles disponibles.';
            this.loading = false;
          }
        );
      }
    });
  }

  addFromSelect(event: MatSelectChange): void {
    this.selectedRoles = event.value;
    this.editForm.get('roles')?.setValue(this.selectedRoles);
  }

  removeRole(role: string): void {
    this.selectedRoles = this.selectedRoles.filter(r => r !== role);
    this.editForm.get('roles')?.setValue(this.selectedRoles);
  }

  onSubmit(): void {
    if (this.editForm.valid && this.userId) {
      this.loading = true;
      this.errorMessage = '';
      const updatedUser: User = {
        ...this.editForm.value,
        id: this.userId,
        roles: this.selectedRoles.map(roleName => ({ name: roleName }))
      };

      this.userService.updateUser(this.userId, updatedUser).subscribe(
        (response) => {
         
          this.router.navigate(['/base/users']);
          this.loading = false;
        },
        (error) => {
          console.error('Erreur lors de la mise à jour de l\'utilisateur', error);
          this.loading = false;
          if (error.status === 400) {
            this.errorMessage = error.error;
          } else if (error.status === 404) {
            this.errorMessage = 'Utilisateur non trouvé.';
          } else {
            this.errorMessage = 'Erreur serveur lors de la mise à jour de l\'utilisateur.';
          }
        }
      );
    } else {
      Object.keys(this.editForm.controls).forEach(key => {
        this.editForm.get(key)?.markAsTouched();
      });
      this.errorMessage = 'Veuillez corriger les erreurs du formulaire.';
    }
  }

  onCancel(): void {
    this.router.navigate(['/base/users']);
  }
}
