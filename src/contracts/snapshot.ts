import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import type { SnapshotFile } from "./types.js";

export async function writeSnapshot(path: string, sourceUrl: string, body: unknown): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  const snapshot: SnapshotFile = {
    sourceUrl,
    fetchedAt: new Date().toISOString(),
    body,
  };
  await writeFile(path, JSON.stringify(snapshot, null, 2) + "\n", "utf8");
}

export async function readSnapshot(path: string): Promise<SnapshotFile> {
  const content = await readFile(path, "utf8");
  return JSON.parse(content) as SnapshotFile;
}
