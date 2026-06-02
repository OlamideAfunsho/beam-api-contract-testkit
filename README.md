# Beam API Contract Testkit

A local contract-test harness and schema-drift guardrail for Beam Player and Automation integrations.

## MVP Scope

This MVP proves three things:

1. a Beam-shaped public contract can be pinned and diffed locally
2. a tiny local harness can return deterministic responses for one Player flow and one Automation flow
3. the whole setup can run in ordinary CI

The MVP intentionally covers only:

- minimal schema pin + diff CLI
- one Player workflow:
  `operation-processing` success and rejection response states
- one Automation workflow:
  `profile creation` pre-deployment state
- one GitHub Actions workflow

It does **not** attempt to emulate all Beam services, Sessions, Policies, or undocumented internals.

## Project Name

Use:

- project title: `Beam API Contract Testkit`
- repo / package name: `beam-api-contract-testkit`

## Commands

Build the project:

```bash
npm run build
```

Pin a contract snapshot from a public URL:

```bash
npm run pin -- --url https://docs.onbeam.com/example-player-contract.json --out snapshots/beam-contract.baseline.json
```

Diff two pinned snapshots:

```bash
npm run diff -- --baseline snapshots/beam-contract.baseline.json --current snapshots/beam-contract.current.json --json-out reports/beam-contract-diff.json
```

Run the local harness:

```bash
npm run harness -- --port 8080
```

Run tests:

```bash
npm test
```

## Local Harness Routes

The MVP harness serves three deterministic routes:

- `GET /player/operations/success`
- `GET /player/operations/rejected`
- `GET /automation/profiles/pre-deployment`

These are fixture-backed Beam-shaped responses meant for local tests and CI, not for backend emulation.

## Contract Diffing

The diff engine compares two pinned JSON snapshots and classifies drift as:

- `breaking`
- `additive`
- `informational`

For the MVP, removed fields and changed values are treated as `breaking`, while added fields are treated as `additive`.

## CI Proof

The included GitHub Actions workflow:

- installs dependencies
- builds the TypeScript project
- creates sample pinned snapshots
- runs the diff CLI
- runs the harness tests

That gives you a minimal but real contract-drift + deterministic-harness proof in CI.

## Repository Layout

- `src/cli/main.ts`
  CLI entrypoint for `pin`, `diff`, and `harness`
- `src/contracts`
  snapshot and diff logic
- `src/harness`
  tiny local HTTP harness
- `src/fixtures`
  deterministic Beam-shaped fixture payloads
- `snapshots`
  pinned contract snapshots
- `tests`
  contract diff and harness tests
- `.github/workflows/ci.yml`
  MVP CI proof

## Out of Scope

This MVP does not include:

- Sessions
- Policies
- webhook simulation
- broad route coverage
- Docker packaging polish
- both TypeScript and C# examples at once
- a full Beam backend emulator
