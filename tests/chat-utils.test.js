const test = require("node:test");
const assert = require("node:assert/strict");

const { normalizeContact, buildManualContact } = require("../src/chat-utils.js");

test("normalizeContact maps a database profile to a contact card", () => {
  const contact = normalizeContact({
    id: "user-1",
    display_name: "Мария",
    role: "client",
    city: "Хургада",
    search_area: "Marina",
  });

  assert.deepEqual(contact, {
    id: "user-1",
    title: "Мария",
    subtitle: "Клиент · Хургада · Marina",
    source: "database",
    canMessage: true,
  });
});

test("buildManualContact creates a local invite contact", () => {
  const contact = buildManualContact("Олег", "+20 100 000 0000");

  assert.equal(contact.title, "Олег");
  assert.equal(contact.subtitle, "+20 100 000 0000 · нужно пригласить в ХурМа");
  assert.equal(contact.source, "manual");
  assert.equal(contact.canMessage, false);
});
