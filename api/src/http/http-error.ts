import type { ErrorKey, FailDetail } from './fail.js';

export class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly key: ErrorKey,
    readonly details?: readonly FailDetail[],
  ) {
    super(key);
    this.name = 'HttpError';
  }
}
