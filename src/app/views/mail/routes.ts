
import { Routes } from '@angular/router';
import {baseGuard} from "../../guards/base.guard";

export const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Mails'
    },
    children: [
      {
        path: 'send',
        loadComponent: () => import('./send/send.component').then(m => m.SendComponent),
        canActivate: [baseGuard],
        data: { permissions: ['SENDEMAIL'] }

      },
      {
        path: 'all',
        loadComponent: () => import('./all/all.component').then(m => m.AllComponent),
        canActivate: [baseGuard],
        data: { permissions: ['SEEALLEMAIL'] }

      },
      {
        path: 'sent',
        loadComponent: () => import('./sent/sent.component').then(m => m.SentComponent),
        canActivate: [baseGuard],
        data: { permissions: ['SENDEMAIL'] }

      },
      {
        path: 'received',
        loadComponent: () => import('./received/received.component').then(m => m.ReceivedComponent),
        canActivate: [baseGuard],
        data: { permissions: ['SEEEMAIL'] }

      },
      {
        path: 'details/:id',
        loadComponent: () => import('./email-details/email-details.component').then(m => m.EmailDetailsComponent),
        canActivate: [baseGuard],


      }
    ]
  }
];
