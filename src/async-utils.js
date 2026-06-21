(function exposeAsyncUtils(globalObject) {
  function withTimeout(promise, timeoutMs, message) {
    let timerId;
    const timeout = new Promise((_, reject) => {
      timerId = setTimeout(() => reject(new Error(message)), timeoutMs);
    });

    return Promise.race([Promise.resolve(promise), timeout]).finally(() => {
      clearTimeout(timerId);
    });
  }

  const api = { withTimeout };
  globalObject.HurmaAsync = api;

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
