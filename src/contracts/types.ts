export type DiffSeverity = "breaking" | "additive" | "informational";

export interface DiffEntry {
  path: string;
  kind: "added" | "removed" | "changed";
  severity: DiffSeverity;
  previous?: unknown;
  current?: unknown;
}

export interface SnapshotFile {
  sourceUrl: string;
  fetchedAt: string;
  body: unknown;
}
