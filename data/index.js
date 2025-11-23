const fs = require("fs");
const path = require("path");

function safeParseJson(filePath) {
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    if (!raw.trim()) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`Não foi possível carregar ${filePath}:`, err.message);
    return null;
  }
}

/**
 * Normaliza qualquer um dos formatos que aparecem nos JSONs:
 * 1) { id: "slug", ...dados }
 * 2) { "slug": { ...dados } }
 */
function normalizarFamilia(parsed, fileName) {
  if (!parsed || typeof parsed !== "object") return null;

  const fromEnvelope = Object.keys(parsed).length === 1;
  const [envelopeKey, envelopeValue] = Object.entries(parsed)[0] || [];

  const conteudo =
    fromEnvelope && envelopeValue && typeof envelopeValue === "object"
      ? envelopeValue
      : parsed;

  const id =
    conteudo.id ||
    (fromEnvelope && envelopeKey) ||
    path.basename(fileName, ".json");

  if (!id) return null;

  return {
    id,
    ...conteudo,
    id: id,
    atributos: conteudo.atributos || {},
  };
}

function loadFamilias() {
  const dir = __dirname;
  const entries = fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".json"));

  const familias = {};

  entries.forEach((file) => {
    const parsed = safeParseJson(path.join(dir, file));
    const normalizado = normalizarFamilia(parsed, file);
    if (!normalizado) return;

    familias[normalizado.id] = normalizado;
  });

  return familias;
}

const familias = loadFamilias();
const familiasLista = Object.entries(familias).map(([id, data]) => ({
  id,
  ...data,
}));

module.exports = { familias, familiasLista };
