import type { Request, Response } from 'express';
import { HttpError } from '../http/http-error.js';
import { authenticated } from './auth.middleware.js';
import * as auth from './auth.service.js';

interface LoginBody {
  email?: unknown;
  password?: unknown;
}

export async function login(
  req: Request<Record<string, string>, unknown, LoginBody>,
  res: Response,
): Promise<void> {
  const { email, password } = req.body ?? {};

  if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
    throw new HttpError(400, 'auth.credentialsRequired');
  }

  res.json(await auth.login(email, password));
}

export function me(req: Request, res: Response): void {
  res.json({ user: authenticated(req) });
}
