import { Routes } from '@angular/router';
import { DefaultLayoutComponent } from './layout';
import { AuthGuard } from './guards/auth.guard';
import { dashboardGuard } from './guards/dashboard.guard';
import { authGuard } from './services/auth.guard';  // ⭐ IMPORTER LE NOUVEAU GUARD

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: '',
    component: DefaultLayoutComponent,
    canActivate: [authGuard],  // ⭐ PROTÉGER TOUT LE LAYOUT
    data: {
      title: 'Home'
    },
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./views/dashboard/routes').then((m) => m.routes),
        canActivate: [dashboardGuard]  // Garde votre guard existant aussi
      },
      {
        path: 'base',
        loadChildren: () => import('./views/base/routes').then((m) => m.routes)
      },
      {
        path: 'roles',
        loadChildren: () => import('./views/roles/routes').then((m) => m.routes)
      },
      {
        path: 'mails',
        loadChildren: () => import('./views/mail/routes').then((m) => m.routes)
      },
      {
        path: 'dossier',
        loadChildren: () => import('./views/dossier/routes').then(m => m.routes)
      },
      {
        path: 'pages',
        loadChildren: () => import('./views/pages/routes').then((m) => m.routes)
      },
      {
        path: 'blacklist',
        loadChildren: () => import('./views/blacklist/routes').then((m) => m.routes)
      }
    ]
  },
  {
    path: '404',
    loadComponent: () => import('./views/pages/page404/page404.component').then(m => m.Page404Component),
    data: {
      title: 'Page 404'
    }
  },
  {
    path: '500',
    loadComponent: () => import('./views/pages/page500/page500.component').then(m => m.Page500Component),
    data: {
      title: 'Page 500'
    }
  },
  {
    path: 'login',
    loadComponent: () => import('./views/pages/login/login.component').then(m => m.LoginComponent),
    // ⭐ RETIRER authGuard d'ici (la page login doit être accessible sans connexion)
    data: {
      title: 'Login Page'
    }
  },
  {
    path: 'grid',
    loadComponent: () => import('./ag-grid/ag-grid.component').then(m => m.AgGridComponent),
    canActivate: [authGuard],  // ⭐ PROTÉGER CETTE ROUTE
    data: {
      title: 'grid Page'
    }
  },
  {
    path: 'Message',
    loadComponent: () => import('./notification-button/notification-button.component').then(m => m.NotificationButtonComponent),
    canActivate: [authGuard],  // ⭐ PROTÉGER CETTE ROUTE
    data: {
      title: 'grid Page'
    }
  },
  {
    path: 'register',
    loadComponent: () => import('./views/pages/register/register.component').then(m => m.RegisterComponent),
    data: {
      title: 'Register Page'
    }
  },
  {
    path: 'forgot',
    loadComponent: () => import('./views/pages/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
    data: {
      title: 'Forgot password'
    }
  },
  {
    path: 'reset',
    loadComponent: () => import('./views/pages//reset-password/reset-password.component').then(m => m.ResetPasswordComponent),
    data: {
      title: 'Reset password'
    }
  },
  {
    path: 'verify',
    loadComponent: () => import('./views/pages//verify-otp/verify-otp.component').then(m => m.VerifyOtpComponent),
    data: {
      title: 'Verify OTP'
    }
  },
  { path: '**', redirectTo: 'dashboard' }
];