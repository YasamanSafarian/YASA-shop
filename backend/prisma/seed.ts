import 'dotenv/config';
import * as bcrypt from 'bcryptjs';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  for (const name of ['customer', 'admin']) {
    await prisma.roles.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    console.log(`role ensured: ${name}`);
  }

  const adminEmail = 'the.yasa.store@gmail.com';
  const adminPhone = '09212500868';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  if (!adminPassword) {
    throw new Error('SEED_ADMIN_PASSWORD is not set');
  }

  const adminRole = await prisma.roles.findUniqueOrThrow({
    where: { name: 'admin' },
  });

  const existingByEmail = await prisma.users.findUnique({
    where: { email: adminEmail },
  });

  if (existingByEmail) {
    console.log('admin user already exists, skipping');
    return;
  }

  await prisma.users.create({
    data: {
      role_id: adminRole.id,
      email: adminEmail,
      phone: adminPhone,
      first_name: 'YASA',
      last_name: 'admin',
      password_hash: await bcrypt.hash(adminPassword, 10),
      is_active: true,
    },
  });
  console.log(`admin user ensured: ${adminEmail}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
