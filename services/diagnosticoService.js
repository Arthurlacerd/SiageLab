const PESO_TIPO = {
  liso: { brilho: 0.3, controle: 0.4, antifrizz: 0.3 },
  ondulado: { nutricao: 0.3, antifrizz: 0.4, maciez: 0.2 },
  cacheado: { nutricao: 0.4, maciez: 0.4, antifrizz: 0.3 },
  crespo: { nutricao: 0.5, maciez: 0.4, resistencia: 0.3 },
};

const PESO_CONDICAO = {
  saudavel: { brilho: 0.3, maciez: 0.3 },
  ressecado: { nutricao: 0.6, maciez: 0.5 },
  danificado: { reconstrucao: 0.7, resistencia: 0.6 },
  oleoso: { brilho: 0.4, controle: 0.5 },
};

const PESO_OBJETIVO = {
  brilho: { brilho: 0.8, nutricao: 0.4 },
  "força": { resistencia: 0.8, reconstrucao: 0.6 },
  "hidratação": { maciez: 0.8, nutricao: 0.3 },
  "crescimento": { resistencia: 0.5, nutricao: 0.4 },
  "equilíbrio": { brilho: 0.3, nutricao: 0.3, maciez: 0.3 },
};

function calcularScore(fam, tipoCabelo, condicao, objetivo) {
  const A = fam.atributos || {};
  let score = 0;

  const pesoTipo = PESO_TIPO[tipoCabelo] || {};
  Object.entries(pesoTipo).forEach(([chave, peso]) => {
    score += (A[chave] || 0) * peso;
  });

  const pesoCond = PESO_CONDICAO[condicao] || {};
  Object.entries(pesoCond).forEach(([chave, peso]) => {
    score += (A[chave] || 0) * peso;
  });

  const pesoObj = PESO_OBJETIVO[objetivo] || {};
  Object.entries(pesoObj).forEach(([chave, peso]) => {
    score += (A[chave] || 0) * peso;
  });

  return score;
}

function gerarDiagnostico({ tipoCabelo, condicao, objetivo }, familiasLista) {
  const recomendadas = familiasLista
    .map((fam) => ({
      id: fam.id,
      nome: fam.nome,
      classificacao: fam.classificacao,
      publico_alvo: fam.publico_alvo,
      atributos: fam.atributos,
      score: calcularScore(fam, tipoCabelo, condicao, objetivo),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const primeira = recomendadas[0];
  const mensagem = primeira
    ? `Analisando seu tipo de cabelo (${tipoCabelo}), condição (${condicao}) e objetivo (${objetivo}), a linha que mais combina\ncom você é: ${primeira.nome}.`
    : `Não consegui encontrar uma linha ideal com os dados enviados.`;

  return { mensagem, recomendadas };
}

module.exports = { gerarDiagnostico };
