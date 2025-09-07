import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

// Carica esplicitamente .env.local per Drizzle
config({ path: '.env.local' });

export default defineConfig({
  out: './drizzle',
  schema: './lib/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
