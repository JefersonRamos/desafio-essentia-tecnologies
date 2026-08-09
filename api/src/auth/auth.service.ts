import { HttpError } from '../http/http-error.js';
import type { User } from '../users/user.model.js';
import { findByEmail } from '../users/user.repo.js';
import { verifyPassword } from './password.js';
import { signToken } from './token.js';

export interface Session {
  token: string;
  user: User;
}

export async function login(email: string, password: string): Promise<Session> {
  const found = await findByEmail(email);
  const verified = found ? await verifyPassword(password, found.passwordHash) : false;

  if (!found || !verified) throw new HttpError(401, 'auth.invalidCredentials');

  const user: User = { id: found.id, name: found.name, email: found.email };

  return { token: signToken(user), user };
}
