const fs = require("fs");
const path = require("path");

let cacheRegras = null;

function carregarRegras() {
  if (cacheRegras) return cacheRegras;
  const regrasPath = path.join(__dirname, "..", "data", "siage_rules.json");
  const raw = fs.readFileSync(regrasPath, "utf-8");
  cacheRegras = JSON.parse(raw);
  return cacheRegras;
}

module.exports = { carregarRegras };
