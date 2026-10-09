// Loads the compiled content (the same JSON the iOS app bundles) and answers queries.

import { fold, SOURCES } from "./util.js";

export const store = {
  loaded: false,
  entries: [], byID: new Map(), byLang: {},
  chapters: [], texts: [], parallels: [], meta: null,
  headKeys: new Map(), relKeys: new Map(), glossKeys: new Map(),
};

export async function loadContent() {
  const get = (name) => fetch(`content/${name}.json`).then((r) => {
    if (!r.ok) throw new Error(`${name}.json: ${r.status}`);
    return r.json();
  });
  const [lexicon, grammar, texts, parallels, meta] = await Promise.all(
    ["lexicon", "grammar", "texts", "parallels", "meta"].map(get));
  store.entries = lexicon;
  store.chapters = grammar;
  store.texts = texts;
  store.parallels = parallels;
  store.meta = meta;
  for (const l of SOURCES) store.byLang[l] = [];
  for (const e of lexicon) {
    store.byID.set(e.id, e);
    store.byLang[e.lang]?.push(e);
    const hk = [fold(e.lemma)];
    if (e.tr) hk.push(fold(e.tr));
    if (e.lemma.startsWith("-")) hk.push(fold(e.lemma.slice(1)));
    store.headKeys.set(e.id, hk);
    store.relKeys.set(e.id, (e.rel || []).map((r) => [fold(r.w), r]));
    store.glossKeys.set(e.id, (e.en || []).map(fold));
  }
  store.loaded = true;
}

export const entries = (l) => (l ? store.byLang[l] || [] : store.entries);
export const chapters = (l) => store.chapters.filter((c) => c.lang === l);
export const chapter = (id) => store.chapters.find((c) => c.id === id);
export const chapterAt = (l, n) => store.chapters.find((c) => c.lang === l && c.n === n);
export const texts = (l) => store.texts.filter((t) => t.lang === l);
export const text = (id) => store.texts.find((t) => t.id === id);

/** The lexicon entry for a word in a language (taps in trees and tables). */
export function lookup(word, l) {
  const k = fold(word);
  return entries(l).find((e) => store.headKeys.get(e.id)?.[0] === k) || null;
}

/** Search in nine languages: headwords (Greek with or without accents, or in Latin letters),
 *  Romance/English relatives, and English meanings. Results explain themselves. */
export function search(query, l = null, limit = 200) {
  const q = fold(query);
  if (!q) return [];
  const hits = new Map();
  const add = (e, reason, score) => {
    const old = hits.get(e.id);
    if (!old || old.score < score) hits.set(e.id, { entry: e, reason, score });
  };
  for (const e of entries(l)) {
    for (const k of store.headKeys.get(e.id) || []) {
      if (k === q) add(e, { type: "head" }, 1000 - e.band);
      else if (k.startsWith(q)) add(e, { type: "head" }, 800 - e.band * 10 - Math.min(k.length - q.length, 30));
    }
    for (const [k, r] of store.relKeys.get(e.id) || []) {
      if (k === q) add(e, { type: "rel", rel: r }, 700 - e.band);
      else if (q.length >= 3 && k.startsWith(q)) add(e, { type: "rel", rel: r }, 400 - e.band * 10);
    }
    if (q.length >= 2) {
      (store.glossKeys.get(e.id) || []).forEach((g, i) => {
        if (g === q) add(e, { type: "gloss" }, 650 - e.band * 5 - i);
        else if (g.startsWith(q + " ") || g.includes(" " + q + " ") || g.endsWith(" " + q) || g.startsWith("to " + q)) {
          add(e, { type: "gloss" }, 500 - e.band * 10 - i);
        }
      });
    }
  }
  return [...hits.values()].sort((a, b) => b.score - a.score || a.entry.lemma.localeCompare(b.entry.lemma)).slice(0, limit);
}

export function wordOfTheDay(l, date = new Date()) {
  const pool = entries(l).filter((e) => e.band <= 2 && (e.rel || []).length >= 4);
  if (!pool.length) return entries(l)[0];
  const day = Math.floor(date.getTime() / 86_400_000);
  return pool[(day * 2654435761) % pool.length];
}

// ---------------------------------------------------------------- chapter parts

/** Reading parts, computed by tools/build_content.py; a chapter without them is one part. */
export function partList(c) {
  const p = c.parts;
  if (Array.isArray(p) && p.length && p.every((x) => x.from >= 0 && x.to <= c.blocks.length && x.from < x.to)) return p;
  return [{ from: 0, to: c.blocks.length, title: null }];
}
/** The blocks of a part; its opening heading becomes the part title, so it isn't repeated. */
export function partBlocks(c, p) {
  const slice = c.blocks.slice(p.from, p.to);
  return slice[0] && "h" in slice[0] && p.title ? slice.slice(1) : slice;
}

/** Which grammar chapter explains this word's inflection (as in the app). */
export function grammarChapterFor(e) {
  let n = null;
  if (e.lang === "la") {
    if (e.pos === "noun") n = { 1: 3, 2: 4, 3: 7, 4: 13, 5: 13 }[e.decl] ?? null;
    else if (e.pos === "adj") n = e.decl === "3" ? 8 : 6;
    else if (e.pos === "verb") n = e.dep ? 18 : (e.conj === "irr" ? 19 : 5);
    else if (e.pos === "pron") n = 11;
  } else if (e.lang === "grc") {
    if (e.pos === "noun") n = { 1: 4, 2: 3, 3: 7 }[e.decl] ?? null;
    else if (e.pos === "adj") n = e.decl === "3" ? 18 : 6;
    else if (e.pos === "verb") n = (e.conj || "").startsWith("contract") ? 14 : (e.conj === "μι" ? 20 : 5);
    else if (e.pos === "pron") n = 13;
  } else if (e.lang === "el") {
    if (e.pos === "noun") n = e.g === "m" ? 3 : 4;
    else if (e.pos === "adj") n = 7;
    else if (e.pos === "verb") n = e.conj === "P" ? 16 : ((e.conj || "").startsWith("B") ? 6 : 5);
    else if (e.pos === "pron") n = 9;
  }
  return n ? chapterAt(e.lang, n) : null;
}
