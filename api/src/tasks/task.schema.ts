import { z } from 'zod';

const title = z.string().trim().min(1).max(255);

const description = z.string().trim().max(5000).nullable();

const done = z.boolean();

export const taskParamsSchema = z.object({ id: z.uuid() });

export const taskQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.uuid().optional(),
});

export const createTaskSchema = z.object({ title, description: description.optional() });

export const updateTaskSchema = z
  .object({
    title: title.optional(),
    description: description.optional(),
    done: done.optional(),
  })
  .refine(
    (body) => body.title !== undefined || body.description !== undefined || body.done !== undefined,
    { error: 'Informe ao menos um campo: title, description ou done' },
  );

export type TaskQuery = z.infer<typeof taskQuerySchema>;

export type CreateTaskInput = z.infer<typeof createTaskSchema>;

export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
