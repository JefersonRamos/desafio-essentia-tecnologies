import type { Messages } from './pt-BR.js';

export const enUS: Messages = {
  auth: {
    credentialsRequired: 'Email and password are required',
    invalidCredentials: 'Invalid credentials',
    tokenMissing: 'Missing token',
    tokenInvalid: 'Invalid token',
    tokenRevoked: 'Revoked token',
  },
  users: {
    emailTaken: 'Email already registered',
    notFound: 'User not found',
    forbidden: 'You can only access your own account',
    currentPasswordInvalid: 'Invalid current password',
  },
  tasks: {
    notFound: 'Task not found',
  },
  common: {
    notFound: 'Route not found',
    internalError: 'Internal error',
    validationError: 'Invalid data',
  },
};
