const { gerarDiagnostico } = require("./diagnosticoService");

const CRONOGRAMA_BASE = {
  saudavel: ["Hidratação", "Nutrição", "Hidratação", "Nutrição"],
  ressecado: ["Hidratação", "Nutrição", "Hidratação", "Reconstrução"],
  danificado: ["Reconstrução", "Nutrição", "Hidratação", "Reconstrução"],
  oleoso: ["Hidratação", "Hidratação", "Nutrição", "Hidratação"],
};

const DICAS_OBJETIVO = {
  brilho: "Use protetor térmico e finalize com óleo leve.",
  "força": "Inclua proteínas e queratina para fortalecer os fios.",
  "hidratação": "Máscaras hidratantes 2x por semana para recuperar maciez.",
  "crescimento": "Massagens no couro cabeludo e tônicos estimulantes.",
  "equilíbrio": "Intercale H/N e evite excessos de reconstrução.",
};

const DICAS_TRATAMENTO = {
  Hidratação: "Foque em repor água e maciez com máscaras leves.",
  Nutrição: "Inclua óleos vegetais e manteigas para selar cutículas.",
  Reconstrução: "Use queratina de forma moderada para não enrijecer os fios.",
};

function ajustarSequencia(condicao, objetivo, atributos = {}) {
  const base = [...(CRONOGRAMA_BASE[condicao] || CRONOGRAMA_BASE.saudavel)];
  const forcaAlta = (atributos.resistencia || 0) + (atributos.reconstrucao || 0) >= 12;
  const muitaMaciez = (atributos.maciez || 0) >= 7;
  const muitaNutricao = (atributos.nutricao || 0) >= 7;

  if (objetivo === "força" || forcaAlta) {
    base[0] = "Reconstrução";
    base[3] = "Reconstrução";
  }

  if (objetivo === "hidratação" || muitaMaciez) {
    base[1] = "Hidratação";
  }

  if (objetivo === "crescimento" || muitaNutricao) {
    base[2] = "Nutrição";
  }

  if (objetivo === "brilho") {
    base[0] = "Hidratação";
    base[2] = "Nutrição";
  }

  return base;
}

function montarCronogramaDetalhado(sequencia, objetivo, familiaPrincipal) {
  const foco = DICAS_OBJETIVO[objetivo] || DICAS_OBJETIVO["equilíbrio"];

  return sequencia.map((tratamento, idx) => ({
    semana: idx + 1,
    tratamento,
    dica: `${foco} ${DICAS_TRATAMENTO[tratamento] || ""}`.trim(),
    familia: familiaPrincipal
      ? { id: familiaPrincipal.id, nome: familiaPrincipal.nome }
      : undefined,
  }));
}

function gerarCronogramaDiagnostico({ tipoCabelo, condicao, objetivo }, familiasLista) {
  const diagnostico = gerarDiagnostico({ tipoCabelo, condicao, objetivo }, familiasLista);
  const principal = diagnostico.recomendadas?.[0];
  const atributos = principal?.atributos || {};
  const sequencia = ajustarSequencia(condicao, objetivo, atributos);

  return {
    mensagem: diagnostico.mensagem,
    recomendadas: diagnostico.recomendadas,
    cronograma: montarCronogramaDetalhado(sequencia, objetivo, principal),
  };
}

module.exports = { gerarCronogramaDiagnostico };
