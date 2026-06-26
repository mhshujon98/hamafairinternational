import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema.ts";

const { Pool } = pg;

export const createPool = () => {
  const connectionString = process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;

  if (connectionString) {
    console.log("Connecting to Supabase/External PostgreSQL via connection string with SSL...");
    return new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false, // Required for Supabase / external hosted DBs
      },
      connectionTimeoutMillis: 15000,
    });
  }

  const host = process.env.SQL_HOST;
  const user = process.env.SQL_USER || process.env.SQL_ADMIN_USER;
  const password = process.env.SQL_PASSWORD || process.env.SQL_ADMIN_PASSWORD;
  const database = process.env.SQL_DB_NAME;

  if (!host || !user || !database) {
    console.warn("Missing SQL environment variables in createPool (no connection string and no Cloud SQL configuration)!");
  }

  return new Pool({
    host,
    user,
    password,
    database,
    ssl: false,
    connectionTimeoutMillis: 15000,
  });
};

const pool = createPool();

pool.on("error", (err) => {
  console.error("Unexpected error on idle SQL pool client:", err);
});

export const db = drizzle(pool, { schema });
