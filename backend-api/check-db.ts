import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
    try {
        const branches = await prisma.branch.findMany({ take: 1 });
        console.log('CHECK_RESULT:', JSON.stringify(branches, null, 2));
    } catch (error) {
        console.error('CHECK_ERROR:', error);
    } finally {
        await prisma.$disconnect();
    }
}

check();
