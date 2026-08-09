import { MongoClient, type Collection, type Db } from 'mongodb';
import { env } from '../config/env.js';
import type { AuditEntry } from './audit.model.js';
import { logger } from './logger.js';

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectMongo(): Promise<Db> {
  if (db) return db;

  client = new MongoClient(env.mongo.url);
  await client.connect();
  db = client.db(env.mongo.database);

  await db.collection<AuditEntry>('audit_logs').createIndexes([
    { key: { at: -1 } },
    { key: { entity: 1, entityId: 1, at: -1 } },
    { key: { actorId: 1, at: -1 } },
    { key: { at: 1 }, expireAfterSeconds: env.mongo.retentionDays * 86400 },
  ]);

  logger.info({ database: env.mongo.database, retentionDays: env.mongo.retentionDays }, 'mongo conectado');

  return db;
}

export function auditCollection(): Collection<AuditEntry> | null {
  return db ? db.collection<AuditEntry>('audit_logs') : null;
}

export async function disconnectMongo(): Promise<void> {
  await client?.close();
  client = null;
  db = null;
}
