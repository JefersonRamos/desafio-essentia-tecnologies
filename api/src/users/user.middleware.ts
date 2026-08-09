import type { NextFunction, Request, Response } from 'express';
import { HttpError } from '../http/http-error.js';

export function requireOwnership(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user || req.user.id !== req.params['id']) {
    throw new HttpError(403, 'users.forbidden');
  }

  next();
}
