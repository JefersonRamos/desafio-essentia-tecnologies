export type AuditEntity = 'user' | 'task';

export type AuditAction = 'create' | 'update' | 'delete';

export interface AuditEntry {
  entity: AuditEntity;
  entityId: string;
  action: AuditAction;
  actorId: string | null;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  at: Date;
}

export interface AuditContext {
  actorId?: string | null;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
}
