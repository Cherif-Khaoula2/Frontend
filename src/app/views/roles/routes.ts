import { Routes } from '@angular/router';
export const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Rôles'
    },
    children: [
      {
        path: 'list',
        loadComponent: () => import('./list/list.component').then(m => m.ListComponent),
        data: { title: 'Liste des rôles', permissions: ['GETALLROLE'] } // 🔒 Vérifie si les permissions sont bien gérées
      },
      {
        path: 'ajout',
        loadComponent: () => import('./ajout-role/ajout-role.component').then(m => m.AjoutRoleComponent),
        data: { title: 'Ajouter rôle', permissions: ['AJOUTERROLE'] } // 🔒 Vérifie si les permissions sont bien gérées
      },
      {
        path: 'edit/:id',
        loadComponent: () => import('./edit-role/edit-role.component').then(m => m.EditRoleComponent),
        data: { title: 'Modifier rôle', permissions: ['MODIFIERROLE'] } // 🔒 Vérifie si les permissions sont bien gérées
      }
    ]
  }
];
