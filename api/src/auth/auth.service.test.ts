import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HttpError } from '../http/http-error.js';

vi.mock('../users/user.repo.js', () => ({ findByEmail: vi.fn() }));
vi.mock('../users/user.service.js', () => ({ register: vi.fn() }));
vi.mock('./password.js', () => ({ verifyPassword: vi.fn(), hashPassword: vi.fn() }));
vi.mock('./token.repo.js', () => ({ revoke: vi.fn() }));

const { findByEmail } = vi.mocked(await import('../users/user.repo.js'));
const users = vi.mocked(await import('../users/user.service.js'));
const { verifyPassword } = vi.mocked(await import('./password.js'));
const { revoke } = vi.mocked(await import('./token.repo.js'));
const service = await import('./auth.service.js');

const USER = {
  id: 'c3f47b60-567c-4fb7-8575-7c8b5edf4086',
  name: 'Candidato',
  email: 'dev@axyo.com.br',
};

const COM_SEGREDO = { ...USER, passwordHash: '$2a$12$hash' };

describe('auth.service', () => {
  beforeEach(() => {
    findByEmail.mockResolvedValue(COM_SEGREDO);
    verifyPassword.mockResolvedValue(true);
    users.register.mockResolvedValue(USER);
    revoke.mockResolvedValue(undefined);
  });

  describe('login', () => {
    it('devolve token e usuário sem o hash da senha', async () => {
      const sessao = await service.login('dev@axyo.com.br', 'senha123');

      expect(sessao.token).toEqual(expect.any(String));
      expect(sessao.user).toEqual(USER);
      expect(sessao.user).not.toHaveProperty('passwordHash');
    });

    it('não distingue e-mail inexistente de senha errada', async () => {
      findByEmail.mockResolvedValue(null);
      const semEmail = await service.login('nao@existe.com', 'senha123').catch((e: unknown) => e);

      findByEmail.mockResolvedValue(COM_SEGREDO);
      verifyPassword.mockResolvedValue(false);
      const senhaErrada = await service.login('dev@axyo.com.br', 'errada').catch((e: unknown) => e);

      expect((semEmail as HttpError).status).toBe(401);
      expect((semEmail as HttpError).key).toBe('auth.invalidCredentials');
      expect((senhaErrada as HttpError).key).toBe((semEmail as HttpError).key);
    });

    it('não compara senha quando o e-mail não existe', async () => {
      findByEmail.mockResolvedValue(null);

      await service.login('nao@existe.com', 'senha123').catch(() => undefined);

      expect(verifyPassword).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('revoga exatamente o jti do token apresentado', async () => {
      const expiresAt = new Date('2026-08-09T16:00:00.000Z');

      await service.logout({
        jti: 'a58a5e79-0de6-42ad-aee9-d5d7204e926b',
        sub: USER.id,
        email: USER.email,
        expiresAt,
      });

      expect(revoke).toHaveBeenCalledWith({
        id: 'a58a5e79-0de6-42ad-aee9-d5d7204e926b',
        userId: USER.id,
        expiresAt,
      });
    });
  });

  describe('register', () => {
    it('já devolve sessão, sem exigir login em seguida', async () => {
      const sessao = await service.register({
        name: 'Candidato',
        email: 'dev@axyo.com.br',
        password: 'senha123',
      });

      expect(sessao).toEqual({ token: expect.any(String), user: USER });
    });
  });
});
