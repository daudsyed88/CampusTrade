const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const saltRounds = 12;
  const commonPassword = 'Password123';
  const hashedPassword = await bcrypt.hash(commonPassword, saltRounds);

  console.log('Seeding data...');

  // Create Users
  const user1 = await prisma.user.upsert({
    where: { email: 'jane.doe@giki.edu' },
    update: {},
    create: {
      email: 'jane.doe@giki.edu',
      displayName: 'Jane Doe',
      passwordHash: hashedPassword,
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'john.smith@giki.edu' },
    update: {},
    create: {
      email: 'john.smith@giki.edu',
      displayName: 'John Smith',
      passwordHash: hashedPassword,
    },
  });

  const user3 = await prisma.user.upsert({
    where: { email: 'sara.khan@giki.edu' },
    update: {},
    create: {
      email: 'sara.khan@giki.edu',
      displayName: 'Sara Khan',
      passwordHash: hashedPassword,
    },
  });

  // Create Listings
  const listings = [
    {
      title: 'MacBook Air M1',
      description: 'Used for 1 year, perfect condition. 8GB RAM, 256GB SSD.',
      price: 155000,
      category: 'Electronics',
      imageUrl: '/uploads/laptop.png',
      ownerId: user1.id,
    },
    {
      title: 'Calculus: Early Transcendentals',
      description: '10th Edition. Barely used, no highlights.',
      price: 2500,
      category: 'Books',
      imageUrl: '/uploads/textbooks.png',
      ownerId: user2.id,
    },
    {
      title: 'Minimalist Desk Lamp',
      description: 'LED lamp with 3 brightness modes. Perfect for late night study.',
      price: 1200,
      category: 'Furniture',
      imageUrl: '/uploads/lamp.png',
      ownerId: user3.id,
    },
    {
      title: 'GIKI Hoodie (XL)',
      description: 'Official hoodie, slightly worn but very comfortable.',
      price: 1500,
      category: 'Clothing',
      imageUrl: null,
      ownerId: user1.id,
    },
    {
      title: 'Scientific Calculator Casio',
      description: 'Standard calculator for engineering students. Works perfectly.',
      price: 3000,
      category: 'Electronics',
      imageUrl: null,
      ownerId: user2.id,
    },
  ];

  for (const item of listings) {
    await prisma.listing.create({
      data: item,
    });
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
