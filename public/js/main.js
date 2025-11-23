import {
  getFamilias,
  enviarDiagnostico,
  gerarCronograma,
} from "./apiClient.js";
import {
  renderCronograma,
  renderFamiliasCatalogo,
  renderLinhaSelector,
  renderMensagem,
  renderLinhas,
  showStatus,
} from "./renderers.js";
import { bindFamiliaCatalogo, bindLinhaSelector, wireNavigation } from "./interactions.js";

const formDiag = document.querySelector("#form-diagnostico");
const familiasCatalogo = document.querySelector("#familiasCatalogo");
const refreshFamilias = document.querySelector("#refreshFamilias");
const linhaGrid = document.querySelector("#linhaGrid");
const btnAvancarGaleria = document.querySelector("#btnAvancarGaleria");
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
    renderFamiliasCatalogo(familias);
    renderLinhaSelector(familias);
  } catch (err) {
    renderFamiliasCatalogo([]);
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
    showStatus(err.message || "Não foi possível gerar o diagnóstico agora.", "error");
    renderMensagem("");
    renderLinhas([]);
    renderCronograma([]);
  }
}

function main() {
  wireNavigation();
  carregarFamilias();

  bindFamiliaCatalogo(familiasCatalogo);
  bindLinhaSelector(linhaGrid, (linhaId) => {
    aplicarTema(linhaId);
    btnAvancarGaleria?.removeAttribute("disabled");
  });

  refreshFamilias?.addEventListener("click", carregarFamilias);
  formDiag?.addEventListener("submit", executarDiagnostico);
}

main();
