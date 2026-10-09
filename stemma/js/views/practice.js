import { esc, fold, roman, lang, lcls, SOURCES, shuffle, pick } from "../util.js";
import { settings, saveSettings, progress, due, dueCount, grade, record, isSaved } from "../state.js";
import { store, entries } from "../store.js";
import { tree, capsHTML, sectionLabel } from "../ui.js";
import { paradigm, paradigmCells } from "../latin.js";

const MODES = {
  heir: { title: "Divination", sub: { la: "A Latin word — which is its Italian, Spanish, French, Portuguese or Romanian heir?", grc: "An Ancient word — what does Modern Greek say?", el: "A Modern Greek word — which Ancient word does it come from?" } },
  ancestor: { title: "Genealogy", sub: { la: "Five Romance words — find the Latin ancestor they share.", grc: "Modern Greek and English descendants — find the Ancient source.", el: "An Ancient word and its meaning — find its Modern Greek form." } },
  cards: { title: "Tabellae", sub: { la: "Your kept words, spaced out over days. Core words fill in when you have kept none." } },
  forms: { title: "Formae", sub: { la: "Generated Latin forms: pick the right case, tense or person." } },
};
const modesFor = (l) => (l === "la" ? ["heir", "ancestor", "cards", "forms"] : ["heir", "ancestor", "cards"]);
const subFor = (m, l) => MODES[m].sub[l] || MODES[m].sub.la;

export function home(_, ctx) {
  const l = settings.focus;
  const html = `<div class="page ${lcls(l)}">
    <div class="tabs" role="group" aria-label="Language" style="margin-bottom:1rem">
      ${SOURCES.map((x) => `<button class="tab ${lcls(x)}" data-focus="${x}" aria-pressed="${x === l}">${lang(x).name}</button>`).join("")}
    </div>
    ${modesFor(l).map((m, i) => `<a class="chapter-row" href="#/practice/${l}/${m}" style="grid-template-columns:2.6rem 1fr">
      <span class="num" style="font-size:1.125rem">${roman(i + 1)}</span>
      <span><span class="row" style="justify-content:space-between">${capsHTML(MODES[m].title, "b")}${m === "cards" && dueCount() ? capsHTML(`${dueCount()} due`, "gold") : ""}</span>
        <div class="it soft small">${esc(subFor(m, l))}</div></span></a>`).join("")}
    ${progress.answered ? `<div class="row" style="justify-content:space-between;margin-top:1.2rem">${capsHTML(`Answered ${progress.answered}`, "faint")}${capsHTML(`${Math.round(progress.correct / progress.answered * 100)}% right`, "faint")}</div>` : ""}
  </div>`;
  return {
    title: "Exercises", subtitle: lang(l).name, html,
    mount(root) {
      root.querySelectorAll("[data-focus]").forEach((b) => b.addEventListener("click", () => { settings.focus = b.dataset.focus; saveSettings(); ctx.rerender(); }));
    },
  };
}

// ---------------------------------------------------------------- question factory (as in the app)

/** Identical apart from accents, breathings and macrons — too easy to ask. */
function same(a, b) {
  const fa = fold(a), fb = fold(b);
  return fa === fb || (fa.startsWith(fb) && fa.length - fb.length <= 1);
}

function options(answer, pool) {
  const uniq = [...new Set(pool.filter((x) => fold(x) !== fold(answer)))];
  if (uniq.length < 3) return null;
  const near = shuffle(uniq.filter((x) => x[0]?.toLowerCase() === answer[0]?.toLowerCase()));
  const picks = [];
  for (const c of [...near, ...shuffle(uniq)]) if (!picks.includes(c) && picks.length < 3) picks.push(c);
  return shuffle([...picks, answer]);
}

