const { gerarDiagnostico } = require("./diagnosticoService");

const CRONOGRAMA_GRAU = {
  1: ["Hidratação", "Nutrição", "Hidratação", "Nutrição"],
  2: ["Hidratação", "Nutrição", "Reconstrução", "Nutrição"],
  3: ["Reconstrução", "Nutrição", "Hidratação", "Reconstrução"],
};

const DICAS_OBJETIVO = {
  brilho: "Use protetor térmico e finalize com óleo leve.",
  força: "Inclua proteínas e queratina para fortalecer os fios.",
  hidratação: "Máscaras hidratantes 2x por semana para recuperar maciez.",
  crescimento: "Massagens no couro cabeludo e tônicos estimulantes.",
  equilíbrio: "Intercale H/N e evite excessos de reconstrução.",
};

const DICAS_TRATAMENTO = {
  Hidratação: "Foque em repor água e maciez com máscaras leves.",
  Nutrição: "Inclua óleos vegetais e manteigas para selar cutículas.",
  Reconstrução: "Use queratina de forma moderada para não enrijecer os fios.",
};

function ajustarSequencia(grau, objetivo, atributos = {}) {
  const base = [...(CRONOGRAMA_GRAU[grau] || CRONOGRAMA_GRAU[1])];
  const focoMaciez = (atributos.maciez || 0) >= 0.7;
  const focoReconstrucao = (atributos.reconstrucao || 0) >= 0.7;
  const focoNutricao = (atributos.nutricao || 0) >= 0.7;

  if (objetivo === "força" || focoReconstrucao) {
    base[0] = "Reconstrução";
    base[3] = "Reconstrução";
  }

  if (objetivo === "hidratação" || focoMaciez) {
    base[1] = "Hidratação";
  }

  if (objetivo === "crescimento" || focoNutricao) {
    base[2] = "Nutrição";
  }

  if (objetivo === "brilho") {
    base[0] = "Hidratação";
    base[2] = "Nutrição";
  }

  return base;
}

function montarCronogramaDetalhado(sequencia, objetivo, familiaPrincipal) {
  const foco = DICAS_OBJETIVO[objetivo] || DICAS_OBJETIVO.equilíbrio;

  return sequencia.map((tratamento, idx) => ({
    semana: idx + 1,
    tratamento,
    dica: `${foco} ${DICAS_TRATAMENTO[tratamento] || ""}`.trim(),
    familia: familiaPrincipal
      ? { id: familiaPrincipal.id, nome: familiaPrincipal.nome }
      : undefined,
  }));
}

function gerarCronogramaDiagnostico(respostas, familiasLista) {
  const diagnostico = gerarDiagnostico(respostas, familiasLista);
  const principal = diagnostico.recomendadas?.[0];
  const atributos = principal?.atributos || {};
  const sequencia = ajustarSequencia(diagnostico.grau, respostas?.objetivo, atributos);

  return {
    mensagem: diagnostico.mensagem,
    recomendadas: diagnostico.recomendadas,
    cronograma: montarCronogramaDetalhado(sequencia, respostas?.objetivo, principal),
  };
}

module.exports = { gerarCronogramaDiagnostico };
