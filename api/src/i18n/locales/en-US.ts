export const enUS = {
  auth: {
    credentialsRequired: 'Email and password are required',
    invalidCredentials: 'Invalid credentials',
    tokenMissing: 'Missing token',
    tokenInvalid: 'Invalid token',
  },
  users: {
    emailTaken: 'Email already registered',
    notFound: 'User not found',
    forbidden: 'You can only access your own account',
    currentPasswordInvalid: 'Invalid current password',
  },
  common: {
    notFound: 'Route not found',
    internalError: 'Internal error',
    validationError: 'Invalid data',
  },
} as const;
