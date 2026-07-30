import test from "node:test";
import assert from "node:assert";

import { fetchStock } from "../src/inventory.ts";

test("fetchStock returns the parsed body", async () => {
  const original = globalThis.fetch;
  globalThis.fetch = (async () =>
    new Response(JSON.stringify({ sku: "A-1", onHand: 3, updatedAt: "2026-01-01T00:00:00Z" }), {
      status: 200,
    })) as typeof fetch;
  try {
    assert.strictEqual((await fetchStock("A-1")).onHand, 3);
  } finally {
    globalThis.fetch = original;
  }
});
