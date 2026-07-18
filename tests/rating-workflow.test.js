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
  assert.match(appSource, /request\.status === "completed"/);
  assert.match(appSource, /request\.comment\?\.includes\("Поездка:"\)/);
  assert.match(appSource, /request\.comment\?\.includes\("Дата и время:"\)/);
  assert.match(appSource, /request\.comment\?\.includes\("Цена исполнителя:"\)/);
  assert.match(appSource, /canRateExecutors && executor\.databaseUserId && ratingRequest/);
  assert.match(appSource, /request_id: request\.id/);
});

test("client selects an executor route before creating a request", () => {
  assert.match(appSource, /function openRequestDialog\(executor\)/);
  assert.match(appSource, /async function createExecutorRequest\(event\)/);
  assert.match(appSource, /requestDialog\.routes\.map/);
  assert.match(appSource, /Поездка: \$\{requestDetails\.from\.trim\(\)\} → \$\{requestDetails\.to\.trim\(\)\}/);
  assert.match(appSource, /type="datetime-local"/);
  assert.match(appSource, /Дата и время: \$\{travelDate\}/);
  assert.match(appSource, /Предложение клиента: \$\{clientPrice\}/);
  assert.match(appSource, /Комментарий: \$\{requestDetails\.comment\.trim\(\)\}/);
  assert.match(appSource, /Своя цена <small>\(необязательно\)<\/small>/);
  assert.match(appSource, /"Оставить заявку"/);
  assert.doesNotMatch(appSource, /onStartChat\(executor\)/);
  assert.match(appSource, /status: "new"/);
});
