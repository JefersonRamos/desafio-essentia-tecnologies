import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../db/prisma.js', () => ({
  prisma: {
    task: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

const { prisma } = await import('../db/prisma.js');
const repo = await import('./task.repo.js');

const task = vi.mocked(prisma.task);

const OWNER = 'c3f47b60-567c-4fb7-8575-7c8b5edf4086';
const TASK = 'b3f1c0de-9a2b-4d77-8f3e-1c6a5d0e2b41';

describe('task.repo', () => {
  beforeEach(() => {
    task.findMany.mockResolvedValue([]);
    task.findFirst.mockResolvedValue(null);
    task.update.mockResolvedValue({} as never);
  });

  describe('listByUser', () => {
    const PAGINA = { limit: 20 };

    it('filtra pelo dono e esconde as removidas', async () => {
      await repo.listByUser(OWNER, PAGINA);

      expect(task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: OWNER, deletedAt: null } }),
      );
    });

    it('desempata por id, senão o cursor não é estável', async () => {
      await repo.listByUser(OWNER, PAGINA);

      const args = task.findMany.mock.calls[0]?.[0];

      expect(args?.orderBy).toEqual([{ done: 'asc' }, { createdAt: 'desc' }, { id: 'desc' }]);
    });

    it('pede um item além do limite, para saber se há próxima página', async () => {
      await repo.listByUser(OWNER, { limit: 20 });

      expect(task.findMany.mock.calls[0]?.[0]?.take).toBe(21);
    });

    it('sem cursor, não posiciona nem pula linha', async () => {
      await repo.listByUser(OWNER, PAGINA);

      const args = task.findMany.mock.calls[0]?.[0];

      expect(args).not.toHaveProperty('cursor');
      expect(args).not.toHaveProperty('skip');
    });

    it('com cursor, posiciona nele e pula a própria linha', async () => {
      await repo.listByUser(OWNER, { limit: 20, cursor: TASK });

      const args = task.findMany.mock.calls[0]?.[0];

      expect(args?.cursor).toEqual({ id: TASK });
      expect(args?.skip).toBe(1);
    });

    it('nunca seleciona a coluna de remoção', async () => {
      await repo.listByUser(OWNER, PAGINA);

      expect(task.findMany).toHaveBeenCalledOnce();

      const select = task.findMany.mock.calls[0]?.[0]?.select ?? {};

      expect(select).not.toHaveProperty('deletedAt');
      expect(select).not.toHaveProperty('userId');
    });
  });

  describe('findOwned', () => {
    it('exige id e dono na mesma consulta', async () => {
      await repo.findOwned(TASK, OWNER);

      expect(task.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: TASK, userId: OWNER, deletedAt: null } }),
      );
    });

    it('devolve null quando a tarefa é de outro dono', async () => {
      task.findFirst.mockResolvedValue(null);

      await expect(repo.findOwned(TASK, 'outro-usuario')).resolves.toBeNull();
    });
  });

  describe('softDelete', () => {
    it('marca deletedAt em vez de apagar a linha', async () => {
      await repo.softDelete(TASK);

      expect(task.update).toHaveBeenCalledTimes(1);

      const args = task.update.mock.calls[0]?.[0];

      expect(args?.where).toEqual({ id: TASK });
      expect(args?.data.deletedAt).toBeInstanceOf(Date);
    });

  });
});
