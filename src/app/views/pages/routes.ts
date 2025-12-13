import { Routes } from '@angular/router';
import {ForgotPasswordComponent} from "./forgot-password/forgot-password.component";

export const routes: Routes = [
  {
    path: '404',
    loadComponent: () => import('./page404/page404.component').then(m => m.Page404Component),
    data: {
      title: 'Page 404'
    }
  },
  {
    path: 'user/dashboard',
    loadComponent: () => import('./user-dashboard/user-dashboard.component').then(m => m.UserDashboardComponent),
    data: {
      title: 'Page user/dashboard'
    }
  },
  {
    path: '500',
    loadComponent: () => import('./page500/page500.component').then(m => m.Page500Component),
    data: {
      title: 'Page 500'
    }
  },
   {
    path: 'dashboard',
    loadChildren: () => import('../dashboard/dashboard.component').then((m) => m.DashboardComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.component').then(m => m.LoginComponent),
    data: {
      title: 'Login Page'
    }
  },
  {
    path: 'register',
    loadComponent: () => import('./register/register.component').then(m => m.RegisterComponent),
    data: {
      title: 'Register Page'
    }
  },
  {
    path: 'forgot',
    loadComponent: () => import('./forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
    data: {
      title: 'Forgot password'
    }
  },
  {
    path: 'reset',
    loadComponent: () => import('./reset-password/reset-password.component').then(m => m.ResetPasswordComponent),
    data: {
      title: 'Reset password'
    }
  },
  {
    path: 'verify',
    loadComponent: () => import('./verify-otp/verify-otp.component').then(m => m.VerifyOtpComponent),
    data: {
      title: 'Verify OTP'
    }
  },
  {
    path: 'profil',
    loadComponent: () => import('../base/profil/profil.component').then(m => m.ProfilComponent),
    data: {
      title: 'profil'
    }
  },

];
