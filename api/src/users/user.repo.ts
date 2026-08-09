import { Prisma } from '../generated/prisma/client.js';
import { prisma } from '../db/prisma.js';
import type { User, UserId, UserWithSecret } from './user.model.js';

const UNIQUE_VIOLATION = 'P2002';

const ACTIVE = { deletedAt: null } as const;

const PUBLIC_FIELDS = { id: true, name: true, email: true } as const;

const SECRET_FIELDS = { ...PUBLIC_FIELDS, passwordHash: true } as const;

export async function findByEmail(email: string): Promise<UserWithSecret | null> {
  return prisma.user.findFirst({ where: { email, ...ACTIVE }, select: SECRET_FIELDS });
}

export async function findById(id: UserId): Promise<User | null> {
  return prisma.user.findFirst({ where: { id, ...ACTIVE }, select: PUBLIC_FIELDS });
}

export async function findSecretById(id: UserId): Promise<UserWithSecret | null> {
  return prisma.user.findFirst({ where: { id, ...ACTIVE }, select: SECRET_FIELDS });
}

export async function isEmailTaken(email: string, exceptId?: UserId): Promise<boolean> {
  const found = await prisma.user.findUnique({ where: { email }, select: { id: true } });

  return found !== null && found.id !== exceptId;
}

export async function create(data: {
  name: string;
  email: string;
  passwordHash: string;
}): Promise<User> {
  return prisma.user.create({ data, select: PUBLIC_FIELDS });
}

export async function update(
  id: UserId,
  data: { name?: string; email?: string; passwordHash?: string },
): Promise<User> {
  return prisma.user.update({ where: { id }, data, select: PUBLIC_FIELDS });
}

export async function softDelete(id: UserId): Promise<void> {
  await prisma.user.update({ where: { id }, data: { deletedAt: new Date() } });
}

export function isDuplicateEmail(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError && error.code === UNIQUE_VIOLATION
  );
}
