import { esc, lang, lcls, markup, caps } from "../util.js";
import { settings } from "../state.js";
import { store, texts as textsOf, text as textByID } from "../store.js";
import { sectionLabel, href, capsHTML, tree } from "../ui.js";

const LEVELS = { 1: "I · First steps", 2: "II · Graded reading", 3: "III · Authors, gently", 4: "IV · Authors, unabridged" };

export function library([l]) {
  const ts = textsOf(l);
  const groups = {};
  for (const t of ts) (groups[t.level] ||= []).push(t);
  const html = `<div class="page ${lcls(l)}">${Object.keys(groups).sort().map((lv) => `
    <section style="margin-top:1.2rem">${sectionLabel(LEVELS[lv] || `Level ${lv}`, String(groups[lv].length), l)}
      ${groups[lv].map((t) => `<a class="linkrow" href="${href.text(t.id)}" style="align-items:flex-start">
        <span>${t.author ? capsHTML(t.author, "b pig") : ""}
          <div style="font-size:1.1875rem">${esc(t.title)}</div>
          ${t.orig ? `<div class="it soft">${esc(t.orig)}</div>` : ""}
          <div class="faint tiny">${esc([t.source, t.date].filter(Boolean).join(" · "))}</div></span>
        <span style="text-align:right">${capsHTML(String(t.lines.length), "gold")}<div class="caps faint" style="font-size:.5rem">${t.kind === "verse" ? "lines" : "periods"}</div></span>
      </a>`).join("")}</section>`).join("") || `<div class="empty">The texts are being typeset.</div>`}</div>`;
  return { title: "Texts", subtitle: lang(l).name, html };
}

// the lens and visible translations persist while you read (per source language)
const lensState = { la: "none", grc: "none", el: "none" };
const shownState = { la: new Set(), grc: new Set(), el: new Set() };

function lensesFor(l) {
  if (l === "la") return ["none", "gloss", ...settings.romance, "parse"];
  if (l === "grc") return ["none", "gloss", "el", "la", "parse"];
  return ["none", "gloss", "grc", "parse"];
}
const lensTitle = (x) => ({ none: "Plain", gloss: "EN", parse: "Parse" }[x] || lang(x).code);

function heir(e, l) {
  const rs = (e.rel || []).filter((r) => r.l === l);
  return rs.find((r) => r.k === "i") || rs.find((r) => r.k === "r") || rs.find((r) => r.k === "b") || rs[0];
}

