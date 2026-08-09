import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../db/prisma.js', () => ({
  prisma: {
    revokedToken: {
      upsert: vi.fn(),
      findUnique: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));

const { prisma } = await import('../db/prisma.js');
const repo = await import('./token.repo.js');

const revoked = vi.mocked(prisma.revokedToken);

const JTI = 'a58a5e79-0de6-42ad-aee9-d5d7204e926b';
const USER = 'c3f47b60-567c-4fb7-8575-7c8b5edf4086';

describe('token.repo', () => {
  beforeEach(() => {
    revoked.upsert.mockResolvedValue({} as never);
    revoked.findUnique.mockResolvedValue(null);
    revoked.deleteMany.mockResolvedValue({ count: 0 });
  });

  describe('revoke', () => {
    it('grava o jti como chave da revogação', async () => {
      const expiresAt = new Date('2026-08-09T15:00:00.000Z');

      await repo.revoke({ id: JTI, userId: USER, expiresAt });

      expect(revoked.upsert).toHaveBeenCalledWith({
        where: { id: JTI },
        create: { id: JTI, userId: USER, expiresAt },
        update: {},
      });
    });

    it('revogar o mesmo token duas vezes não estoura', async () => {
      const token = { id: JTI, userId: USER, expiresAt: new Date() };

      await repo.revoke(token);
      await expect(repo.revoke(token)).resolves.toBeUndefined();

      const [{ update }] = revoked.upsert.mock.calls[1]!;

      expect(update).toEqual({});
    });
  });

  describe('isRevoked', () => {
    it('é falso quando o jti não está na denylist', async () => {
      revoked.findUnique.mockResolvedValue(null);

      await expect(repo.isRevoked(JTI)).resolves.toBe(false);
    });

    it('é verdadeiro quando o jti está na denylist', async () => {
      revoked.findUnique.mockResolvedValue({ id: JTI } as never);

      await expect(repo.isRevoked(JTI)).resolves.toBe(true);
    });
  });

  describe('purgeExpired', () => {
    it('apaga apenas o que já venceu', async () => {
      const antes = Date.now();

      await repo.purgeExpired();

      const where = revoked.deleteMany.mock.calls[0]?.[0]?.where ?? {};
      const corte = (where as { expiresAt: { lt: Date } }).expiresAt.lt;

      expect(Object.keys(where)).toEqual(['expiresAt']);
      expect(corte.getTime()).toBeGreaterThanOrEqual(antes);
      expect(corte.getTime()).toBeLessThanOrEqual(Date.now());
    });

    it('devolve quantas linhas saíram', async () => {
      revoked.deleteMany.mockResolvedValue({ count: 7 });

      await expect(repo.purgeExpired()).resolves.toBe(7);
    });
  });
});
