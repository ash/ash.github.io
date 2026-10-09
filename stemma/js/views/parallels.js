import { esc, roman, lang, lcls, markup } from "../util.js";
import { shows } from "../state.js";
import { store } from "../store.js";
import { compareTable, capsHTML } from "../ui.js";

const group = (g) => store.parallels.find((x) => x.group === g);

export function groups() {
  const html = `<div class="page">
    <p class="it soft" style="margin-bottom:1rem">How one word became five, and what a sentence kept when its grammar changed.</p>
    ${store.parallels.map((g, i) => `<a class="chapter-row" href="#/parallels/${g.group}" style="grid-template-columns:2.8rem 1fr auto">
      <span class="num" style="font-size:1.125rem">${roman(i + 1)}</span>
      <span>${capsHTML(g.title, "b")}<div class="it soft small">${esc(g.items.slice(0, 3).map((x) => x.title).join(" · "))}</div></span>
      ${capsHTML(String(g.items.length), "faint")}</a>`).join("")}
  </div>`;
  return { title: "Parallels", html };
}

function ruleLine(rule, langs) {
  const order = langs.filter((l) => rule[l] && shows(l));
  return `<div class="row" style="gap:.35rem .8rem">${order.map((l, i) => `${i === 1 ? '<span class="faint">→</span>' : ""}
    <span class="${lcls(l)}"><span class="code" style="min-width:0">${esc(lang(l).code)}</span>
    <strong class="${i === 0 ? "pig" : ""}">${esc(rule[l])}</strong></span>`).join("")}</div>`;
}

export function groupView([gid]) {
  const g = group(gid);
  if (!g) return { title: "Parallels", html: `<div class="empty">This table group is not in this edition.</div>` };
  const html = `<div class="page">
    ${g.intro ? `<p class="soft prose" style="margin-bottom:1rem">${markup(g.intro)}</p>` : ""}
    ${g.items.map((it) => `<a class="linkrow" href="#/parallels/${g.group}/${encodeURIComponent(it.id)}" style="flex-direction:column;align-items:flex-start;gap:.3rem">
      <div style="font-size:1.1875rem">${esc(it.title)}</div>
      ${it.sub ? `<div class="it soft small">${esc(it.sub)}</div>` : ""}
      ${it.rule ? ruleLine(it.rule, it.langs) : ""}</a>`).join("")}
  </div>`;
  return { title: g.title, html };
}

export function itemView([gid, iid]) {
  const g = group(gid);
  const it = g?.items.find((x) => x.id === iid);
  if (!it) return { title: "Parallels", html: `<div class="empty">This table is not in this edition.</div>` };
  const html = `<div class="page wide stack ${lcls(it.langs[0])}">
    <div><h1>${esc(it.title)}</h1>${it.sub ? `<p class="it soft" style="font-size:1.0625rem">${esc(it.sub)}</p>` : ""}</div>
    ${it.rule ? `<div style="border:1px solid var(--gold-dim);padding:.75rem .9rem">${ruleLine(it.rule, it.langs)}</div>` : ""}
    ${(it.p || "").split("\n\n").filter(Boolean).map((para) => `<p class="prose" style="--accent: var(--c)">${markup(para)}</p>`).join("")}
    ${compareTable({ langs: it.langs, rows: it.rows, gloss: it.gloss, hl: it.hl })}
  </div>`;
  return { title: g.title, html, docTitle: `${it.title} — Stemma` };
}
