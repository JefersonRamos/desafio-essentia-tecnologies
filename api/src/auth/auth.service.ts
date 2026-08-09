import { HttpError } from '../http/http-error.js';
import type { User } from '../users/user.model.js';
import { findByEmail } from '../users/user.repo.js';
import type { CreateUserInput } from '../users/user.schema.js';
import * as users from '../users/user.service.js';
import { verifyPassword } from './password.js';
import { signToken, type TokenPayload } from './token.js';
import { revoke } from './token.repo.js';

export interface Session {
  token: string;
  user: User;
}

export async function register(input: CreateUserInput): Promise<Session> {
  const user = await users.register(input);

  return { token: signToken(user), user };
}

export async function login(email: string, password: string): Promise<Session> {
  const found = await findByEmail(email);
  const verified = found ? await verifyPassword(password, found.passwordHash) : false;

  if (!found || !verified) throw new HttpError(401, 'auth.invalidCredentials');

  const user: User = { id: found.id, name: found.name, email: found.email };

  return { token: signToken(user), user };
}

export async function logout(payload: TokenPayload): Promise<void> {
  await revoke({ id: payload.jti, userId: payload.sub, expiresAt: payload.expiresAt });
}
