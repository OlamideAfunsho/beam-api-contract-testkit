import type { DiffEntry } from "./types.js";

export function diffContracts(previous: unknown, current: unknown, basePath = "$"): DiffEntry[] {
  if (isPrimitive(previous) || isPrimitive(current)) {
    if (!Object.is(previous, current)) {
      return [
        {
          path: basePath,
          kind: "changed",
          severity: "breaking",
          previous,
          current,
        },
      ];
    }
    return [];
  }

  if (Array.isArray(previous) || Array.isArray(current)) {
    return diffArrays(asArray(previous), asArray(current), basePath);
  }

  return diffObjects(asRecord(previous), asRecord(current), basePath);
}

function diffObjects(previous: Record<string, unknown>, current: Record<string, unknown>, basePath: string): DiffEntry[] {
  const keys = new Set([...Object.keys(previous), ...Object.keys(current)]);
  const entries: DiffEntry[] = [];

  for (const key of [...keys].sort()) {
    const nextPath = `${basePath}.${key}`;
    if (!(key in previous)) {
      entries.push({
        path: nextPath,
        kind: "added",
        severity: "additive",
        current: current[key],
      });
      continue;
    }

    if (!(key in current)) {
      entries.push({
        path: nextPath,
        kind: "removed",
        severity: "breaking",
        previous: previous[key],
      });
      continue;
    }

    entries.push(...diffContracts(previous[key], current[key], nextPath));
  }

  return entries;
}

function diffArrays(previous: unknown[], current: unknown[], basePath: string): DiffEntry[] {
  const entries: DiffEntry[] = [];
  const max = Math.max(previous.length, current.length);

  for (let index = 0; index < max; index += 1) {
    const nextPath = `${basePath}[${index}]`;
    if (index >= previous.length) {
      entries.push({
        path: nextPath,
        kind: "added",
        severity: "additive",
        current: current[index],
      });
      continue;
    }

    if (index >= current.length) {
      entries.push({
        path: nextPath,
        kind: "removed",
        severity: "breaking",
        previous: previous[index],
      });
      continue;
    }

    entries.push(...diffContracts(previous[index], current[index], nextPath));
  }

  return entries;
}

function isPrimitive(value: unknown): boolean {
  return value === null || ["string", "number", "boolean"].includes(typeof value);
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export function renderReadableDiff(entries: DiffEntry[]): string {
  if (entries.length === 0) {
    return "No contract drift detected.";
  }

  const lines = ["Beam contract drift report", ""];
  for (const entry of entries) {
    lines.push(`- [${entry.severity}] ${entry.kind.toUpperCase()} ${entry.path}`);
  }
  return lines.join("\n");
}
