import { getFamilia } from "./apiClient.js";
import { renderFamiliaDetalhe } from "./renderers.js";

function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth" });
}

export function wireNavigation() {
  const btnComecar = document.querySelector("#btnComecar");
  const btnAvancarGaleria = document.querySelector("#btnAvancarGaleria");

  btnComecar?.addEventListener("click", () => scrollToSection("linha"));
  btnAvancarGaleria?.addEventListener("click", () => scrollToSection("galeria"));
}

export function bindFamiliaCatalogo(container) {
  if (!container) return;

  container.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-familia-id]");
    if (!button) return;

    const card = button.closest(".familia-card");
    const familiaId = button.dataset.familiaId;
    if (!familiaId) return;

    card?.querySelectorAll(".familia-detalhe").forEach((node) => node.remove());
    button.disabled = true;
    button.textContent = "Carregando...";

    try {
      const familia = await getFamilia(familiaId);
      renderFamiliaDetalhe(card, familia);
    } catch (err) {
      const feedback = document.createElement("p");
      feedback.className = "familia-erro";
      feedback.textContent = "Não foi possível carregar os detalhes.";
      card.appendChild(feedback);
    } finally {
      button.disabled = false;
      button.textContent = "Ver detalhes";
    }
  });
}

export function bindLinhaSelector(container, onSelect) {
  if (!container) return;

  container.addEventListener("click", (event) => {
    const btn = event.target.closest(".opcao-linha");
    if (!btn) return;

    container.querySelectorAll(".opcao-linha").forEach((el) => {
      el.classList.remove("ativo");
      el.setAttribute("aria-pressed", "false");
    });

    btn.classList.add("ativo");
    btn.setAttribute("aria-pressed", "true");
    if (typeof onSelect === "function") onSelect(btn.dataset.linha);
  });
}
