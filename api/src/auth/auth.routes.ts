import { Router } from 'express';
import { validateBody } from '../http/validate.js';
import { createUserSchema } from '../users/user.schema.js';
import * as controller from './auth.controller.js';
import { requireAuth } from './auth.middleware.js';

export const authRouter = Router();

authRouter.post('/register', validateBody(createUserSchema), controller.register);

authRouter.post('/login', controller.login);

authRouter.get('/me', requireAuth, controller.me);

authRouter.post('/logout', requireAuth, controller.logout);
