import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createTestDb } from "../../test/helpers/db";
import { loadCatalog } from "./load";
import { seedCatalog } from "./seed";
import { loadSnapshotFromDb, snapshotFromCatalog } from "./snapshot";

async function tempData(files: Record<string, string>): Promise<string> {
  const dir = await mkdtemp(path.join(tmpdir(), "bw-data-"));
  await mkdir(path.join(dir, "parents"));
  await mkdir(path.join(dir, "brands"));
  for (const [rel, body] of Object.entries(files)) await writeFile(path.join(dir, rel), body);
  return dir;
}

const PARENT = `id: acme\nname: Acme Holdings\nsources: [https://example.com/acme]\n`;
const brand = (id: string, extra = "") =>
  `id: ${id}\nname: ${id.toUpperCase()} Pet\nparent: acme\nmarkets: [US]\nsources: [https://example.com/${id}]\n${extra}`;

describe("catalog loader", () => {
  it("loads the real data/ directory without errors", async () => {
    const res = await loadCatalog();
    if (!res.ok) throw new Error(res.errors.join("\n"));
    expect(res.catalog.brands.map((b) => b.id)).toEqual(expect.arrayContaining(["hills", "blue-buffalo"]));
    const labels = res.catalog.aliases.filter((a) => a.entityId === "blue-buffalo/wilderness");
    expect(labels.map((a) => [a.normalized, a.kind])).toContainEqual(["blue wilderness", "label"]);
  });

  it("reports every error, not just the first", async () => {
    const dir = await tempData({
      "parents/acme.yaml": PARENT,
      "brands/one.yaml": brand("one", "aliases: [Shared Name]\n"),
      "brands/two.yaml": brand("two", "parent: nobody\n").replace("parent: acme\n", ""),
      "brands/three.yaml": brand("three", "aliases: [Shared Name]\nmanufacturers: [ghost]\n"),
      "brands/wrong-name.yaml": brand("four"),
      "brands/bad.yaml": "id: Bad Id\nname: x\n",
      "manufacturers.yaml": "manufacturers: []\n",
    });
    const res = await loadCatalog(dir);
    expect(res.ok).toBe(false);
    if (res.ok) return;
    const all = res.errors.join("\n");
    expect(all).toMatch(/parent 'nobody'/);
    expect(all).toMatch(/identifies both 'one' and 'three'/);
    expect(all).toMatch(/manufacturer 'ghost'/);
    expect(all).toMatch(/must match the file name/);
    expect(all).toMatch(/bad\.yaml/);
  });

  it("rejects fictional mockup brands", async () => {
    const dir = await tempData({
      "parents/acme.yaml": PARENT,
      "brands/kettle-creek.yaml": brand("kettle-creek", "aliases: [Kettle Creek]\n"),
      "manufacturers.yaml": "manufacturers: []\n",
    });
    const res = await loadCatalog(dir);
    expect(res.ok).toBe(false);
  });

  it("line UPCs are normalized and belong to one line only", async () => {
    const line = (id: string, upc: string) => `  - id: ${id}\n    name: ${id}\n    upcs: ["${upc}"]\n    species: [cat]\n    formats: [wet]\n`;
    const dir = await tempData({
      "parents/acme.yaml": PARENT,
      "brands/one.yaml": brand("one", `lines:\n${line("pate", "076344088226")}${line("stew", "0-76344-08822-6".replace(/-/g, ""))}`),
      "manufacturers.yaml": "manufacturers: []\n",
    });
    const res = await loadCatalog(dir);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.errors.join("\n")).toMatch(/UPC '076344088226' is on both 'one\/pate' and 'one\/stew'/);
    const ok = await loadCatalog(path.resolve(__dirname, "../../data"));
    if (!ok.ok) throw new Error(ok.errors.join("\n"));
    const wellness = snapshotFromCatalog(ok.catalog).lines.find((l) => l.id === "wellness/complete-health");
    expect(wellness?.upcs).toContain("7634408822");
  });

  it("seeds the database and round-trips the snapshot", async () => {
    const res = await loadCatalog();
    if (!res.ok) throw new Error(res.errors.join("\n"));
    const { db, close } = await createTestDb();
    try {
      const stats = await seedCatalog(db, res.catalog);
      expect(stats.brands).toBe(res.catalog.brands.length);
      // Reseeding is idempotent.
      await seedCatalog(db, res.catalog);
      const fromDb = await loadSnapshotFromDb(db);
      const fromYaml = snapshotFromCatalog(res.catalog);
      const sort = <T>(xs: T[]) => [...xs].map((x) => JSON.stringify(x)).sort();
      expect(sort(fromDb.brands)).toEqual(sort(fromYaml.brands));
      expect(sort(fromDb.lines)).toEqual(sort(fromYaml.lines));
      expect(sort(fromDb.aliases)).toEqual(sort(fromYaml.aliases));
    } finally {
      await close();
    }
  });
});
