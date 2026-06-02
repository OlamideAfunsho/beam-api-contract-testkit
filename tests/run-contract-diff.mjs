import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const baseline = {
  sourceUrl: "https://docs.onbeam.com/example-player-contract.json",
  fetchedAt: "2026-05-30T00:00:00.000Z",
  body: {
    service: "beam-player-api",
    version: "2026-05-01",
    routes: [
      { path: "/player/operations/{id}", method: "GET", responseFields: ["id", "status"] },
      { path: "/automation/profiles", method: "POST", responseFields: ["id", "status"] }
    ]
  }
};

const current = {
  sourceUrl: "https://docs.onbeam.com/example-player-contract.json",
  fetchedAt: "2026-05-30T00:00:00.000Z",
  body: {
    service: "beam-player-api",
    version: "2026-05-30",
    routes: [
      { path: "/player/operations/{id}", method: "GET", responseFields: ["id", "status", "result"] },
      { path: "/automation/profiles", method: "POST", responseFields: ["id", "status", "profile"] }
    ]
  }
};

await mkdir(resolve("snapshots"), { recursive: true });
await writeFile(resolve("snapshots", "beam-contract.baseline.json"), JSON.stringify(baseline, null, 2) + "\n");
await writeFile(resolve("snapshots", "beam-contract.current.json"), JSON.stringify(current, null, 2) + "\n");
await mkdir(dirname(resolve("reports", "beam-contract-diff.json")), { recursive: true });
