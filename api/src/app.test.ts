import request from 'supertest';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

const estado = vi.hoisted(() => ({
  revogados: new Set<string>(),
  tarefas: [] as Record<string, unknown>[],
  hash: '',
}));

vi.mock('./db/prisma.js', () => ({
  prisma: {
    user: {
      findFirst: vi.fn(({ where }: { where: Record<string, unknown> }) => {
        const cadastrado = {
          id: 'c3f47b60-567c-4fb7-8575-7c8b5edf4086',
          name: 'Candidato',
          email: 'dev@axyo.com.br',
          passwordHash: estado.hash,
        };

        if (where['email'] && where['email'] !== cadastrado.email) return Promise.resolve(null);
        if (where['id'] && where['id'] !== cadastrado.id) return Promise.resolve(null);

        return Promise.resolve(cadastrado);
      }),
    },
    revokedToken: {
      upsert: vi.fn(({ create }: { create: { id: string } }) => {
        estado.revogados.add(create.id);
        return Promise.resolve({});
      }),
      findUnique: vi.fn(({ where }: { where: { id: string } }) =>
        Promise.resolve(estado.revogados.has(where.id) ? { id: where.id } : null),
      ),
      deleteMany: vi.fn(() => Promise.resolve({ count: 0 })),
    },
    task: {
      create: vi.fn(({ data }: { data: Record<string, unknown> }) => {
        const criada = {
          id: 'b3f1c0de-9a2b-4d77-8f3e-1c6a5d0e2b41',
          title: data['title'],
          description: data['description'],
          done: false,
          createdAt: new Date('2026-08-09T12:00:00.000Z'),
          updatedAt: new Date('2026-08-09T12:00:00.000Z'),
        };

        estado.tarefas.push(criada);
        return Promise.resolve(criada);
      }),
      findMany: vi.fn(() => Promise.resolve(estado.tarefas)),
      findFirst: vi.fn(() => Promise.resolve(null)),
      update: vi.fn(() => Promise.resolve({})),
    },
  },
}));

const { createApp } = await import('./app.js');
const { initI18n } = await import('./i18n/index.js');
const { hashPassword } = await import('./auth/password.js');

const app = createApp();

const CREDENCIAIS = { email: 'dev@axyo.com.br', password: 'senha123' };

async function autenticar(): Promise<string> {
  const { body } = await request(app).post('/api/auth/login').send(CREDENCIAIS).expect(200);

  return body.token as string;
}

beforeAll(async () => {
  await initI18n();
  estado.hash = await hashPassword(CREDENCIAIS.password);
});

beforeEach(() => {
  estado.revogados.clear();
  estado.tarefas.length = 0;
});

describe('createApp — montagem da aplicação', () => {
  it('responde o health sem autenticação', async () => {
    const { body } = await request(app).get('/api/health').expect(200);

    expect(body.status).toBe('ok');
  });

  it('devolve 404 com código estável em rota inexistente', async () => {
    const { body } = await request(app).get('/api/nao-existe').expect(404);

    expect(body.code).toBe('common.not_found');
  });

  it('monta o router de tarefas sob /api/tasks', async () => {
    await request(app).get('/api/tasks').expect(401);
    await request(app).get('/tasks').expect(404);
  });

  it('serve o documento OpenAPI', async () => {
    const { body } = await request(app).get('/api/openapi.json').expect(200);

    expect(body.paths).toHaveProperty('/tasks');
  });
});

