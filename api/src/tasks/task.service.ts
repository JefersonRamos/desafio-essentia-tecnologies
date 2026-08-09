import { HttpError } from '../http/http-error.js';
import { taskAudit } from '../logging/audit.js';
import type { UserId } from '../users/user.model.js';
import type { Task, TaskId } from './task.model.js';
import * as repo from './task.repo.js';
import type { CreateTaskInput, UpdateTaskInput } from './task.schema.js';

interface TaskChanges {
  title?: string;
  description?: string | null;
  done?: boolean;
}

export async function list(userId: UserId): Promise<Task[]> {
  return repo.listByUser(userId);
}

export async function findOrFail(id: TaskId, userId: UserId): Promise<Task> {
  const task = await repo.findOwned(id, userId);

  if (!task) throw new HttpError(404, 'tasks.notFound');

  return task;
}

export async function create(userId: UserId, input: CreateTaskInput): Promise<Task> {
  const task = await repo.create({
    userId,
    title: input.title,
    description: input.description ?? null,
  });

  await taskAudit.create(task.id, { actorId: userId, after: snapshot(task) });

  return task;
}

export async function update(
  id: TaskId,
  userId: UserId,
  input: UpdateTaskInput,
): Promise<Task> {
  const current = await findOrFail(id, userId);
  const changes: TaskChanges = {};

  if (input.title !== undefined) {
    changes.title = input.title;
  }

  if (input.description !== undefined) {
    changes.description = input.description;
  }

  if (input.done !== undefined) {
    changes.done = input.done;
  }

  const updated = await repo.update(current.id, changes);

  await taskAudit.update(updated.id, {
    actorId: userId,
    before: snapshot(current),
    after: snapshot(updated),
  });

  return updated;
}

export async function remove(id: TaskId, userId: UserId): Promise<void> {
  const current = await findOrFail(id, userId);

  await repo.softDelete(current.id);

  await taskAudit.delete(current.id, { actorId: userId, before: snapshot(current) });
}

function snapshot(task: Task): Record<string, unknown> {
  return { title: task.title, description: task.description, done: task.done };
}
