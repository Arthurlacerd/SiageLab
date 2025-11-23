/* ==========================================================
   SiàgeLab — interação básica com o diagnóstico
   ========================================================== */

const $ = (q) => document.querySelector(q);
const $$ = (q) => Array.from(document.querySelectorAll(q));

function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth" });
}

// Navegação simples
const btnComecar = $("#btnComecar");
btnComecar?.addEventListener("click", () => scrollToSection("linha"));

const btnAvancarGaleria = $("#btnAvancarGaleria");
btnAvancarGaleria?.addEventListener("click", () => scrollToSection("galeria"));

// Seletor de linha (apenas feedback visual)
$$('.opcao-linha').forEach((btn) => {
  btn.addEventListener("click", () => {
    $$('.opcao-linha').forEach((b) => b.classList.remove("ativo"));
    btn.classList.add("ativo");
    btnAvancarGaleria?.removeAttribute("disabled");
  });
});

const formDiag = $("#form-diagnostico");
const resultado = $("#resultado");
const linhasRecomendadas = $("#linhasRecomendadas");
const cronogramaBox = $("#cronogramaBox");

async function postJSON(url, payload) {
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!resp.ok) throw new Error(`Erro ${resp.status}`);
  return resp.json();
}

function renderMensagem(mensagem) {
  resultado.innerHTML = `<div class="card-result">${mensagem}</div>`;
}

function renderLinhas(lista = []) {
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
        <article class="familia-card">
          <h4>${f.nome}</h4>
          <p class="familia-classificacao">${f.classificacao || ""}</p>
          <p class="familia-publico">${f.publico_alvo || ""}</p>
          ${f.score != null ? `<p class="familia-score">Match: ${(f.score * 100).toFixed(0)}%</p>` : ""}
        </article>`
        )
        .join("")}
    </div>
  `;
}

function renderCronograma(lista = []) {
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

formDiag?.addEventListener("submit", async (e) => {
  e.preventDefault();
  resultado.textContent = "Gerando diagnóstico...";

  const payload = {
    nome: $("#nome")?.value,
    tipoCabelo: $("#tipoCabelo")?.value,
    condicao: $("#condicao")?.value,
    objetivo: $("#objetivo")?.value,
  };

  try {
    const diag = await postJSON("/api/diagnostico", payload);
    renderMensagem(diag.mensagem || "Pronto! Aqui está seu plano.");
    renderLinhas(diag.recomendadas || []);

    const plano = await postJSON("/api/cronograma", payload);
    renderCronograma(plano.cronograma || []);
  } catch (err) {
    console.error(err);
    renderMensagem("Não foi possível gerar o diagnóstico agora. Tente novamente.");
    renderLinhas([]);
    renderCronograma([]);
  }
});
