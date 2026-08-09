import type { NextFunction, Request, Response } from 'express';
import { fail } from '../http/fail.js';
import { HttpError } from '../http/http-error.js';
import { findById } from '../users/user.repo.js';
import type { User } from '../users/user.model.js';
import { verifyToken } from './token.js';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export function authenticated(req: Pick<Request, 'user'>): User {
  if (!req.user) throw new HttpError(401, 'auth.tokenMissing');

  return req.user;
}

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const header = req.header('authorization');

  if (!header?.startsWith('Bearer ')) {
    fail(res, 401, 'auth.tokenMissing');
    return;
  }

  try {
    const payload = verifyToken(header.slice('Bearer '.length).trim());
    const user = await findById(payload.sub);

    if (!user) {
      fail(res, 401, 'auth.tokenInvalid');
      return;
    }

    req.user = user;
    next();
  } catch {
    fail(res, 401, 'auth.tokenInvalid');
  }
}
