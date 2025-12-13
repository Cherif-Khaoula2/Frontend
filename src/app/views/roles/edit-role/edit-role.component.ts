// src/app/components/role-edit/edit-role.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RoleService } from '../../../service/role.service';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MessageService } from '../../../service/message.service'; // Import the MessageService

interface Permission {
  id: number;
  name: string;
}

@Component({
  selector: 'app-role-edit',
  templateUrl: './edit-role.component.html',
  styleUrl: './edit-role.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
  ],
})
export class EditRoleComponent implements OnInit {
  roleId: number | null = null;
  editForm: FormGroup;
  allPermissions: Permission[] = [];
  selectedPermissions: Permission[] = [];
  errorMessage: string = '';
  successMessage: string = '';
  currentRole: any;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private roleService: RoleService,
    private messageService: MessageService // Inject the MessageService
  ) {
    this.editForm = this.fb.group({
      name: ['', Validators.required],
      permissions: [[]],
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      this.roleId = idParam ? +idParam : null;
      if (this.roleId) {
        this.loadRoleDetails(this.roleId);
        this.loadPermissions();
      }
    });
  }

  loadRoleDetails(id: number): void {
    this.roleService.getRoleById(id).subscribe({
      next: (data) => {
        this.currentRole = data;
        this.editForm.patchValue({ name: data.name });
        this.selectedPermissions = data.permissions.map((rolePermission: { id: number }) => {
          return this.allPermissions.find(allPermission => allPermission.id === rolePermission.id);
        }).filter((permission: Permission | undefined) => !!permission) as Permission[];
        this.editForm.get('permissions')?.setValue(this.selectedPermissions);
      },
      error: (error) => {
        console.error('Error loading role details:', error);
        this.errorMessage = 'Erreur lors du chargement des détails du rôle.';
      }
    });
  }

  loadPermissions(): void {
    this.roleService.getAllPermissions().subscribe({
      next: (permissions: Permission[]) => {
        this.allPermissions = permissions;
        if (this.currentRole) {
          this.selectedPermissions = this.currentRole.permissions.map((rolePermission: { id: number }) => {
            return this.allPermissions.find(allPermission => allPermission.id === rolePermission.id);
          }).filter((permission: Permission | undefined) => !!permission) as Permission[];
          this.editForm.get('permissions')?.setValue(this.selectedPermissions);
        }
      },
      error: (error) => {
        console.error('Error loading permissions:', error);
        this.errorMessage = 'Erreur lors du chargement des permissions.';
      }
    });
  }

  onPermissionsChange(event: MatSelectChange): void {
    this.selectedPermissions = event.value;
    this.editForm.get('permissions')?.setValue(this.selectedPermissions);
  }

  removePermission(permission: Permission): void {
    this.selectedPermissions = this.selectedPermissions.filter(p => p.id !== permission.id);
    this.editForm.get('permissions')?.setValue(this.selectedPermissions);
  }

  onSubmit(): void {
    if (this.editForm.valid && this.roleId) {
      const updatedRole = {
        name: this.editForm.get('name')?.value,
        permissions: this.selectedPermissions.map(p => ({ id: p.id })),
      };

      this.roleService.updateRole(this.roleId, updatedRole).subscribe({
        next: (response: any) => {
          console.log('Role mis à jour avec succès', response);
          this.messageService.setSuccessMessage(`Le rôle "${response.name}" a été mis à jour avec succès!`); // Set success message
          this.router.navigate(['/roles/list']);
          this.errorMessage = '';
        },
        error: (error) => {
          console.error('Error updating role:', error);
          this.errorMessage = error.message || 'Erreur lors de la mise à jour du rôle.';
          this.successMessage = '';
        }
      });
    } else {
      this.errorMessage = 'Veuillez remplir le nom du rôle.';
      this.successMessage = '';
    }
  }

  goBack(): void {
    this.router.navigate(['/roles/list']);
  }
}
