import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getDatabaseUrl(): string {
  const url = process.env["DATABASE_URL"] ?? "";
  try {
    const u = new URL(url);
    if (u.hostname.includes("pooler.supabase.com") && (u.port === "" || u.port === "5432")) {
      u.port = "6543";
      return u.toString();
    }
  } catch {
    /* fall through to raw value */
  }
  return url;
}

function createPrismaClient() {
  const adapter = new PrismaPg({
    connectionString: getDatabaseUrl(),
    max: Number(process.env["DATABASE_POOL_MAX"] ?? 3),
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
  });
  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
