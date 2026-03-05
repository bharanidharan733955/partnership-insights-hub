const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash('password123', 10);

    // 1. Create Analyst
    const analyst = await prisma.user.upsert({
        where: { email: 'analyst@enterprise.com' },
        update: {},
        create: {
            email: 'analyst@enterprise.com',
            password: hashedPassword,
            name: 'Global Analyst',
            role: 'ANALYST',
        },
    });

    // 2. Create Partners
    const p1 = await prisma.partner.upsert({
        where: { name: 'TechSolutions Inc' },
        update: {},
        create: { name: 'TechSolutions Inc' },
    });

    const p2 = await prisma.partner.upsert({
        where: { name: 'RetailHub Global' },
        update: {},
        create: { name: 'RetailHub Global' },
    });

    // 3. Create Branches
    const b1 = await prisma.branch.create({
        data: {
            name: 'South Branch',
            location: 'Bangalore',
            partnerId: p1.id,
        },
    });

    const b2 = await prisma.branch.create({
        data: {
            name: 'North Branch',
            location: 'Delhi',
            partnerId: p1.id,
        },
    });

    // 4. Create Partner Users
    await prisma.user.create({
        data: {
            email: 'manager1@techsolutions.com',
            password: hashedPassword,
            name: 'John Doe',
            role: 'PARTNER',
            partnerId: p1.id,
            branchId: b1.id,
        },
    });

    // 5. Add one sample sales record
    await prisma.salesRecord.create({
        data: {
            date: new Date(),
            productName: 'Sample Product',
            quantity: 5,
            salesAmount: 1500,
            profit: 300,
            branchId: b1.id,
        },
    });

    console.log('Database seeded successfully');
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
