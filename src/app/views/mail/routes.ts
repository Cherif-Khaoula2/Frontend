
import { Routes } from '@angular/router';
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

      },
      {
        path: 'all',
        loadComponent: () => import('./all/all.component').then(m => m.AllComponent),

      },
      {
        path: 'sent',
        loadComponent: () => import('./sent/sent.component').then(m => m.SentComponent),

      },
      {
        path: 'received',
        loadComponent: () => import('./received/received.component').then(m => m.ReceivedComponent),

      },
      {
        path: 'details/:id',
        loadComponent: () => import('./email-details/email-details.component').then(m => m.EmailDetailsComponent),

      }
    ]
  }
];
