import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { ZodIssue, ZodType } from 'zod';
import type { FailDetail } from './fail.js';
import { HttpError } from './http-error.js';

function toDetail(issue: ZodIssue): FailDetail {
  return { field: issue.path.join('.') || 'body', message: issue.message };
}

export function validateBody<T>(schema: ZodType<T>): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    req.body = parse(schema, req.body);

    next();
  };
}

export function parseParams<T>(schema: ZodType<T>, params: unknown): T {
  return parse(schema, params);
}

function parse<T>(schema: ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);

  if (!result.success) {
    throw new HttpError(400, 'common.validationError', result.error.issues.map(toDetail));
  }

  return result.data;
}
