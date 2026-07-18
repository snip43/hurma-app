const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(root, "src", "App.jsx"), "utf8");

test("executor filters include transport and cleaning options", () => {
  assert.match(appSource, /const EXECUTOR_FILTER_OPTIONS =/);
  assert.match(appSource, /label: "С детьми"/);
  assert.match(appSource, /label: "Детское кресло"/);
  assert.match(appSource, /label: "Русскоговорящий"/);
  assert.match(appSource, /label: "Межгород"/);
  assert.match(appSource, /label: "Генеральная уборка"/);
  assert.match(appSource, /label: "После ремонта"/);
});

test("selected executor options are applied and can be reset", () => {
  assert.match(appSource, /selectedFeatures\.every/);
  assert.match(appSource, /executorMatchesFilter\(executor, option\)/);
  assert.match(appSource, /setSelectedFeatures\(filterDraft\.features\)/);
  assert.match(appSource, /setFilterDraft\(\{ q: "", features: \[\] \}\)/);
});
