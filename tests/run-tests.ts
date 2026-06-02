import assert from "node:assert/strict";
import { diffContracts } from "../src/contracts/diff.js";
import { startHarnessServer } from "../src/harness/server.js";

async function main() {
  testDiffRemovedField();
  testDiffAddedField();
  await testHarnessFixtures();
  console.log("All MVP tests passed.");
}

function testDiffRemovedField() {
  const before = { routes: [{ path: "/player/operations/{id}", method: "GET", status: "ok" }] };
  const after = { routes: [{ path: "/player/operations/{id}", method: "GET" }] };
  const entries = diffContracts(before, after);

  assert.equal(entries.length, 1);
  assert.equal(entries[0]?.severity, "breaking");
  assert.equal(entries[0]?.kind, "removed");
}

function testDiffAddedField() {
  const before = { routes: [{ path: "/automation/profiles", method: "POST" }] };
  const after = { routes: [{ path: "/automation/profiles", method: "POST", note: "new" }] };
  const entries = diffContracts(before, after);

  assert.equal(entries.length, 1);
  assert.equal(entries[0]?.severity, "additive");
  assert.equal(entries[0]?.kind, "added");
}

async function testHarnessFixtures() {
  const server = await startHarnessServer({ port: 0 });

  try {
    const playerResponse = await fetch(`http://127.0.0.1:${server.port}/player/operations/success`);
    const playerBody = await playerResponse.json() as { status: string; result: { approvalState: string } };

    assert.equal(playerResponse.status, 200);
    assert.equal(playerBody.status, "processed");
    assert.equal(playerBody.result.approvalState, "approved");

    const automationResponse = await fetch(`http://127.0.0.1:${server.port}/automation/profiles/pre-deployment`);
    const automationBody = await automationResponse.json() as { status: string; profile: { deploymentState: string } };

    assert.equal(automationResponse.status, 200);
    assert.equal(automationBody.status, "pending_deployment");
    assert.equal(automationBody.profile.deploymentState, "not_deployed");
  } finally {
    await server.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
