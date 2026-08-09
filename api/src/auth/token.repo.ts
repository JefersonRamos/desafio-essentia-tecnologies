import { prisma } from '../db/prisma.js';
import type { UserId } from '../users/user.model.js';

export async function revoke(token: {
  id: string;
  userId: UserId;
  expiresAt: Date;
}): Promise<void> {
  await prisma.revokedToken.upsert({
    where: { id: token.id },
    create: token,
    update: {},
  });
}

export async function isRevoked(id: string): Promise<boolean> {
  const found = await prisma.revokedToken.findUnique({ where: { id }, select: { id: true } });

  return found !== null;
}

export async function purgeExpired(): Promise<number> {
  const { count } = await prisma.revokedToken.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });

  return count;
}
