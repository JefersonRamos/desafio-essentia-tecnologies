import { Router, type Request, type Response } from 'express';
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
    res.status(400).json({ error: 'email e password são obrigatórios' });
    return;
  }

  const user = await findByEmail(email);

  const ok = user ? await verifyPassword(password, user.passwordHash) : false;

  if (!user || !ok) {
    res.status(401).json({ error: 'credenciais inválidas' });
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
