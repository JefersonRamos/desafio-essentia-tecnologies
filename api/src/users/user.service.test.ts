import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HttpError } from '../http/http-error.js';

vi.mock('./user.repo.js', () => ({
  create: vi.fn(),
  update: vi.fn(),
  findById: vi.fn(),
  findSecretById: vi.fn(),
  isEmailTaken: vi.fn(),
  softDelete: vi.fn(),
  isDuplicateEmail: vi.fn(() => false),
}));

vi.mock('../auth/password.js', () => ({
  hashPassword: vi.fn(async () => '$2a$12$novo'),
  verifyPassword: vi.fn(),
}));

vi.mock('../logging/audit.js', () => ({
  userAudit: { create: vi.fn(), update: vi.fn(), delete: vi.fn() },
}));

const repo = vi.mocked(await import('./user.repo.js'));
const { hashPassword, verifyPassword } = vi.mocked(await import('../auth/password.js'));
const service = await import('./user.service.js');

const USER = {
  id: 'c3f47b60-567c-4fb7-8575-7c8b5edf4086',
  name: 'Candidato',
  email: 'dev@axyo.com.br',
};

describe('user.service', () => {
  beforeEach(() => {
    repo.findById.mockResolvedValue(USER);
    repo.findSecretById.mockResolvedValue({ ...USER, passwordHash: '$2a$12$atual' });
    repo.isEmailTaken.mockResolvedValue(false);
    repo.isDuplicateEmail.mockReturnValue(false);
    repo.create.mockResolvedValue(USER);
    repo.update.mockResolvedValue(USER);
    repo.softDelete.mockResolvedValue(undefined);
    verifyPassword.mockResolvedValue(true);
  });

  describe('register', () => {
    it('nunca grava a senha em claro', async () => {
      await service.register({ name: 'Candidato', email: 'dev@axyo.com.br', password: 'senha123' });

      const [dados] = repo.create.mock.calls[0]!;

      expect(dados).not.toHaveProperty('password');
      expect(dados.passwordHash).toBe('$2a$12$novo');
      expect(hashPassword).toHaveBeenCalledWith('senha123');
    });

    it('recusa e-mail já cadastrado com 409', async () => {
      repo.isEmailTaken.mockResolvedValue(true);

      const erro = await service
        .register({ name: 'Outro', email: 'dev@axyo.com.br', password: 'senha123' })
        .catch((e: unknown) => e);

      expect((erro as HttpError).status).toBe(409);
      expect((erro as HttpError).key).toBe('users.emailTaken');
      expect(repo.create).not.toHaveBeenCalled();
    });

    it('traduz corrida de e-mail duplicado do banco para o mesmo 409', async () => {
      repo.isEmailTaken.mockResolvedValue(false);
      repo.create.mockRejectedValue(new Error('P2002'));
      repo.isDuplicateEmail.mockReturnValue(true);

      const erro = await service
        .register({ name: 'Outro', email: 'dev@axyo.com.br', password: 'senha123' })
        .catch((e: unknown) => e);

      expect((erro as HttpError).status).toBe(409);
    });
  });

  describe('updateProfile', () => {
    it('exige a senha atual para trocar a senha', async () => {
      verifyPassword.mockResolvedValue(false);

      const erro = await service
        .updateProfile(USER.id, { password: 'novasenha123', currentPassword: 'errada' })
        .catch((e: unknown) => e);

      expect((erro as HttpError).status).toBe(400);
      expect((erro as HttpError).key).toBe('users.currentPasswordInvalid');
      expect(repo.update).not.toHaveBeenCalled();
    });

    it('não checa disponibilidade quando o e-mail não mudou', async () => {
      await service.updateProfile(USER.id, { email: USER.email });

      expect(repo.isEmailTaken).not.toHaveBeenCalled();
    });

    it('só envia os campos que vieram', async () => {
      await service.updateProfile(USER.id, { name: 'Candidato Silva' });

      expect(repo.update).toHaveBeenCalledWith(USER.id, { name: 'Candidato Silva' });
    });
  });

  describe('remove', () => {
    it('usa remoção lógica', async () => {
      await service.remove(USER.id);

      expect(repo.softDelete).toHaveBeenCalledWith(USER.id);
    });

    it('devolve 404 para usuário inexistente', async () => {
      repo.findById.mockResolvedValue(null);

      const erro = await service.remove(USER.id).catch((e: unknown) => e);

      expect((erro as HttpError).status).toBe(404);
    });
  });
});
