import { Router } from 'express';
import { requireAuth } from '../auth/auth.middleware.js';
import { validateBody } from '../http/validate.js';
import * as controller from './task.controller.js';
import { createTaskSchema, updateTaskSchema } from './task.schema.js';

export const taskRouter = Router();

taskRouter.use(requireAuth);

taskRouter.get('/', controller.index);

taskRouter.post('/', validateBody(createTaskSchema), controller.store);

taskRouter.get('/:id', controller.show);

taskRouter.patch('/:id', validateBody(updateTaskSchema), controller.update);

taskRouter.delete('/:id', controller.destroy);
