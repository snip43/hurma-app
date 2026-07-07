const test = require("node:test");
const assert = require("node:assert/strict");

const { withTimeout } = require("../src/async-utils.js");

test("withTimeout rejects when an operation never settles", async () => {
  await assert.rejects(
    withTimeout(new Promise(() => {}), 20, "request timed out"),
    /request timed out/
  );
});

test("withTimeout returns a completed operation result", async () => {
  const result = await withTimeout(Promise.resolve("ok"), 20, "request timed out");
  assert.equal(result, "ok");
});
