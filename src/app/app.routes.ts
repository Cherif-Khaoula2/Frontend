import { Routes } from '@angular/router';
import { DefaultLayoutComponent } from './layout';
import { AdminGuard } from './guards/admin.guard';
import { AuthGuard } from './guards/auth.guard';
import { userGuard } from './guards/user.guard';
import { dashboardGuard } from './guards/dashboard.guard';
export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: '',
    component: DefaultLayoutComponent,
    data: {
      title: 'Home'
    },
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./views/dashboard/routes').then((m) => m.routes)
        ,canActivate: [dashboardGuard]
      }
      ,

      {
        path: 'base',
        loadChildren: () => import('./views/base/routes').then((m) => m.routes)
      },
      {
        path: 'roles',
        loadChildren: () => import('./views/roles/routes').then((m) => m.routes)
      }
      ,
      {
        path: 'mails',
        loadChildren: () => import('./views/mail/routes').then((m) => m.routes)
      },
      {
        path: 'dossier',
        loadChildren: () => import('./views/dossier/routes').then(m => m.routes),

      },

      {
        path: 'pages',
        loadChildren: () => import('./views/pages/routes').then((m) => m.routes)
      }
      ,
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
    loadComponent: () => import('./views/pages/login/login.component').then(m => m.LoginComponent),canActivate: [AuthGuard],
    data: {
      title: 'Login Page'
    }
  },
  {
    path: 'grid',
    loadComponent: () => import('./ag-grid/ag-grid.component').then(m => m.AgGridComponent),
    data: {
      title: 'grid Page'
    }
  },
  {
    path: 'Message',
    loadComponent: () => import('./notification-button/notification-button.component').then(m => m.NotificationButtonComponent),
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
    loadComponent: () => import('./views/pages//forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
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
