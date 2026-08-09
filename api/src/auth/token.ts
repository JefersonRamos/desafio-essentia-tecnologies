import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import type { User, UserId } from '../users/user.model.js';

export interface TokenPayload {
  sub: UserId;
  email: string;
}

export function signToken(user: User): string {
  const payload: TokenPayload = { sub: user.id, email: user.email };

  return jwt.sign(payload, env.jwt.secret, {
    expiresIn: env.jwt.expiresIn as jwt.SignOptions['expiresIn'],
  });
}

export function verifyToken(token: string): TokenPayload {
  const decoded = jwt.verify(token, env.jwt.secret);

  if (typeof decoded === 'string' || typeof decoded.sub !== 'string') {
    throw new jwt.JsonWebTokenError('payload do token em formato inesperado');
  }

  return { sub: decoded.sub, email: String(decoded['email'] ?? '') };
}
