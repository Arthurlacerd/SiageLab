// Importa os módulos necessários
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

// Inicializa o app
const app = express();

// Configura o body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Define a pasta "public" como estática (para HTML, CSS, JS)
app.use(express.static(path.join(__dirname, "public")));

// Endpoint principal
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// === Diagnóstico Capilar ===
app.post("/api/diagnostico", (req, res) => {
  const { nome, tipoCabelo, condicao, objetivo } = req.body;

  const respostas = {
    brilho: "Use máscaras com óleos nutritivos e finalize com protetor térmico da linha Siàge Brilho Extremo.",
    força: "Invista na linha Siàge Reconstrói os Fios, rica em aminoácidos e queratina.",
    hidratação: "Aposte na linha Siàge Hidratação Micelar para repor a água e devolver a maciez.",
    crescimento: "Use tônicos capilares e massageie o couro cabeludo 3x por semana.",
    equilíbrio: "Faça cronograma alternando limpeza profunda e hidratação leve.",
  };

  const recomendacao =
    respostas[objetivo] ||
    "Mantenha uma rotina equilibrada com hidratação, nutrição e reconstrução.";

  const mensagem = `
    <strong>Olá, ${nome}!</strong><br>
    Seu cabelo <em>${tipoCabelo}</em> está <em>${condicao}</em> e o seu objetivo é <em>${objetivo}</em>.<br><br>
    <strong>Recomendação:</strong> ${recomendacao}<br><br>
    💜 Nossa IA Siàge está montando um cronograma exclusivo com base nas suas informações.
  `;

  res.json({ mensagem });
});

// === Geração de Cronograma Capilar ===
app.post("/api/cronograma", (req, res) => {
  const { tipoCabelo, condicao, objetivo } = req.body;

  // Define proporções baseadas na condição
  const base = {
    saudavel: ["Hidratação", "Nutrição", "Hidratação", "Nutrição"],
    ressecado: ["Hidratação", "Nutrição", "Hidratação", "Reconstrução"],
    danificado: ["Reconstrução", "Nutrição", "Hidratação", "Reconstrução"],
    oleoso: ["Hidratação", "Hidratação", "Nutrição", "Hidratação"],
  };

  // Ajuste pelo objetivo
  const foco = {
    brilho: "use produtos com óleos leves e finalize com protetor térmico.",
    força: "inclua produtos ricos em proteínas e queratina.",
    hidratação: "mantenha máscaras hidratantes 2x por semana.",
    crescimento: "use tônicos capilares e massageie o couro cabeludo.",
    equilibrio: "intercale hidratação e nutrição sem exagerar em reconstruções.",
  };

  const planoBase = base[condicao.toLowerCase()] || base.saudavel;
  const focoTexto = foco[objetivo.toLowerCase()] || foco.equilibrio;

  const cronograma = planoBase.map((trat, i) => ({
    dia: `Semana ${i + 1}`,
    tratamento: trat,
  }));

  res.json({
    cronograma,
    foco: focoTexto,
  });
});

// Sobe o servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
