import { HttpInterceptorFn } from "@angular/common/http";

import { readSession } from "../../../auth/session-storage";

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const session = readSession();

  if (!session || !req.url.startsWith("/api/")) return next(req);

  return next(req.clone({ setHeaders: { Authorization: `Bearer ${session.token}` } }));
};
