import { Routes } from '@angular/router';
import { authGuard } from './auth/auth-guard';
import { Board } from './board/board';
import { Login } from './login/login';
import { Register } from './register/register';

export const routes: Routes = [
  { path: '', component: Board, canActivate: [authGuard] },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: '**', redirectTo: '' },
];
