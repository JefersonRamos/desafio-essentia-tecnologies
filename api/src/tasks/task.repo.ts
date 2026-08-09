import { prisma } from '../db/prisma.js';
import type { UserId } from '../users/user.model.js';
import type { Task, TaskId } from './task.model.js';

const ACTIVE = { deletedAt: null } as const;

const PUBLIC_FIELDS = {
  id: true,
  title: true,
  description: true,
  done: true,
  createdAt: true,
  updatedAt: true,
} as const;

export async function listByUser(userId: UserId): Promise<Task[]> {
  return prisma.task.findMany({
    where: { userId, ...ACTIVE },
    orderBy: [{ done: 'asc' }, { createdAt: 'desc' }],
    select: PUBLIC_FIELDS,
  });
}

export async function findOwned(id: TaskId, userId: UserId): Promise<Task | null> {
  return prisma.task.findFirst({ where: { id, userId, ...ACTIVE }, select: PUBLIC_FIELDS });
}

export async function create(data: {
  userId: UserId;
  title: string;
  description: string | null;
}): Promise<Task> {
  return prisma.task.create({ data, select: PUBLIC_FIELDS });
}

export async function update(
  id: TaskId,
  data: { title?: string; description?: string | null; done?: boolean },
): Promise<Task> {
  return prisma.task.update({ where: { id }, data, select: PUBLIC_FIELDS });
}

export async function softDelete(id: TaskId): Promise<void> {
  await prisma.task.update({ where: { id }, data: { deletedAt: new Date() } });
}
