const fs = require("fs");
const path = require("path");

function carregarJSONs() {
  const pasta = __dirname;
  const arquivos = fs.readdirSync(pasta);

  const familias = {};

  arquivos.forEach((arquivo) => {
    if (arquivo.endsWith(".json") && arquivo !== "index.json") {
      const nome = path.basename(arquivo, ".json");

      const conteudo = JSON.parse(
        fs.readFileSync(path.join(pasta, arquivo), "utf-8")
      );

      familias[nome] = conteudo;
    }
  });

  return familias;
}

module.exports = carregarJSONs;
const fs = require("fs");
const path = require("path");

function carregarJSONs() {
  const pasta = __dirname;
  const arquivos = fs.readdirSync(pasta);

  const familias = {};

  arquivos.forEach((arquivo) => {
    if (arquivo.endsWith(".json") && arquivo !== "index.json") {
      const nome = path.basename(arquivo, ".json");

      const conteudo = JSON.parse(
        fs.readFileSync(path.join(pasta, arquivo), "utf-8")
      );

      familias[nome] = conteudo;
    }
  });

  return familias;
}

module.exports = carregarJSONs;
