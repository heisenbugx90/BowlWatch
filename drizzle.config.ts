import { defineConfig } from "drizzle-kit";

// `drizzle-kit generate` only diffs the TS schema against drizzle/ snapshots;
// it needs no database connection. Migrations are applied by src/db/migrate.ts.
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  strict: true,
  verbose: true,
});
