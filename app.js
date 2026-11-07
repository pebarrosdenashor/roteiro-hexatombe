import OBR from "https://cdn.jsdelivr.net/npm/@owlbear-rodeo/sdk@3.1.0/+esm";
import { PADRAO, VERSAO_DADOS } from "./dados.js?v=1.0.0";

/* =========================================================
   Roteiro do Hexatombe (Owlbear Rodeo) — só para o mestre.
   Linha do tempo de Bom Jesus do Açude: quem está em cada
   local, dia a dia, eventos fixos, alianças e equipes.
   O conteúdo fica salvo no navegador do mestre e pode ser
   exportado/importado como texto.
   ========================================================= */

const NS = "io.github.pebarrosdenashor.roteiro-hx";
const KEY = NS + ":dados";
const UI_KEY = NS + ":ui";
const MODAL_ID = NS + "/modal";
const IS_MODAL = new URLSearchParams(location.search).has("modal");
const DIAS = [1, 2, 3, 4, 5, 6];
const TIPOS = ["Base", "Explorar", "Enigma"];

/* ---------- Utilidades ---------- */
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const clone = (o) => JSON.parse(JSON.stringify(o));
const uid = () => Math.random().toString(36).slice(2, 9);
const lsGet = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, v); return true; } catch { return false; } };
const paras = (t) => esc(t).split(/\n{2,}/).map((p) => `<p>${p.replace(/\n/g, "<br>")}</p>`).join("");

const I = {
  sol: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  lua: '<svg viewBox="0 0 24 24"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/></svg>',
  editar: '<svg viewBox="0 0 24 24"><path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/></svg>',
  expandir: '<svg viewBox="0 0 24 24"><path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7"/></svg>',
  fechar: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  mais: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
  lixo: '<svg viewBox="0 0 24 24"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>',
  lista: '<svg viewBox="0 0 24 24"><path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/></svg>',
  grade: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
  menu: '<svg viewBox="0 0 24 24"><circle cx="12" cy="5" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="12" cy="19" r="1.2"/></svg>',
  pin: '<svg viewBox="0 0 24 24"><path d="M12 21s-6-5.5-6-11a6 6 0 0 1 12 0c0 5.5-6 11-6 11z"/><circle cx="12" cy="10" r="2"/></svg>',
  seta: '<svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg>',
  check: '<svg viewBox="0 0 24 24"><path d="M5 12l5 5 9-10"/></svg>',
  cadeado: '<svg viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
};

/* ---------- Estado ---------- */
function carregar() {
  const raw = lsGet(KEY);
  if (raw) {
    try {
      const d = JSON.parse(raw);
      if (d && Array.isArray(d.locais) && Array.isArray(d.equipes)) return normalizar(d);
    } catch {}
  }
  return clone(PADRAO);
}
function normalizar(d) {
  const base = clone(PADRAO);
  const out = { ...base, ...d };
  out.versao = VERSAO_DADOS;
  out.dias = DIAS.map((_, i) => ({ d: d.dias?.[i]?.d ?? "", n: d.dias?.[i]?.n ?? "" }));
  out.locais = (d.locais || []).map((l) => ({
    id: l.id || uid(), nome: l.nome || "Novo local", tipo: l.tipo || "Explorar", dono: l.dono || "",
    encontro: l.encontro || "", rende: l.rende || "",
    p: DIAS.map((_, i) => ({ d: turno(l.p?.[i]?.d), n: turno(l.p?.[i]?.n) })),
  }));
  out.equipes = (d.equipes || []).map((e) => ({ id: e.id || uid(), nome: e.nome || "Equipe", cor: e.cor || "#999999", membros: e.membros || "", base: e.base || "", plano: DIAS.map((_, i) => e.plano?.[i] ?? "") }));
  out.eventos = (d.eventos || []).map((e) => ({ id: e.id || uid(), dia: Number(e.dia) || 1, turno: e.turno === "n" ? "n" : "d", local: e.local || "", titulo: e.titulo || "Evento", texto: e.texto || "", fala: e.fala || "", feito: !!e.feito }));
  out.aliancas = d.aliancas || base.aliancas;
  out.blocos = d.blocos || base.blocos;
  out.diaAtual = Number(d.diaAtual) || 1;
  return out;
}
const turno = (t) => ({ eq: Array.isArray(t?.eq) ? t.eq : [], t: t?.t ?? "" });

let dados = carregar();
const uiSalva = (() => { try { return JSON.parse(lsGet(UI_KEY) || "{}"); } catch { return {}; } })();
const ui = {
  aba: uiSalva.aba || "linha",
  dia: uiSalva.dia || dados.diaAtual || 1,
  turno: uiSalva.turno || "d",
  vista: uiSalva.vista || (IS_MODAL ? "grade" : "lista"),
  filtro: "todos",
  editar: false,
  aberto: null,
  menu: false,
  dialogo: null,
  realce: null,
};
const salvarUi = () => lsSet(UI_KEY, JSON.stringify({ aba: ui.aba, dia: ui.dia, turno: ui.turno, vista: ui.vista }));

