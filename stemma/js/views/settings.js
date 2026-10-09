import { esc, grouped, lang, lcls, ROMANCE } from "../util.js";
import { settings, saveSettings, toggleRomance, FACES, SIZES, loadFaceFont, progress, resetProgress } from "../state.js";
import { store } from "../store.js";
import { sectionLabel, capsHTML } from "../ui.js";

export function view(_, ctx) {
  FACES.forEach((f) => loadFaceFont(f.id)); // so each typeface previews in itself
  const faceFamily = { palatino: '"Palatino","Palatino Linotype","Book Antiqua","Gentium Book Plus",serif', gentium: '"Gentium Book Plus",serif', garamond: '"EB Garamond",serif', notoserif: '"Noto Serif",serif', notosans: '"Noto Sans",sans-serif' };
  const sizeIndex = SIZES.indexOf(settings.scale);

  const html = `<div class="page stack">
    <div class="specimen">
      <span class="caps">Specimen</span>
      <div class="row l-la"><span class="pig" style="font-weight:700;font-size:1.65rem">nox</span><span class="soft">noctis f.</span></div>
      <div>night — Italian <em>notte</em>, Spanish <em>noche</em>, Romanian <em>noapte</em></div>
      <div class="it" style="color:var(--la);font-size:1.0625rem">Arma virumque canō, Trōiae quī prīmus ab ōrīs</div>
      <div class="it" style="color:var(--grc);font-size:1.0625rem">μῆνιν ἄειδε θεὰ Πηληϊάδεω Ἀχιλῆος</div>
      <div class="it" style="color:var(--el);font-size:1.0625rem">Σα βγεις στον πηγαιμό για την Ιθάκη</div>
    </div>

    <section class="stack-s">
      ${sectionLabel("Text size", sizeIndex < 0 ? "Browser setting" : `${Math.round(settings.scale * 100)}%`)}
      <div class="sizes" role="group" aria-label="Text size">${SIZES.map((s, i) => `<button data-size="${s}" aria-pressed="${settings.scale === s}" aria-label="${Math.round(s * 100)} percent" style="font-size:${11 + i * 2.2}px">A</button>`).join("")}</div>
      <button class="tab" data-size="1" aria-pressed="${settings.scale === 1}" style="justify-self:start">Standard size</button>
    </section>

    <section>
      ${sectionLabel("Typeface", FACES.find((f) => f.id === settings.face)?.title || "")}
      <p class="it soft small" style="margin:.6rem 0 .3rem">Every face here draws macrons and full polytonic Greek. Labels stay in Optima.</p>
      ${FACES.map((f) => `<button class="check" data-face="${f.id}" aria-pressed="${settings.face === f.id}" style="align-items:flex-start;padding:.7rem 0">
        <span class="box" style="margin-top:.4rem;--c:var(--gold)"></span>
        <span><div style="font-family:${faceFamily[f.id]};font-size:1.25rem">${esc(f.title)}</div>
          ${capsHTML(f.note, "faint")}
          <div class="it soft" style="font-family:${faceFamily[f.id]}">rēx, rēgis · λόγος, ὁ · νύχτα</div></span>
      </button>`).join("")}
    </section>

    <section class="stack-s">
      ${sectionLabel("Appearance")}
      <div class="swatches" role="group" aria-label="Appearance">
        ${[["nero", "Nero", "#0E0D0C"], ["marmo", "Marmo", "#F3F2EF"], ["system", "Follow system", "linear-gradient(90deg,#0E0D0C 50%,#F3F2EF 50%)"]].map(([id, t, bg]) => `
          <div class="stack-s" style="gap:.4rem;text-align:center"><button class="swatch" data-appearance="${id}" aria-pressed="${settings.appearance === id}" style="background:${bg}" aria-label="${t}">Aa</button>${capsHTML(t, settings.appearance === id ? "b" : "faint")}</div>`).join("")}
      </div>
    </section>

    <section>
      ${sectionLabel("Romance languages")}
      <p class="it soft small" style="margin:.6rem 0 .3rem">Shown in family trees, comparison tables and the reading lens.</p>
      ${ROMANCE.map((l) => `<button class="check ${lcls(l)}" data-romance="${l}" aria-pressed="${settings.romance.includes(l)}">
        <span class="box"></span><span style="font-size:1.125rem">${lang(l).name}</span><span class="it faint">${lang(l).endonym}</span></button>`).join("")}
    </section>

    <section>
      ${sectionLabel("Greek")}
      <button class="check" data-translit aria-pressed="${settings.translit}" style="padding:.7rem 0">
        <span class="box" style="--c:var(--gold)"></span><span><div>Show transliteration</div><div class="it soft small">ἄνθρωπος · anthrōpos   νύχτα · níchta</div></span></button>
    </section>

    <section class="stack-s">
      ${sectionLabel("Progress")}
      <p class="soft">${progress.saved.length} words kept · ${progress.answered} answers · ${progress.readParts.length} grammar parts read</p>
      <p class="it faint small">Kept in this browser only.</p>
      <button class="slab" data-reset style="border-color:color-mix(in srgb, var(--wrong) 60%, transparent)">${capsHTML("Reset progress", "b")}</button>
    </section>

    <section class="stack-s">
      ${sectionLabel("Colophon")}
      <p class="soft small">Stemma contains ${grouped(store.entries.length)} dictionary entries, ${store.chapters.length} grammar chapters and ${store.texts.length} texts. Ancient and medieval texts are in the public domain; all translations, glosses, notes and graded texts were written for Stemma.</p>
      <p class="soft small">New Testament passages follow the SBL Greek New Testament (Society of Biblical Literature and Logos Bible Software, 2010), used with attribution under its licence. Aesop follows Chambry's edition. Latin texts follow standard school editions, with macrons added.</p>
      <p class="it faint small">Set in Palatino and Optima where your device has them, otherwise in Gentium Book Plus (SIL) from Google Fonts. Your progress stays in this browser.</p>
    </section>
  </div>`;

  return {
    title: "Settings",
    html,
    mount(root) {
      const apply = () => { saveSettings(); ctx.rerender({ keepScroll: true }); };
      root.querySelectorAll("[data-size]").forEach((b) => b.addEventListener("click", () => { settings.scale = +b.dataset.size; apply(); }));
      root.querySelectorAll("[data-face]").forEach((b) => b.addEventListener("click", () => { settings.face = b.dataset.face; apply(); }));
      root.querySelectorAll("[data-appearance]").forEach((b) => b.addEventListener("click", () => { settings.appearance = b.dataset.appearance; apply(); }));
      root.querySelectorAll("[data-romance]").forEach((b) => b.addEventListener("click", () => { toggleRomance(b.dataset.romance); ctx.rerender({ keepScroll: true }); }));
      root.querySelector("[data-translit]").addEventListener("click", () => { settings.translit = !settings.translit; apply(); });
      root.querySelector("[data-reset]").addEventListener("click", () => {
        if (confirm("Reset all progress? Kept words, flashcard history and reading progress will be erased.")) { resetProgress(); ctx.rerender({ keepScroll: true }); }
      });
    },
  };
}
