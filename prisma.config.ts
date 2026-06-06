import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
  experimental: {
    externalTables: true,
  },
  tables: {
    external: [
      'public.jackson_store',
      'public.jackson_index',
      'public.jackson_ttl',
    ],
  },
});
