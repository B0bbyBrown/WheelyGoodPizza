import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from '../../shared/schema.js';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

// Create PostgreSQL pool for better connection management
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create the database connection
export const db = drizzle(pool, { schema });