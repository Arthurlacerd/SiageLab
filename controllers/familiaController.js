const { buildError } = require("../services/errorService");
const {
  validateId,
  getAllFamilias,
  getFamiliaById,
} = require("../services/familiaService");

function listarFamilias(req, res) {
  return res.status(200).json(getAllFamilias());
}

function obterFamilia(req, res) {
  const { id } = req.params;
  const { error, value } = validateId(id);

  if (error) {
    return res.status(400).json(buildError("INVALID_ID", error, { id }));
  }

  const familia = getFamiliaById(value);

  if (!familia) {
    return res
      .status(404)
      .json(buildError("NOT_FOUND", "Família não encontrada", { id: value }));
  }

  return res.status(200).json({ id: value, ...familia });
}

module.exports = {
  listarFamilias,
  obterFamilia,
};
