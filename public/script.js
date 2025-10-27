/* ==========================================================
   SiàgeLab — Front-end de luxo + IA prática
   ========================================================== */

/** Map de temas por linha (dinâmico; o Admin adiciona mais) */
const THEMES = {
  rosa:      { class: "theme-rosa",       label: "Nutri Rosé",     hero: "./assets/hero-siage.jpg" },
  micelar:   { class: "theme-micelar",    label: "Hidratação Micelar", hero: "./assets/hero-micelar.jpg" },
  reconstrucao:{ class: "theme-reconstrucao", label:"Reconstrói os Fios", hero:"./assets/hero-reconstrucao.jpg" },
  cauteriza: { class: "theme-cauteriza",  label: "Cauterização dos Lisos", hero:"./assets/hero-cauteriza.jpg" },
  brilho:    { class: "theme-brilho",     label: "Brilho Extremo",  hero:"./assets/hero-brilho.jpg" },
  liso:      { class: "theme-liso",       label: "Liso Intenso",    hero:"./assets/hero-liso.jpg" },
  // Linhas adicionadas no Admin são fundidas aqui (em runtime)
};

const $ = (q) => document.querySelector(q);
const $$ = (q) => Array.from(document.querySelectorAll(q));

/* ====== elementos ====== */
const selectLinha = $("#selectLinha");
const preview = $("#preview");
const fotoInput = $("#fotoInput");
const formDiag = $("#formDiag");
const msgDiag = $("#msgDiag");
const grid = $("#cronogramaGrid");
const btnExportPDF = $("#btnExportPDF");
const btnExportIMG = $("#btnExportIMG");
const toggleConsultora = $("#toggleConsultora");
const tipsConsultora = $("#tipsConsultora");
const btnAdmin = $("#btnAdmin");
const adminModal = $("#adminModal");

const btnSalvarPerfil = $("#btnSalvarPerfil");
const btnCarregarPerfil = $("#btnCarregarPerfil");

/* ====== tema dinâmico ====== */
function applyTheme(slug){
  const tema = THEMES[slug] || THEMES.rosa;
  document.body.className = tema.class;
  preview.src = tema.hero;
}
selectLinha.addEventListener("change", e => applyTheme(e.target.value));
applyTheme(selectLinha.value);

/* ====== upload + análise visual ======
   Fazemos uma leitura simples no canvas: brilho médio e contraste
   para influenciar a dose de H/N/R no cronograma (client-side). */
let fotoStats = null;

fotoInput.addEventListener("change", async (e) => {
  const file = e.target.files?.[0];
  if(!file) return;
  const img = new Image();
  img.onload = () => {
    preview.src = img.src;
    fotoStats = analyzeImage(img);
  };
  img.src = URL.createObjectURL(file);
});

function analyzeImage(img){
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const w = canvas.width = 240;
  const h = canvas.height = Math.round((img.height / img.width) * 240);
  ctx.drawImage(img, 0, 0, w, h);
  const { data } = ctx.getImageData(0,0,w,h);

  let sum=0, sumSq=0;
  for(let i=0;i<data.length;i+=4){
    // luminância aproximada
    const y = 0.2126*data[i] + 0.7152*data[i+1] + 0.0722*data[i+2];
    sum += y; sumSq += y*y;
  }
  const n = data.length/4;
  const mean = sum/n;
  const variance = (sumSq/n) - (mean*mean);
  const contrast = Math.sqrt(Math.max(variance,0));
  return { mean, contrast }; // mean ≈ brilho, contrast ≈ variação
}

/* ====== helpers ====== */
function postJSON(url, payload){
  return fetch(url, {method:"POST",headers:{ "Content-Type":"application/json" }, body:JSON.stringify(payload)}).then(r=>r.json());
}

/* ====== diagnóstico → backend /api/diagnostico  ====== */
formDiag.addEventListener("submit", async (e) => {
  e.preventDefault();
  const fd = new FormData(formDiag);
  const nome = fd.get("nome");
  const tipoCabelo = fd.get("tipoCabelo");
  const condicao = fd.get("condicao");
  const objetivo = fd.get("objetivo");

  // Ajuste fino baseado na foto:
  // Se brilho muito baixo → mais hidratação; se contraste muito alto (frizz/textura forte) → + nutrição/reconstrução
  const fotoAdj = photoAdjustment(fotoStats);

  const { mensagem } = await postJSON("/api/diagnostico", { nome, tipoCabelo, condicao, objetivo });
  msgDiag.innerHTML = mensagem;

  const plano = await gerarCronograma({ tipoCabelo, condicao, objetivo, fotoAdj });
  renderCronograma(plano);
  renderTipsConsultora(plano, objetivo);
});

