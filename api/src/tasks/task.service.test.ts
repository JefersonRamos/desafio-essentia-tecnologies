import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HttpError } from '../http/http-error.js';

vi.mock('./task.repo.js', () => ({
  listByUser: vi.fn(),
  findOwned: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  softDelete: vi.fn(),
}));

vi.mock('../logging/audit.js', () => ({
  taskAudit: { create: vi.fn(), update: vi.fn(), delete: vi.fn() },
}));

const repo = vi.mocked(await import('./task.repo.js'));
const { taskAudit } = await import('../logging/audit.js');
const service = await import('./task.service.js');

const audit = vi.mocked(taskAudit);

const OWNER = 'c3f47b60-567c-4fb7-8575-7c8b5edf4086';
const TASK = 'b3f1c0de-9a2b-4d77-8f3e-1c6a5d0e2b41';

const tarefa = {
  id: TASK,
  title: 'Configurar projeto Angular',
  description: null,
  done: false,
  createdAt: new Date('2026-08-09T12:00:00.000Z'),
  updatedAt: new Date('2026-08-09T12:00:00.000Z'),
};

describe('task.service', () => {
  beforeEach(() => {
    repo.findOwned.mockResolvedValue(tarefa);
    repo.create.mockResolvedValue(tarefa);
    repo.update.mockResolvedValue(tarefa);
    repo.softDelete.mockResolvedValue(undefined);
  });

  describe('findOrFail', () => {
    it('devolve 404 — não 403 — quando a tarefa não é do usuário', async () => {
      repo.findOwned.mockResolvedValue(null);

      const erro = await service.findOrFail(TASK, OWNER).catch((e: unknown) => e);

      expect(erro).toBeInstanceOf(HttpError);
      expect((erro as HttpError).status).toBe(404);
      expect((erro as HttpError).key).toBe('tasks.notFound');
    });

    it('repassa o dono para a consulta', async () => {
      await service.findOrFail(TASK, OWNER);

      expect(repo.findOwned).toHaveBeenCalledWith(TASK, OWNER);
    });
  });

  describe('create', () => {
    it('grava descrição ausente como null, não undefined', async () => {
      await service.create(OWNER, { title: 'Escrever README' });

      expect(repo.create).toHaveBeenCalledWith({
        userId: OWNER,
        title: 'Escrever README',
        description: null,
      });
    });

    it('audita a criação com o autor', async () => {
      await service.create(OWNER, { title: 'Escrever README' });

      expect(audit.create).toHaveBeenCalledWith(
        TASK,
        expect.objectContaining({ actorId: OWNER }),
      );
    });
  });

  describe('update', () => {
    it('só envia os campos presentes no corpo', async () => {
      await service.update(TASK, OWNER, { done: true });

      expect(repo.update).toHaveBeenCalledWith(TASK, { done: true });
    });

    it('distingue descrição ausente de descrição apagada', async () => {
      await service.update(TASK, OWNER, { description: null });

      expect(repo.update).toHaveBeenCalledWith(TASK, { description: null });
    });

    it('não toca no banco quando a tarefa é de outro dono', async () => {
      repo.findOwned.mockResolvedValue(null);

      await expect(service.update(TASK, OWNER, { done: true })).rejects.toBeInstanceOf(
        HttpError,
      );
      expect(repo.update).not.toHaveBeenCalled();
    });

    it('registra antes e depois na auditoria', async () => {
      await service.update(TASK, OWNER, { done: true });

      const contexto = audit.update.mock.calls[0]?.[1] ?? {};

      expect(contexto).toMatchObject({ actorId: OWNER });
      expect(contexto.before).toBeTruthy();
      expect(contexto.after).toBeTruthy();
    });
  });

  describe('remove', () => {
    it('usa remoção lógica', async () => {
      await service.remove(TASK, OWNER);

      expect(repo.softDelete).toHaveBeenCalledWith(TASK);
    });

    it('não remove tarefa de outro dono', async () => {
      repo.findOwned.mockResolvedValue(null);

      await expect(service.remove(TASK, OWNER)).rejects.toBeInstanceOf(HttpError);
      expect(repo.softDelete).not.toHaveBeenCalled();
    });
  });
});
