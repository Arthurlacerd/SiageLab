const fs = require('fs');
const path = require('path');

let cacheRegras = null;

function carregarRegras() {
  if (cacheRegras) return cacheRegras;
  const regrasPath = path.join(__dirname, 'data', 'siage_rules.json');
  const raw = fs.readFileSync(regrasPath, 'utf-8');
  cacheRegras = JSON.parse(raw);
  return cacheRegras;
}

function valorResposta(resposta, escala = {}) {
  if (typeof resposta === 'number') return resposta;
  if (typeof resposta === 'boolean') return resposta ? 1 : 0;
  if (typeof resposta === 'string') {
    const normalizada = resposta.trim().toLowerCase();
    if (escala[normalizada] !== undefined) return escala[normalizada];
    if ([
      'sim',
      'true',
      'positivo',
      'presente',
      'frequente',
    ].includes(normalizada)) {
      return 1;
    }
    return 0;
  }
  return 0;
}

function calcularGrau(respostas = {}) {
  const regras = carregarRegras();
  const { weights = {}, thresholds = {}, scaleAnswers = {} } = regras;

  const score = Object.entries(respostas).reduce((total, [pergunta, resposta]) => {
    const peso = weights[pergunta];
    if (!peso) return total;
    const escala = scaleAnswers[pergunta] || {};
    const valor = valorResposta(resposta, escala);
    return total + valor * peso;
  }, 0);

  const tGrau3 = Number.isFinite(thresholds.grau3) ? thresholds.grau3 : 7;
  const tGrau2 = Number.isFinite(thresholds.grau2) ? thresholds.grau2 : 3;

  if (score >= tGrau3) return 3;
  if (score >= tGrau2) return 2;
  return 1;
}

module.exports = { calcularGrau, carregarRegras };
