const test = require("node:test");
const assert = require("node:assert/strict");

const {
  readAuthCallback,
  cleanAuthCallbackUrl,
  confirmationErrorMessage,
} = require("../src/auth-utils.js");

test("reads an email confirmation token from the callback URL", () => {
  const callback = readAuthCallback(
    "https://example.com/hurma-app/?auth_callback=signup&token_hash=secret&type=email"
  );

  assert.equal(callback.isEmailConfirmation, true);
  assert.equal(callback.isRecovery, false);
  assert.equal(callback.tokenHash, "secret");
  assert.equal(callback.type, "email");
});

test("recognizes an expired confirmation link and returns a Russian message", () => {
  const callback = readAuthCallback(
    "https://example.com/hurma-app/?auth_callback=signup&error=access_denied&error_code=otp_expired&error_description=Email%20link%20has%20expired"
  );

  assert.equal(callback.isEmailConfirmation, true);
  assert.match(confirmationErrorMessage(callback), /Ссылка подтверждения истекла/);
});

test("removes auth parameters but keeps unrelated URL state", () => {
  const cleaned = cleanAuthCallbackUrl(
    "https://example.com/hurma-app/?auth_callback=signup&token_hash=secret&view=chat#tab=active"
  );

  assert.equal(cleaned, "/hurma-app/?view=chat#tab=active");
});

test("keeps password recovery separate from email confirmation", () => {
  const callback = readAuthCallback(
    "https://example.com/hurma-app/?auth_callback=recovery&code=secret"
  );

  assert.equal(callback.isRecovery, true);
  assert.equal(callback.isEmailConfirmation, false);
});
