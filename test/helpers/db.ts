import { openPglite, type Db } from "@/db/client";

/** Fresh, migrated in-memory database per call. Call `close()` in afterEach/afterAll. */
export async function createTestDb(): Promise<{ db: Db; close: () => Promise<void> }> {
  const handle = await openPglite();
  await handle.migrate();
  return { db: handle.db, close: handle.close };
}
