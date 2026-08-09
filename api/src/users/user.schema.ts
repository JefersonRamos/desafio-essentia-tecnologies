import { z } from 'zod';

const name = z.string().trim().min(2).max(255);

const email = z.string().trim().toLowerCase().pipe(z.email().max(255));

const password = z.string().min(8).max(128);

export const createUserSchema = z.object({ name, email, password });

export const updateUserSchema = z
  .object({
    name: name.optional(),
    email: email.optional(),
    password: password.optional(),
    currentPassword: z.string().optional(),
  })
  .refine(
    (body) => body.name !== undefined || body.email !== undefined || body.password !== undefined,
    { error: 'Informe ao menos um campo: name, email ou password' },
  )
  .refine((body) => body.password === undefined || Boolean(body.currentPassword), {
    path: ['currentPassword'],
    error: 'Obrigatório para trocar a senha',
  });

export type CreateUserInput = z.infer<typeof createUserSchema>;

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
