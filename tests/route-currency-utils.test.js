const test = require("node:test");
const assert = require("node:assert/strict");

const {
  ROUTE_CITIES,
  routePlaces,
  CUSTOM_PLACE,
  normalizeRouteDraft,
  pointLabel,
} = require("../src/route-data.js");
const {
  formatMoney,
  convertCurrency,
  conversionText,
} = require("../src/currency-utils.js");

test("normalizeRouteDraft keeps old free-text routes compatible", () => {
  const route = normalizeRouteDraft({ from: "Аэропорт", to: "Эль-Ахья", price: 10 }, "Хургада");

  assert.equal(route.fromCity, "Хургада");
  assert.equal(route.fromPlace, CUSTOM_PLACE);
  assert.equal(route.fromCustom, "Аэропорт");
  assert.equal(route.toCity, "Хургада");
  assert.equal(route.toPlace, "Эль-Ахья");
  assert.equal(route.currency, "USD");
});

test("pointLabel combines city and selected place", () => {
  assert.equal(pointLabel({
    fromCity: "Хургада",
    fromPlace: "Аэропорт Хургады (HRG)",
  }, "from"), "Хургада · Аэропорт Хургады (HRG)");

  assert.equal(pointLabel({
    toCity: "Каир",
    toPlace: CUSTOM_PLACE,
    toCustom: "Отель у аэропорта",
  }, "to"), "Каир · Отель у аэропорта");
});

test("route directory includes resort destinations and intercity travel", () => {
  assert.equal(ROUTE_CITIES.includes("Хургада"), true);
  assert.equal(ROUTE_CITIES.includes("Шарм-эль-Шейх"), true);
  assert.equal(ROUTE_CITIES.includes("Каир"), true);
  assert.equal(ROUTE_CITIES.includes("Александрия"), true);
  assert.equal(routePlaces("Хургада").includes("Аэропорт Хургады (HRG)"), true);
  assert.equal(routePlaces("Хургада").includes("Senzo Mall"), true);
  assert.equal(routePlaces("Шарм-эль-Шейх").includes("SOHO Square"), true);
});

test("currency conversion uses USD-based rates", () => {
  const rates = { USD: 1, EGP: 50, RUB: 90 };

  assert.equal(convertCurrency(10, "USD", "EGP", rates), 500);
  assert.equal(convertCurrency(500, "EGP", "USD", rates), 10);
  assert.equal(formatMoney(500, "EGP"), "500 E£");
  assert.equal(conversionText(10, "USD", rates), "≈ 500 E£ · 900 ₽");
});
