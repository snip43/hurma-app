const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(root, "src", "App.jsx"), "utf8");
const migration = fs.readFileSync(
  path.join(root, "supabase", "19-rating-after-completed-request.sql"),
  "utf8"
);

test("rating is linked to a completed request", () => {
  assert.match(migration, /request_id uuid/);
  assert.match(migration, /r\.status = 'completed'/);
  assert.match(migration, /executor_ratings_unique_request unique \(request_id\)/);
  assert.match(migration, /Only a completed trip can be rated/);
});

test("rating controls require a completed request in the interface", () => {
  assert.match(appSource, /const completedRequests = executorRequests\.filter\(\(request\) => request\.status === "completed"\)/);
  assert.match(appSource, /canRateExecutors && executor\.databaseUserId && ratingRequest/);
  assert.match(appSource, /request_id: request\.id/);
});

test("client can create a trip request before rating", () => {
  assert.match(appSource, /async function createExecutorRequest\(executor\)/);
  assert.match(appSource, /"Заказать поездку"/);
  assert.match(appSource, /status: "new"/);
});