let saveTimer = null;
function salvar(agora = false) {
  clearTimeout(saveTimer);
  const go = () => { lsSet(KEY, JSON.stringify(dados)); marcarSalvo(); };
  if (agora) go(); else saveTimer = setTimeout(go, 350);
}
function marcarSalvo() {
  const el = document.getElementById("salvo");
  if (!el) return;
  el.classList.add("on");
  clearTimeout(marcarSalvo.t);
  marcarSalvo.t = setTimeout(() => el.classList.remove("on"), 1400);
}

const eqMap = () => Object.fromEntries(dados.equipes.map((e) => [e.id, e]));
const localPorId = (id) => dados.locais.find((l) => l.id === id);

function setPath(path, value) {
  const parts = path.split(".");
  let o = dados;
  for (let i = 0; i < parts.length - 1; i++) o = o[isNaN(parts[i]) ? parts[i] : Number(parts[i])];
  const last = parts[parts.length - 1];
  o[isNaN(last) ? last : Number(last)] = value;
}

/* ---------- Pedaços de interface ---------- */
function chip(e, extra = "") {
  if (!e) return "";
  return `<span class="chip" style="--c:${esc(e.cor)}"${extra}><i></i>${esc(e.nome)}</span>`;
}
function chipsDe(ids) {
  const m = eqMap();
  return ids.map((id) => chip(m[id])).join("");
}
function editaChips(path, ids) {
  return `<div class="chips-edit">${dados.equipes.map((e) => `<button class="chip toggle ${ids.includes(e.id) ? "on" : ""}" style="--c:${esc(e.cor)}" data-act="chip" data-path="${path}" data-eq="${e.id}"><i></i>${esc(e.nome)}</button>`).join("")}</div>`;
}
const campo = (rotulo, path, valor, linhas = 2) =>
  `<label class="campo"><span>${rotulo}</span><textarea rows="${linhas}" data-bind="${path}">${esc(valor)}</textarea></label>`;
const campoLinha = (rotulo, path, valor) =>
  `<label class="campo"><span>${rotulo}</span><input type="text" data-bind="${path}" value="${esc(valor)}"></label>`;
function seletor(path, valor, opcoes, rotulo) {
  return `<label class="campo"><span>${rotulo}</span><select data-bind-sel="${path}">${opcoes.map(([v, t]) => `<option value="${esc(v)}" ${v === valor ? "selected" : ""}>${esc(t)}</option>`).join("")}</select></label>`;
}

function cabecalho() {
  return `
  <header class="top">
    <div class="marca">
      <div class="selo">${I.pin}</div>
      <div><h1>Roteiro do Hexatombe</h1><small>Bom Jesus do Açude <span id="salvo" class="salvo">· ${I.check} salvo</span></small></div>
    </div>
    <div class="acoes">
      <button class="ico ${ui.editar ? "ativo" : ""}" data-act="editar" title="${ui.editar ? "Sair da edição" : "Editar conteúdo"}">${I.editar}<span>${ui.editar ? "Pronto" : "Editar"}</span></button>
      ${OBR.isAvailable ? `<button class="ico so" data-act="${IS_MODAL ? "fechar-modal" : "expandir"}" title="${IS_MODAL ? "Fechar tela grande" : "Abrir em tela grande"}">${IS_MODAL ? I.fechar : I.expandir}</button>` : ""}
      <div class="menu-wrap">
        <button class="ico so" data-act="menu" title="Mais opções">${I.menu}</button>
        ${ui.menu ? `<div class="menu">
          <button data-act="exportar">Exportar conteúdo</button>
          <button data-act="importar">Importar conteúdo</button>
          <button data-act="restaurar" class="perigo">Restaurar o roteiro original</button>
        </div>` : ""}
      </div>
    </div>
  </header>
  <nav class="abas">
    ${[["linha", "Linha do tempo"], ["eventos", "Eventos"], ["aliancas", "Alianças"], ["equipes", "Equipes"]]
      .map(([k, t]) => `<button class="${ui.aba === k ? "on" : ""}" data-act="aba" data-v="${k}">${t}</button>`).join("")}
  </nav>`;
}

function seletorDia() {
  return `
  <div class="dia-bar">
    <div class="dias">
      ${DIAS.map((d) => `<button class="dia ${ui.dia === d ? "on" : ""} ${dados.diaAtual === d ? "hoje" : ""}" data-act="dia" data-v="${d}"><b>${d}</b><small>${dados.diaAtual === d ? "hoje" : "dia"}</small></button>`).join("")}
    </div>
    <div class="seg turnos">
      <button class="${ui.turno === "d" ? "on" : ""}" data-act="turno" data-v="d">${I.sol}Dia</button>
      <button class="${ui.turno === "n" ? "on" : ""}" data-act="turno" data-v="n">${I.lua}Noite</button>
    </div>
  </div>`;
}

