import { logger } from '../logging/logger.js';
import { purgeExpired } from './token.repo.js';

const INTERVAL_MS = 60 * 60 * 1000;

async function purge(): Promise<void> {
  try {
    const removed = await purgeExpired();

    if (removed > 0) logger.info({ removed }, 'tokens revogados expirados removidos');
  } catch (error) {
    logger.error({ error }, 'falha ao limpar tokens revogados');
  }
}

export function startTokenCleanup(): NodeJS.Timeout {
  void purge();

  return setInterval(() => void purge(), INTERVAL_MS).unref();
}
