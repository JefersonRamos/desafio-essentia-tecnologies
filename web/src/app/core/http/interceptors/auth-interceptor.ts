import { HttpErrorResponse, HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { Router } from "@angular/router";
import { catchError, throwError } from "rxjs";

import { clearSession, readSession } from "../../../auth/session-storage";
import { UserStore } from "../../../user/user-store";

const PUBLICAS = ["/api/auth/login", "/api/auth/register"];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const users = inject(UserStore);
  const session = readSession();
  const autenticada = session !== null && req.url.startsWith("/api/");

  if (!autenticada) return next(req);

  return next(
    req.clone({ setHeaders: { Authorization: `Bearer ${session.token}` } }),
  ).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !PUBLICAS.some((rota) => req.url.startsWith(rota))) {
        clearSession();
        users.signOut();
        void router.navigateByUrl("/login");
      }

      return throwError(() => error);
    }),
  );
};
