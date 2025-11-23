const BRAND_COLOR = [217, 143, 207];
const SECONDARY_COLOR = [45, 45, 54];
const GRAY = [102, 102, 110];

function requireJsPDF() {
  const lib = window.jspdf?.jsPDF || window.jsPDF;
  if (!lib) {
    throw new Error("Biblioteca jsPDF não carregada");
  }
  return lib;
}

function drawHeader(doc, title) {
  doc.setFillColor(...BRAND_COLOR);
  doc.rect(0, 0, 210, 28, "F");
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text("SiàgeLab", 12, 17);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(title, 12, 24);
  doc.setTextColor(...SECONDARY_COLOR);
}

function addSectionTitle(doc, text, y) {
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text(text, 12, y);
  return y + 6;
}

function addParagraph(doc, text, y, maxWidth = 180) {
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...SECONDARY_COLOR);
  const lines = doc.splitTextToSize(text, maxWidth);
  doc.text(lines, 12, y);
  return y + lines.length * 6 + 2;
}

function addBadge(doc, label, x, y) {
  doc.setFillColor(...BRAND_COLOR);
  doc.setTextColor(255, 255, 255);
  doc.roundedRect(x, y - 5, 40, 10, 3, 3, "F");
  doc.setFontSize(10);
  doc.text(label, x + 4, y + 1);
  doc.setTextColor(...SECONDARY_COLOR);
}

function renderRecomendadas(doc, recomendadas, startY) {
  let y = addSectionTitle(doc, "Linhas recomendadas", startY);
  recomendadas.slice(0, 3).forEach((linha, idx) => {
    addBadge(doc, `Top ${idx + 1}`, 12, y);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(linha.nome || linha.id, 58, y + 1);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const publico = linha.publico_alvo || "Todos os cabelos";
    doc.setTextColor(...GRAY);
    doc.text(publico, 58, y + 6);
    if (linha.score != null) {
      doc.setTextColor(...SECONDARY_COLOR);
      doc.text(`Match ${(linha.score * 100).toFixed(0)}%`, 58, y + 11);
    }
    y += 20;
  });
  return y;
}

function renderCronograma(doc, cronograma, startY) {
  let y = addSectionTitle(doc, "Primeiras 4 semanas", startY);
  cronograma.forEach((item) => {
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(`Semana ${item.semana}`, 12, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...BRAND_COLOR);
    doc.text(item.tratamento, 50, y);
    doc.setTextColor(...SECONDARY_COLOR);
    const dicaLines = doc.splitTextToSize(item.dica || "", 140);
    doc.text(dicaLines, 12, y + 6);
    y += Math.max(18, dicaLines.length * 6 + 8);
  });
  return y;
}

export function exportDiagnosticoPDF({ perfil, diagnostico }) {
  const JsPDF = requireJsPDF();
  const doc = new JsPDF();
  drawHeader(doc, "Diagnóstico personalizado");
  let y = 36;

  y = addSectionTitle(doc, "Perfil da cliente", y);
  const perfilTxt = [
    perfil?.nome ? `Nome: ${perfil.nome}` : null,
    perfil?.tipoCabelo ? `Tipo: ${perfil.tipoCabelo}` : null,
    perfil?.condicao ? `Condição: ${perfil.condicao}` : null,
    perfil?.objetivo ? `Objetivo: ${perfil.objetivo}` : null,
  ]
    .filter(Boolean)
    .join(" · ");
  y = addParagraph(doc, perfilTxt || "Dados não informados.", y);

  if (diagnostico?.mensagem) {
    y = addSectionTitle(doc, "Resumo do parecer", y + 4);
    y = addParagraph(doc, diagnostico.mensagem, y);
  }

  if (diagnostico?.recomendadas?.length) {
    y = renderRecomendadas(doc, diagnostico.recomendadas, y + 6);
  }

  doc.setFontSize(9);
  doc.setTextColor(...GRAY);
  doc.text("Gerado automaticamente pelo SiàgeLab", 12, 285);
  doc.save("diagnostico-sialge.pdf");
}

export function exportCronogramaPDF({ perfil, diagnostico, cronograma }) {
  const JsPDF = requireJsPDF();
  const doc = new JsPDF();
  drawHeader(doc, "Plano semanal Siàge");
  let y = 36;

  y = addSectionTitle(doc, "Contexto", y);
  const contextoTxt = [
    perfil?.tipoCabelo && `Tipo: ${perfil.tipoCabelo}`,
    perfil?.condicao && `Condição: ${perfil.condicao}`,
    perfil?.objetivo && `Objetivo: ${perfil.objetivo}`,
  ]
    .filter(Boolean)
    .join(" · ");
  y = addParagraph(doc, contextoTxt || "Perfil não informado.", y);

  if (diagnostico?.mensagem) {
    y = addSectionTitle(doc, "Parecer", y + 4);
    y = addParagraph(doc, diagnostico.mensagem, y);
  }

  if (diagnostico?.recomendadas?.length) {
    y = renderRecomendadas(doc, diagnostico.recomendadas, y + 6);
  }

  if (cronograma?.length) {
    y = renderCronograma(doc, cronograma, y + 2);
  }

  doc.setFontSize(9);
  doc.setTextColor(...GRAY);
  doc.text("Gerado automaticamente pelo SiàgeLab", 12, 285);
  doc.save("cronograma-sialge.pdf");
}
