const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const appSource = fs.readFileSync(path.join(__dirname, "..", "src", "App.jsx"), "utf8");
const migrationSource = fs.readFileSync(
  path.join(__dirname, "..", "supabase", "20-chat-after-accepted-request.sql"),
  "utf8"
);

test("contact picker loads only accepted or completed client-executor requests", () => {
  assert.match(appSource, /\.in\("status", \["accepted", "completed"\]\)/);
  assert.match(appSource, /profile\.role === "executor"/);
  assert.match(appSource, /profile\.role === "client"/);
  assert.match(appSource, /eligibleOppositeRoleIds\.has\(profile\.id\)/);
});

test("direct chat RPC requires an accepted request before creating a cross-role chat", () => {
  assert.match(migrationSource, /r\.status in \('accepted', 'completed'\)/);
  assert.match(migrationSource, /Executor chat requires an accepted request/);
  assert.ok(
    migrationSource.indexOf("if existing_conversation_id is not null")
      < migrationSource.indexOf("Executor chat requires an accepted request"),
    "existing chats must remain available"
  );
});

test("database access error is translated for the user", () => {
  assert.match(appSource, /Переписка с исполнителем станет доступна после того, как он примет вашу заявку/);
});
