// src/app/guards/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../services/user.service';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const userService = inject(UserService);

  const user = userService.getCurrentUser();

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
    router.navigate(['/home']);
    return false;
  }
};
