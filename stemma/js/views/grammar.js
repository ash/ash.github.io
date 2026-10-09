import { esc, roman, lang, lcls, icons } from "../util.js";
import { isRead, markRead, progress } from "../state.js";
import { chapters, chapter as chapterByID, partList, partBlocks } from "../store.js";
import { sectionLabel, block, href, capsHTML } from "../ui.js";

const INTRO = {
  la: "Every chapter closes with an Afterlife: what Italian, Spanish, French, Portuguese and Romanian made of the feature you have just learned.",
  grc: "Attic Greek, chapter by chapter — and in every Afterlife, what the language of today kept, changed or lost.",
  el: "Standard Modern Greek, with the ancestry of each form: the Ancient word behind it, and the Romance parallel beside it.",
};
const LEVEL = ["", "Foundations", "Intermediate", "Advanced"];

function dots(c) {
  const parts = partList(c);
  if (parts.length < 2) return "";
  const read = parts.filter((_, i) => isRead(c.id, i)).length;
  return `<span class="dots ${lcls(c.lang)}" aria-label="${read} of ${parts.length} parts read">${parts.map((_, i) => `<i class="${isRead(c.id, i) ? "f" : ""}"></i>`).join("")}<span class="caps">${parts.length} parts</span></span>`;
}

export function book([l]) {
  const cs = chapters(l);
  const byLevel = {};
  for (const c of cs) (byLevel[c.level || 1] ||= []).push(c);
  const html = `<div class="page ${lcls(l)}">
    <p class="it pig" style="font-size:1.15rem">${esc(lang(l).endonym)}</p>
    <p class="soft" style="margin:.4rem 0 1.2rem">${esc(INTRO[l] || "")}</p>
    ${Object.keys(byLevel).sort().map((lv) => `<section style="margin-top:1rem">
      ${sectionLabel(LEVEL[Math.min(Math.max(+lv, 1), 3)], String(byLevel[lv].length), l)}
      ${byLevel[lv].sort((a, b) => a.n - b.n).map((c) => `<a class="chapter-row" href="${href.chapter(c.id)}">
        <span class="num">${roman(c.n)}</span>
        <span><div style="font-size:1.125rem">${esc(c.title)}</div>${c.sub ? `<div class="it soft small">${esc(c.sub)}</div>` : ""}${dots(c)}</span>
      </a>`).join("")}
    </section>`).join("")}
  </div>`;
  return { title: "Grammar", subtitle: lang(l).name, html };
}

const partName = (c, p) => (p.afterlife ? (c.lang === "el" ? "Ancestry" : "Afterlife") : (p.title || "Continued"));

/** A chapter is read one part at a time; the parts together are exactly the chapter. */
export function chapterView([id, partArg], ctx) {
  const c = chapterByID(id);
  if (!c) return { title: "Grammar", html: `<div class="empty">This chapter is not in this edition.</div>` };
  const parts = partList(c);
  let index;
  if (partArg != null) index = Math.min(Math.max(+partArg, 0), parts.length - 1);
  else {
    const allRead = parts.every((_, i) => isRead(c.id, i));
    index = allRead ? 0 : Math.min(progress.lastPart[c.id] ?? 0, parts.length - 1);
  }
  markRead(c.id, index);
  const p = parts[index];
  const all = chapters(c.lang);
  const ci = all.findIndex((x) => x.id === c.id);
  const prevC = all[ci - 1], nextC = all[ci + 1];

  const header = index === 0
    ? `<div class="stack-s" style="gap:.5rem">
        <div class="chapter-num">${roman(c.n)}</div>
        <h1 style="font-size:1.75rem">${esc(c.title)}</h1>
        ${c.sub ? `<p class="it soft" style="font-size:1.0625rem">${esc(c.sub)}</p>` : ""}
        <div class="meander" style="margin-top:.4rem" aria-hidden="true"></div></div>`
    : `<div class="stack-s"><div class="row"><span class="chapter-num" style="font-size:1.25rem">${roman(c.n)}</span><span class="it soft" style="font-size:1.0625rem">${esc(c.title)}</span></div>
        <div class="meander" aria-hidden="true"></div></div>`;

  const strip = parts.length > 1 ? `<nav class="partstrip" aria-label="Parts">${parts.map((x, i) => `
      <button data-part="${i}" class="${isRead(c.id, i) ? "read" : ""}" aria-current="${i === index}"
        aria-label="Part ${i + 1}${x.afterlife ? ", afterlife" : (x.title ? ", " + esc(x.title) : "")}">${x.afterlife ? `<span style="width:14px;height:14px;display:block">${icons.tree}</span>` : roman(i + 1)}</button>`).join("")}</nav>` : "";

  const heading = parts.length > 1 ? `<div class="stack-s" style="gap:.3rem">
      ${capsHTML(`Part ${roman(index + 1)} of ${roman(parts.length)}`, "b pig")}
      ${!p.afterlife && p.title ? `<h2>${esc(p.title)}</h2>` : ""}</div>` : "";

  const back = index > 0 ? `<button class="caps soft" data-part="${index - 1}" style="text-align:left">← Part ${roman(index)} · ${esc(partName(c, parts[index - 1]))}</button>` : "";
  const footer = index + 1 < parts.length
    ? `<div class="stack-s" style="margin-top:1.5rem">
        <button class="slab fill" data-part="${index + 1}">
          <span class="row" style="justify-content:space-between;flex-wrap:nowrap"><span>
            ${capsHTML(`Continue · Part ${roman(index + 2)}`, "b")}
            <div style="font-weight:700;font-size:1.125rem">${esc(partName(c, parts[index + 1]))}</div></span><span aria-hidden="true">→</span></span>
        </button>${back}</div>`
    : `<div class="stack-s" style="margin-top:1.5rem">${back}
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:.6rem">
          ${prevC ? `<a class="slab" href="${href.chapter(prevC.id)}">${capsHTML(`← ${roman(prevC.n)}`, "faint")}<div class="soft small">${esc(prevC.title)}</div></a>` : "<span></span>"}
          ${nextC ? `<a class="slab" href="${href.chapter(nextC.id)}" style="text-align:right">${capsHTML(`Next chapter · ${roman(nextC.n)} →`, "gold")}<div class="small">${esc(nextC.title)}</div></a>` : ""}
        </div></div>`;

  const html = `<div class="page ${lcls(c.lang)}">
    <div class="stack" style="gap:1.1rem">
      ${header}${strip}${heading}
      <div class="blocks">${partBlocks(c, p).map((b) => block(b, c.lang)).join("")}</div>
      ${footer}
    </div></div>`;

  return {
    title: `Grammar ${roman(c.n)}`,
    subtitle: lang(c.lang).name,
    docTitle: `${c.title}${parts.length > 1 ? ` · ${partName(c, p)}` : ""} — Stemma`,
    html,
    mount(root) {
      if (partArg == null && parts.length > 1) ctx.replace(href.chapter(c.id, index));
      root.querySelectorAll("[data-part]").forEach((b) => b.addEventListener("click", () => {
        ctx.go(href.chapter(c.id, +b.dataset.part), { replace: true });
      }));
    },
  };
}
