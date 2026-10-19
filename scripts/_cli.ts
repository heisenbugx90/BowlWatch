import { closeDb, getDbHandle } from "../src/db/client";

/** Run a CLI main(), close the database, set the exit code. */
export function runCli(main: () => Promise<void | number>): void {
  main()
    .then((code) => {
      process.exitCode = typeof code === "number" ? code : 0;
    })
    .catch((e: unknown) => {
      console.error(e instanceof Error ? (e.stack ?? e.message) : e);
      process.exitCode = 1;
    })
    .finally(() => closeDb());
}

/** Open the database and apply pending migrations. */
export async function openMigrated() {
  const handle = await getDbHandle();
  await handle.migrate();
  if (handle.kind === "pglite" && !process.env.PGLITE_DIR)
    console.warn("note: DATABASE_URL and PGLITE_DIR are unset; using a throwaway in-memory PGlite database");
  return handle.db;
}