function question(mode, e, l, pool) {
  const rel = (x, f) => (x.rel || []).find(f);
  if (mode === "heir" && l === "la") {
    for (const r of shuffle(settings.romance)) {
      const h = rel(e, (x) => x.l === r && x.k === "i");
      if (!h || same(h.w, e.lemma)) continue;
      const opts = options(h.w, pool.filter((o) => o.id !== e.id).map((o) => rel(o, (x) => x.l === r && x.k === "i")?.w).filter(Boolean));
      if (opts) return { e, label: `${lang(r).name} heir of`, prompt: [["la", e.lemma]], gloss: e.en?.[0], options: opts, answer: h.w };
    }
    return null;
  }
  if (mode === "heir" && l === "grc") {
    const f = (x) => x.l === "el" && (x.k === "i" || x.k === "r");
    const h = rel(e, f);
    if (!h || same(h.w, e.lemma)) return null;
    const opts = options(h.w, pool.filter((o) => o.id !== e.id).map((o) => rel(o, f)?.w).filter(Boolean));
    return opts && { e, label: "In Modern Greek", prompt: [["grc", e.lemma]], gloss: e.en?.[0], options: opts, answer: h.w };
  }
  if (mode === "heir") {
    const f = (x) => x.l === "grc" && x.k === "a";
    const a = rel(e, f);
    if (!a || same(a.w, e.lemma)) return null;
    const opts = options(a.w, pool.filter((o) => o.id !== e.id).map((o) => rel(o, f)?.w).filter(Boolean));
    return opts && { e, label: "Ancient ancestor of", prompt: [["el", e.lemma]], gloss: e.en?.[0], options: opts, answer: a.w };
  }
  if (mode === "ancestor" && l === "la") {
    const heirs = settings.romance.map((r) => [r, rel(e, (x) => x.l === r && x.k === "i")?.w]).filter((x) => x[1]);
    if (heirs.length < 3) return null;
    const opts = options(e.lemma, pool.filter((o) => o.id !== e.id && o.pos === e.pos).map((o) => o.lemma));
    return opts && { e, label: "The Latin ancestor of", prompt: heirs, options: opts, answer: e.lemma };
  }
  if (mode === "ancestor" && l === "grc") {
    const shown = [];
    const m = rel(e, (x) => x.l === "el" && x.k === "i");
    if (m) shown.push(["el", m.w]);
    (e.rel || []).filter((x) => x.l === "en" && x.k === "b").slice(0, 2).forEach((x) => shown.push(["en", x.w]));
    if (shown.length < 2) return null;
    const opts = options(e.lemma, pool.filter((o) => o.id !== e.id && o.pos === e.pos).map((o) => o.lemma));
    return opts && { e, label: "The Ancient source of", prompt: shown, options: opts, answer: e.lemma };
  }
  if (mode === "ancestor") {
    const a = rel(e, (x) => x.l === "grc" && x.k === "a");
    if (!a || same(a.w, e.lemma)) return null;
    const opts = options(e.lemma, pool.filter((o) => o.id !== e.id && o.pos === e.pos).map((o) => o.lemma));
    return opts && { e, label: "Modern form of", prompt: [["grc", a.w]], gloss: e.en?.[0], options: opts, answer: e.lemma };
  }
  if (mode === "forms") {
    const p = paradigm(e);
    if (!p) return null;
    const cells = paradigmCells(p).filter(([, f]) => !f.includes(" ") && !f.includes(","));
    if (!cells.length) return null;
    const [desc, form] = pick(cells);
    const opts = options(form, cells.map(([, f]) => f).filter((f) => f !== form));
    return opts && { e, label: desc, prompt: [["la", e.cite]], gloss: e.en?.[0], options: opts, answer: form };
  }
  return null;
}

function makeQuestions(mode, l, count = 10) {
  const pool = entries(l).filter((e) => e.band <= 3);
  const out = [];
  for (let tries = 0; out.length < count && tries < 400; tries++) {
    const e = pick(pool);
    if (!e || out.some((q) => q.e.id === e.id)) continue;
    const q = question(mode, e, l, pool);
    if (q) out.push(q);
  }
  return out;
}

function makeDeck(l) {
  let deck = due(progress.saved).map((id) => store.byID.get(id)).filter((e) => e && e.lang === l).slice(0, 20);
  if (deck.length < 10) deck = deck.concat(shuffle(entries(l).filter((e) => e.band === 1 && !progress.cards[e.id])).slice(0, 10 - deck.length));
  return deck;
}

// ---------------------------------------------------------------- session

