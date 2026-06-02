import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { automationProfileFixtures } from "../fixtures/automation-profile.js";
import { playerOperationFixtures } from "../fixtures/player-operation.js";

export interface HarnessOptions {
  port?: number;
}

export function createHarnessServer() {
  return createServer((req, res) => {
    if (!req.url || req.method !== "GET") {
      respondJson(res, 404, { error: "not_found" });
      return;
    }

    if (req.url === "/player/operations/success") {
      respondJson(res, 200, playerOperationFixtures.success);
      return;
    }

    if (req.url === "/player/operations/rejected") {
      respondJson(res, 200, playerOperationFixtures.rejected);
      return;
    }

    if (req.url === "/automation/profiles/pre-deployment") {
      respondJson(res, 200, automationProfileFixtures.preDeployed);
      return;
    }

    respondJson(res, 404, { error: "not_found" });
  });
}

export async function startHarnessServer(options: HarnessOptions = {}): Promise<{ port: number; close: () => Promise<void> }> {
  const server = createHarnessServer();
  const port = options.port ?? 8080;

  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, "127.0.0.1", () => {
      server.off("error", reject);
      resolve();
    });
  });

  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("failed to determine harness address");
  }

  return {
    port: address.port,
    close: async () =>
      new Promise<void>((resolve, reject) => {
        server.close((error?: Error) => {
          if (error) {
            reject(error);
            return;
          }
          resolve();
        });
      }),
  };
}

function respondJson(res: ServerResponse, status: number, body: unknown) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "content-type": "application/json",
    "content-length": Buffer.byteLength(payload),
  });
  res.end(payload);
}