function lensText(tok, lens) {
  const e = store.byID.get(tok[1]);
  if (lens === "gloss") return [((e?.en?.[0] || "").split(/[,;(]/)[0] || "").trim(), "var(--soft)"];
  if (lens === "parse") return [tok[2] || "", "var(--gold)"];
  const r = e && heir(e, lens);
  if (!r) return ["·", "var(--faint)"];
  return [r.w, r.k === "i" ? `var(--${lens})` : `color-mix(in srgb, var(--${lens}) 60%, transparent)`];
}

const TRANS_ORDER = ["en", "it", "es", "fr", "pt", "ro", "el", "la", "grc"];

export function reader([id], ctx) {
  const t = textByID(id);
  if (!t) return { title: "Texts", html: `<div class="empty">This text is not in this edition.</div>` };
  const l = t.lang;
  const transLangs = TRANS_ORDER.filter((x) => t.lines.some((ln) => ln.tr?.[x]));

  const linesHTML = () => t.lines.map((ln, i) => `
    <div class="line"><span class="n">${i + 1}</span><div>
      <div class="tokens">${ln.w.map((tok, j) => {
        const [lt, lc] = lensState[l] === "none" ? ["", ""] : lensText(tok, lensState[l]);
        return `<button class="tok" data-tok="${i}.${j}" ${tok[1] || tok[2] ? "" : "disabled"} aria-label="${esc(tok[0])}">
          <span>${esc(tok[0])}</span>${lensState[l] !== "none" ? `<span class="lens" style="--lc:${lc}">${esc(lt || " ")}</span>` : ""}</button>`;
      }).join("")}</div>
      ${transLangs.filter((x) => shownState[l].has(x) && ln.tr?.[x]).map((x) => `<div class="tr-line">${capsHTML(lang(x).code, `code ${lcls(x)}`)}<span>${esc(ln.tr[x])}</span></div>`).join("")}
    </div></div>`).join("");

  const lensBar = () => `
    <div class="row">${capsHTML("Lens")}<div class="tabs" role="group" aria-label="Lens">${lensesFor(l).map((x) =>
      `<button class="tab ${lcls(x)}" data-lens="${x}" aria-pressed="${lensState[l] === x}">${esc(lensTitle(x))}</button>`).join("")}</div></div>
    <div class="row">${capsHTML("Translate")}<div class="tabs" role="group" aria-label="Translations">${transLangs.map((x) =>
      `<button class="tab ${lcls(x)}" data-tr="${x}" aria-pressed="${shownState[l].has(x)}">${esc(lang(x).code)}</button>`).join("")}</div></div>`;

  const html = `<div class="page wide ${lcls(l)}">
      <div class="stack-s">
        <h1>${esc(t.title)}</h1>
        ${t.orig ? `<div class="it pig" style="font-size:1.125rem">${esc(t.orig)}</div>` : ""}
        <div class="row">${t.source ? capsHTML(t.source, "faint") : ""}${t.date ? capsHTML("· " + t.date, "faint") : ""}</div>
        ${t.intro ? `<p class="soft prose" style="--accent: var(--c)">${markup(t.intro)}</p>` : ""}
        <div class="meander" aria-hidden="true"></div>
      </div>
      <div id="lines" class="stack" style="margin-top:1.4rem;gap:1.2rem">${linesHTML()}</div>
      ${t.notes?.length ? `<section class="stack-s" style="margin-top:2rem">${sectionLabel("Notes")}
        ${t.notes.map((n) => `<div class="line"><span class="n">${n.line != null ? n.line + 1 : ""}</span><p class="soft prose small" style="--accent: var(--c)">${markup(n.n)}</p></div>`).join("")}</section>` : ""}
    </div>
    <div class="lensbar" id="lensbar">${lensBar()}</div>`;

  return {
    title: t.author || "Text",
    subtitle: t.source || "",
    docTitle: `${t.title} — Stemma`,
    html,
    mount(root) {
      const redraw = () => {
        root.querySelector("#lines").innerHTML = linesHTML();
        root.querySelector("#lensbar").innerHTML = lensBar();
      };
      root.addEventListener("click", (ev) => {
        const lensBtn = ev.target.closest("[data-lens]");
        if (lensBtn) { lensState[l] = lensBtn.dataset.lens; redraw(); return; }
        const trBtn = ev.target.closest("[data-tr]");
        if (trBtn) {
          const x = trBtn.dataset.tr;
          shownState[l].has(x) ? shownState[l].delete(x) : shownState[l].add(x);
          redraw(); return;
        }
        const tokBtn = ev.target.closest("[data-tok]");
        if (tokBtn) {
          const [i, j] = tokBtn.dataset.tok.split(".").map(Number);
          openWordSheet(t.lines[i].w[j], l, ctx);
        }
      });
    },
  };
}

function openWordSheet(tok, l, ctx) {
  const e = store.byID.get(tok[1]);
  const sheet = document.getElementById("sheet");
  sheet.innerHTML = `<div class="card ${lcls(l)}" role="dialog" aria-modal="true" aria-label="${esc(tok[0])}">
    <div><div class="pig" style="font-weight:700;font-size:1.9rem">${esc(tok[0].replace(/[.,;:·!?’'"“”()]+$/u, ""))}</div>
      ${tok[2] ? `<div class="it gold">${esc(tok[2])}</div>` : ""}</div>
    ${e ? `<hr class="hair"><div>${esc(e.cite)}</div><div class="soft">${esc((e.en || []).join("; "))}</div>
      ${tree(e, { compact: true, linkable: false })}
      <a class="slab" href="${href.entry(e.id)}" style="text-align:center">${capsHTML("Open the entry", "b gold")}</a>` : ""}
    <button class="caps faint" data-close style="justify-self:center">Close</button>
  </div>`;
  sheet.hidden = false;
  const close = () => { sheet.hidden = true; sheet.innerHTML = ""; document.removeEventListener("keydown", onKey); };
  const onKey = (ev) => { if (ev.key === "Escape") close(); };
  document.addEventListener("keydown", onKey);
  sheet.onclick = (ev) => {
    if (ev.target === sheet || ev.target.closest("[data-close]") || ev.target.closest("a")) close();
  };
  sheet.querySelector("[data-close]").focus();
}
