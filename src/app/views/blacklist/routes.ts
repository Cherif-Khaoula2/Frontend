import { Routes } from '@angular/router';
import { baseGuard } from '../../guards/base.guard';

export const routes: Routes = [
  {
    path: '',
    data: {
      title: 'blacklist'
    },
    children: [
      {
        path: '',
        redirectTo: 'cards',
        pathMatch: 'full'
      },
     
     
      {
        path: 'ajouterblacklist',
        loadComponent: () => import('./ajouter/ajouter.component').then(m => m.AjouterComponent),
        data: { title: 'ajouterblacklist'},
      },
      {
        path: 'voirblacklist',
        loadComponent: () => import('./voir/voir.component').then(m => m.VoirComponent),
        data: { title: 'voirblacklist'},
      },

      
     
      
     
    ]
  }
];


