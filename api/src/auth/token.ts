import { randomUUID } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import type { User, UserId } from '../users/user.model.js';

export interface TokenPayload {
  jti: string;
  sub: UserId;
  email: string;
  expiresAt: Date;
}

export function signToken(user: User): string {
  return jwt.sign({ email: user.email }, env.jwt.secret, {
    subject: user.id,
    jwtid: randomUUID(),
    expiresIn: env.jwt.expiresIn as jwt.SignOptions['expiresIn'],
  });
}

export function verifyToken(token: string): TokenPayload {
  const decoded = jwt.verify(token, env.jwt.secret);

  if (typeof decoded === 'string') {
    throw new jwt.JsonWebTokenError('payload do token em formato inesperado');
  }

  const { jti, sub, exp } = decoded;

  if (typeof jti !== 'string' || typeof sub !== 'string' || typeof exp !== 'number') {
    throw new jwt.JsonWebTokenError('token sem jti, sub ou exp');
  }

  return { jti, sub, email: String(decoded['email'] ?? ''), expiresAt: new Date(exp * 1000) };
}