/* ---------- Aba: Linha do tempo ---------- */
function abaLinha() {
  const i = ui.dia - 1, t = ui.turno;
  const resumo = dados.dias[i][t];
  const evs = dados.eventos.filter((e) => e.dia === ui.dia && e.turno === t);
  const ocupados = dados.locais.filter((l) => l.p[i][t].eq.length).length;
  const vazios = dados.locais.length - ocupados;
  let locais = dados.locais.map((l, idx) => ({ l, idx }));
  if (ui.filtro === "ocupados") locais = locais.filter(({ l }) => l.p[i][t].eq.length);
  if (ui.filtro === "vazios") locais = locais.filter(({ l }) => !l.p[i][t].eq.length);

  return `
  ${seletorDia()}
  <section class="resumo ${t === "n" ? "noite" : ""}">
    <div class="resumo-top">
      <span class="tag">${t === "d" ? I.sol : I.lua} Dia ${ui.dia} · ${t === "d" ? "de dia" : "de noite"}</span>
      ${dados.diaAtual !== ui.dia ? `<button class="link" data-act="hoje">Marcar como dia atual</button>` : `<span class="tag hoje">Dia atual da mesa</span>`}
    </div>
    ${ui.editar ? `<textarea rows="2" data-bind="dias.${i}.${t}" placeholder="O que acontece neste turno">${esc(resumo)}</textarea>` : `<p class="resumo-txt">${esc(resumo) || '<span class="muted">Nada marcado para este turno.</span>'}</p>`}
    ${evs.length ? `<div class="ev-mini">${evs.map((e) => `<button class="ev-pill ${e.feito ? "feito" : ""}" data-act="ir-evento" data-v="${e.id}">${e.feito ? I.check : "★"} ${esc(e.titulo)}${e.local && localPorId(e.local) ? ` <small>· ${esc(localPorId(e.local).nome)}</small>` : ""}</button>`).join("")}</div>` : ""}
  </section>

  <div class="barra">
    <div class="seg filtro">
      <button class="${ui.filtro === "todos" ? "on" : ""}" data-act="filtro" data-v="todos">Todos <small>${dados.locais.length}</small></button>
      <button class="${ui.filtro === "ocupados" ? "on" : ""}" data-act="filtro" data-v="ocupados">Ocupados <small>${ocupados}</small></button>
      <button class="${ui.filtro === "vazios" ? "on" : ""}" data-act="filtro" data-v="vazios">Vazios <small>${vazios}</small></button>
    </div>
    <div class="seg vista">
      <button class="${ui.vista === "lista" ? "on" : ""}" data-act="vista" data-v="lista" title="Lista">${I.lista}</button>
      <button class="${ui.vista === "grade" ? "on" : ""}" data-act="vista" data-v="grade" title="Grade da semana">${I.grade}</button>
    </div>
  </div>

  ${ui.vista === "grade" ? grade() : `<div class="locais">${locais.map(({ l, idx }) => cartaoLocal(l, idx)).join("") || '<p class="vazio-msg">Nenhum local neste filtro.</p>'}</div>`}
  ${ui.editar && ui.vista === "lista" ? `<button class="novo" data-act="novo-local">${I.mais} Novo local</button>` : ""}
  `;
}

function cartaoLocal(l, idx) {
  const i = ui.dia - 1, t = ui.turno;
  const cel = l.p[i][t];
  const vazio = !cel.eq.length;
  const aberto = ui.aberto === l.id;
  const m = eqMap();
  const dono = m[l.dono];
  const base = `locais.${idx}`;
  return `
  <article class="local ${vazio ? "vazio" : ""} ${aberto ? "aberto" : ""} ${ui.realce === l.id ? "realce" : ""}" data-local="${l.id}" style="--c:${esc(dono?.cor || "#5b6170")}">
    <button class="local-cab" data-act="abrir" data-v="${l.id}">
      <div class="local-tit">
        <h3>${esc(l.nome)}</h3>
        <div class="badges"><span class="badge">${esc(l.tipo)}</span>${dono ? `<span class="badge dono">base · ${esc(dono.nome)}</span>` : ""}</div>
      </div>
      <span class="seta">${I.seta}</span>
    </button>
    <div class="local-corpo">
      ${ui.editar ? editaChips(`${base}.p.${i}.${t}.eq`, cel.eq) : (vazio ? `<div class="estado-vazio">Vazio</div>` : `<div class="chips">${chipsDe(cel.eq)}</div>`)}
      ${ui.editar ? `<textarea rows="2" data-bind="${base}.p.${i}.${t}.t" placeholder="Quem está aqui e o que está fazendo">${esc(cel.t)}</textarea>` : (cel.t ? `<p class="cel-txt">${esc(cel.t)}</p>` : "")}
    </div>
    ${aberto ? detalheLocal(l, idx) : ""}
  </article>`;
}

