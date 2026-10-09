// Shared helpers: languages, escaping, folding, inline markup, Roman numerals.

export const LANGS = {
  la: { code: "LA", name: "Latin", endonym: "Lingua Latīna", emblem: "VERBVM" },
  grc: { code: "GRC", name: "Ancient Greek", endonym: "Ἑλληνικὴ γλῶττα", emblem: "ΛΟΓΟΣ" },
  el: { code: "EL", name: "Modern Greek", endonym: "Ελληνική γλώσσα", emblem: "ΛΕΞΗ" },
  it: { code: "IT", name: "Italian", endonym: "italiano" },
  es: { code: "ES", name: "Spanish", endonym: "español" },
  fr: { code: "FR", name: "French", endonym: "français" },
  pt: { code: "PT", name: "Portuguese", endonym: "português" },
  ro: { code: "RO", name: "Romanian", endonym: "română" },
  en: { code: "EN", name: "English", endonym: "English" },
};
export const SOURCES = ["la", "grc", "el"];
export const ROMANCE = ["it", "es", "fr", "pt", "ro"];
export const lang = (l) => LANGS[l] || { code: "··", name: "Other", endonym: "" };
export const lcls = (l) => `l-${LANGS[l] ? l : "other"}`;

export const KINSHIP = {
  i: "inherited", b: "borrowed", c: "cognate", a: "source", r: "replaced by",
};

export function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

/** lowercase, no accents/breathings/macrons, final sigma → σ (mirrors fold() in build_content.py) */
export function fold(s) {
  return String(s ?? "").normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().replace(/ς/g, "σ").replace(/’/g, "'").trim();
}

export const isGreek = (s) => /[Ͱ-Ͽἀ-῿]/.test(s);

/** Capitals for labels; Greek in capitals drops its accents (ΡΗΜΑ, not ῬΗ͂ΜΑ). */
export function caps(s) {
  const up = String(s).toUpperCase();
  return isGreek(up) ? up.normalize("NFD").replace(/\p{M}/gu, "") : up;
}

/** *italic* and **bold** → HTML (escaped). */
export function markup(s) {
  let out = "", italic = false, bold = false, i = 0;
  const t = String(s ?? "");
  while (i < t.length) {
    if (t[i] === "*" && t[i + 1] === "*") { out += bold ? "</strong>" : "<strong>"; bold = !bold; i += 2; continue; }
    if (t[i] === "*") { out += italic ? "</em>" : "<em>"; italic = !italic; i += 1; continue; }
    out += esc(t[i]); i += 1;
  }
  if (italic) out += "</em>";
  if (bold) out += "</strong>";
  return out;
}

/** Wrap the first diacritic-insensitive match of `needle` in <mark>; returns HTML. */
export function highlight(text, needle) {
  const t = String(text ?? "");
  if (!needle || needle === "—" || needle === "∅") return markup(t);
  // fold char by char, remembering where each folded char came from
  const map = [];
  let folded = "";
  for (let i = 0; i < t.length; i++) {
    const f = fold(t[i]);
    for (const ch of f) { folded += ch; map.push(i); }
  }
  const n = fold(needle);
  const at = folded.indexOf(n);
  if (at < 0 || !n) return markup(t);
  const start = map[at], end = map[at + n.length - 1] + 1;
  return markup(t.slice(0, start)) + "<mark>" + esc(t.slice(start, end)) + "</mark>" + markup(t.slice(end));
}

export function roman(n) {
  if (!(n > 0 && n < 4000)) return String(n);
  const table = [[1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"], [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];
  let out = "";
  for (const [v, s] of table) while (n >= v) { out += s; n -= v; }
  return out;
}

/** 3012 → "3 012" with a thin space, as in a printed index */
export const grouped = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ");

export const shuffle = (a) => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
export const pick = (a) => a[Math.floor(Math.random() * a.length)];

export const icons = {
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>',
  sliders: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/><circle cx="9" cy="6" r="2" fill="var(--ground)"/><circle cx="15" cy="12" r="2" fill="var(--ground)"/><circle cx="8" cy="18" r="2" fill="var(--ground)"/></svg>',
  bookmark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="M6 3h12v18l-6-4-6 4z"/></svg>',
  bookmarkFill: '<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="M6 3h12v18l-6-4-6 4z"/></svg>',
  tree: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="17" r="2.6"/><circle cx="5" cy="7" r="2.4"/><circle cx="19" cy="7" r="2.4"/><path d="M5 7L12 17L19 7" fill="none" stroke="currentColor" stroke-width="1.4" stroke-dasharray="2 2"/></svg>',
};
