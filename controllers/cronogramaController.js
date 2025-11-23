const { buildError } = require("../services/errorService");
const { familiasLista } = require("../data");
const { gerarCronogramaDiagnostico } = require("../services/cronogramaService");

function postCronograma(req, res) {
  const { tipoCabelo, condicao, objetivo } = req.body || {};

  if (!tipoCabelo || !condicao || !objetivo) {
    return res
      .status(400)
      .json(
        buildError(
          "INVALID_BODY",
          "Campos obrigatórios faltando (tipoCabelo, condicao, objetivo)."
        )
      );
  }

  const resultado = gerarCronogramaDiagnostico(
    { tipoCabelo, condicao, objetivo },
    familiasLista
  );

  return res.json(resultado);
}

module.exports = { postCronograma };