function detalheLocal(l, idx) {
  const base = `locais.${idx}`;
  const m = eqMap();
  const semana = `
    <div class="semana">
      ${DIAS.map((d, i) => `<div class="sem-dia ${d === ui.dia ? "on" : ""}"><small>${d}</small>
        ${["d", "n"].map((t) => {
          const c = l.p[i][t];
          return `<button class="sem-cel ${c.eq.length ? "" : "vz"} ${d === ui.dia && t === ui.turno ? "atual" : ""}" data-act="ir-cel" data-dia="${d}" data-turno="${t}" title="Dia ${d} · ${t === "d" ? "dia" : "noite"}${c.t ? ": " + esc(c.t) : ""}">${pontos(c.eq, m)}</button>`;
        }).join("")}
      </div>`).join("")}
    </div>`;
  if (ui.editar) {
    return `<div class="detalhe">
      ${semana}
      <div class="grid2">${campoLinha("Nome", `${base}.nome`, l.nome)}
      ${seletor(`${base}.tipo`, l.tipo, TIPOS.map((t) => [t, t]), "Tipo")}</div>
      ${seletor(`${base}.dono`, l.dono, [["", "Nenhuma equipe"], ...dados.equipes.map((e) => [e.id, e.nome])], "Base de")}
      ${campo("Encontro principal", `${base}.encontro`, l.encontro, 3)}
      ${campo("O que pode render", `${base}.rende`, l.rende, 2)}
      <button class="perigo-btn" data-act="del-local" data-v="${l.id}">${I.lixo} Excluir local</button>
    </div>`;
  }
  return `<div class="detalhe">
    <h4>A semana aqui</h4>${semana}
    ${l.encontro ? `<h4>Encontro principal</h4><p>${esc(l.encontro)}</p>` : ""}
    ${l.rende ? `<h4>O que pode render</h4><p class="rende">${esc(l.rende)}</p>` : ""}
  </div>`;
}

function pontos(ids, m) {
  const mostrar = ids.length > 4 ? ids.slice(0, 3) : ids;
  return mostrar.map((id) => `<i style="--c:${esc(m[id]?.cor || "#888")}"></i>`).join("") + (ids.length > 4 ? `<b class="mais">+${ids.length - 3}</b>` : "");
}
function grade() {
  const m = eqMap();
  return `
  <div class="grade-wrap">
    <table class="grade">
      <thead><tr><th class="g-local">Local</th>${DIAS.map((d) => `<th colspan="2" class="${d === ui.dia ? "on" : ""}">Dia ${d}</th>`).join("")}</tr>
      <tr class="sub"><th></th>${DIAS.map(() => `<th>${I.sol}</th><th>${I.lua}</th>`).join("")}</tr></thead>
      <tbody>
      ${dados.locais.map((l) => `<tr><th class="g-local"><div><span style="--c:${esc(m[l.dono]?.cor || "transparent")}"></span>${esc(l.nome)}</div></th>
        ${DIAS.map((d, i) => ["d", "n"].map((t) => {
          const c = l.p[i][t];
          return `<td class="${d === ui.dia ? "on" : ""} ${t === "n" ? "nt" : ""}"><button class="g-cel ${c.eq.length ? "" : "vz"} ${d === ui.dia && t === ui.turno ? "atual" : ""}" data-act="ir-cel" data-local="${l.id}" data-dia="${d}" data-turno="${t}" title="${esc(l.nome)} · dia ${d} · ${t === "d" ? "dia" : "noite"}${c.t ? "\n" + esc(c.t) : ""}">${c.eq.length ? pontos(c.eq, m) : "·"}</button></td>`;
        }).join("")).join("")}</tr>`).join("")}
      </tbody>
    </table>
  </div>
  <div class="legenda">${dados.equipes.map((e) => chip(e)).join("")}<span class="chip vz-leg">· vazio</span></div>
  <p class="dica">Clique numa célula para abrir o local naquele dia e turno.</p>`;
}

