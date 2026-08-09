import { Router } from 'express';
import * as controller from './auth.controller.js';
import { requireAuth } from './auth.middleware.js';

export const authRouter = Router();

authRouter.post('/login', controller.login);

authRouter.get('/me', requireAuth, controller.me);

authRouter.post('/logout', requireAuth, controller.logout);
