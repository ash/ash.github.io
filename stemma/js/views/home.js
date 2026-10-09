import { esc, roman, grouped, lang, lcls, SOURCES, icons } from "../util.js";
import { settings, saveSettings, progress, dueCount } from "../state.js";
import { store, chapters, texts, wordOfTheDay } from "../store.js";
import { tree, sectionLabel, href, capsHTML } from "../ui.js";

const GRAMMAR_SUB = {
  la: "From the sounds of Latin to the sequence of tenses — and what Romance made of each",
  grc: "Attic grammar, with what survived into Modern Greek",
  el: "Modern Greek grammar, traced back to its ancestors",
};
const TEXTS_SUB = {
  la: "Graded stories, then Caesar, Catullus, Vergil — with Italian and Spanish lenses",
  grc: "Aesop, the Gospels, Homer, Plato — read through Modern Greek",
  el: "Everyday Greek, then Cavafy and Solomos",
};
const WOTD = { la: "Verbum diēī", grc: "Ῥῆμα τῆς ἡμέρας", el: "Η λέξη της ημέρας" };

function indexRow(n, title, sub, count, link) {
  return `<a class="index-row" href="${link}">
    <span class="num">${roman(n)}</span>
    <span><span class="head">${capsHTML(title)}${count ? capsHTML(count, "faint") : ""}</span><p>${esc(sub)}</p></span>
  </a>`;
}

export function view(_, ctx) {
  const l = settings.focus;
  const w = wordOfTheDay(l);
  const tables = store.parallels.reduce((n, g) => n + g.items.length, 0);
  const dc = dueCount();
  const html = `
  <div class="page">
    <div class="mast">
      <h1 class="wordmark">Stemma</h1>
      <a class="iconbtn" href="#/settings" aria-label="Settings">${icons.sliders}</a>
    </div>
    <div class="meander" style="margin-top:.6rem" aria-hidden="true"></div>
    <p class="it soft" style="margin-top:.6rem">Latin, Ancient and Modern Greek — read through the languages they became.</p>

    <div class="pillars" role="group" aria-label="Focus language">
      ${SOURCES.map((x) => `<button class="pillar ${lcls(x)}" data-focus="${x}" aria-pressed="${x === l}">
          <span class="emblem">${esc(lang(x).emblem)}</span><span class="rule"></span>${capsHTML(lang(x).name)}
        </button>`).join("")}
    </div>

    ${w ? `<section class="stack-s" style="margin-top:2rem">
      ${sectionLabel(WOTD[l], "word of the day", l)}
      <a href="${href.entry(w.id)}" aria-label="Word of the day: ${esc(w.lemma)}">${tree(w, { compact: true, linkable: false })}</a>
      ${w.note ? `<p class="it soft small">${esc(w.note)}</p>` : ""}
    </section>` : ""}

    <section style="margin-top:2.2rem">
      ${sectionLabel("Index", lang(l).name)}
      ${indexRow(1, "Grammar", GRAMMAR_SUB[l], `${chapters(l).length} chapters`, href.grammar(l))}
      ${indexRow(2, "Texts", TEXTS_SUB[l], `${texts(l).length} readings`, href.library(l))}
      ${indexRow(3, "Lexicon", "Every word with its heirs in five Romance languages and English", `${grouped(store.entries.length)} words`, `#/lexicon?lang=${l}`)}
      ${indexRow(4, "Parallels", "Sound laws, afterlives, the same word in nine languages", `${tables} tables`, "#/parallels")}
      ${indexRow(5, "Exercises", "Guess the heir, find the ancestor, drill the forms", dc ? `${dc} due` : "", "#/practice")}
      ${indexRow(6, "Commonplace book", "The words you have kept", progress.saved.length ? `${progress.saved.length} kept` : "", "#/saved")}
    </section>
    <div class="colophon" aria-hidden="true">SENATVS·POPVLVSQVE·LINGVARVM</div>
  </div>
  <a class="searchslab" href="#/search">${icons.search}<span>Search nine languages — nox, notte, night…</span></a>`;

  return {
    bare: true,
    title: "Stemma",
    html,
    mount(root) {
      root.querySelectorAll("[data-focus]").forEach((b) => b.addEventListener("click", () => {
        settings.focus = b.dataset.focus;
        saveSettings();
        ctx.rerender();
      }));
    },
  };
}
