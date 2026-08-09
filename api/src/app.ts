import express, {
  type Express,
  type NextFunction,
  type Request,
  type Response,
} from 'express';
import swaggerUi from 'swagger-ui-express';
import { errorCode, fail } from './http/fail.js';
import { HttpError } from './http/http-error.js';
import { i18nMiddleware } from './i18n/index.js';
import { logger } from './logging/logger.js';
import { authRouter } from './auth/auth.routes.js';
import { userRouter } from './users/user.routes.js';
import { taskRouter } from './tasks/task.routes.js';
import { openapiDocument } from './docs/openapi.js';

export function createApp(): Express {
  const app = express();

  app.use(express.json());
  app.use(i18nMiddleware);

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', uptime: process.uptime() });
  });

  app.use('/api/auth', authRouter);
  app.use('/api/users', userRouter);
  app.use('/api/tasks', taskRouter);

  app.get('/api/openapi.json', (_req: Request, res: Response) => {
    res.json(openapiDocument);
  });

  app.use(
    '/api/docs',
    swaggerUi.serve,
    swaggerUi.setup(openapiDocument, { customSiteTitle: 'TechX API' }),
  );

  app.use((_req: Request, res: Response) => {
    fail(res, 404, 'common.notFound');
  });

  app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (error instanceof HttpError) {
      fail(res, error.status, error.key, error.details);
      return;
    }

    logger.error({ error, code: errorCode('common.internalError') }, 'erro nao tratado');
    fail(res, 500, 'common.internalError');
  });

  return app;
}
