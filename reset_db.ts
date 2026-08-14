import { db } from "./server/db";
import { sql } from "drizzle-orm";

async function reset() {
  console.log("Dropping and recreating public schema...");
  await db.execute(sql`DROP SCHEMA public CASCADE`);
  await db.execute(sql`CREATE SCHEMA public`);
  console.log("Database reset complete.");
  process.exit(0);
}

reset().catch(console.error);
