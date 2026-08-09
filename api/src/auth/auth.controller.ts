import type { Request, Response } from 'express';
import { HttpError } from '../http/http-error.js';
import type { CreateUserInput } from '../users/user.schema.js';
import { authenticated, currentToken } from './auth.middleware.js';
import * as auth from './auth.service.js';

type WithBody<T> = Request<Record<string, string>, unknown, T>;

interface LoginBody {
  email?: unknown;
  password?: unknown;
}

export async function register(req: WithBody<CreateUserInput>, res: Response): Promise<void> {
  res.status(201).json(await auth.register(req.body));
}

export async function login(req: WithBody<LoginBody>, res: Response): Promise<void> {
  const { email, password } = req.body ?? {};

  if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
    throw new HttpError(400, 'auth.credentialsRequired');
  }

  res.json(await auth.login(email, password));
}

export function me(req: Request, res: Response): void {
  res.json({ user: authenticated(req) });
}

export async function logout(req: Request, res: Response): Promise<void> {
  await auth.logout(currentToken(req));

  res.status(204).end();
}
