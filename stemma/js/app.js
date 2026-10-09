// Stemma for the web: a hash router over the same content as the iOS app.

import { esc, caps, icons } from "./util.js";
import { saveSettings } from "./state.js";
import { loadContent } from "./store.js";
import * as home from "./views/home.js";
import * as lexicon from "./views/lexicon.js";
import * as grammar from "./views/grammar.js";
import * as texts from "./views/texts.js";
import * as parallels from "./views/parallels.js";
import * as practice from "./views/practice.js";
import * as settingsView from "./views/settings.js";

const routes = [
  [/^$/, home.view],
  [/^lexicon$/, lexicon.list],
  [/^entry\/(.+)$/, lexicon.entry],
  [/^paradigm\/(.+)$/, lexicon.paradigmView],
  [/^saved$/, lexicon.saved],
  [/^search$/, lexicon.searchView],
  [/^grammar\/(la|grc|el)$/, grammar.book],
  [/^chapter\/([^/]+)(?:\/(\d+))?$/, grammar.chapterView],
  [/^library\/(la|grc|el)$/, texts.library],
  [/^text\/(.+)$/, texts.reader],
  [/^parallels$/, parallels.groups],
  [/^parallels\/([^/]+)$/, parallels.groupView],
  [/^parallels\/([^/]+)\/([^/]+)$/, parallels.itemView],
  [/^practice$/, practice.home],
  [/^practice\/(la|grc|el)\/(\w+)$/, practice.session],
  [/^settings$/, settingsView.view],
];

const main = document.getElementById("main");
const bar = document.getElementById("bar");

// ---------------------------------------------------------------- history & scroll

const scrolls = new Map();
let seq = 0;
let current = null;

function stamp() {
  if (!history.state?.key) {
    const depth = (current?.depth ?? -1) + 1;
    history.replaceState({ key: `k${Date.now()}-${seq++}`, depth }, "");
    return false; // a new page
  }
  return true; // revisiting via back/forward
}

let ticking = false;
addEventListener("scroll", () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => { if (history.state?.key) scrolls.set(history.state.key, scrollY); ticking = false; });
}, { passive: true });

const ctx = {
  rerender: (opts = {}) => render({ keepScroll: opts.keepScroll }),
  /** Update the address silently (filters, search text) without re-rendering. */
  replace: (hash) => history.replaceState(history.state, "", hash),
  /** Navigate; with replace, the new page takes the place of the current one in history. */
  go: (hash, { replace = false } = {}) => {
    if (replace) { history.replaceState(history.state, "", hash); render({ top: true }); }
    else location.hash = hash;
  },
  setSubtitle: (s) => { const el = bar.querySelector("[data-sub]"); if (el) el.textContent = caps(s); },
};

// ---------------------------------------------------------------- render

function route() {
  const raw = location.hash.replace(/^#\/?/, "");
  const [path, qs = ""] = raw.split("?");
  for (const [re, fn] of routes) {
    const m = path.match(re);
    if (m) return { fn, args: m.slice(1).map((x) => (x == null ? x : decodeURIComponent(x))), query: new URLSearchParams(qs) };
  }
  return { fn: home.view, args: [], query: new URLSearchParams() };
}

function renderBar(v) {
  if (v.bare) { bar.hidden = true; bar.innerHTML = ""; return; }
  bar.hidden = false;
  const sub = typeof v.subtitle === "function" ? v.subtitle() : v.subtitle;
  bar.innerHTML = `
    <button class="iconbtn" data-back aria-label="Back">${icons.back}</button>
    <div class="title"><div class="caps">${esc(caps(v.title || ""))}</div>${sub ? `<div class="caps" data-sub>${esc(caps(sub))}</div>` : `<div class="caps" data-sub></div>`}</div>
    ${v.action ? `<button class="iconbtn" data-action aria-label="${esc(v.action.label())}">${v.action.html()}</button>` : `<a class="iconbtn" href="#/" aria-label="Home"><span class="caps gold" style="font-size:.6rem;letter-spacing:.1em">Σ</span></a>`}`;
  bar.querySelector("[data-back]").addEventListener("click", () => {
    if ((history.state?.depth ?? 0) > 0) history.back();
    else location.hash = "#/";
  });
  bar.querySelector("[data-action]")?.addEventListener("click", (ev) => {
    v.action.run();
    ev.currentTarget.innerHTML = v.action.html();
    ev.currentTarget.setAttribute("aria-label", v.action.label());
  });
}

function render({ keepScroll = false, top = false } = {}) {
  const y = scrollY;
  const revisit = stamp();
  const sheet = document.getElementById("sheet");
  sheet.hidden = true; sheet.innerHTML = "";
  const { fn, args, query } = route();
  let v;
  try {
    v = fn(args, ctx, query);
  } catch (err) {
    console.error(err);
    v = { title: "Stemma", html: `<div class="empty">Something went wrong on this page.<br><span class="tiny">${esc(err.message)}</span></div>` };
  }
  current = { depth: history.state?.depth ?? 0 };
  renderBar(v);
  // a fresh container per render, so a view's listeners never pile up on <main>
  const root = document.createElement("div");
  root.innerHTML = v.html;
  main.replaceChildren(root);
  v.mount?.(root);
  document.title = v.docTitle || (v.bare ? "Stemma — Latin & Greek Roots" : `${v.title} — Stemma`);
  if (keepScroll) scrollTo(0, y);
  else if (!top && revisit && scrolls.has(history.state.key)) scrollTo(0, scrolls.get(history.state.key));
  else scrollTo(0, 0);
  if (!keepScroll) main.focus({ preventScroll: true });
}

addEventListener("hashchange", () => render());

// ---------------------------------------------------------------- start

saveSettings(); // applies theme, size and face
loadContent()
  .then(() => render())
  .catch((err) => {
    console.error(err);
    main.innerHTML = `<div class="empty">The content could not be loaded.<br><span class="tiny">${esc(err.message)}</span></div>`;
  });

if ("serviceWorker" in navigator && location.protocol === "https:") {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}
