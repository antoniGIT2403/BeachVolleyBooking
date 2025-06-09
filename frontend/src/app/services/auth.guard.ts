// src/app/guards/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../services/user.service';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  if (user && user.status === 'active') {
    return true;
  } else if (user && user.status === 'pending') {
    router.navigate(['/pending']);
  } else {
    router.navigate(['/login']);
  }
  return false;
};


export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);
  const userService = inject(UserService);
  const user = userService.getCurrentUser();

  if (user?.role === 'admin') {
    return true;
  } else {
    router.navigate(['/home']); // ou vers une page 403 par exemple
    return false;
  }
};
