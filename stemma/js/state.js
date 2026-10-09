// Settings and progress, kept in localStorage (the web twin of Settings.swift / Progress.swift).

import { ROMANCE } from "./util.js";

const SETTINGS_KEY = "stemma.settings";
const PROGRESS_KEY = "stemma.progress.v1";

function read(key, fallback) {
  try { return { ...fallback, ...JSON.parse(localStorage.getItem(key) || "{}") }; } catch { return { ...fallback }; }
}
function write(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* private mode: keep in memory */ }
}

export const settings = read(SETTINGS_KEY, {
  appearance: "nero",       // nero | marmo | system
  focus: "la",              // la | grc | el
  romance: ROMANCE.slice(), // shown in trees, tables, lenses
  translit: true,
  scale: 1,                 // text size
  face: "palatino",         // reading typeface
});

export function saveSettings() {
  write(SETTINGS_KEY, settings);
  const root = document.documentElement;
  root.dataset.theme = settings.appearance;
  root.style.setProperty("--scale", settings.scale);
  root.dataset.face = settings.face;
  loadFaceFont(settings.face);
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content",
    settings.appearance === "marmo" ? "#F3F2EF" : "#0E0D0C");
}

export const shows = (l) => !ROMANCE.includes(l) || settings.romance.includes(l);

export function toggleRomance(l) {
  if (settings.romance.includes(l)) settings.romance = settings.romance.filter((x) => x !== l);
  else settings.romance = ROMANCE.filter((x) => settings.romance.includes(x) || x === l);
  saveSettings();
}

/** Reading faces. Palatino is used where installed (Apple, Windows), with Gentium as the web fallback. */
export const FACES = [
  { id: "palatino", title: "Palatino", note: "Zapf, 1949 · the house face (Gentium where Palatino is missing)" },
  { id: "gentium", title: "Gentium Book Plus", note: "SIL · made for scholars of Greek and Latin", google: "Gentium+Book+Plus:ital,wght@0,400;0,700;1,400" },
  { id: "garamond", title: "EB Garamond", note: "Renaissance French · elegant", google: "EB+Garamond:ital,wght@0,400;0,700;1,400" },
  { id: "notoserif", title: "Noto Serif", note: "Plain and sturdy on any screen", google: "Noto+Serif:ital,wght@0,400;0,700;1,400" },
  { id: "notosans", title: "Noto Sans", note: "Sans-serif", google: "Noto+Sans:ital,wght@0,400;0,700;1,400" },
];

export function loadFaceFont(id) {
  const f = FACES.find((x) => x.id === id);
  if (!f?.google || document.getElementById(`font-${id}`)) return;
  const link = document.createElement("link");
  link.id = `font-${id}`;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${f.google}&display=swap`;
  document.head.appendChild(link);
}

export const SIZES = [0.85, 0.92, 1, 1.08, 1.16, 1.25, 1.36, 1.5, 1.66];

// ---------------------------------------------------------------- progress

export const progress = read(PROGRESS_KEY, {
  saved: [],          // entry ids, most recent first
  cards: {},          // id → { box, due, seen, right }
  answered: 0,
  correct: 0,
  readParts: [],      // "chapterID#part"
  lastPart: {},       // chapterID → part
});

const save = () => write(PROGRESS_KEY, progress);
const DAY = 86_400_000;
const INTERVALS = [0, 1, 3, 7, 21].map((d) => d * DAY);

export const isSaved = (id) => progress.saved.includes(id);
export function toggleSaved(id) {
  const i = progress.saved.indexOf(id);
  if (i >= 0) progress.saved.splice(i, 1);
  else {
    progress.saved.unshift(id);
    if (!progress.cards[id]) progress.cards[id] = { box: 0, due: Date.now(), seen: 0, right: 0 };
  }
  save();
}
export const due = (ids, now = Date.now()) => ids.filter((id) => (progress.cards[id]?.due ?? 0) <= now);
export const dueCount = () => due(progress.saved).length;
export function grade(id, ok) {
  const c = progress.cards[id] || { box: 0, due: Date.now(), seen: 0, right: 0 };
  c.seen += 1;
  if (ok) { c.right += 1; c.box = Math.min(c.box + 1, 4); } else c.box = 0;
  c.due = Date.now() + (ok ? INTERVALS[c.box] : 10 * 60_000);
  progress.cards[id] = c;
  record(ok);
}
export function record(ok) {
  progress.answered += 1;
  if (ok) progress.correct += 1;
  save();
}
export const isRead = (chapter, part) => progress.readParts.includes(`${chapter}#${part}`);
export function markRead(chapter, part) {
  const key = `${chapter}#${part}`;
  if (!progress.readParts.includes(key)) progress.readParts.push(key);
  progress.lastPart[chapter] = part;
  save();
}
export function resetProgress() {
  Object.assign(progress, { saved: [], cards: {}, answered: 0, correct: 0, readParts: [], lastPart: {} });
  save();
}
