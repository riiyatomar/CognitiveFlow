import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../shared/schema';
import * as dotenv from 'dotenv';
dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. Please copy .env.example to .env and configure your database.");
}

const sql = neon(process.env.DATABASE_URL);
export const db = drizzle(sql, { schema });
