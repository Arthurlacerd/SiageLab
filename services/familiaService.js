const { familias, familiasLista } = require("../data");

const PESOS_GRAU = {
  1: { brilho: 0.6, maciez: 0.6, controle: 0.4, nutricao: 0.4 },
  2: { nutricao: 0.6, maciez: 0.5, antifrizz: 0.5, reconstrucao: 0.4 },
  3: { reconstrucao: 0.7, resistencia: 0.6, nutricao: 0.5, antifrizz: 0.4 },
};

function validateId(id) {
  if (typeof id !== "string") return { error: "O parâmetro 'id' deve ser uma string." };
  const value = id.trim();
  if (!value) return { error: "O parâmetro 'id' não pode ser vazio." };
  return { value };
}

function getAllFamilias() {
  return familiasLista;
}

function getFamiliaById(id) {
  return familias[id];
}

function calcularScorePorGrau(familia, grau) {
  const pesos = PESOS_GRAU[grau] || PESOS_GRAU[1];
  const atributos = familia?.atributos || {};
  return Object.entries(pesos).reduce((total, [chave, peso]) => total + (atributos[chave] || 0) * peso, 0);
}

function selecionarFamiliasPorGrau(grau, lista = familiasLista) {
  return [...lista]
    .map((familia) => ({ ...familia, score: calcularScorePorGrau(familia, grau) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ score, ...fam }) => fam);
}

module.exports = {
  validateId,
  getAllFamilias,
  getFamiliaById,
  selecionarFamiliasPorGrau,
};
