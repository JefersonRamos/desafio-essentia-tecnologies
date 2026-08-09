import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { ZodIssue, ZodType } from 'zod';
import type { FailDetail } from './fail.js';
import { HttpError } from './http-error.js';

function toDetail(issue: ZodIssue): FailDetail {
  return { field: issue.path.join('.') || 'body', message: issue.message };
}

export function validateBody<T>(schema: ZodType<T>): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      throw new HttpError(400, 'common.validationError', result.error.issues.map(toDetail));
    }

    req.body = result.data;

    next();
  };
}
