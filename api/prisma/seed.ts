import { hashPassword } from '../src/auth/password.js';
import { prisma } from '../src/db/prisma.js';
import { userAudit } from '../src/logging/audit.js';
import { connectMongo, disconnectMongo } from '../src/logging/mongo.js';

const SEED = {
  name: 'Candidato',
  email: 'dev@axyo.com.br',
  password: 'senha123',
};

async function seed(): Promise<void> {
  await connectMongo();

  const existing = await prisma.user.findUnique({ where: { email: SEED.email } });

  if (existing) {
    console.log(`usuário ${SEED.email} já existe (id: ${existing.id})`);
    return;
  }

  const user = await prisma.user.create({
    data: {
      name: SEED.name,
      email: SEED.email,
      passwordHash: await hashPassword(SEED.password),
    },
  });

  await userAudit.create(user.id, {
    after: { name: user.name, email: user.email },
  });

  console.log(`usuário ${SEED.email} criado (id: ${user.id}, senha: ${SEED.password})`);
}

seed()
  .catch((error: unknown) => {
    console.error('seed falhou:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await disconnectMongo();
  });
