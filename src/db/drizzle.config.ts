import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config();

let connectionString = process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;

if (connectionString) {
  if (connectionString.includes("[YOUR-PASSWORD]") || connectionString.includes("[YOUR-PROJECT-REF]")) {
    console.warn("Drizzle config: Connection string contains placeholder values. Ignoring it.");
    connectionString = undefined;
  }
}

const sqlHost = process.env.SQL_HOST;
const sqlDbName = process.env.SQL_DB_NAME;
const user = process.env.SQL_ADMIN_USER || process.env.SQL_USER;
const password = process.env.SQL_ADMIN_PASSWORD || process.env.SQL_PASSWORD;

const dbCredentials = connectionString 
  ? {
      url: connectionString,
      ssl: { rejectUnauthorized: false },
    }
  : {
      host: sqlHost || "",
      user: user || "",
      password: password || "",
      database: sqlDbName || "",
      ssl: false,
    };

if (!connectionString && (!sqlHost || !sqlDbName || !user || !password)) {
  console.warn("Warning: No database credentials or connection string configured.");
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  schemaFilter: ["public"],
  dbCredentials,
  verbose: true,
});
