const test = require("node:test");
const assert = require("node:assert/strict");

const {
  normalizeContact,
  buildManualContact,
  normalizeChatMessage,
  upsertChatMessage,
} = require("../src/chat-utils.js");

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
    role: "client",
    avatarUrl: "",
    source: "database",
    canMessage: true,
  });
});

test("normalizeContact keeps the profile avatar for chat lists", () => {
  const contact = normalizeContact({
    id: "user-2",
    display_name: "Ахмед Саид",
    role: "executor",
    city: "Хургада",
    search_area: "Все",
    avatar_url: "https://example.test/avatar.webp",
  });

  assert.equal(contact.avatarUrl, "https://example.test/avatar.webp");
  assert.equal(contact.role, "executor");
});

test("normalizeChatMessage maps a database message for the current user", () => {
  const message = normalizeChatMessage({
    id: "message-1",
    sender_id: "user-1",
    body: "hello",
    created_at: "2026-07-09T10:15:00.000Z",
  }, "user-1");

  assert.equal(message.id, "message-1");
  assert.equal(message.text, "hello");
  assert.equal(message.me, true);
  assert.match(message.time, /^\d{2}:\d{2}$/);
});

test("normalizeChatMessage maps attachment metadata", () => {
  const message = normalizeChatMessage({
    id: "message-file",
    sender_id: "user-2",
    body: "",
    attachment_path: "user-2/conversation-1/photo.jpg",
    attachment_name: "photo.jpg",
    attachment_type: "image/jpeg",
    attachment_size: 2048,
    signed_url: "https://example.test/photo.jpg",
    created_at: "2026-07-11T10:15:00.000Z",
  }, "user-1");

  assert.equal(message.text, "");
  assert.equal(message.me, false);
  assert.deepEqual(message.attachment, {
    path: "user-2/conversation-1/photo.jpg",
    name: "photo.jpg",
    type: "image/jpeg",
    size: 2048,
    url: "https://example.test/photo.jpg",
  });
});

test("upsertChatMessage appends new messages and updates existing messages", () => {
  const first = { id: "message-1", text: "one", me: true };
  const updated = { id: "message-1", text: "two", me: true };
  const second = { id: "message-2", text: "three", me: false };

  assert.deepEqual(upsertChatMessage([], first), [first]);
  assert.deepEqual(upsertChatMessage([first], updated), [updated]);
  assert.deepEqual(upsertChatMessage([updated], second), [updated, second]);
});

test("buildManualContact creates a local invite contact", () => {
  const contact = buildManualContact("Олег", "+20 100 000 0000");

  assert.equal(contact.title, "Олег");
  assert.equal(contact.subtitle, "+20 100 000 0000 · нужно пригласить в ХурМа");
  assert.equal(contact.source, "manual");
  assert.equal(contact.canMessage, false);
});
