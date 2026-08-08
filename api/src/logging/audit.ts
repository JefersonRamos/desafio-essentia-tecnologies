import type { AuditAction, AuditContext, AuditEntity, AuditEntry } from './audit.model.js';
import { logger } from './logger.js';
import { auditCollection } from './mongo.js';

export class AuditLog {
  constructor(private readonly entity: AuditEntity) {}

  create(entityId: string, context: AuditContext = {}): Promise<void> {
    return this.write('create', entityId, context);
  }

  update(entityId: string, context: AuditContext = {}): Promise<void> {
    return this.write('update', entityId, context);
  }

  delete(entityId: string, context: AuditContext = {}): Promise<void> {
    return this.write('delete', entityId, context);
  }

  async list(entityId: string, limit = 50): Promise<AuditEntry[]> {
    const collection = auditCollection();
    if (!collection) return [];

    return collection
      .find({ entity: this.entity, entityId })
      .sort({ at: -1 })
      .limit(limit)
      .toArray();
  }

  private async write(
    action: AuditAction,
    entityId: string,
    context: AuditContext,
  ): Promise<void> {
    const entry: AuditEntry = {
      entity: this.entity,
      entityId,
      action,
      actorId: context.actorId ?? null,
      before: context.before ?? null,
      after: context.after ?? null,
      at: new Date(),
    };

    const collection = auditCollection();

    if (!collection) {
      logger.warn({ entry }, 'mongo indisponível, log de auditoria descartado');
      return;
    }

    try {
      await collection.insertOne(entry);
      logger.debug({ entity: this.entity, action, entityId }, 'auditoria registrada');
    } catch (error) {
      logger.error({ error, entry }, 'falha ao gravar log de auditoria');
    }
  }
}

export const userAudit = new AuditLog('user');
export const taskAudit = new AuditLog('task');
