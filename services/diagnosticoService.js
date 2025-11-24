const fs = require("fs");
const path = require("path");
const { selecionarFamiliasPorGrau } = require("./familiaService");

let cacheRegras = null;

function carregarRegras() {
  if (cacheRegras) return cacheRegras;
  const regrasPath = path.join(__dirname, "..", "data", "siage_rules.json");
  const raw = fs.readFileSync(regrasPath, "utf-8");
  cacheRegras = JSON.parse(raw);
  return cacheRegras;
}

function valorResposta(resposta, escala = {}) {
  if (typeof resposta === "number" && Number.isFinite(resposta)) return resposta;
  if (typeof resposta === "boolean") return resposta ? 1 : 0;
  if (typeof resposta === "string") {
    const normalizada = resposta.trim().toLowerCase();
    if (Object.prototype.hasOwnProperty.call(escala, normalizada)) {
      return escala[normalizada];
    }
  }
  return 0;
}

function calcularGrau(respostas = {}) {
  const { weights = {}, thresholds = {}, scaleAnswers = {} } = carregarRegras();

  const score = Object.entries(respostas).reduce((total, [pergunta, resposta]) => {
    if (!Object.prototype.hasOwnProperty.call(weights, pergunta)) return total;
    const peso = weights[pergunta];
    const escala = scaleAnswers[pergunta] || {};
    const valor = valorResposta(resposta, escala);
    return total + valor * peso;
  }, 0);

  if (score >= thresholds.grau3) return 3;
  if (score >= thresholds.grau2) return 2;
  return 1;
}

function gerarDiagnostico(respostas = {}, familiasLista = []) {
  const grau = calcularGrau(respostas);
  const recomendadas = selecionarFamiliasPorGrau(grau, familiasLista);

  const principal = recomendadas[0];
  const mensagem = principal
    ? `Com base na anamnese (Grau ${grau}), recomendamos começar pela linha ${principal.nome}.`
    : `Não foi possível encontrar uma linha ideal com as respostas informadas.`;

  return { grau, mensagem, recomendadas };
}

module.exports = { gerarDiagnostico, calcularGrau, carregarRegras };
