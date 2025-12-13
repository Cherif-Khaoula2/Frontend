import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RoleService } from '../../../service/role.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectChange, MatSelectModule } from "@angular/material/select";
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MessageService } from '../../../service/message.service'; // Import the MessageService

@Component({
  selector: 'app-ajout-role',
  templateUrl: './ajout-role.component.html',
  styleUrls: ['./ajout-role.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AjoutRoleComponent implements OnInit {
  roleForm: FormGroup;
  allPermissions$: Observable<string[]> | undefined;
  selectedPermissions: string[] = [];
  loading = false;

  constructor(
    private fb: FormBuilder,
    private roleService: RoleService,
    private router: Router,
    private messageService: MessageService // Inject the MessageService
  ) {
    this.roleForm = this.fb.group({
      name: ['', Validators.required],
      permissions: [[]]
    });
  }

  ngOnInit(): void {
    this.allPermissions$ = this.roleService.getAllPermissions().pipe(
      map((permissions: { id: number; name: string }[]) => {
        return permissions.map(p => p.name);
      })
    );
  }

  addFromSelect(event: MatSelectChange): void {
    const selected = event.value;

    if (Array.isArray(selected)) {
      this.selectedPermissions = [...new Set([...this.selectedPermissions, ...selected])];
    } else {
      if (!this.selectedPermissions.includes(selected)) {
        this.selectedPermissions.push(selected);
      }
    }

    this.roleForm.get('permissions')?.setValue(this.selectedPermissions);
  }

  removePermission(permission: string): void {
    this.selectedPermissions = this.selectedPermissions.filter(p => p !== permission);
    this.roleForm.get('permissions')?.setValue(this.selectedPermissions);
    this.roleForm.get('permissions')?.updateValueAndValidity();
  }

  submitRole(): void {
    if (this.roleForm.valid) {
      const roleData = {
        name: this.roleForm.get('name')?.value,
        permissions: this.selectedPermissions.map(p => ({ name: p }))
      };

      this.loading = true;
      this.roleService.createRole(roleData).subscribe(
        (res: any) => {
          console.log("Rôle créé avec succès", res);
          this.messageService.setSuccessMessage(`Le rôle "${res.name}" a été ajouté avec succès.`); // Set the success message
          this.router.navigate(['/roles/list']);
        },
        (error) => {
          console.error("Erreur lors de la création du rôle :", error);
          // Optionally set an error message using messageService.setErrorMessage()
        }
      ).add(() => this.loading = false);
    }
  }

  onCancel(): void {
    this.router.navigate(['/roles/list']);
  }
}
