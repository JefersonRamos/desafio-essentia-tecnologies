import { startTokenCleanup } from './auth/token.cleanup.js';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { initI18n } from './i18n/index.js';
import { logger } from './logging/logger.js';
import { connectMongo, disconnectMongo } from './logging/mongo.js';

async function start(): Promise<void> {
  await initI18n();

  try {
    await connectMongo();
  } catch (error) {
    logger.error({ error }, 'mongo indisponível, seguindo sem log de auditoria');
  }

  startTokenCleanup();

  const server = createApp().listen(env.port, () => {
    logger.info({ port: env.port }, 'api no ar');
  });

  for (const signal of ['SIGINT', 'SIGTERM'] as const) {
    process.on(signal, () => {
      server.close(() => {
        void disconnectMongo().then(() => process.exit(0));
      });
    });
  }
}

void start();
