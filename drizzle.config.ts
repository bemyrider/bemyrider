import { config as loadEnv } from 'dotenv';
import type { Config } from 'drizzle-kit';

// Carica esplicitamente .env.local per Drizzle
loadEnv({ path: '.env.local' });

const drizzleConfig: Config = {
  schema: './lib/db/schema.ts',
  out: './drizzle',
};

export default drizzleConfig;
