import type { NextFunction, Request, Response } from 'express';
import { HttpError } from '../http/http-error.js';
import { findById } from '../users/user.repo.js';
import type { User } from '../users/user.model.js';
import { verifyToken, type TokenPayload } from './token.js';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

const BEARER = 'Bearer ';

export function authenticated(req: Pick<Request, 'user'>): User {
  if (!req.user) throw new HttpError(401, 'auth.tokenMissing');

  return req.user;
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const header = req.header('authorization');

  if (!header?.startsWith(BEARER)) throw new HttpError(401, 'auth.tokenMissing');

  const payload = decode(header.slice(BEARER.length).trim());
  const user = await findById(payload.sub);

  if (!user) throw new HttpError(401, 'auth.tokenInvalid');

  req.user = user;

  next();
}

function decode(token: string): TokenPayload {
  try {
    return verifyToken(token);
  } catch {
    throw new HttpError(401, 'auth.tokenInvalid');
  }
}
