import { hashPassword, verifyPassword } from '../auth/password.js';
import { HttpError } from '../http/http-error.js';
import { userAudit } from '../logging/audit.js';
import type { User, UserId } from './user.model.js';
import * as repo from './user.repo.js';
import type { CreateUserInput, UpdateUserInput } from './user.schema.js';

interface ProfileChanges {
  name?: string;
  email?: string;
  passwordHash?: string;
}

export async function register(input: CreateUserInput): Promise<User> {
  await assertEmailAvailable(input.email);

  try {
    const user = await repo.create({
      name: input.name,
      email: input.email,
      passwordHash: await hashPassword(input.password),
    });

    await userAudit.create(user.id, { actorId: user.id, after: snapshot(user) });

    return user;
  } catch (error) {
    throw repo.isDuplicateEmail(error) ? emailTaken() : error;
  }
}

export async function findOrFail(id: UserId): Promise<User> {
  const user = await repo.findById(id);

  if (!user) throw new HttpError(404, 'users.notFound');

  return user;
}

export async function updateProfile(id: UserId, input: UpdateUserInput): Promise<User> {
  const current = await findOrFail(id);
  const changes: ProfileChanges = {};

  if (input.name !== undefined) {
    changes.name = input.name;
  }

  if (input.email !== undefined && input.email !== current.email) {
    await assertEmailAvailable(input.email, current.id);
    changes.email = input.email;
  }

  if (input.password !== undefined) {
    await assertCurrentPassword(current.id, input.currentPassword);
    changes.passwordHash = await hashPassword(input.password);
  }

  try {
    const updated = await repo.update(current.id, changes);

    await userAudit.update(updated.id, {
      actorId: updated.id,
      before: snapshot(current),
      after: { ...snapshot(updated), passwordChanged: changes.passwordHash !== undefined },
    });

    return updated;
  } catch (error) {
    throw repo.isDuplicateEmail(error) ? emailTaken() : error;
  }
}

export async function remove(id: UserId): Promise<void> {
  const current = await findOrFail(id);

  await repo.softDelete(current.id);

  await userAudit.delete(current.id, { actorId: current.id, before: snapshot(current) });
}

async function assertEmailAvailable(email: string, exceptId?: UserId): Promise<void> {
  if (await repo.isEmailTaken(email, exceptId)) throw emailTaken();
}

async function assertCurrentPassword(id: UserId, currentPassword: string | undefined): Promise<void> {
  const user = await repo.findSecretById(id);
  const matches = user ? await verifyPassword(currentPassword ?? '', user.passwordHash) : false;

  if (!matches) throw new HttpError(400, 'users.currentPasswordInvalid');
}

function emailTaken(): HttpError {
  return new HttpError(409, 'users.emailTaken');
}

function snapshot(user: User): Record<string, unknown> {
  return { name: user.name, email: user.email };
}
