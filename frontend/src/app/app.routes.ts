import { Routes } from '@angular/router';
import { adminGuard, authGuard } from './services/auth.guard';

export const routes: Routes = [
  {
    path: 'register',
    loadComponent: () =>
      import('./components/register/register.component').then(
        (m) => m.RegisterComponent
      ),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./components/login/login.component').then(
        (m) => m.LoginComponent
      ),
  },
  {
    path: 'credit',
    loadComponent: () =>
      import('./components/credit/credit.component').then(
        (m) => m.CreditComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./components/home/home.component').then((m) => m.HomeComponent),
    canActivate: [authGuard],
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./components/admin/admin.component').then(
        (m) => m.AdminComponent
      ),
    canActivate: [adminGuard],
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./components/profile/profile.component').then(
        (m) => m.ProfileComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'pending',
    loadComponent: () =>
      import('./components/pending/pending.component').then(
        (m) => m.PendingComponent
      ),
  },

  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
];
