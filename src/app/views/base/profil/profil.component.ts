import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../service/user.service';
import { StorageService } from '../../../service/storage-service/storage.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

export interface Permission {
  id: number;
  name: string;
}
export interface Role {
  id: number;
  name: string;
  permissions: Permission[];
}

@Component({
  selector: 'app-profil',
  standalone: true,
  imports:[CommonModule],
  templateUrl: './profil.component.html',
  styleUrls: ['./profil.component.scss']
})
export class ProfilComponent implements OnInit {

  username: string = '';
  email: string = '';
  role: string = '';
  permissions: string[] = [];

  constructor(
    private userService: UserService,
    private storageService: StorageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const userId = this.storageService.getUserId();

    if (userId !== null) {
      this.userService.getUserById(userId).subscribe(
        user => {
          this.username = user.name;
          this.email = user.email;
          this.role = user.roles?.[0]?.name || 'Aucun rôle';
          this.permissions = (user.roles?.[0]?.permissions || []).map((p: Permission) => p.name);
        },
        error => {
          console.error('Erreur lors de la récupération du profil', error);
        }
      );
    } else {
      console.warn('Aucun utilisateur connecté.');
    }
  }
  onResetPassword(): void {
    this.router.navigate(['/forgot']);

  }
}
