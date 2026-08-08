const DEV_JWT_SECRET = 'dev_secret_change_me';

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`variável de ambiente obrigatória ausente: ${name}`);
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 3000),
  isProduction: process.env.NODE_ENV === 'production',

  jwt: {
    secret: required('JWT_SECRET'),
    expiresIn: process.env.JWT_EXPIRES_IN ?? '1h',
  },

  databaseUrl: required('DATABASE_URL'),

  mongo: {
    url: required('MONGO_URL'),
    database: process.env.MONGO_DATABASE ?? 'techx_logs',
    retentionDays: Number(process.env.LOG_RETENTION_DAYS ?? 30),
  },

  logLevel: process.env.LOG_LEVEL ?? 'info',
} as const;

if (env.isProduction && env.jwt.secret === DEV_JWT_SECRET) {
  throw new Error('JWT_SECRET ainda é o valor de desenvolvimento — defina um segredo real em produção');
}
