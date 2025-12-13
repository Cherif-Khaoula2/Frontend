import { Routes } from '@angular/router';
import { baseGuard } from '../../guards/base.guard';

export const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Base'
    },
    children: [
      {
        path: '',
        redirectTo: 'cards',
        pathMatch: 'full'
      },

      {
        path: 'users',
        loadComponent: () => import('./users/users.component').then(m => m.usersComponent),
        data: { title: 'users', permissions: ['GETALLUSER'] }, // 🔒 Ajout des permissions requises
        canActivate: [baseGuard]
      },
      {
        path: 'ajouteuser',
        loadComponent: () => import('./ajouteuser/ajouteuser.component').then(m => m.AppajouteuserComponent),
        data: { title: 'ajouteuser', permissions: ['AJOUTERUSER'] }, // 🔒 Protection ajout d'utilisateur
        canActivate: [baseGuard]
      },
      {
        path: 'edit-user/:id',
        loadComponent: () => import('./edit-user/edit-user.component').then(m => m.EditUserComponent),
        data: { title: 'editeuser', permissions: ['MODIFIERUSER'] }, // 🔒 Protection édition
        canActivate: [baseGuard]
      },
      {
        path: 'profil',
        loadComponent: () => import('./profil/profil.component').then(m => m.ProfilComponent),
        data: {
          title: 'profil'
        }
      },


    ]
  }
];


