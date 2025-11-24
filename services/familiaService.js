const { familias, familiasLista } = require("../data");

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

module.exports = {
  validateId,
  getAllFamilias,
  getFamiliaById,
};
