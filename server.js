// server.js
const express = require("express");
const path = require("path");
const { familias, familiasLista } = require("./data"); // <– IMPORTANTE

// Pesos da IA de recomendação

const PESO_TIPO = {
  liso:        { brilho: 0.3, controle: 0.4, antifrizz: 0.3 },
  ondulado:    { nutricao: 0.3, antifrizz: 0.4, maciez: 0.2 },
  cacheado:    { nutricao: 0.4, maciez: 0.4, antifrizz: 0.3 },
  crespo:      { nutricao: 0.5, maciez: 0.4, resistencia: 0.3 },
};

const PESO_CONDICAO = {
  saudavel:   { brilho: 0.3, maciez: 0.3 },
  ressecado:  { nutricao: 0.6, maciez: 0.5 },
  danificado: { reconstrucao: 0.7, resistencia: 0.6 },
  oleoso:     { brilho: 0.4, controle: 0.5 },
};

const PESO_OBJETIVO = {
  brilho:      { brilho: 0.8, nutricao: 0.4 },
  "força":     { resistencia: 0.8, reconstrucao: 0.6 },
  "hidratação":{ maciez: 0.8, nutricao: 0.3 },
  "crescimento": { resistencia: 0.5, nutricao: 0.4 },
  "equilíbrio":  { brilho: 0.3, nutricao: 0.3, maciez: 0.3 },
};

const app = express();
const PORT = process.env.PORT || 3000;

// middleware pra ler JSON do body
app.use(express.json());

// arquivos estáticos (css, js, imagens)
app.use(express.static(path.join(__dirname, "public")));

// ====== ROTAS DE PÁGINA (views) ======

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

app.get("/diagnostico", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "diagnostico.html"));
});

app.get("/resultado", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "resultado.html"));
});

// ====== API SIÀGE ======

// lista todas as famílias (resumo)
app.get("/api/familias", (req, res) => {
  res.json(familiasLista);
});

// detalhes de uma família específica
app.get("/api/familias/:id", (req, res) => {
  const { id } = req.params;
  const familia = familias[id];

  if (!familia) {
    return res.status(404).json({ erro: "Família não encontrada" });
  }

  res.json({
    id,
    ...familia,
  });
});

// diagnóstico simples baseado em focos (primeira versão)
app.post("/api/diagnostico", (req, res) => {
  const { nome, tipoCabelo, condicao, objetivo } = req.body || {};

  if (!tipoCabelo || !condicao || !objetivo) {
    return res.status(400).json({
      erro: "Campos obrigatórios faltando (tipoCabelo, condicao, objetivo).",
    });
  }

  function calcularScore(fam) {
    const A = fam.atributos || {};
    let score = 0;

    // tipo de cabelo
    const pesoTipo = PESO_TIPO[tipoCabelo] || {};
    Object.entries(pesoTipo).forEach(([chave, peso]) => {
      score += (A[chave] || 0) * peso;
    });

    // condição atual
    const pesoCond = PESO_CONDICAO[condicao] || {};
    Object.entries(pesoCond).forEach(([chave, peso]) => {
      score += (A[chave] || 0) * peso;
    });

    // objetivo
    const pesoObj = PESO_OBJETIVO[objetivo] || {};
    Object.entries(pesoObj).forEach(([chave, peso]) => {
      score += (A[chave] || 0) * peso;
    });

    return score;
  }

  const recomendadas = familiasLista
    .map((fam) => ({
      id: fam.id,
      nome: fam.nome,
      classificacao: fam.classificacao,
      publico_alvo: fam.publico_alvo,
      atributos: fam.atributos,
      score: calcularScore(fam),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const primeira = recomendadas[0];

  const mensagem = primeira
    ? `Analisando seu tipo de cabelo (${tipoCabelo}), condição (${condicao}) e objetivo (${objetivo}), a linha que mais combina com você é: ${primeira.nome}.`
    : `Não consegui encontrar uma linha ideal com os dados enviados.`;

  return res.json({
    mensagem,
    recomendadas,
  });
});

// ====== INICIAR SERVIDOR ======

app.listen(PORT, () => {
  console.log(`SiàgeLab rodando em http://localhost:${PORT}`);
});
