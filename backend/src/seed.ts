import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/** Seed: cria usuário admin padrão */
async function main() {
  const email = 'admin@marcenaria.com';
  const password = 'changeme';
  const hash = await bcrypt.hash(password, 10);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log('Admin user already exists:', email);
  } else {
    await prisma.user.create({ data: { email, password_hash: hash, name: 'Admin' } });
    console.log('Admin user created:', email);
  }
}

main().finally(async () => {
  await prisma.$disconnect();
});