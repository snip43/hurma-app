(function initHurMaAuthUtils(global) {
  const CALLBACK_KEYS = [
    "auth_callback",
    "code",
    "token_hash",
    "type",
    "access_token",
    "refresh_token",
    "error",
    "error_code",
    "error_description",
  ];

  function readAuthCallback(urlValue) {
    const fallbackBase = "https://hurma.local/";
    const url = new URL(urlValue || fallbackBase, fallbackBase);
    const hash = new URLSearchParams(url.hash.replace(/^#/, ""));
    const read = (key) => url.searchParams.get(key) || hash.get(key) || "";
    const marker = read("auth_callback");
    const type = read("type");
    const error = read("error");
    const errorCode = read("error_code");
    const errorDescription = read("error_description");
    const isRecovery = marker === "recovery" || type === "recovery";
    const looksLikeEmailError = /email|otp|link|confirm|expired/i.test(
      `${error} ${errorCode} ${errorDescription}`
    );

    return {
      marker,
      type,
      code: read("code"),
      tokenHash: read("token_hash"),
      accessToken: read("access_token"),
      refreshToken: read("refresh_token"),
      error,
      errorCode,
      errorDescription,
      isRecovery,
      isEmailConfirmation:
        !isRecovery &&
        (marker === "signup" ||
          type === "signup" ||
          type === "email" ||
          Boolean(read("token_hash")) ||
          Boolean(error && looksLikeEmailError)),
    };
  }

  function cleanAuthCallbackUrl(urlValue) {
    const fallbackBase = "https://hurma.local/";
    const url = new URL(urlValue || fallbackBase, fallbackBase);
    CALLBACK_KEYS.forEach((key) => url.searchParams.delete(key));
    const hash = new URLSearchParams(url.hash.replace(/^#/, ""));
    CALLBACK_KEYS.forEach((key) => hash.delete(key));
    const nextHash = hash.toString();
    return `${url.pathname}${url.search}${nextHash ? `#${nextHash}` : ""}`;
  }

  function confirmationErrorMessage(callback) {
    const details = `${callback?.errorCode || ""} ${callback?.errorDescription || ""}`;
    if (/expired|otp_expired|invalid/i.test(details)) {
      return "Ссылка подтверждения истекла или уже была использована. Запросите новое письмо.";
    }
    return "Не удалось подтвердить email. Запросите новое письмо и попробуйте ещё раз.";
  }

  const api = { readAuthCallback, cleanAuthCallbackUrl, confirmationErrorMessage };
  global.HurmaAuthUtils = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
