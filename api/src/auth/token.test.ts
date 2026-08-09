import { describe, expect, it } from 'vitest';
import { signToken, verifyToken } from './token.js';

const USER = {
  id: 'c3f47b60-567c-4fb7-8575-7c8b5edf4086',
  name: 'Candidato',
  email: 'dev@axyo.com.br',
};

describe('token', () => {
  it('assina e verifica o próprio token', () => {
    const payload = verifyToken(signToken(USER));

    expect(payload.sub).toBe(USER.id);
    expect(payload.email).toBe(USER.email);
  });

  it('gera um jti diferente a cada emissão', () => {
    const primeiro = verifyToken(signToken(USER));
    const segundo = verifyToken(signToken(USER));

    expect(primeiro.jti).toEqual(expect.any(String));
    expect(primeiro.jti).not.toBe(segundo.jti);
  });

  it('expõe a expiração como Date, para a denylist saber até quando guardar', () => {
    const { expiresAt } = verifyToken(signToken(USER));

    expect(expiresAt).toBeInstanceOf(Date);
    expect(expiresAt.getTime()).toBeGreaterThan(Date.now());
  });

  it('recusa token adulterado', () => {
    const token = signToken(USER);
    const adulterado = `${token.slice(0, -3)}xyz`;

    expect(() => verifyToken(adulterado)).toThrow();
  });

  it('recusa token assinado com outro segredo', () => {
    const outro =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ4In0.assinatura-invalida';

    expect(() => verifyToken(outro)).toThrow();
  });
});
