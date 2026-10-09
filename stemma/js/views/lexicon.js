import { esc, fold, roman, grouped, lang, lcls, SOURCES, markup } from "../util.js";
import { settings, isSaved, toggleSaved, progress } from "../state.js";
import { store, entries, search, grammarChapterFor, text as textByID } from "../store.js";
import { tree, sectionLabel, entryRow, href, capsHTML, bookmarkIcon } from "../ui.js";
import { paradigm } from "../latin.js";

const BAND = ["", "core", "common", "frequent", "wider"];

function posName(e) {
  const m = { noun: "noun", verb: e.dep ? "deponent verb" : "verb", adj: "adjective", adv: "adverb", pron: "pronoun", prep: "preposition", conj: "conjunction", num: "numeral", interj: "interjection", part: "particle", phrase: "phrase" };
  return m[e.pos] || e.pos;
}

function grammarDetail(e) {
  if (e.lang === "la" && e.pos === "noun" && /^[1-5]$/.test(e.decl || "")) return `${["", "first", "second", "third", "fourth", "fifth"][+e.decl]} declension`;
  if (e.lang === "la" && e.pos === "verb" && e.conj) {
    const name = { 1: "first", 2: "second", 3: "third", "3io": "third (-iō)", 4: "fourth", irr: "irregular" }[e.conj] || e.conj;
    return `${name} conjugation${e.dep ? ", deponent" : ""}${e.semidep ? ", semi-deponent" : ""}`;
  }
  if (e.pos === "prep" && e.case) return `takes the ${e.case.replace("/", " or ")} case`;
  if (e.lang === "el" && e.pos === "verb" && e.conj) return { A: "conjugation A", B1: "conjugation B1", B2: "conjugation B2", P: "passive-form (-ομαι) verb", irr: "irregular" }[e.conj] || e.conj;
  return "";
}

// ---------------------------------------------------------------- list

const CHUNK = 150;

