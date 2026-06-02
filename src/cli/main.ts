#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { diffContracts, renderReadableDiff } from "../contracts/diff.js";
import { readSnapshot, writeSnapshot } from "../contracts/snapshot.js";
import { startHarnessServer } from "../harness/server.js";

async function main() {
  const [command, ...rest] = process.argv.slice(2);

  switch (command) {
    case "pin":
      await runPin(rest);
      return;
    case "diff":
      await runDiff(rest);
      return;
    case "harness":
      await runHarness(rest);
      return;
    default:
      printUsage();
      process.exitCode = 1;
  }
}

async function runPin(args: string[]) {
  const url = getFlagValue(args, "--url");
  const out = resolve(getFlagValue(args, "--out") ?? "snapshots/beam-contract.snapshot.json");

  if (!url) {
    throw new Error("pin requires --url");
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`failed to fetch contract source: ${response.status} ${response.statusText}`);
  }

  const contentType = response.headers.get("content-type") ?? "";
  const text = await response.text();
  const body = contentType.includes("application/json") ? JSON.parse(text) : { raw: text };

  await writeSnapshot(out, url, body);
  console.log(`Pinned Beam contract snapshot to ${out}`);
}

async function runDiff(args: string[]) {
  const baselinePath = getFlagValue(args, "--baseline");
  const currentPath = getFlagValue(args, "--current");
  const jsonOut = getFlagValue(args, "--json-out");

  if (!baselinePath || !currentPath) {
    throw new Error("diff requires --baseline and --current");
  }

  const baseline = await readSnapshot(resolve(baselinePath));
  const current = await readSnapshot(resolve(currentPath));
  const entries = diffContracts(baseline.body, current.body);

  console.log(renderReadableDiff(entries));

  if (jsonOut) {
    const outputPath = resolve(jsonOut);
    await mkdir(dirname(outputPath), { recursive: true });
    await writeFile(outputPath, JSON.stringify(entries, null, 2) + "\n", "utf8");
    console.log(`Wrote machine-readable drift report to ${outputPath}`);
  }
}

async function runHarness(args: string[]) {
  const port = Number(getFlagValue(args, "--port") ?? "8080");
  const server = await startHarnessServer({ port });
  console.log(`Beam test harness listening on http://127.0.0.1:${server.port}`);
}

function getFlagValue(args: string[], name: string): string | undefined {
  const index = args.indexOf(name);
  if (index === -1) {
    return undefined;
  }
  return args[index + 1];
}

function printUsage() {
  console.log(`Usage:
  beam-contract-diff pin --url <public-beam-contract-url> --out <snapshot-path>
  beam-contract-diff diff --baseline <snapshot-path> --current <snapshot-path> [--json-out <path>]
  beam-testkit harness [--port 8080]`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
