import { Router } from 'express';
import { requireAuth } from '../auth/auth.middleware.js';
import { validateBody } from '../http/validate.js';
import * as controller from './user.controller.js';
import { requireOwnership } from './user.middleware.js';
import { updateUserSchema } from './user.schema.js';

export const userRouter = Router();

userRouter.get('/:id', requireAuth, requireOwnership, controller.show);

userRouter.patch(
  '/:id',
  requireAuth,
  requireOwnership,
  validateBody(updateUserSchema),
  controller.update,
);

userRouter.delete('/:id', requireAuth, requireOwnership, controller.destroy);
