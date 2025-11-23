const resultado = document.querySelector("#resultado");
const linhasRecomendadas = document.querySelector("#linhasRecomendadas");
const cronogramaBox = document.querySelector("#cronogramaBox");
const statusDiag = document.querySelector("#statusDiag");
const familiasCatalogo = document.querySelector("#familiasCatalogo");
const linhaGrid = document.querySelector("#linhaGrid");
const consultoraFamiliaSelect = document.querySelector("#consultoraFamilia");
const consultoraStatus = document.querySelector("#consultoraStatus");
const consultoraKit = document.querySelector("#kitSugestoes");

function formatarAtributos(atributos) {
  if (!atributos) return "";
  if (Array.isArray(atributos)) return atributos.join(" · ");

  if (typeof atributos === "object") {
    return Object.entries(atributos)
      .map(([nome, valor]) => `${nome}: ${(valor * 100).toFixed(0)}%`)
      .join(" · ");
  }

  return String(atributos);
}

export function showStatus(message, tone = "info") {
  if (!statusDiag) return;
  statusDiag.textContent = message;
  statusDiag.dataset.tone = tone;
}

export function renderMensagem(mensagem) {
  if (!resultado) return;
  resultado.innerHTML = `<div class="card-result">${mensagem}</div>`;
}

export function renderLinhas(lista = []) {
  if (!linhasRecomendadas) return;

  if (!lista.length) {
    linhasRecomendadas.innerHTML = "";
    return;
  }

  linhasRecomendadas.innerHTML = `
    <h3>Linhas Siàge recomendadas</h3>
    <div class="familias-grid">
      ${lista
        .map(
          (f) => `
        <article class="familia-card" role="listitem">
          <header>
            <p class="pill-tag">${f.classificacao || "Linha"}</p>
            <h4>${f.nome}</h4>
          </header>
          <p class="familia-publico">${f.publico_alvo || "Todos os tipos"}</p>
          ${f.score != null ? `<p class="familia-score">Match ${(f.score * 100).toFixed(0)}%</p>` : ""}
        </article>`
        )
        .join("")}
    </div>
  `;
}

export function renderCronograma(lista = []) {
  if (!cronogramaBox) return;

  if (!lista.length) {
    cronogramaBox.innerHTML = "";
    return;
  }

  cronogramaBox.innerHTML = `
    <h3>Primeiras 4 semanas de cuidado</h3>
    <div class="crono-grid">
      ${lista
        .map(
          (item) => `
        <div class="crono-col">
          <h4>Semana ${item.semana}</h4>
          <div class="crono-item">
            <span class="crono-tag">${item.tratamento}</span>
            <span>${item.dica}</span>
          </div>
        </div>`
        )
        .join("")}
    </div>
  `;
}

export function renderFamiliasCatalogo(lista = []) {
  if (!familiasCatalogo) return;

  if (!lista.length) {
    familiasCatalogo.innerHTML = '<p class="muted">Nenhuma linha encontrada.</p>';
    return;
  }

  familiasCatalogo.innerHTML = lista
    .map(
      (familia) => `
      <article class="familia-card" role="listitem" data-familia-id="${familia.id}">
        <header>
          <p class="pill-tag">${familia.classificacao || "Linha"}</p>
          <h4>${familia.nome}</h4>
        </header>
        <p class="familia-publico">${familia.publico_alvo || ""}</p>
        <p class="familia-atributos">${formatarAtributos(familia.atributos)}</p>
        <button class="btn btn-ghost" type="button" data-familia-id="${familia.id}">Ver detalhes</button>
      </article>
    `
    )
    .join("");
}

