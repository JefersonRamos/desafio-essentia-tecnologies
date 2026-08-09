import type { Request, Response } from 'express';
import { authenticated } from '../auth/auth.middleware.js';
import { parseParams } from '../http/validate.js';
import { taskParamsSchema, type CreateTaskInput, type UpdateTaskInput } from './task.schema.js';
import * as tasks from './task.service.js';

type WithBody<T> = Request<Record<string, string>, unknown, T>;

function taskId(req: Pick<Request, 'params'>): string {
  return parseParams(taskParamsSchema, req.params).id;
}

export async function index(req: Request, res: Response): Promise<void> {
  const list = await tasks.list(authenticated(req).id);

  res.json({ tasks: list });
}

export async function store(req: WithBody<CreateTaskInput>, res: Response): Promise<void> {
  const task = await tasks.create(authenticated(req).id, req.body);

  res.status(201).json({ task });
}

export async function show(req: Request, res: Response): Promise<void> {
  const task = await tasks.findOrFail(taskId(req), authenticated(req).id);

  res.json({ task });
}

export async function update(req: WithBody<UpdateTaskInput>, res: Response): Promise<void> {
  const task = await tasks.update(taskId(req), authenticated(req).id, req.body);

  res.json({ task });
}

export async function destroy(req: Request, res: Response): Promise<void> {
  await tasks.remove(taskId(req), authenticated(req).id);

  res.status(204).end();
}
