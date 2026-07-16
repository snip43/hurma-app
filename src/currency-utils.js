(function exposeCurrencyUtils(globalObject) {
  const CURRENCIES = [
    { code: "USD", label: "USD · $", symbol: "$" },
    { code: "EGP", label: "EGP · E£", symbol: "E£" },
    { code: "RUB", label: "RUB · ₽", symbol: "₽" },
  ];

  const CURRENCY_CODES = CURRENCIES.map((currency) => currency.code);

  function normalizeCurrency(value) {
    return CURRENCY_CODES.includes(value) ? value : "USD";
  }

  function currencySymbol(currency) {
    return CURRENCIES.find((item) => item.code === normalizeCurrency(currency))?.symbol || "$";
  }

  function formatMoney(value, currency, options = {}) {
    const amount = Number(value);
    if (!Number.isFinite(amount)) return "";
    const code = normalizeCurrency(currency);
    const maximumFractionDigits = options.maximumFractionDigits == null
      ? (Math.abs(amount) < 10 ? 2 : 0)
      : options.maximumFractionDigits;
    const formatted = new Intl.NumberFormat("ru-RU", {
      minimumFractionDigits: 0,
      maximumFractionDigits,
    }).format(amount);
    return code === "USD"
      ? `${formatted} $`
      : code === "EGP"
        ? `${formatted} E£`
        : `${formatted} ₽`;
  }

  function convertCurrency(value, fromCurrency, toCurrency, rates) {
    const amount = Number(value);
    const from = normalizeCurrency(fromCurrency);
    const to = normalizeCurrency(toCurrency);
    if (!Number.isFinite(amount) || amount < 0) return null;
    if (from === to) return amount;
    const fromRate = Number(rates?.[from]);
    const toRate = Number(rates?.[to]);
    if (!Number.isFinite(fromRate) || !Number.isFinite(toRate) || fromRate <= 0 || toRate <= 0) return null;
    return (amount / fromRate) * toRate;
  }

  function conversionText(value, currency, rates) {
    const source = normalizeCurrency(currency);
    const converted = CURRENCY_CODES
      .filter((code) => code !== source)
      .map((code) => {
        const amount = convertCurrency(value, source, code, rates);
        return amount == null ? "" : formatMoney(amount, code);
      })
      .filter(Boolean);
    return converted.length ? `≈ ${converted.join(" · ")}` : "";
  }

  const api = {
    CURRENCIES,
    CURRENCY_CODES,
    normalizeCurrency,
    currencySymbol,
    formatMoney,
    convertCurrency,
    conversionText,
  };

  globalObject.HurmaCurrencyUtils = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
