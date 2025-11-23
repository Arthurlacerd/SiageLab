const { familiasLista } = require("../data");
const { buildError } = require("../services/errorService");
const { gerarDiagnostico } = require("../services/diagnosticoService");

function postDiagnostico(req, res) {
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

  const resultado = gerarDiagnostico(
    { tipoCabelo, condicao, objetivo },
    familiasLista
  );

  return res.json(resultado);
}

module.exports = { postDiagnostico };
