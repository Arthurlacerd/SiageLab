import {
  getFamilias,
  enviarDiagnostico,
  gerarCronograma,
} from "./apiClient.js";
import {
  renderCronograma,
  renderConsultoraKit,
  renderConsultoraSelect,
  renderConsultoraStatus,
  renderFamiliasCatalogo,
  renderLinhaSelector,
  renderMensagem,
  renderLinhas,
  showStatus,
} from "./renderers.js";
import {
  bindFamiliaCatalogo,
  bindLinhaSelector,
  wireNavigation,
} from "./interactions.js";

const formDiag = document.querySelector("#form-diagnostico");
const familiasCatalogo = document.querySelector("#familiasCatalogo");
const refreshFamilias = document.querySelector("#refreshFamilias");
const linhaGrid = document.querySelector("#linhaGrid");
const btnAvancarGaleria = document.querySelector("#btnAvancarGaleria");

const consultoraForm = document.querySelector("#consultoraForm");
const consultoraFamiliaSelect = document.querySelector("#consultoraFamilia");

let familiasCache = [];

const accentMap = {
  hidratacao_micelar: "#a6e4ff",
  cauterizacao_dos_fios: "#d7c0ff",
  brilho_extremo: "#fff1a6",
  nutri_oleos_poderosos: "#d9a3ff",
  reconstrucao_dos_fios: "#ffd5a6",
  liso_intenso: "#c6f1e8",
};

function aplicarTema(linhaId) {
  document.body.dataset.theme = linhaId;
  const cor = accentMap[linhaId];
  if (cor) document.documentElement.style.setProperty("--accent", cor);
}

async function carregarFamilias() {
  renderFamiliasCatalogo([]);
  try {
    const familias = await getFamilias();
    familiasCache = familias;
    renderFamiliasCatalogo(familias);
    renderLinhaSelector(familias);
    renderConsultoraSelect(familias);
  } catch (err) {
    renderFamiliasCatalogo([]);
    renderConsultoraSelect([]);
    if (familiasCatalogo) {
      familiasCatalogo.innerHTML = `<p class="familia-erro">Erro ao carregar as linhas (${err.message || err}).</p>`;
    }
  }
}

function coletarPayload() {
  const nome = document.querySelector("#nome")?.value?.trim();
  const tipoCabelo = document.querySelector("#tipoCabelo")?.value;
  const condicao = document.querySelector("#condicao")?.value;
  const objetivo = document.querySelector("#objetivo")?.value;

  return { nome, tipoCabelo, condicao, objetivo };
}

function mapearAtributo(objetivo) {
  const mapa = {
    brilho: "brilho",
    força: "resistencia",
    hidratação: "maciez",
    crescimento: "resistencia",
    equilíbrio: "controle",
  };
  return mapa[objetivo] || "brilho";
}

function montarKitConsultora(perfil, familia) {
  const produtos = familia?.produtos || {};
  const atributos = familia?.atributos || {};
  const essenciais = [];
  const complementares = [];

  Object.entries(produtos).forEach(([categoria, data]) => {
    const item = {
      categoria,
      nome: data?.nome || `${familia.nome} ${categoria}`,
      beneficios: data?.beneficios || data?.funcoes || [],
      modo_de_uso: data?.modo_de_uso,
      uso_ideal: data?.uso_ideal,
      descricao: (data?.funcoes || []).join(" · "),
    };

    if (["shampoo", "condicionador"].includes(categoria)) {
      essenciais.push(item);
    } else {
      complementares.push(item);
    }
  });

  const atributoAlvo = mapearAtributo(perfil?.objetivo);
  const match = atributos?.[atributoAlvo];
  const matchTexto =
    typeof match === "number"
      ? `Combina ${(match * 100).toFixed(0)}% com o objetivo de ${perfil?.objetivo}`
      : undefined;

  const observacoes = familia?.observacoes_reais || {};
  const recomendacoes = [
    ...(observacoes.recomendacoes_profissionais || []),
    ...(observacoes.riscos_de_excesso || []),
  ].slice(0, 5);

  return {
    familia,
    perfil,
    essenciais,
    complementares,
    recomendacoes,
    matchTexto,
  };
}

async function executarDiagnostico(event) {
  event.preventDefault();
  const payload = coletarPayload();
  showStatus("Gerando diagnóstico...", "info");
  renderMensagem("");
  renderLinhas([]);
  renderCronograma([]);

  try {
    const diag = await enviarDiagnostico(payload);
    renderMensagem(diag.mensagem || "Pronto! Aqui está seu plano.");
    renderLinhas(diag.recomendadas || []);
    showStatus("Diagnóstico concluído!", "success");

    const plano = await gerarCronograma(payload);
    renderCronograma(plano.cronograma || []);
  } catch (err) {
    console.error(err);
    showStatus(
      err.message || "Não foi possível gerar o diagnóstico agora.",
      "error"
    );
    renderMensagem("");
    renderLinhas([]);
    renderCronograma([]);
  }
}

function main() {
  wireNavigation();
  carregarFamilias();

  // Estado inicial do modo Consultora
  renderConsultoraKit({});
  renderConsultoraStatus(
    "Selecione um perfil e uma família para começar."
  );

  bindFamiliaCatalogo(familiasCatalogo);
  bindLinhaSelector(linhaGrid, (linhaId) => {
    aplicarTema(linhaId);
    btnAvancarGaleria?.removeAttribute("disabled");
  });

  consultoraForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    renderConsultoraStatus("Montando kit sob medida...", "info");

    const perfil = {
      tipoCabelo: consultoraForm.querySelector("[name=tipoCabelo]")?.value,
      condicao: consultoraForm.querySelector("[name=condicao]")?.value,
      objetivo: consultoraForm.querySelector("[name=objetivo]")?.value,
    };

    const familiaId = consultoraFamiliaSelect?.value;
    const familia = familiasCache.find((f) => f.id === familiaId);

    if (!familia) {
      renderConsultoraStatus(
        "Escolha uma família para gerar o kit.",
        "error"
      );
      renderConsultoraKit({});
      return;
    }

    aplicarTema(familia.id);
    const kit = montarKitConsultora(perfil, familia);
    renderConsultoraStatus(
      "Kit gerado com base no perfil da cliente.",
      "success"
    );
    renderConsultoraKit(kit);
  });

  refreshFamilias?.addEventListener("click", carregarFamilias);
  formDiag?.addEventListener("submit", executarDiagnostico);
}

main();
