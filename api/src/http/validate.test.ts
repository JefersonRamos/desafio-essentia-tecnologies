import { describe, expect, it, vi } from 'vitest';
import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { HttpError } from './http-error.js';
import { parseParams, validateBody } from './validate.js';

const schema = z.object({ title: z.string().trim().min(1).max(255) });

function requisicao(body: unknown): Request {
  return { body } as Request;
}

describe('validateBody', () => {
  it('substitui o corpo pelo dado já normalizado', () => {
    const req = requisicao({ title: '  Configurar projeto  ' });
    const next = vi.fn() as unknown as NextFunction;

    validateBody(schema)(req, {} as Response, next);

    expect(req.body).toEqual({ title: 'Configurar projeto' });
    expect(next).toHaveBeenCalledOnce();
  });

  it('recusa corpo inválido com 400 e não chama o próximo middleware', () => {
    const next = vi.fn() as unknown as NextFunction;

    const erro = (() => {
      try {
        validateBody(schema)(requisicao({ title: '' }), {} as Response, next);
      } catch (e: unknown) {
        return e;
      }
      return null;
    })();

    expect(erro).toBeInstanceOf(HttpError);
    expect((erro as HttpError).status).toBe(400);
    expect((erro as HttpError).key).toBe('common.validationError');
    expect(next).not.toHaveBeenCalled();
  });

  it('aponta qual campo reprovou', () => {
    try {
      validateBody(schema)(requisicao({}), {} as Response, vi.fn() as unknown as NextFunction);
      expect.unreachable('deveria ter lançado');
    } catch (erro) {
      expect((erro as HttpError).details).toEqual([
        expect.objectContaining({ field: 'title' }),
      ]);
    }
  });
});

describe('parseParams', () => {
  const params = z.object({ id: z.uuid() });

  it('devolve o valor tipado quando o parâmetro é válido', () => {
    const id = 'b3f1c0de-9a2b-4d77-8f3e-1c6a5d0e2b41';

    expect(parseParams(params, { id })).toEqual({ id });
  });

  it('recusa id fora do formato uuid antes de qualquer ida ao banco', () => {
    expect(() => parseParams(params, { id: 'nao-e-uuid' })).toThrow(HttpError);
  });

  it('recusa parâmetro ausente', () => {
    expect(() => parseParams(params, {})).toThrow(HttpError);
  });
});