/* ---------- Aba: Eventos ---------- */
function abaEventos() {
  const porDia = DIAS.map((d) => ({ d, evs: dados.eventos.map((e, idx) => ({ e, idx })).filter(({ e }) => e.dia === d).sort((a, b) => (a.e.turno > b.e.turno ? 1 : -1)) }));
  const feitos = dados.eventos.filter((e) => e.feito).length;
  return `
  <div class="intro"><p>${dados.eventos.length} eventos fixos · ${feitos} já aconteceram.</p></div>
  ${porDia.map(({ d, evs }) => (evs.length || ui.editar) ? `
    <section class="ev-dia">
      <h2><span>Dia ${d}</span>${dados.diaAtual === d ? '<em class="tag hoje">hoje</em>' : ""}</h2>
      ${evs.map(({ e, idx }) => cartaoEvento(e, idx)).join("") || '<p class="muted small">Sem eventos fixos.</p>'}
      ${ui.editar ? `<button class="novo pequeno" data-act="novo-evento" data-v="${d}">${I.mais} Evento no dia ${d}</button>` : ""}
    </section>` : "").join("")}
  <section class="notas">
    <h2><span>Notas do mestre</span></h2>
    <textarea rows="4" data-bind="notas" placeholder="Anote o que mudou durante a sessão: quem morreu, alianças, o que os jogadores descobriram...">${esc(dados.notas)}</textarea>
  </section>`;
}

function cartaoEvento(e, idx) {
  const base = `eventos.${idx}`;
  const loc = localPorId(e.local);
  if (ui.editar) {
    return `<article class="evento edit" id="ev-${e.id}">
      ${campoLinha("Título", `${base}.titulo`, e.titulo)}
      <div class="grid3">
        ${seletor(`${base}.dia`, String(e.dia), DIAS.map((d) => [String(d), "Dia " + d]), "Dia")}
        ${seletor(`${base}.turno`, e.turno, [["d", "De dia"], ["n", "De noite"]], "Turno")}
        ${seletor(`${base}.local`, e.local, [["", "Qualquer lugar"], ...dados.locais.map((l) => [l.id, l.nome])], "Local")}
      </div>
      ${campo("O que acontece", `${base}.texto`, e.texto, 6)}
      ${campo("Fala", `${base}.fala`, e.fala, 2)}
      <button class="perigo-btn" data-act="del-evento" data-v="${e.id}">${I.lixo} Excluir evento</button>
    </article>`;
  }
  return `<article class="evento ${e.feito ? "feito" : ""} ${ui.realce === e.id ? "realce" : ""}" id="ev-${e.id}">
    <div class="ev-cab">
      <div>
        <h3>${esc(e.titulo)}</h3>
        <div class="badges"><span class="badge">${e.turno === "d" ? I.sol + " de dia" : I.lua + " de noite"}</span>${loc ? `<button class="badge link-b" data-act="ir-local" data-v="${loc.id}" data-dia="${e.dia}" data-turno="${e.turno}">${I.pin}${esc(loc.nome)}</button>` : ""}</div>
      </div>
      <button class="check ${e.feito ? "on" : ""}" data-act="feito" data-v="${e.id}" title="Marcar como acontecido">${I.check}</button>
    </div>
    <div class="ev-txt">${paras(e.texto)}</div>
    ${e.fala ? `<blockquote>${esc(e.fala)}</blockquote>` : ""}
  </article>`;
}

