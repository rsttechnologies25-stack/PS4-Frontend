
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Use any to bypass TS checks on the outdated client
    const users: any = await prisma.$queryRawUnsafe('SELECT id, email, customerName, addressLine1, city FROM User LIMIT 5');
    console.log(JSON.stringify(users, null, 2));
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
