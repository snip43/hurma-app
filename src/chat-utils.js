(function exposeChatUtils(globalObject) {
  function roleLabel(role) {
    return role === "executor" ? "Исполнитель" : "Клиент";
  }

  function compact(parts) {
    return parts.filter(Boolean).join(" · ");
  }

  function normalizeContact(profile) {
    const title = profile.display_name || profile.name || "Пользователь ХурМа";
    return {
      id: profile.id,
      title,
      subtitle: compact([roleLabel(profile.role), profile.city, profile.search_area || profile.searchArea]),
      role: profile.role || "client",
      avatarUrl: profile.avatar_url || profile.avatarUrl || "",
      source: "database",
      canMessage: true,
    };
  }

  function buildManualContact(name, phone) {
    const cleanName = String(name || "").trim() || "Новый контакт";
    const cleanPhone = String(phone || "").trim();
    return {
      id: `manual:${Date.now()}:${Math.random().toString(16).slice(2)}`,
      title: cleanName,
      subtitle: compact([cleanPhone, "нужно пригласить в ХурМа"]),
      phone: cleanPhone,
      source: "manual",
      canMessage: false,
    };
  }

  function formatMessageTime(value) {
    const date = value ? new Date(value) : new Date();
    return date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  }

  function normalizeChatMessage(message, currentUserId, fallbackText) {
    const createdAt = message && message.created_at ? message.created_at : new Date().toISOString();
    const attachmentPath = message && message.attachment_path ? message.attachment_path : "";
    const attachmentName = message && message.attachment_name ? message.attachment_name : "";
    const attachmentType = message && message.attachment_type ? message.attachment_type : "";
    const attachmentSize = message && typeof message.attachment_size !== "undefined" ? message.attachment_size : null;
    const attachmentUrl = message && (message.signed_url || message.attachment_url) ? (message.signed_url || message.attachment_url) : "";
    return {
      id: (message && message.id) || `local:${Date.now()}`,
      text: (message && message.body) || fallbackText || "",
      time: formatMessageTime(createdAt),
      me: Boolean(message && message.sender_id === currentUserId),
      attachment: attachmentPath ? {
        path: attachmentPath,
        name: attachmentName || "Файл",
        type: attachmentType || "application/octet-stream",
        size: attachmentSize,
        url: attachmentUrl,
      } : null,
    };
  }

  function upsertChatMessage(messages, nextMessage) {
    if (!nextMessage || !nextMessage.id) return messages;
    const index = messages.findIndex((message) => message.id === nextMessage.id);
    if (index === -1) return [...messages, nextMessage];

    const updated = messages.slice();
    updated[index] = { ...updated[index], ...nextMessage };
    return updated;
  }

  const api = { normalizeContact, buildManualContact, normalizeChatMessage, upsertChatMessage };
  globalObject.HurmaChatUtils = api;

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
