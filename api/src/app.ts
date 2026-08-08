import express, {
  type Express,
  type NextFunction,
  type Request,
  type Response,
} from 'express';
import swaggerUi from 'swagger-ui-express';
import { authRouter } from './auth/auth.routes.js';
import { openapiDocument } from './docs/openapi.js';

export function createApp(): Express {
  const app = express();

  app.use(express.json());

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', uptime: process.uptime() });
  });

  app.use('/api/auth', authRouter);

  app.get('/api/openapi.json', (_req: Request, res: Response) => {
    res.json(openapiDocument);
  });

  app.use(
    '/api/docs',
    swaggerUi.serve,
    swaggerUi.setup(openapiDocument, { customSiteTitle: 'TechX API' }),
  );

  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: 'rota não encontrada' });
  });

  app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error(error);
    res.status(500).json({ error: 'erro interno' });
  });

  return app;
}