export function session([l, mode], ctx) {
  const state = { items: mode === "cards" ? makeDeck(l) : makeQuestions(mode, l), index: 0, chosen: null, revealed: false, score: 0 };

  const finished = () => `<div class="empty stack-s" style="justify-items:center">
      ${state.items.length ? `${capsHTML("Finis", "b gold")}<div style="font-size:3rem;font-weight:700;font-style:normal;color:var(--ink)">${state.score} / ${state.items.length}</div>
      <div class="meander" style="width:140px"></div>
      <button class="slab fill" data-again style="max-width:16rem;--c:var(--gold)">${capsHTML("Another round", "b")}</button>` : "Not enough material for this exercise yet."}
    </div>`;

  const quiz = () => {
    const q = state.items[state.index];
    const answered = state.chosen !== null;
    return `<div class="stack">
      <div class="stack-s">${capsHTML(q.label, "faint")}
        ${q.prompt.map(([pl, w]) => `<div class="row ${lcls(pl)}">${q.prompt.length > 1 ? `<span class="code">${lang(pl).code}</span>` : ""}<span class="pig" style="font-weight:700;font-size:${q.prompt.length > 1 ? 1.5 : 2.1}rem">${esc(w)}</span></div>`).join("")}
        ${q.gloss ? `<div class="it soft">“${esc(q.gloss)}”</div>` : ""}</div>
      <div class="stack-s">${q.options.map((o) => {
        let cls = "";
        if (answered) cls = o === q.answer ? "ok" : (o === state.chosen ? "no" : "dim");
        return `<button class="option ${cls}" data-opt="${esc(o)}" ${answered ? "disabled" : ""}><span>${esc(o)}</span><span>${answered && o === q.answer ? "✓" : (answered && o === state.chosen ? "✗" : "")}</span></button>`;
      }).join("")}</div>
      ${answered ? `<div class="stack-s">${sectionLabel("The family", "", q.e.lang)}${tree(q.e, { compact: true, linkable: false })}
        <button class="slab fill" data-next style="--c:var(--gold)">${capsHTML(state.index + 1 < state.items.length ? "Next" : "Finish", "b")}</button></div>` : ""}
    </div>`;
  };

  const card = () => {
    const e = state.items[state.index];
    return `<div class="stack ${lcls(e.lang)}">
      ${capsHTML(isSaved(e.id) ? `Kept word · box ${(progress.cards[e.id]?.box ?? 0) + 1} of 5` : "Core word", "faint")}
      <div class="headword">${esc(e.lemma)}</div>
      ${settings.translit && e.tr ? `<div class="it soft">${esc(e.tr)}</div>` : ""}
      ${state.revealed ? `<div class="soft">${esc(e.cite)}</div><div style="font-size:1.375rem">${esc((e.en || []).join("; "))}</div>
        ${tree(e, { compact: true, linkable: false })}
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:.6rem">
          <button class="slab" data-grade="0" style="border-color:var(--wrong)">${capsHTML("Again", "b")}</button>
          <button class="slab" data-grade="1" style="border-color:var(--right)">${capsHTML("Knew it", "b")}</button></div>`
        : `<button class="slab" data-reveal style="border-color:var(--gold-dim);margin-top:1.5rem">${capsHTML("Reveal", "b gold")}</button>`}
    </div>`;
  };

  const body = () => (state.index >= state.items.length ? finished() : (mode === "cards" ? card() : quiz()));
  const bar = () => `<div class="progressbar ${lcls(l)}"><i style="width:${state.items.length ? state.index / state.items.length * 100 : 0}%"></i></div>`;

  return {
    title: MODES[mode]?.title || "Exercises", subtitle: lang(l).name,
    html: `<div class="page ${lcls(l)}"><div id="pbar">${bar()}</div><div id="drill" style="margin-top:1.4rem">${body()}</div></div>`,
    mount(root) {
      const draw = () => { root.querySelector("#drill").innerHTML = body(); root.querySelector("#pbar").innerHTML = bar(); };
      root.addEventListener("click", (ev) => {
        const opt = ev.target.closest("[data-opt]");
        if (opt && state.chosen === null) {
          const q = state.items[state.index];
          state.chosen = opt.dataset.opt;
          const ok = state.chosen === q.answer;
          if (ok) state.score += 1;
          record(ok);
          navigator.vibrate?.(ok ? 15 : [20, 40, 20]);
          draw(); return;
        }
        if (ev.target.closest("[data-next]")) { state.index += 1; state.chosen = null; draw(); window.scrollTo(0, 0); return; }
        if (ev.target.closest("[data-reveal]")) { state.revealed = true; draw(); return; }
        const g = ev.target.closest("[data-grade]");
        if (g) {
          const ok = g.dataset.grade === "1";
          if (ok) state.score += 1;
          grade(state.items[state.index].id, ok);
          state.index += 1; state.revealed = false; draw(); return;
        }
        if (ev.target.closest("[data-again]")) {
          Object.assign(state, { items: mode === "cards" ? makeDeck(l) : makeQuestions(mode, l), index: 0, chosen: null, revealed: false, score: 0 });
          draw();
        }
      });
    },
  };
}
