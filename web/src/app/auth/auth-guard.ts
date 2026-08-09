import { inject } from '@angular/core';
import { Router, type CanActivateFn, type UrlTree } from '@angular/router';
import { UserStore } from '../user/user-store';

export const authGuard: CanActivateFn = (): boolean | UrlTree => {
  const users = inject(UserStore);

  return users.isAuthenticated() || inject(Router).createUrlTree(['/login']);
};