describe('cadeia de autenticação', () => {
  it('rejeita tarefa sem token', async () => {
    const { body } = await request(app).get('/api/tasks').expect(401);

    expect(body.code).toBe('auth.token_missing');
  });

  it('rejeita header sem o prefixo Bearer', async () => {
    const { body } = await request(app)
      .get('/api/tasks')
      .set('authorization', await autenticar())
      .expect(401);

    expect(body.code).toBe('auth.token_missing');
  });

  it('rejeita token corrompido', async () => {
    const { body } = await request(app)
      .get('/api/tasks')
      .set('authorization', 'Bearer nao.e.um.jwt')
      .expect(401);

    expect(body.code).toBe('auth.token_invalid');
  });

  it('não distingue e-mail inexistente de senha errada', async () => {
    const semEmail = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nao@existe.com', password: 'senha123' })
      .expect(401);

    const senhaErrada = await request(app)
      .post('/api/auth/login')
      .send({ ...CREDENCIAIS, password: 'errada' })
      .expect(401);

    expect(semEmail.body.code).toBe('auth.invalid_credentials');
    expect(senhaErrada.body).toEqual(semEmail.body);
  });

  it('exige e-mail e senha no corpo', async () => {
    const { body } = await request(app).post('/api/auth/login').send({}).expect(400);

    expect(body.code).toBe('auth.credentials_required');
  });
});

describe('login → cria → lista', () => {
  it('percorre o caminho crítico com o token emitido', async () => {
    const token = await autenticar();

    const criada = await request(app)
      .post('/api/tasks')
      .set('authorization', `Bearer ${token}`)
      .send({ title: 'Escrever o teste de HTTP' })
      .expect(201);

    expect(criada.body.task.title).toBe('Escrever o teste de HTTP');

    const listada = await request(app)
      .get('/api/tasks')
      .set('authorization', `Bearer ${token}`)
      .expect(200);

    expect(listada.body.tasks).toHaveLength(1);
  });

  it('valida o corpo antes de chegar no controller', async () => {
    const { body } = await request(app)
      .post('/api/tasks')
      .set('authorization', `Bearer ${await autenticar()}`)
      .send({ title: '   ' })
      .expect(400);

    expect(body.code).toBe('common.validation_error');
    expect(body.details).toEqual([expect.objectContaining({ field: 'title' })]);
  });

  it('recusa id fora do formato uuid', async () => {
    const { body } = await request(app)
      .get('/api/tasks/nao-e-uuid')
      .set('authorization', `Bearer ${await autenticar()}`)
      .expect(400);

    expect(body.code).toBe('common.validation_error');
  });
});

describe('denylist bloqueia requisição real', () => {
  it('o mesmo token deixa de passar depois do logout', async () => {
    const token = await autenticar();

    await request(app).get('/api/tasks').set('authorization', `Bearer ${token}`).expect(200);

    await request(app).post('/api/auth/logout').set('authorization', `Bearer ${token}`).expect(204);

    const { body } = await request(app)
      .get('/api/tasks')
      .set('authorization', `Bearer ${token}`)
      .expect(401);

    expect(body.code).toBe('auth.token_revoked');
  });

  it('revoga só o token apresentado, não a conta inteira', async () => {
    const primeiro = await autenticar();
    const segundo = await autenticar();

    await request(app)
      .post('/api/auth/logout')
      .set('authorization', `Bearer ${primeiro}`)
      .expect(204);

    await request(app).get('/api/tasks').set('authorization', `Bearer ${primeiro}`).expect(401);
    await request(app).get('/api/tasks').set('authorization', `Bearer ${segundo}`).expect(200);
  });

  it('logout sem token não revoga nada', async () => {
    await request(app).post('/api/auth/logout').expect(401);

    expect(estado.revogados.size).toBe(0);
  });
});

describe('i18n na cadeia de middlewares', () => {
  it('traduz a mensagem conforme o Accept-Language', async () => {
    const pt = await request(app).get('/api/tasks').expect(401);
    const en = await request(app).get('/api/tasks').set('accept-language', 'en-US').expect(401);

    expect(pt.body.error).toBe('Token ausente');
    expect(en.body.error).toBe('Missing token');
  });

  it('mantém o código estável entre idiomas', async () => {
    const pt = await request(app).get('/api/tasks').expect(401);
    const en = await request(app).get('/api/tasks').set('accept-language', 'en-US').expect(401);

    expect(en.body.code).toBe(pt.body.code);
  });

  it('aceita o idioma por querystring', async () => {
    const { body } = await request(app).get('/api/tasks?lang=en-US').expect(401);

    expect(body.error).toBe('Missing token');
  });
});