function photoAdjustment(stats){
  if(!stats) return { addH:0, addN:0, addR:0, note:"" };
  const { mean, contrast } = stats;
  let addH=0, addN=0, addR=0, note=[];
  if(mean < 85)  { addH += 1; note.push("Foto escura → +Hidratação"); }
  if(mean > 170) { addN += 1; note.push("Foto muito clara → +Nutrição leve"); }
  if(contrast > 60){ addN += 1; addR += 1; note.push("Contraste alto → +Nutrição/Recontr."); }
  return { addH, addN, addR, note:note.join("; ") };
}

/* ====== cronograma inteligente (client-side) ====== */
const BASES = {
  saudavel:   ["Hidratação","Nutrição","Hidratação","Nutrição"],
  ressecado:  ["Hidratação","Nutrição","Hidratação","Reconstrução"],
  danificado: ["Reconstrução","Nutrição","Hidratação","Reconstrução"],
  oleoso:     ["Hidratação","Hidratação","Nutrição","Hidratação"],
};

const FOCO = {
  brilho:      "use produtos com óleos leves e finalize com protetor térmico.",
  força:       "inclua produtos ricos em proteínas e queratina.",
  hidratação:  "mantenha máscaras hidratantes 2x por semana.",
  crescimento: "use tônicos e massagem no couro cabeludo.",
  equilíbrio:  "intercale H/N sem exagerar em reconstruções."
};

async function gerarCronograma({ tipoCabelo, condicao, objetivo, fotoAdj }){
  // base server-side (opcional, já temos /api/cronograma)
  const srv = await postJSON("/api/cronograma", { tipoCabelo, condicao, objetivo });
  let arr = srv.cronograma.map(o=>o.tratamento); // 4 semanas

  // Ajuste pelo objetivo (fino)
  const goal = (objetivo||"equilibrio").toLowerCase();
  if(goal === "hidratação") arr[0] = "Hidratação";
  if(goal === "brilho")     arr[1] = "Nutrição";
  if(goal === "força")      arr[2] = "Reconstrução";
  if(goal === "crescimento")arr[3] = "Nutrição";

  // Ajustes da foto
  for(let i=0;i<fotoAdj.addH;i++) arr[i%4] = "Hidratação";
  for(let i=0;i<fotoAdj.addN;i++) arr[(i+1)%4] = "Nutrição";
  for(let i=0;i<fotoAdj.addR;i++) arr[(i+2)%4] = "Reconstrução";

  // Retorna estrutura enriquecida
  return arr.map((trat,i)=>({
    semana:i+1,
    tratamento:trat,
    dica: dicaProduto(trat)
  }));
}

function dicaProduto(trat){
  switch(trat){
    case "Hidratação":  return "Hidratação Micelar: máscara + leave-in leve.";
    case "Nutrição":    return "Nutri Rosé / Brilho Extremo: óleos leves e finalizador.";
    case "Reconstrução":return "Reconstrói os Fios / Cauterização: aminoácidos + proteção térmica.";
    default:            return "Equilíbrio Siàge, finalize com proteção UV."
  }
}

function renderCronograma(plano){
  grid.innerHTML = "";
  plano.forEach(item=>{
    const el = document.createElement("div");
    el.className = "card-day";
    el.innerHTML = `
      <span class="badge">Semana ${item.semana}</span>
      <h4>${item.tratamento}</h4>
      <p>${item.dica}</p>
    `;
    grid.appendChild(el);
  });
}

/* ====== Modo Consultora ====== */
toggleConsultora.addEventListener("change", e=>{
  tipsConsultora.classList.toggle("hidden", !e.target.checked);
});
function renderTipsConsultora(plano, objetivo){
  if(!toggleConsultora.checked) return;
  const foco = (objetivo||"equilíbrio").toLowerCase();
  const upsell = {
    brilho: [
      "Combo Brilho: shampoo + máscara + óleo finalizador.",
      "Ofereça protetor térmico na finalização (secador/chapinha)."
    ],
    força: [
      "Sugerir ampola reconstrutora 1x/semana.",
      "Adicionar leave-in com queratina na semana 2."
    ],
    hidratação: [
      "Cross-sell: água micelar capilar + máscara hidratante.",
      "Atenção a comprimento x raízes para evitar peso."
    ],
    crescimento: [
      "Tônico + massagem 3x/semana (mostre antes/depois).",
      "Calendário de fotos a cada 14 dias."
    ],
    equilíbrio: [
      "Kit básico Siàge (shampoo, máscara, leave-in).",
      "Oferecer refil quando acabar (recorrência!)."
    ]
  }[foco] || [];
  tipsConsultora.innerHTML = upsell.map(t=>`<div class="tip">💡 ${t}</div>`).join("");
}

