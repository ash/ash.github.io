// Components shared by the views: the stemma, rows, tables, grammar blocks.

import { esc, markup, highlight, lang, lcls, caps, KINSHIP, ROMANCE, icons } from "./util.js";
import { settings, shows } from "./state.js";
import { lookup } from "./store.js";

export const href = {
  entry: (id) => `#/entry/${encodeURIComponent(id)}`,
  paradigm: (id) => `#/paradigm/${encodeURIComponent(id)}`,
  chapter: (id, part) => `#/chapter/${encodeURIComponent(id)}${part != null ? `/${part}` : ""}`,
  text: (id) => `#/text/${encodeURIComponent(id)}`,
  grammar: (l) => `#/grammar/${l}`,
  library: (l) => `#/library/${l}`,
};

export const capsHTML = (s, cls = "") => `<span class="caps ${cls}">${esc(caps(s))}</span>`;

export function sectionLabel(title, trailing = "", l = null) {
  return `<div class="section-label ${l ? lcls(l) : ""}">${capsHTML(title)}${trailing ? capsHTML(trailing, "faint") : ""}</div>`;
}

export const langCode = (l) => `<span class="code ${lcls(l)}">${esc(lang(l).code)}</span>`;

// ---------------------------------------------------------------- the stemma

const DASH = { i: "", b: "4 3", c: "0.1 4", r: "7 2.5 1.5 2.5", a: "" };
const WIDTH = { i: 1.8, b: 1.5, c: 1.8, r: 1.5, a: 1.8 };

function twig(k) {
  return `<svg class="twig" viewBox="0 0 34 23" aria-hidden="true"><path d="M7 2 Q7 18.5 29 18.5" fill="none" stroke="var(--c)" stroke-width="${WIDTH[k] || 1.6}" stroke-linecap="${k === "c" || k === "i" ? "round" : "butt"}" ${DASH[k] ? `stroke-dasharray="${DASH[k]}"` : ""}/></svg>`;
}

function relWord(r, linkable) {
  const target = linkable && ["la", "grc", "el"].includes(r.l) ? lookup(r.w, r.l) : null;
  return target ? `<a class="word" href="${href.entry(target.id)}">${esc(r.w)}</a>` : `<span class="word">${esc(r.w)}</span>`;
}

export function tree(e, { compact = false, linkable = true } = {}) {
  const order = [...settings.romance, "el", "grc", "la", "en", "other"];
  const rank = { i: 0, r: 1, b: 2, c: 3 };
  const ancestors = (e.rel || []).filter((r) => r.k === "a" && shows(r.l));
  let kids = (e.rel || []).filter((r) => r.k !== "a" && shows(r.l));
  kids.sort((a, b) => (order.indexOf(a.l) - order.indexOf(b.l)) || ((rank[a.k] ?? 4) - (rank[b.k] ?? 4)));
  if (compact) {
    const seen = new Set();
    kids = kids.filter((r) => !seen.has(r.l) && seen.add(r.l));
  }
  const anc = ancestors.map((r) => `
    <div class="ancestor ${lcls(r.l)}"><span class="ring"></span>${langCode(r.l)}
      ${relWord(r, linkable)}${r.g ? `<span class="gl">“${esc(r.g)}”</span>` : ""}
      <span class="kind" style="margin-left:auto">${esc(r.n || "source")}</span></div>`).join("");
  const head = `<div class="headnode ${lcls(e.lang)}"><span class="sq"></span><span class="w">${esc(e.lemma)}</span><span class="g">${esc(e.en?.[0] || "")}</span></div>`;
  const rows = kids.map((r, i) => `
    <div class="branch k-${r.k} ${lcls(r.l)} ${i === kids.length - 1 ? "last" : ""}">
      ${twig(r.k)}${langCode(r.l)}
      <span class="meta">${relWord(r, linkable)}${r.g ? `<span class="gl">“${esc(r.g)}”</span>` : ""}${r.n ? `<span class="nt">${esc(r.n)}</span>` : ""}</span>
      ${r.k !== "i" ? `<span class="kind">${esc(KINSHIP[r.k] || "")}</span>` : ""}
    </div>`).join("");
  const kinds = new Set(kids.map((r) => r.k));
  const legend = !compact && kids.length ? `<div class="legend" aria-hidden="true">${["i", "b", "c", "r"].filter((k) => kinds.has(k)).map((k) => `
      <span><svg viewBox="0 0 22 8"><path d="M0 4H22" stroke="var(--soft)" stroke-width="${WIDTH[k]}" ${DASH[k] ? `stroke-dasharray="${DASH[k]}"` : ""} stroke-linecap="${k === "c" ? "round" : "butt"}"/></svg>${k === "r" ? "replaced" : KINSHIP[k]}</span>`).join("")}</div>` : "";
  return `<div class="tree ${compact ? "compact" : ""}" role="group" aria-label="Family tree of ${esc(e.lemma)}">${anc}${head}${rows}${legend}</div>`;
}

