import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Create Admin User
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@lawlink.in' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'admin@lawlink.in',
      password: adminPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });
  console.log(`✅ Admin created: ${admin.email}`);

  // 2. Create Packages
  const packages = [
    {
      name: 'Basic Legal Consultation',
      price: 2500,
      period: 'One-time',
      description: 'A 30-minute consultation with an expert lawyer.',
      features: ['30-min call', 'Basic document review', 'Written summary'],
      active: true,
    },
    {
      name: 'Property Dispute Resolution',
      price: 15000,
      period: 'Per Case',
      description: 'Comprehensive handling of property disputes.',
      features: ['Dedicated lawyer', 'Court representation', 'All filings included'],
      active: true,
    },
  ];

  for (const pkg of packages) {
    await prisma.package.create({
      data: pkg,
    });
  }
  console.log('✅ Packages seeded');

  console.log('🌱 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