export function renderLinhaSelector(lista = []) {
  if (!linhaGrid) return;

  if (!lista.length) {
    linhaGrid.innerHTML = "<p class=\"muted\">Não há linhas para escolher.</p>";
    return;
  }

  linhaGrid.innerHTML = lista
    .map(
      (familia) => `
      <button role="listitem" class="opcao-linha" data-linha="${familia.id}" aria-pressed="false">
        <span class="pill-tag">${familia.classificacao || "Linha"}</span>
        <strong>${familia.nome}</strong>
        <span class="familia-publico">${familia.publico_alvo || ""}</span>
      </button>
    `
    )
    .join("");
}

export function renderConsultoraSelect(lista = []) {
  if (!consultoraFamiliaSelect) return;

  consultoraFamiliaSelect.innerHTML = "";

  if (!lista.length) {
    consultoraFamiliaSelect.innerHTML = '<option value="">Sem linhas disponíveis</option>';
    return;
  }

  const options = [
    '<option value="">Selecione uma família</option>',
    ...lista.map(
      (familia) =>
        `<option value="${familia.id}">${familia.nome || familia.id} — ${familia.classificacao || "Linha"}</option>`
    ),
  ];

  consultoraFamiliaSelect.innerHTML = options.join("");
}

export function renderConsultoraStatus(message, tone = "info") {
  if (!consultoraStatus) return;
  consultoraStatus.textContent = message;
  consultoraStatus.dataset.tone = tone;
}

export function renderConsultoraKit({ familia, perfil, essenciais = [], complementares = [], recomendacoes = [], matchTexto }) {
  if (!consultoraKit) return;

  if (!familia) {
    consultoraKit.innerHTML = '<p class="muted">Selecione uma família para montar o kit.</p>';
    return;
  }

  const pillPerfil = [perfil?.tipoCabelo, perfil?.condicao, perfil?.objetivo]
    .filter(Boolean)
    .map((txt) => `<span class="pill-tag">${txt}</span>`) // eslint-disable-line quotes
    .join(" ");

  const renderItem = (item) => `
    <article class="produto-card" role="listitem">
      <header>
        <p class="pill-tag">${item.categoria}</p>
        <h4>${item.nome}</h4>
      </header>
      <p class="muted">${item.descricao || ""}</p>
      <ul class="produto-beneficios">
        ${(item.beneficios || []).map((b) => `<li>${b}</li>`).join("")}
      </ul>
      <p class="modo-uso">${item.modo_de_uso || item.uso_ideal || ""}</p>
    </article>
  `;

  const listaEssenciais = essenciais.length
    ? `<div class="kit-bloco"><h4>Kit Essencial</h4><div class="kit-grid" role="list">${essenciais
        .map(renderItem)
        .join("")}</div></div>`
    : "";

  const listaComplementar = complementares.length
    ? `<div class="kit-bloco"><h4>Refino & Finalização</h4><div class="kit-grid" role="list">${complementares
        .map(renderItem)
        .join("")}</div></div>`
    : "";

  const listaRecs = recomendacoes.length
    ? `<div class="kit-recs"><h4>Observações de consultoria</h4><ul>${recomendacoes
        .map((rec) => `<li>${rec}</li>`)
        .join("")}</ul></div>`
    : "";

  consultoraKit.innerHTML = `
    <div class="kit-meta">
      <div>
        ${pillPerfil}
        <p class="pill-tag soft">${familia.classificacao || "Linha"}</p>
      </div>
      <div>
        <h3>${familia.nome}</h3>
        <p class="muted">${familia.publico_alvo || ""}</p>
        ${matchTexto ? `<p class="familia-score">${matchTexto}</p>` : ""}
      </div>
    </div>
    ${listaEssenciais}
    ${listaComplementar}
    ${listaRecs}
  `;
}

export function renderFamiliaDetalhe(target, familia) {
  if (!target || !familia) return;
  const detalhes = document.createElement("div");
  detalhes.className = "familia-detalhe";
  detalhes.innerHTML = `
    <p class="muted">${familia.descricao || ""}</p>
    <p class="familia-atributos">${formatarAtributos(familia.atributos)}</p>
  `;
  target.appendChild(detalhes);
}