export function kinStrip(e) {
  const langs = [...settings.romance, "el", "grc", "la", "en"].filter((l) => l !== e.lang && (e.rel || []).some((r) => r.l === l && r.k !== "a"));
  return `<span class="kin" aria-hidden="true">${langs.map((l) => `<i class="${lcls(l)} ${(e.rel || []).some((r) => r.l === l && r.k === "i") ? "f" : ""}"></i>`).join("")}</span>`;
}

export function entryRow(e, reason = null) {
  const why = reason?.type === "rel" ? `<div class="why">${langCode(reason.rel.l)} ${esc(reason.rel.w)}</div>` : "";
  return `<a class="entry-row ${lcls(e.lang)}" href="${href.entry(e.id)}">
    <span class="bar2"></span>
    <span><span class="lemma">${esc(e.lemma)}</span>${e.hom ? `<sup class="faint tiny">${e.hom}</sup>` : ""}${settings.translit && e.tr ? `<span class="tr">${esc(e.tr)}</span>` : ""}
      <div class="gloss">${esc((e.en || []).join("; "))}</div>${why}</span>
    ${kinStrip(e)}
  </a>`;
}

// ---------------------------------------------------------------- tables

export function paradigmTable(t, fallback) {
  const l = t.lang || fallback;
  const labelCol = !t.cols?.[0];
  return `<div class="${lcls(l)}">
    ${t.title ? `<div class="tcaption pig">${markup(t.title)}</div>` : ""}
    <div class="scrollx"><table class="ptable">
      <thead><tr>${(t.cols || []).map((c) => `<th>${esc(c)}</th>`).join("")}</tr></thead>
      <tbody>${(t.rows || []).map((r) => `<tr>${r.map((c, i) => `<td${i === 0 && labelCol ? "" : ""}>${markup(c)}</td>`).join("")}</tr>`).join("")}</tbody>
    </table></div>
    ${t.note ? `<div class="tnote">${markup(t.note)}</div>` : ""}
  </div>`;
}

export function compareTable(b) {
  const langs = b.langs || [];
  const visible = langs.map((l, i) => i).filter((i) => i === 0 || !ROMANCE.includes(langs[i]) || settings.romance.includes(langs[i]));
  const dense = visible.length + (b.gloss ? 1 : 0) > 5;
  const head = visible.map((i) => `<th class="${lcls(langs[i])}">${esc(lang(langs[i]).code)}</th>`).join("") + (b.gloss ? "<th></th>" : "");
  const rows = (b.rows || []).map((row, r) => `<tr>${visible.map((i) =>
    `<td class="${i === 0 ? "first " : ""}${lcls(langs[i])}" style="--hl: var(--c)">${highlight(row[i] ?? "", b.hl?.[i])}</td>`).join("")}${b.gloss ? `<td class="gloss">${esc(b.gloss[r] ?? "")}</td>` : ""}</tr>`).join("");
  return `<div>
    ${b.title ? `<div class="tcaption">${markup(b.title)}</div>` : ""}
    <div class="scrollx"><table class="ctable ${dense ? "dense" : ""}"><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table></div>
    ${b.note ? `<div class="tnote">${markup(b.note)}</div>` : ""}
  </div>`;
}

// ---------------------------------------------------------------- grammar blocks

export function block(b, l) {
  if ("h" in b) return `<h3>${esc(b.h)}</h3>`;
  if ("p" in b) return `<p class="prose ${lcls(l)}" style="--accent: var(--c)">${markup(b.p)}</p>`;
  if ("table" in b) return paradigmTable(b.table, l);
  if ("compare" in b) return compareTable(b.compare);
  if ("ex" in b) {
    const ex = Array.isArray(b.ex) ? { items: b.ex } : b.ex;
    const el = ex.lang || l;
    return `<div class="examples ${lcls(el)}">${(ex.items || []).map((it, i) => `
      <div class="example"><span class="n">${i + 1}</span><div>
        <div class="t">${markup(it.t)}</div>
        ${it.lit ? `<div class="faint it small">lit. ${esc(it.lit)}</div>` : ""}
        <div class="en">${markup(it.en)}</div></div></div>`).join("")}</div>`;
  }
  if ("tip" in b) return `<div class="callout" style="--c: var(--gold)">${capsHTML("Memoria")}<p class="prose">${markup(b.tip)}</p></div>`;
  if ("pitfall" in b) return `<div class="callout" style="--c: var(--wrong)">${capsHTML("Cave!")}<p class="prose">${markup(b.pitfall)}</p></div>`;
  if ("afterlife" in b) {
    const a = b.afterlife;
    return `<section class="afterlife">
      <div><span class="caps label">${l === "el" ? "Ancestry" : "Afterlife"}</span>${a.title ? `<h3>${esc(a.title)}</h3>` : ""}</div>
      ${(a.blocks || []).map((x) => block(x, l)).join("")}
    </section>`;
  }
  return "";
}

export const bookmarkIcon = (on) => (on ? icons.bookmarkFill : icons.bookmark);
