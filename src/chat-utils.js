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

  const api = { normalizeContact, buildManualContact };
  globalObject.HurmaChatUtils = api;

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
