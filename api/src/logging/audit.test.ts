import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./mongo.js', () => ({ auditCollection: vi.fn() }));

vi.mock('./logger.js', () => ({
  logger: { warn: vi.fn(), error: vi.fn(), debug: vi.fn(), info: vi.fn() },
}));

const { auditCollection } = await import('./mongo.js');
const { logger } = await import('./logger.js');
const { AuditLog } = await import('./audit.js');

const collection = vi.mocked(auditCollection);
const log = vi.mocked(logger);

describe('AuditLog', () => {
  beforeEach(() => {
    collection.mockReturnValue(null);
  });

  it('não derruba a requisição quando o Mongo está fora', async () => {
    const audit = new AuditLog('task');

    await expect(audit.create('id-da-tarefa')).resolves.toBeUndefined();
    expect(log.warn).toHaveBeenCalled();
  });

  it('não derruba a requisição quando a gravação falha', async () => {
    collection.mockReturnValue({
      insertOne: vi.fn().mockRejectedValue(new Error('mongo caiu no meio')),
    } as never);

    const audit = new AuditLog('task');

    await expect(audit.delete('id-da-tarefa')).resolves.toBeUndefined();
    expect(log.error).toHaveBeenCalled();
  });

  it('grava a entrada com entidade, ação e autor', async () => {
    const insertOne = vi.fn().mockResolvedValue({});
    collection.mockReturnValue({ insertOne } as never);

    const audit = new AuditLog('user');

    await audit.update('id-do-usuario', { actorId: 'quem-fez' });

    expect(insertOne).toHaveBeenCalledWith(
      expect.objectContaining({
        entity: 'user',
        entityId: 'id-do-usuario',
        action: 'update',
        actorId: 'quem-fez',
      }),
    );
  });

  it('devolve lista vazia quando não há coleção', async () => {
    const audit = new AuditLog('task');

    await expect(audit.list('id-da-tarefa')).resolves.toEqual([]);
  });
});