export function list(_, ctx, query) {
  let l = query.get("lang") ?? settings.focus;
  if (l === "all") l = null;
  let q = query.get("q") || "";
  let band = query.get("band") ? +query.get("band") : null;

  const html = `<div class="page">
    <div class="list-controls">
      <div class="tabs" role="group" aria-label="Language">
        <button class="tab" data-lang="all" aria-pressed="${l === null}">All</button>
        ${SOURCES.map((x) => `<button class="tab ${lcls(x)}" data-lang="${x}" aria-pressed="${l === x}">${lang(x).name}</button>`).join("")}
      </div>
      <label class="field"><span class="gold" aria-hidden="true">⌕</span>
        <input id="lexq" type="search" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Find a word, an heir or a meaning" value="${esc(q)}" aria-label="Search the lexicon"></label>
      <div class="tabs" role="group" aria-label="Show">
        <span class="caps faint">Show</span>
        <button class="tab" data-band="1" aria-pressed="${band === 1}">Core</button>
        <button class="tab" data-band="2" aria-pressed="${band === 2}">Common</button>
        <button class="tab" data-band="" aria-pressed="${band === null}">Everything</button>
      </div>
    </div>
    <div id="lexresults"></div>
  </div>`;

  return {
    title: "Lexicon",
    subtitle: () => `${grouped(entries(l).length)} words`,
    html,
    mount(root) {
      const results = root.querySelector("#lexresults");
      let observer;
      const sync = () => ctx.replace(`#/lexicon?lang=${l ?? "all"}${q ? `&q=${encodeURIComponent(q)}` : ""}${band ? `&band=${band}` : ""}`);
      const draw = () => {
        observer?.disconnect();
        if (q.trim()) {
          const hits = search(q, l);
          results.innerHTML = hits.length ? hits.map((h) => entryRow(h.entry, h.reason)).join("")
            : `<p class="it soft" style="padding:1rem 0">Nothing found for “${esc(q)}”.</p>`;
          return;
        }
        let es = entries(l);
        if (band) es = es.filter((e) => e.band <= band);
        // letter sections, rendered a chunk at a time as you scroll
        let shown = 0, current = "";
        results.innerHTML = "";
        const more = () => {
          const parts = [];
          for (const e of es.slice(shown, shown + CHUNK)) {
            const k = fold(e.lemma).replace(/^-/, "").slice(0, 1).toUpperCase();
            const head = l ? k : `${lang(e.lang).code} · ${k}`;
            if (head !== current) { parts.push(`<div class="letter">${esc(head)}</div>`); current = head; }
            parts.push(entryRow(e));
          }
          shown += CHUNK;
          results.insertAdjacentHTML("beforeend", parts.join(""));
          if (shown < es.length) {
            const s = document.createElement("div");
            s.style.height = "1px";
            results.appendChild(s);
            observer = new IntersectionObserver((xs) => {
              if (xs.some((x) => x.isIntersecting)) { observer.disconnect(); s.remove(); more(); }
            }, { rootMargin: "800px" });
            observer.observe(s);
          }
        };
        more();
        ctx.setSubtitle(`${grouped(es.length)} words`);
      };
      root.querySelectorAll("[data-lang]").forEach((b) => b.addEventListener("click", () => {
        l = b.dataset.lang === "all" ? null : b.dataset.lang;
        root.querySelectorAll("[data-lang]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
        sync(); draw();
      }));
      root.querySelectorAll("[data-band]").forEach((b) => b.addEventListener("click", () => {
        band = b.dataset.band ? +b.dataset.band : null;
        root.querySelectorAll("[data-band]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
        sync(); draw();
      }));
      let t;
      root.querySelector("#lexq").addEventListener("input", (ev) => {
        clearTimeout(t);
        t = setTimeout(() => { q = ev.target.value; sync(); draw(); }, 90);
      });
      draw();
    },
  };
}

// ---------------------------------------------------------------- entry

export function entry([id], ctx) {
  const e = store.byID.get(id);
  if (!e) return { title: "Lexicon", html: `<div class="empty">This word is not in the lexicon.</div>` };
  const p = e.lang === "la" ? paradigm(e) : null;
  const gc = grammarChapterFor(e);
  const ppLabels = e.lang === "grc"
    ? ["present", "future", "aorist", "perfect", "perfect mid./pass.", "aorist passive"]
    : ["present", "aorist", "aorist passive", "past participle"];
  const showPP = e.lang !== "la" && (e.pp?.length || 0) > 1;
  const occ = (e.texts || []).map(textByID).filter(Boolean);
  const detail = grammarDetail(e);

  const html = `<div class="page stack ${lcls(e.lang)}">
    <header class="stack-s" style="gap:.35rem">
      <div class="row">${capsHTML(lang(e.lang).name, "b pig")}<span class="caps faint">·</span>${capsHTML(posName(e))}<span class="caps faint">·</span>${capsHTML(BAND[Math.min(Math.max(e.band, 0), 4)])}</div>
      <h1 class="headword">${esc(e.lemma)}</h1>
      ${settings.translit && e.tr ? `<div class="it soft">${esc(e.tr)}</div>` : ""}
      ${e.cite !== e.lemma ? `<div>${esc(e.cite)}</div>` : ""}
      ${detail ? `<div class="it soft small">${esc(detail)}</div>` : ""}
    </header>
    <div class="senses">${(e.en || []).map((s, i) => e.en.length > 1
      ? `<div class="sense"><span class="n">${roman(i + 1).toLowerCase()}</span><span>${esc(s)}</span></div>`
      : `<div class="sense" style="grid-template-columns:1fr"><span>${esc(s)}</span></div>`).join("")}</div>
    <section class="stack-s">${sectionLabel("Stemma", "family tree", e.lang)}${tree(e)}</section>
    ${e.note ? `<section class="stack-s">${sectionLabel("Nota")}<p class="prose">${markup(e.note)}</p></section>` : ""}
    ${e.ex ? `<div class="exemplum"><span class="caps">Exemplum</span><div class="it pig" style="font-size:1.2rem">${esc(e.ex.t)}</div><div class="soft">${esc(e.ex.en)}</div></div>` : ""}
    ${p || gc || showPP ? `<section>${sectionLabel("Forms")}
      ${showPP ? e.pp.map((f, i) => `<div class="pp">${capsHTML(ppLabels[i] || "")}<span class="${f === "—" ? "faint" : ""}">${esc(f)}</span></div>`).join("") : ""}
      ${p ? `<a class="linkrow" href="${href.paradigm(e.id)}"><span><div>${e.pos === "verb" ? "Full conjugation" : "Full declension"}</div><div class="it soft small">every form, generated</div></span><span class="arrow">→</span></a>` : ""}
      ${gc ? `<a class="linkrow" href="${href.chapter(gc.id)}"><span><div>Grammar ${roman(gc.n)}</div><div class="it soft small">${esc(gc.title)}</div></span><span class="arrow">→</span></a>` : ""}
    </section>` : ""}
    ${occ.length ? `<section>${sectionLabel("In the texts", String(occ.length))}
      ${occ.map((t) => `<a class="linkrow" href="${href.text(t.id)}"><span><div>${esc(t.title)}</div><div class="it soft small">${esc([t.author, t.source].filter(Boolean).join(" · "))}</div></span><span class="arrow">→</span></a>`).join("")}
    </section>` : ""}
  </div>`;

  return {
    title: lang(e.lang).name,
    subtitle: posName(e),
    docTitle: `${e.lemma} — Stemma`,
    action: {
      html: () => bookmarkIcon(isSaved(e.id)),
      label: () => (isSaved(e.id) ? "Remove from commonplace book" : "Keep in commonplace book"),
      run: () => toggleSaved(e.id),
    },
    html,
  };
}

// ---------------------------------------------------------------- paradigm

export function paradigmView([id]) {
  const e = store.byID.get(id);
  const p = e && paradigm(e);
  if (!p) return { title: "Paradigm", html: `<div class="empty">No generated paradigm for this word.</div>` };
  const short = (t) => t.replace(" subjunctive", " subj.").replace("Future perfect", "Fut. perf.").replace("Pluperfect", "Plupf.");
  const html = `<div class="page stack ${lcls(e.lang)}">
    <div><h1 class="pig" style="font-size:1.9rem">${esc(e.lemma)}</h1><div class="soft">${esc(e.cite)}</div></div>
    ${p.sections.length > 3 ? `<nav class="tabs" aria-label="Sections">${p.sections.map((s, i) => `<a class="tab" href="#sec-${i}" data-jump="${i}">${esc(short(s.title))}</a>`).join("")}</nav>` : ""}
    ${p.sections.map((s, i) => `<section id="sec-${i}">
      ${sectionLabel(s.title, "", e.lang)}
      <div class="scrollx"><table class="ptable" style="width:100%">
        ${s.columns.length > 1 || s.columns[0] ? `<thead><tr><th></th>${s.columns.map((c) => `<th>${esc(c)}</th>`).join("")}</tr></thead>` : ""}
        <tbody>${s.rows.map((r) => `<tr><td>${esc(r.label)}</td>${r.cells.map((c) => `<td class="${c === "—" ? "faint" : ""}">${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody>
      </table></div></section>`).join("")}
    <p class="it faint tiny">Generated from the principal parts. Rare alternative forms are not shown.</p>
  </div>`;
  return {
    title: p.title, subtitle: e.lemma, html,
    mount(root) {
      root.querySelectorAll("[data-jump]").forEach((a) => a.addEventListener("click", (ev) => {
        ev.preventDefault();
        root.querySelector(`#sec-${a.dataset.jump}`)?.scrollIntoView({ block: "start" });
        window.scrollBy(0, -70);
      }));
    },
  };
}

// ---------------------------------------------------------------- saved

export function saved() {
  const es = progress.saved.map((id) => store.byID.get(id)).filter(Boolean);
  return {
    title: "Commonplace book",
    subtitle: `${es.length} kept`,
    html: es.length ? `<div class="page">${es.map((e) => entryRow(e)).join("")}</div>`
      : `<div class="empty">Keep words with the bookmark on any entry.<br>They become your flashcards.</div>`,
  };
}

// ---------------------------------------------------------------- search

export function searchView(_, ctx, query) {
  const q0 = query.get("q") || "";
  const html = `<div class="page">
    <label class="field" style="border-width:0 0 1.5px;border-color:var(--gold);padding:.6rem 0">
      <input id="omniq" type="search" autocomplete="off" autocapitalize="off" spellcheck="false" style="font-size:1.5rem"
        placeholder="nox · notte · night · λόγος · logos" value="${esc(q0)}" aria-label="Search nine languages"></label>
    <div id="omni"></div>
  </div>`;
  const hint = `<div class="stack-s" style="margin-top:1.2rem">
      ${capsHTML("Search in any of nine languages", "faint")}
      <p class="it soft">Type a Latin or Greek word (accents optional, Greek in Latin letters works too), an Italian, Spanish, French, Portuguese or Romanian heir, or an English meaning.</p>
      <div class="chips">${["aqua", "notte", "hijo", "philosophy", "anthropos", "νερό", "œil", "frate"].map((s) => `<button class="chip" data-q="${esc(s)}">${esc(s)}</button>`).join("")}</div>
    </div>`;
  return {
    title: "Search",
    html,
    mount(root) {
      const input = root.querySelector("#omniq");
      const out = root.querySelector("#omni");
      const draw = (q) => {
        ctx.replace(`#/search${q ? `?q=${encodeURIComponent(q)}` : ""}`);
        if (!q.trim()) {
          out.innerHTML = hint;
          out.querySelectorAll("[data-q]").forEach((b) => b.addEventListener("click", () => { input.value = b.dataset.q; draw(b.dataset.q); }));
          return;
        }
        const hits = search(q);
        out.innerHTML = hits.length ? hits.map((h) => entryRow(h.entry, h.reason)).join("") : `<p class="it soft" style="padding:1rem 0">Nothing found.</p>`;
      };
      let t;
      input.addEventListener("input", () => { clearTimeout(t); t = setTimeout(() => draw(input.value), 90); });
      draw(q0);
      if (!q0) input.focus();
    },
  };
}
