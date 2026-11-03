import { defineConfig } from 'prisma/config';

const schema = process.env.PRISMA_SCHEMA || 'prisma/schema.prisma';
const isPostgres = schema.includes('postgres');
const migrationsPath = isPostgres ? 'prisma/migrations-postgres' : 'prisma/migrations';
const defaultUrl = isPostgres
  ? 'postgresql://omniflow:omniflow@localhost:5432/omniflow'
  : 'file:./dev.db';

export default defineConfig({
  schema,
  migrations: {
    path: migrationsPath,
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: process.env.DATABASE_URL || defaultUrl,
  },
});
