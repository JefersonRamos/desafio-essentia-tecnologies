import type { Response } from 'express';
import type { ptBR } from '../i18n/locales/pt-BR.js';

type KeyPath<T, P extends string = ''> = {
  [K in keyof T & string]: T[K] extends string ? `${P}${K}` : KeyPath<T[K], `${P}${K}.`>;
}[keyof T & string];

export type ErrorKey = KeyPath<typeof ptBR>;

export function errorCode(key: ErrorKey): string {
  return key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

export function fail(res: Response, status: number, key: ErrorKey): void {
  res.status(status).json({ code: errorCode(key), error: res.req.t(key) });
}
