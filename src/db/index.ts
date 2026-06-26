import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema.ts";

const { Pool } = pg;

export const createPool = () => {
  const supabaseUrl = process.env.SUPABASE_DATABASE_URL;
  const genericDbUrl = process.env.DATABASE_URL;
  
  // Choose the connection string
  let connectionString = supabaseUrl || genericDbUrl;

  // Let's inspect if the connection string is a placeholder or invalid
  if (connectionString) {
    if (connectionString.includes("[YOUR-PASSWORD]") || connectionString.includes("[YOUR-PROJECT-REF]")) {
      console.warn("Database connection string contains placeholder values. Ignoring it.");
      connectionString = undefined;
    }
  }

  if (connectionString) {
    // Mask the password for safe logging
    const maskedUrl = connectionString.replace(/:([^:@]+)@/, ":******@");
    console.log(`Connecting to database via connection string: ${maskedUrl}`);
    
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

  console.log(`Connecting to Cloud SQL database: host=${host}, user=${user}, database=${database}`);

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