/* ====== Exportação (PDF e PNG) ====== */
async function captureCronograma(){
  const area = $("#diagnostico");
  const canvas = await html2canvas(area, { backgroundColor: null, scale: 2 });
  return canvas;
}

btnExportPDF.addEventListener("click", async ()=>{
  const canvas = await captureCronograma();
  const imgData = canvas.toDataURL("image/png");
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ unit:"pt", format:"a4" });

  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const ratio = Math.min(pageW / canvas.width, pageH / canvas.height);
  const w = canvas.width * ratio, h = canvas.height * ratio;
  const x = (pageW - w)/2, y = 24;

  pdf.addImage(imgData, "PNG", x, y, w, h);
  pdf.save("SiageLab-cronograma.pdf");
});

btnExportIMG.addEventListener("click", async ()=>{
  const canvas = await captureCronograma();
  const a = document.createElement("a");
  a.href = canvas.toDataURL("image/png");
  a.download = "SiageLab-cronograma.png";
  a.click();
});

/* ====== localStorage (perfil capilar) ====== */
btnSalvarPerfil.addEventListener("click", ()=>{
  const fd = new FormData(formDiag);
  const perfil = Object.fromEntries(fd.entries());
  perfil.linha = selectLinha.value;
  localStorage.setItem("siage_perfil", JSON.stringify(perfil));
  toast("Perfil salvo no dispositivo.");
});
btnCarregarPerfil.addEventListener("click", ()=>{
  const raw = localStorage.getItem("siage_perfil");
  if(!raw) return toast("Nenhum perfil salvo.");
  const perfil = JSON.parse(raw);
  formDiag.nome.value = perfil.nome || "";
  formDiag.tipoCabelo.value = perfil.tipoCabelo || "Liso";
  formDiag.condicao.value = perfil.condicao || "Saudavel";
  formDiag.objetivo.value = perfil.objetivo || "Equilíbrio";
  if(perfil.linha) { selectLinha.value = perfil.linha; applyTheme(perfil.linha); }
  toast("Perfil carregado.");
});

function toast(t){
  const el = document.createElement("div");
  el.style.position="fixed"; el.style.bottom="20px"; el.style.left="50%"; el.style.transform="translateX(-50%)";
  el.style.background="rgba(0,0,0,.8)"; el.style.color="#fff"; el.style.padding="10px 14px"; el.style.borderRadius="999px"; el.style.fontSize="12px"; el.style.zIndex=50;
  el.textContent = t;
  document.body.appendChild(el);
  setTimeout(()=>el.remove(), 1800);
}

/* ====== Painel Admin (cadastrar linha/campanha) ====== */
btnAdmin.addEventListener("click", ()=> adminModal.showModal());
$("#admSalvar").addEventListener("click", ()=>{
  const slug = $("#admSlug").value.trim();
  const nome = $("#admNome").value.trim();
  const cor1 = $("#admCor1").value;
  const cor2 = $("#admCor2").value;
  const img = $("#admImg").value || "./assets/hero-generic.jpg";

  if(!slug || !nome) return;
  // cria um tema novo in-memory + salva no storage
  const customThemes = JSON.parse(localStorage.getItem("siage_themes")||"{}");
  const cls = `theme-${slug}`;
  customThemes[slug] = { class: cls, label:nome, hero: img, colors:[cor1, cor2] };
  localStorage.setItem("siage_themes", JSON.stringify(customThemes));

  // injeta CSS do tema
  injectThemeClass(cls, cor1, cor2);

  // adiciona no seletor
  const opt = document.createElement("option");
  opt.value = slug; opt.textContent = nome;
  selectLinha.appendChild(opt);

  adminModal.close();
  toast("Linha adicionada ao seletor.");
  $("#admSlug").value = $("#admNome").value = $("#admImg").value = "";
});

(function restoreCustomThemes(){
  const custom = JSON.parse(localStorage.getItem("siage_themes")||"{}");
  Object.entries(custom).forEach(([slug,def])=>{
    THEMES[slug] = def;
    injectThemeClass(def.class, def.colors?.[0]||"#c7c7c7", def.colors?.[1]||"#1a1a1a");
    const opt = document.createElement("option");
    opt.value = slug; opt.textContent = def.label;
    selectLinha.appendChild(opt);
  });
})();

function injectThemeClass(cls, c1, c2){
  const style = document.createElement("style");
  style.textContent = `body.${cls}{ --accent:${c1}; --accent-2:${c2}; }`;
  document.head.appendChild(style);
}
