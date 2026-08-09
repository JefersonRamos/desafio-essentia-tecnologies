import { Router, type Request, type Response } from 'express';
import { fail } from '../http/fail.js';
import { findByEmail } from '../users/user.repo.js';
import { requireAuth } from './auth.middleware.js';
import { verifyPassword } from './password.js';
import { signToken } from './token.js';

export const authRouter = Router();

interface LoginBody {
  email?: unknown;
  password?: unknown;
}

authRouter.post('/login', async (req: Request<unknown, unknown, LoginBody>, res: Response) => {
  const { email, password } = req.body ?? {};

  if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
    fail(res, 400, 'auth.credentialsRequired');
    return;
  }

  const user = await findByEmail(email);

  const verified = user ? await verifyPassword(password, user.passwordHash) : false;

  if (!user || !verified) {
    fail(res, 401, 'auth.invalidCredentials');
    return;
  }

  res.json({
    token: signToken(user),
    user: { id: user.id, name: user.name, email: user.email },
  });
});

authRouter.get('/me', requireAuth, (req: Request, res: Response) => {
  res.json({ user: req.user });
});
