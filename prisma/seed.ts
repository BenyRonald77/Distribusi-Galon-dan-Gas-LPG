import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "galon123";

async function main() {
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await prisma.admin.upsert({
    where: { username: ADMIN_USERNAME },
    update: {},
    create: { username: ADMIN_USERNAME, passwordHash },
  });
  console.log(`Akun admin siap. Username: ${ADMIN_USERNAME} / Password: ${ADMIN_PASSWORD}`);

  // Data pelanggan, produk, pesanan, dan kurir ditambahkan pada commit
  // fitur "tambah seed data" setelah skema lengkap tersedia.
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
