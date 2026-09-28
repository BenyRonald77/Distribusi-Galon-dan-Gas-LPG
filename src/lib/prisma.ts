import { PrismaClient } from "@prisma/client";

// Menghindari pembuatan banyak instance PrismaClient saat hot-reload di
// mode development (pola standar yang direkomendasikan Prisma untuk Next.js).
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