/* ---------- Aba: Alianças ---------- */
function abaAliancas() {
  const m = eqMap();
  const bloco = dados.blocos.find((b) => b.escolha === dados.escolhida);
  return `
  <div class="intro"><p>No dia 3 os jogadores escolhem uma aliança. As duas recusadas formam o Bloco rival.</p></div>
  <div class="escolha">
    <span>Aliança escolhida</span>
    <div class="seg">
      <button class="${!dados.escolhida ? "on" : ""}" data-act="escolher" data-v="">Ainda não</button>
      ${dados.aliancas.map((a) => `<button class="${dados.escolhida === a.id ? "on" : ""}" data-act="escolher" data-v="${a.id}" style="--c:${esc(m[a.id]?.cor || "#888")}"><i class="dot"></i>${esc(m[a.id]?.nome || a.id)}</button>`).join("")}
    </div>
  </div>
  ${bloco ? `<div class="bloco-aviso"><b>Bloco rival: ${esc(bloco.uniao)}.</b> ${esc(bloco.porque)} ${esc(bloco.fazem)}</div>` : ""}
  ${dados.aliancas.map((a, idx) => {
    const e = m[a.id];
    const base = `aliancas.${idx}`;
    const cls = dados.escolhida === a.id ? "escolhida" : (dados.escolhida ? "recusada" : "");
    if (ui.editar) return `<article class="alianca edit" style="--c:${esc(e?.cor || "#888")}"><h3>${esc(e?.nome || a.id)}</h3>
      ${campo("Onde e como", `${base}.como`, a.como)}${campo("Requisito", `${base}.requisito`, a.requisito)}
      ${campo("Oferta", `${base}.oferta`, a.oferta)}${campo("Se recusada", `${base}.recusa`, a.recusa)}${campo("Fala de abertura", `${base}.fala`, a.fala)}</article>`;
    return `<article class="alianca ${cls}" style="--c:${esc(e?.cor || "#888")}">
      <div class="al-cab"><h3>${esc(e?.nome || a.id)}</h3>${cls === "escolhida" ? '<span class="tag ok">aliada</span>' : cls === "recusada" ? '<span class="tag">recusada</span>' : ""}</div>
      <dl>
        <dt>Onde e como</dt><dd>${esc(a.como)}</dd>
        <dt>Requisito</dt><dd>${esc(a.requisito)}</dd>
        <dt>Oferta</dt><dd>${esc(a.oferta)}</dd>
        <dt>Se recusada</dt><dd>${esc(a.recusa)}</dd>
      </dl>
      ${a.fala ? `<blockquote>${esc(a.fala)}</blockquote>` : ""}
    </article>`;
  }).join("")}
  <section class="blocos">
    <h2><span>O 2 contra 2</span></h2>
    ${dados.blocos.map((b, idx) => {
      const base = `blocos.${idx}`;
      if (ui.editar) return `<div class="bloco edit"><b>Se escolherem ${esc(m[b.escolha]?.nome || b.escolha)}</b>${campoLinha("Unem-se", `${base}.uniao`, b.uniao)}${campoLinha("Por quê", `${base}.porque`, b.porque)}${campoLinha("O que fazem", `${base}.fazem`, b.fazem)}</div>`;
      return `<div class="bloco ${dados.escolhida === b.escolha ? "on" : ""}"><small>Se escolherem ${esc(m[b.escolha]?.nome || b.escolha)}</small><b>${esc(b.uniao)}</b><p>${esc(b.porque)} ${esc(b.fazem)}</p></div>`;
    }).join("")}
  </section>`;
}

/* ---------- Aba: Equipes ---------- */
function ondeEsta(eqId, i) {
  const r = { d: [], n: [] };
  for (const l of dados.locais) for (const t of ["d", "n"]) if (l.p[i][t].eq.includes(eqId)) r[t].push(l);
  return r;
}
function abaEquipes() {
  return `
  <div class="intro"><p>Onde cada equipe está vem da linha do tempo. O plano é o que ela faz fora de cena.</p></div>
  ${dados.equipes.map((e, idx) => {
    const base = `equipes.${idx}`;
    const aberto = ui.aberto === "eq-" + e.id;
    if (ui.editar) return `<article class="equipe edit" style="--c:${esc(e.cor)}">
      <div class="grid-eq">${campoLinha("Nome", `${base}.nome`, e.nome)}<label class="campo cor"><span>Cor</span><input type="color" data-bind-cor="${base}.cor" value="${esc(e.cor)}"></label></div>
      ${campo("Membros", `${base}.membros`, e.membros, 2)}
      ${DIAS.map((d, i) => campoLinha(`Plano no dia ${d}`, `${base}.plano.${i}`, e.plano[i])).join("")}
      ${e.id !== "jog" ? `<button class="perigo-btn" data-act="del-equipe" data-v="${e.id}">${I.lixo} Excluir equipe</button>` : ""}
    </article>`;
    return `<article class="equipe ${aberto ? "aberto" : ""}" style="--c:${esc(e.cor)}">
      <button class="eq-cab" data-act="abrir" data-v="eq-${e.id}">
        <span class="eq-dot"></span>
        <div><h3>${esc(e.nome)}</h3><small>${esc(e.membros)}</small></div>
        <span class="seta">${I.seta}</span>
      </button>
      ${aberto ? `<ol class="eq-dias">${DIAS.map((d, i) => {
        const o = ondeEsta(e.id, i);
        const lugar = (arr) => arr.length ? arr.map((l) => `<button class="lugar" data-act="ir-local" data-v="${l.id}" data-dia="${d}" data-turno="${arr === o.d ? "d" : "n"}">${esc(l.nome)}</button>`).join("") : '<span class="muted">—</span>';
        return `<li class="${d === dados.diaAtual ? "hoje" : ""}"><div class="eq-dn">Dia ${d}</div>
          <div class="eq-info">${e.plano[i] ? `<p>${esc(e.plano[i])}</p>` : ""}
          <div class="eq-onde"><span>${I.sol}</span>${lugar(o.d)}</div>
          <div class="eq-onde"><span>${I.lua}</span>${lugar(o.n)}</div></div></li>`;
      }).join("")}</ol>` : ""}
    </article>`;
  }).join("")}
  ${ui.editar ? `<button class="novo" data-act="nova-equipe">${I.mais} Nova equipe</button>` : ""}`;
}

/* ---------- Diálogos ---------- */
function dialogo() {
  if (!ui.dialogo) return "";
  const { tipo } = ui.dialogo;
  if (tipo === "exportar") return `<div class="overlay"><div class="dlg">
    <h3>Exportar conteúdo</h3><p class="muted small">Guarde este texto para ter uma cópia do roteiro ou para levar para outro computador.</p>
    <textarea id="dlg-txt" rows="12" readonly>${esc(JSON.stringify(dados))}</textarea>
    <div class="dlg-acoes"><button data-act="copiar" class="primario">Copiar</button><button data-act="fechar-dlg">Fechar</button></div></div></div>`;
  if (tipo === "importar") return `<div class="overlay"><div class="dlg">
    <h3>Importar conteúdo</h3><p class="muted small">Cole aqui um texto exportado. Ele substitui o roteiro atual.</p>
    <textarea id="dlg-txt" rows="12" placeholder="Cole o conteúdo aqui"></textarea><p class="erro" id="dlg-erro"></p>
    <div class="dlg-acoes"><button data-act="aplicar-import" class="primario">Importar</button><button data-act="fechar-dlg">Cancelar</button></div></div></div>`;
  if (tipo === "confirmar") return `<div class="overlay"><div class="dlg">
    <h3>${esc(ui.dialogo.titulo)}</h3><p>${esc(ui.dialogo.texto)}</p>
    <div class="dlg-acoes"><button data-act="confirmar" class="perigo-cheio">${esc(ui.dialogo.botao)}</button><button data-act="fechar-dlg">Cancelar</button></div></div></div>`;
  return "";
}
function confirmar(titulo, texto, botao, fn) { ui.dialogo = { tipo: "confirmar", titulo, texto, botao, fn }; render(); }

/* ---------- Render ---------- */
const app = document.getElementById("app");
function render() {
  const sy = window.scrollY;
  const corpo = { linha: abaLinha, eventos: abaEventos, aliancas: abaAliancas, equipes: abaEquipes }[ui.aba]();
  app.className = `${IS_MODAL ? "modal" : ""} ${ui.editar ? "editando" : ""}`;
  app.innerHTML = `${cabecalho()}${ui.editar ? '<div class="faixa-edit">Modo de edição: as mudanças são salvas sozinhas.</div>' : ""}<main>${corpo}</main>${dialogo()}`;
  window.scrollTo(0, sy);
  salvarUi();
}
function irPara(sel) {
  requestAnimationFrame(() => {
    const el = document.querySelector(sel);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => { ui.realce = null; document.querySelectorAll(".realce").forEach((x) => x.classList.remove("realce")); }, 1800);
  });
}

/* ---------- Eventos de interface ---------- */
app.addEventListener("input", (ev) => {
  const t = ev.target;
  if (t.dataset.bind) { setPath(t.dataset.bind, t.value); salvar(); }
  if (t.dataset.bindCor) { setPath(t.dataset.bindCor, t.value); salvar(); t.closest(".equipe")?.style.setProperty("--c", t.value); }
});
app.addEventListener("change", (ev) => {
  const t = ev.target;
  if (t.dataset.bindSel) {
    const v = t.dataset.bindSel.endsWith(".dia") ? Number(t.value) : t.value;
    setPath(t.dataset.bindSel, v); salvar(true); render();
  }
  if (t.dataset.bindCor) render();
});
app.addEventListener("click", async (ev) => {
  const b = ev.target.closest("[data-act]");
  if (!b) { if (ui.menu && !ev.target.closest(".menu")) { ui.menu = false; render(); } return; }
  const act = b.dataset.act, v = b.dataset.v;
  if (act !== "menu" && !b.closest(".menu")) ui.menu = false;
  switch (act) {
    case "aba": ui.aba = v; ui.aberto = null; window.scrollTo(0, 0); break;
    case "dia": ui.dia = Number(v); break;
    case "turno": ui.turno = v; break;
    case "filtro": ui.filtro = v; break;
    case "vista": ui.vista = v; break;
    case "hoje": dados.diaAtual = ui.dia; salvar(true); break;
    case "editar": ui.editar = !ui.editar; break;
    case "abrir": ui.aberto = ui.aberto === v ? null : v; break;
    case "menu": ui.menu = !ui.menu; break;
    case "expandir": OBR.modal.open({ id: MODAL_ID, url: new URL("index.html?modal=1", location.href).href, width: 1180, height: 860 }); return;
    case "fechar-modal": OBR.modal.close(MODAL_ID); return;
    case "chip": {
      const path = b.dataset.path, id = b.dataset.eq;
      const parts = path.split("."); let o = dados; for (const p of parts) o = o[isNaN(p) ? p : Number(p)];
      const arr = o; const k = arr.indexOf(id);
      if (k >= 0) arr.splice(k, 1); else arr.push(id);
      const ordem = dados.equipes.map((e) => e.id); arr.sort((a, c) => ordem.indexOf(a) - ordem.indexOf(c));
      salvar(true); break;
    }
    case "ir-cel": {
      ui.dia = Number(b.dataset.dia); ui.turno = b.dataset.turno;
      if (b.dataset.local) { ui.aberto = b.dataset.local; ui.vista = "lista"; ui.filtro = "todos"; ui.realce = b.dataset.local; render(); irPara(`[data-local="${b.dataset.local}"]`); return; }
      break;
    }
    case "ir-local": {
      ui.aba = "linha"; ui.vista = "lista"; ui.filtro = "todos"; ui.dia = Number(b.dataset.dia); ui.turno = b.dataset.turno; ui.aberto = v; ui.realce = v;
      render(); irPara(`[data-local="${v}"]`); return;
    }
    case "ir-evento": ui.aba = "eventos"; ui.realce = v; render(); irPara(`#ev-${v}`); return;
    case "feito": { const e = dados.eventos.find((x) => x.id === v); if (e) e.feito = !e.feito; salvar(true); break; }
    case "escolher": dados.escolhida = v; salvar(true); break;
    case "novo-local": {
      const l = { id: uid(), nome: "Novo local", tipo: "Explorar", dono: "", encontro: "", rende: "", p: DIAS.map(() => ({ d: turno(), n: turno() })) };
      dados.locais.push(l); ui.aberto = l.id; salvar(true); render(); irPara(`[data-local="${l.id}"]`); return;
    }
    case "del-local": {
      const l = localPorId(v);
      confirmar("Excluir local", `Excluir "${l?.nome}" e tudo o que está marcado nele?`, "Excluir", () => { dados.locais = dados.locais.filter((x) => x.id !== v); dados.eventos.forEach((e) => { if (e.local === v) e.local = ""; }); });
      return;
    }
    case "novo-evento": {
      const e = { id: uid(), dia: Number(v), turno: "d", local: "", titulo: "Novo evento", texto: "", fala: "", feito: false };
      dados.eventos.push(e); salvar(true); render(); irPara(`#ev-${e.id}`); return;
    }
    case "del-evento": {
      const e = dados.eventos.find((x) => x.id === v);
      confirmar("Excluir evento", `Excluir "${e?.titulo}"?`, "Excluir", () => { dados.eventos = dados.eventos.filter((x) => x.id !== v); });
      return;
    }
    case "nova-equipe": dados.equipes.push({ id: uid(), nome: "Nova equipe", cor: "#7fd1c7", membros: "", base: "", plano: DIAS.map(() => "") }); salvar(true); break;
    case "del-equipe": {
      const e = dados.equipes.find((x) => x.id === v);
      confirmar("Excluir equipe", `Excluir "${e?.nome}"? Ela some de todos os locais.`, "Excluir", () => {
        dados.equipes = dados.equipes.filter((x) => x.id !== v);
        dados.locais.forEach((l) => { if (l.dono === v) l.dono = ""; l.p.forEach((p) => ["d", "n"].forEach((t) => { p[t].eq = p[t].eq.filter((x) => x !== v); })); });
      });
      return;
    }
    case "exportar": ui.dialogo = { tipo: "exportar" }; break;
    case "importar": ui.dialogo = { tipo: "importar" }; break;
    case "restaurar": confirmar("Restaurar o roteiro original", "Isso apaga todas as suas edições e volta ao roteiro original. Exporte antes se quiser guardar uma cópia.", "Restaurar", () => { dados = clone(PADRAO); }); return;
    case "copiar": {
      const ta = document.getElementById("dlg-txt"); ta.select();
      try { await navigator.clipboard.writeText(ta.value); b.textContent = "Copiado"; } catch { document.execCommand("copy"); b.textContent = "Copiado"; }
      return;
    }
    case "aplicar-import": {
      const txt = document.getElementById("dlg-txt").value.trim();
      try {
        const d = JSON.parse(txt);
        if (!d || !Array.isArray(d.locais) || !Array.isArray(d.equipes)) throw new Error();
        dados = normalizar(d); salvar(true); ui.dialogo = null;
      } catch { document.getElementById("dlg-erro").textContent = "Esse texto não é um roteiro exportado."; return; }
      break;
    }
    case "confirmar": { const fn = ui.dialogo?.fn; ui.dialogo = null; if (fn) { fn(); salvar(true); } break; }
    case "fechar-dlg": ui.dialogo = null; break;
  }
  render();
});

// Popover e tela grande dividem o mesmo navegador: mantém os dois iguais.
window.addEventListener("storage", (ev) => {
  if (ev.key !== KEY) return;
  const foco = document.activeElement;
  if (foco && (foco.tagName === "TEXTAREA" || foco.tagName === "INPUT")) return;
  dados = carregar(); render();
});

/* ---------- Início ---------- */
function privado() {
  app.className = "privado-wrap";
  app.innerHTML = `<div class="privado">${I.cadeado}<h2>Privado para o mestre</h2><p>Este roteiro só abre para o mestre da sala.</p></div>`;
}
if (!OBR.isAvailable) {
  render(); // aberto fora do Owlbear: modo de pré-visualização
} else {
  OBR.onReady(async () => {
    let papel = null;
    const aplicar = (role) => { if (role === papel) return; papel = role; role === "GM" ? render() : privado(); };
    aplicar(await OBR.player.getRole());
    OBR.player.onChange((p) => aplicar(p.role));
  });
}
