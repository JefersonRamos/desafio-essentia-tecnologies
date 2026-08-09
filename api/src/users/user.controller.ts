import type { Request, Response } from 'express';
import { authenticated } from '../auth/auth.middleware.js';
import type { UpdateUserInput } from './user.schema.js';
import * as users from './user.service.js';

type WithBody<T> = Request<Record<string, string>, unknown, T>;

export async function show(req: Request, res: Response): Promise<void> {
  const user = await users.findOrFail(authenticated(req).id);

  res.json({ user });
}

export async function update(req: WithBody<UpdateUserInput>, res: Response): Promise<void> {
  const user = await users.updateProfile(authenticated(req).id, req.body);

  res.json({ user });
}

export async function destroy(req: Request, res: Response): Promise<void> {
  await users.remove(authenticated(req).id);

  res.status(204).end();
}
