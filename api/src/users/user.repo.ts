import { prisma } from '../db/prisma.js';
import type { User, UserId, UserWithSecret } from './user.model.js';

export async function findByEmail(email: string): Promise<UserWithSecret | null> {
  return prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, email: true, passwordHash: true },
  });
}

export async function findById(id: UserId): Promise<User | null> {
  return prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true },
  });
}
