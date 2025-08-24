import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Hash password
  const adminPassword = await bcrypt.hash('admin123', 10);

  // Create admin user only
  const admin = await prisma.user.create({
    data: {
      email: 'admin@polytechnic.edu.ng',
      password: adminPassword,
      name: 'System Administrator',
      role: 'ADMIN',
      adminProfile: {
        create: {}
      }
    }
  });

  console.log('Database seeded successfully!');
  console.log('==========================================');
  console.log('Admin Credentials:');
  console.log('==========================================');
  console.log('Admin: admin@polytechnic.edu.ng / admin123');
  console.log('==========================================');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });