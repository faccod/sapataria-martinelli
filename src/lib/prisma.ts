import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrisma() {
  const url = process.env.DATABASE_URL ?? "file:./dev.db";

  // Em producao (Vercel) usa libSQL/Turso via adapter
  // Em dev continua usando SQLite local
  if (url.startsWith("libsql://") || url.startsWith("https://")) {
    const authToken = process.env.TURSO_AUTH_TOKEN ?? "";
    const client = createClient({ url, authToken });
    const adapter = new PrismaLibSQL(client);
    return new PrismaClient({ adapter });
  }

  // SQLite local (dev)
  return new PrismaClient();
}

export const prisma = globalForPrisma.prisma ?? createPrisma();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;