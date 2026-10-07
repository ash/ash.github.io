/* Fortuna Flashcards — plain JS, no build step. Progress lives in localStorage. */
(() => {
  'use strict';

  /* ================= Data ================= */

  const CHAPTER_NOTES = {
    10: 'De woorden van tekst 10 (blz. 192–193) ontbreken nog in de foto’s.',
  };
  const LEVEL_NAMES = ['Nieuw', 'Lastig', 'Bijna', 'Gekend', 'Gekend', 'Meester'];

  function parseLine(line) {
    const i = line.indexOf(' = ');
    let left = line.slice(0, i).trim();
    let right = line.slice(i + 3).trim();
    let extra = '';
    const t = right.indexOf(' ~ ');
    if (t >= 0) { extra = right.slice(t + 3).trim(); right = right.slice(0, t).trim(); }
    let note = '';
    left = left.replace(/\s*\[([^\]]+)\]\s*/, (_, n) => { note = n.trim(); return ' '; }).trim();
    const senses = right.split(' | ').map(s => s.trim()).filter(Boolean);
    return { la: left, note, senses, extra };
  }

  const LESSONS = LESSONS_RAW.map(raw => {
    const l = { id: raw.id, chapter: raw.chapter, kind: raw.kind, title: raw.title || `Woorden tekst ${raw.id}` };
    if (raw.kind === 'tekst') { l.short = `Tekst ${raw.id}`; l.label = raw.id; }
    else {
      l.short = raw.id.endsWith('V') ? 'Voorzetsels' : raw.kind === 'perfecta' ? 'Perfecta' : 'Herhaling';
      l.label = `${l.short} (les ${raw.chapter})`;
    }
    l.words = raw.words.trim().split('\n').map(s => s.trim()).filter(Boolean).map((line, idx) => {
      const w = parseLine(line);
      w.lesson = l.id; w.kind = l.kind; w.idx = idx;
      w.key = [w.la, w.note, w.extra].join('¦');
      return w;
    });
    return l;
  });
  const LESSON_BY_ID = new Map(LESSONS.map(l => [l.id, l]));
  const CHAPTERS = [];
  for (const l of [...LESSONS].sort((a, b) => a.chapter - b.chapter)) {
    let ch = CHAPTERS.find(c => c.n === l.chapter);
    if (!ch) CHAPTERS.push(ch = { n: l.chapter, lessons: [] });
    ch.lessons.push(l);
  }
  const ALL_WORDS = LESSONS.flatMap(l => l.words);

  /* ================= Storage ================= */

  const STORE_KEY = 'fortuna-flashcards-v1';
  const DEFAULT_PREFS = { mode: 'cards', dir: 'la-nl', count: 20, onlyNew: false };
  const freshState = () => ({ v: 1, profiles: [], current: null, sel: {}, prog: {}, days: {} });

  function load() {
    try {
      const s = JSON.parse(localStorage.getItem(STORE_KEY));
      if (s && s.v === 1 && Array.isArray(s.profiles)) return Object.assign(freshState(), s);
    } catch (e) { /* private mode or corrupt data: start fresh */ }
    return freshState();
  }
  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* storage unavailable */ }
  }

  let state = load();
  if (state.current && !state.profiles.some(p => p.id === state.current)) state.current = state.profiles[0]?.id || null;

  const profile = () => state.profiles.find(p => p.id === state.current);
  const prefs = () => { const p = profile(); return (p.prefs = Object.assign({}, DEFAULT_PREFS, p.prefs)); };
  const prog = () => (state.prog[state.current] ||= {});
  const box = w => prog()[w.key]?.[0] || 0;
  const selection = () => new Set(state.sel[state.current] || []);
  const setSelection = set => { state.sel[state.current] = [...set]; save(); };

  function record(w, ok) {
    const p = prog();
    const prev = p[w.key] ? p[w.key].slice() : null;
    const e = prev ? prev.slice() : [0, 0, 0, 0];
    if (ok) { e[0] = Math.min(5, Math.max(1, e[0]) + 1); e[1]++; }
    else { e[0] = 1; e[2]++; }
    e[3] = Date.now();
    p[w.key] = e;
    touchDay();
    save();
    return () => { if (prev) p[w.key] = prev; else delete p[w.key]; save(); };
  }

  const dayStr = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const yesterday = () => { const d = new Date(); d.setDate(d.getDate() - 1); return dayStr(d); };
  function touchDay() {
    const d = (state.days[state.current] ||= { streak: 0, last: null, today: 0 });
    const today = dayStr();
    if (d.last !== today) {
      d.streak = d.last === yesterday() ? d.streak + 1 : 1;
      d.last = today;
      d.today = 0;
    }
    d.today++;
  }
  function streakNow() {
    const d = state.days[state.current];
    return d && (d.last === dayStr() || d.last === yesterday()) ? d.streak : 0;
  }
  function todayCount() {
    const d = state.days[state.current];
    return d && d.last === dayStr() ? d.today : 0;
  }

  /* ================= Helpers ================= */

  const $ = (sel, root = document) => root.querySelector(sel);
  const app = $('#app');
  const dlg = $('#dialog');
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const uid = () => Math.random().toString(36).slice(2, 10);
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

  function unique(words) {
    const seen = new Set(), out = [];
    for (const w of words) if (!seen.has(w.key)) { seen.add(w.key); out.push(w); }
    return out;
  }
  const wordsOf = ids => unique([...ids].flatMap(id => LESSON_BY_ID.get(id)?.words || []));

  function statsFor(words) {
    let n = 0, l1 = 0, l2 = 0, l3 = 0, sum = 0;
    for (const w of unique(words)) {
      const b = box(w); n++; sum += Math.min(b, 3);
      if (b >= 3) l3++; else if (b === 2) l2++; else if (b === 1) l1++;
    }
    return { n, l1, l2, l3, pct: n ? Math.round(sum / (3 * n) * 100) : 0 };
  }
  function meterHTML(s) {
    if (!s.n) return '';
    const p = x => (x / s.n * 100).toFixed(1) + '%';
    return `<span class="meter" aria-hidden="true"><span class="m3" style="width:${p(s.l3)}"></span><span class="m2" style="width:${p(s.l2)}"></span><span class="m1" style="width:${p(s.l1)}"></span></span>`;
  }
  const dotHTML = w => { const b = box(w); return `<i class="lvl-dot l${b}" title="${LEVEL_NAMES[b]}"></i>`; };
  const LEGEND = `<div class="legend" aria-label="Uitleg kleuren">
      <span><i class="lvl-dot"></i>Nieuw</span><span><i class="lvl-dot l1"></i>Lastig</span>
      <span><i class="lvl-dot l2"></i>Bijna</span><span><i class="lvl-dot l3"></i>Gekend</span>
      <span><i class="lvl-dot l5"></i>Meester</span></div>`;

  /* --- rendering words --- */
  const remHTML = s => esc(s).replace(/\{([^}]*)\}/g, '<span class="rem">($1)</span>');
  const remText = s => s.replace(/\{([^}]*)\}/g, '($1)');
  const meaningHTML = w => w.senses.length > 1
    ? `<ol>${w.senses.map(s => `<li>${remHTML(s)}</li>`).join('')}</ol>`
    : remHTML(w.senses[0]);
  const meaningInline = w => w.senses.length > 1
    ? w.senses.map((s, i) => `<b>${i + 1}.</b> ${remHTML(s)}`).join(' ')
    : remHTML(w.senses[0]);
  const meaningPlain = w => w.senses.map(remText).join('; ');
  const noteHTML = w => w.note ? ` <span class="note">${esc(w.note)}</span>` : '';
  const latinInline = s => `<span class="latin-inline">${esc(s)}</span>`;
  const extraHTML = w => w.extra === '–' ? '<div class="extra">heeft geen praesens</div>'
    : `<div class="extra">praesens: ${latinInline(w.extra)}</div>`;
  const fullAnswerHTML = w => `${latinInline(w.la)}${noteHTML(w)} = ${meaningInline(w)}${w.extra ? ` <span class="rem">(praesens: ${esc(w.extra)})</span>` : ''}`;

  /* ================= Answer checking ================= */

  const stripMarks = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '');
  const normLatin = s => stripMarks(s).toLowerCase().replace(/j/g, 'i').replace(/[^a-z\s]/g, ' ').replace(/\s+/g, ' ').trim();
  const PRONOUNS = /^(?:(?:hij|zij|ze|het|ik|jij|je|wij|we|jullie|de|een|te|zich)\s+)+/;
  function normDutch(s) {
    const t = stripMarks(s).toLowerCase().replace(/[’‘`´]/g, "'").replace(/[^a-z0-9'\s]/g, ' ').replace(/\s+/g, ' ').trim();
    return t.replace(PRONOUNS, '') || t;
  }
  function splitTop(s, seps) {
    const out = []; let depth = 0, cur = '';
    for (const ch of s) {
      if (ch === '(') depth++;
      else if (ch === ')') depth = Math.max(0, depth - 1);
      if (depth === 0 && seps.includes(ch)) { out.push(cur); cur = ''; } else cur += ch;
    }
    out.push(cur);
    return out.map(x => x.trim()).filter(Boolean);
  }
  // "(be)woont" -> ["woont", "bewoont"]
  function expandOptional(s) {
    let acc = [''];
    for (const part of s.split(/(\([^()]*\))/)) {
      if (/^\(.*\)$/.test(part)) { const inner = part.slice(1, -1); acc = acc.flatMap(a => [a, a + inner]); }
      else acc = acc.map(a => a + part);
      acc = acc.slice(0, 64);
    }
    return acc;
  }
  // "brengen tot/naar" -> ["brengen tot", "brengen naar"]
  function expandSlash(s) {
    if (!s.includes('/')) return [s];
    let acc = [''];
    for (const tok of s.split(/(\s+)/)) {
      const alts = tok.includes('/') ? tok.split('/') : [tok];
      acc = acc.flatMap(a => alts.map(x => a + x)).slice(0, 64);
    }
    return acc;
  }
  const dvCache = new Map(), lvCache = new Map();
  function dutchVariants(w) {
    if (dvCache.has(w)) return dvCache.get(w);
    const out = new Set();
    for (const sense of w.senses) {
      const clean = sense.replace(/\{[^}]*\}/g, ' ').replace(/…/g, ' ');
      for (const part of [clean, ...splitTop(clean, ',;')])
        for (const a of expandOptional(part))
          for (const b of expandSlash(a)) { const n = normDutch(b); if (n) out.add(n); }
    }
    dvCache.set(w, out);
    return out;
  }
  function latinVariants(w) {
    if (lvCache.has(w)) return lvCache.get(w);
    const out = new Set();
    for (const s of [w.la, splitTop(w.la, ',')[0]])
      for (const v of expandOptional(s))
        for (const x of expandSlash(v)) { const n = normLatin(x); if (n) out.add(n); }
    lvCache.set(w, out);
    return out;
  }
  const meaningKey = w => normDutch(w.senses.join(' ').replace(/\{[^}]*\}/g, ' '));
  const BY_MEANING = new Map();
  for (const w of ALL_WORDS) { const k = meaningKey(w); if (!BY_MEANING.has(k)) BY_MEANING.set(k, []); BY_MEANING.get(k).push(w); }

  function lev(a, b) {
    if (Math.abs(a.length - b.length) > 2) return 3;
    let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) {
      const cur = [i];
      for (let j = 1; j <= b.length; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = cur;
    }
    return prev[b.length];
  }
  function near(a, b) {
    const len = Math.max(a.length, b.length);
    if (Math.min(a.length, b.length) < 4) return false;
    return lev(a, b) <= (len >= 9 ? 2 : 1);
  }

  function checkDutch(input, w) {
    const whole = normDutch(input);
    if (!whole) return { res: 'empty' };
    const vars = dutchVariants(w);
    if (vars.has(whole)) return { res: 'ok' };
    const parts = input.split(/[,;/]|\s+of\s+/).map(normDutch).filter(Boolean);
    if (parts.some(p => vars.has(p))) return { res: 'ok' };
    for (const p of [whole, ...parts]) for (const v of vars) if (near(p, v)) return { res: 'almost' };
    return { res: 'no' };
  }
  function checkLatin(input, w) {
    const n = normLatin(input);
    if (!n) return { res: 'empty' };
    const vars = latinVariants(w);
    if (vars.has(n)) return { res: 'ok' };
    for (const o of BY_MEANING.get(meaningKey(w)) || []) {
      if (o.key !== w.key && (o.kind === 'perfecta') === (w.kind === 'perfecta') && latinVariants(o).has(n)) return { res: 'ok', alt: o };
    }
    for (const v of vars) if (near(n, v)) return { res: 'almost' };
    return { res: 'no' };
  }

  // Two words are "confusable" if either would also be a right answer for the other.
  function overlaps(a, b) {
    if (a.key === b.key) return true;
    const la = latinVariants(a), lb = latinVariants(b);
    for (const x of la) if (lb.has(x)) return true;
    const da = dutchVariants(a), db = dutchVariants(b);
    for (const x of da) if (db.has(x)) return true;
    return false;
  }
  function buildOptions(item, pool) {
    const target = item.w;
    const text = w => item.dir === 'la-nl' ? normDutch(meaningPlain(w)) : normLatin(w.la);
    const picked = [target];
    const ok = c => !picked.some(p => overlaps(p, c) || text(p) === text(c)) && (c.kind === 'perfecta') === (target.kind === 'perfecta');
    const near = ALL_WORDS.filter(w => Math.abs(LESSON_BY_ID.get(w.lesson).chapter - LESSON_BY_ID.get(target.lesson).chapter) <= 2);
    for (const src of [pool, near, ALL_WORDS]) {
      for (const c of shuffle(src.slice())) {
        if (picked.length >= 4) break;
        if (ok(c)) picked.push(c);
      }
    }
    return shuffle(picked).map(w => ({ w, correct: w === target }));
  }

  /* ================= UI chrome ================= */

  function updateChip() {
    const p = profile();
    $('.profile-chip').hidden = !p;
    if (p) { $('#chip-avatar').textContent = p.avatar; $('#chip-name').textContent = p.name; }
  }
  function openDialog(html) { dlg.innerHTML = html; if (!dlg.open) dlg.showModal(); }
  function closeDialog() { if (dlg.open) dlg.close(); }
  dlg.addEventListener('click', e => { if (e.target === dlg) closeDialog(); });

  let toastTimer;
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg; t.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2400);
  }
  function confetti() {
    const box = document.createElement('div');
    box.className = 'confetti';
    const colors = ['#b8532c', '#4f7a3a', '#c9951f', '#e08a5f', '#7aa65a', '#e3be4f'];
    for (let i = 0; i < 90; i++) {
      const p = document.createElement('i');
      p.style.left = Math.random() * 100 + 'vw';
      p.style.background = colors[i % colors.length];
      p.style.animationDuration = 1.8 + Math.random() * 1.8 + 's';
      p.style.animationDelay = Math.random() * .5 + 's';
      p.style.transform = `rotate(${Math.random() * 360}deg)`;
      box.appendChild(p);
    }
    document.body.appendChild(box);
    setTimeout(() => box.remove(), 4500);
  }

  const bar = document.createElement('div');
  bar.className = 'practice-bar';
  document.body.appendChild(bar);

  let view = 'home';
  function show(v) {
    view = v;
    bar.hidden = !(v === 'home' || v === 'list');
    if (!bar.hidden) renderBar();
  }

  /* ================= Welcome & profiles ================= */

  const AVATARS = ['🦉', '🦊', '🐺', '🦁', '🐴', '🐢', '🦅', '🐬', '🐱', '🐶', '🐻', '🐼', '🦄', '🐉', '🏛️', '⚔️'];
  function profileFormHTML(p) {
    const cur = p?.avatar || AVATARS[Math.floor(Math.random() * 8)];
    return `<label><div class="field-label">Naam</div>
        <input class="text-input" id="pf-name" maxlength="20" autocomplete="off" placeholder="Bijvoorbeeld: Julia" value="${esc(p?.name || '')}"></label>
      <div><div class="field-label">Kies een plaatje</div>
        <div class="avatar-pick">${AVATARS.map(a => `<button type="button" data-action="pick-avatar" data-av="${a}" aria-pressed="${a === cur}" aria-label="Plaatje ${a}">${a}</button>`).join('')}</div></div>`;
  }
  function saveProfile(root, editId) {
    const name = $('#pf-name', root).value.trim() || 'Leerling';
    const avatar = $('.avatar-pick [aria-pressed="true"]', root)?.dataset.av || '🦉';
    if (editId) Object.assign(state.profiles.find(p => p.id === editId), { name, avatar });
    else {
      const p = { id: uid(), name, avatar, prefs: { ...DEFAULT_PREFS } };
      state.profiles.push(p);
      state.current = p.id;
    }
    save(); closeDialog(); updateChip(); renderHome();
  }

  function renderWelcome() {
    show('welcome');
    updateChip();
    app.innerHTML = `<section class="welcome">
      <h1>Salve!</h1>
      <p>Welkom bij de Fortuna-flashcards. Wie gaat er oefenen?</p>
      <div class="panel" id="welcome-form">
        ${profileFormHTML()}
        <button class="btn btn-primary" data-action="save-profile">Beginnen ▸</button>
      </div>
      <p>Je voortgang wordt alleen in deze browser bewaard — geen account nodig.</p>
    </section>`;
  }

  function openProfiles() {
    const cur = profile();
    openDialog(`<div class="dlg">
      <div class="dlg-head"><h2 id="dialog-title">Wie oefent er?</h2><button class="icon-btn" data-action="close" aria-label="Sluiten">✕</button></div>
      <div class="profiles">
        ${state.profiles.map(p => {
          const known = Object.values(state.prog[p.id] || {}).filter(e => e[0] >= 3).length;
          return `<button class="profile-card" data-action="switch" data-pid="${p.id}" aria-current="${p.id === state.current}">
            <span class="avatar">${p.avatar}</span>${esc(p.name)}<small>${known} gekend</small></button>`;
        }).join('')}
        <button class="profile-card" data-action="new-profile"><span class="avatar">＋</span>Nieuwe speler<small>&nbsp;</small></button>
      </div>
      <div><div class="field-label">${esc(cur.avatar)} ${esc(cur.name)}</div>
        <div class="link-row">
          <button class="btn btn-small" data-action="edit-profile">✏️ Naam of plaatje</button>
          <button class="btn btn-small" data-action="reset-progress">↺ Voortgang wissen</button>
          ${state.profiles.length > 1 ? '<button class="btn btn-small danger" data-action="delete-profile">Speler verwijderen</button>' : ''}
        </div></div>
      <div><div class="field-label">Back-up</div>
        <div class="link-row">
          <button class="btn btn-small" data-action="export">⬇️ Voortgang opslaan</button>
          <button class="btn btn-small" data-action="import">⬆️ Voortgang laden</button>
        </div>
        <p class="chapter-note">Alles wordt alleen op dit apparaat bewaard. Met een back-up neem je de voortgang mee naar een ander apparaat.</p>
      </div>
    </div>`);
  }
  function openProfileForm(p) {
    openDialog(`<div class="dlg" id="profile-form" data-edit="${p ? p.id : ''}">
      <div class="dlg-head"><h2 id="dialog-title">${p ? 'Speler aanpassen' : 'Nieuwe speler'}</h2><button class="icon-btn" data-action="close" aria-label="Sluiten">✕</button></div>
      ${profileFormHTML(p)}
      <div class="dlg-foot"><button class="btn btn-ghost" data-action="profiles">Annuleren</button><button class="btn btn-primary" data-action="save-profile">Opslaan</button></div>
    </div>`);
    setTimeout(() => $('#pf-name')?.focus(), 50);
  }

  function exportProgress() {
    const blob = new Blob([JSON.stringify(state, null, 1)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `fortuna-voortgang-${dayStr()}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
  function importProgress() {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = 'application/json,.json';
    input.onchange = async () => {
      try {
        const data = JSON.parse(await input.files[0].text());
        if (!data || data.v !== 1 || !Array.isArray(data.profiles)) throw new Error('bad');
        if (!confirm('Dit vervangt alle spelers en voortgang op dit apparaat. Doorgaan?')) return;
        state = Object.assign(freshState(), data);
        if (!state.profiles.some(p => p.id === state.current)) state.current = state.profiles[0]?.id || null;
        save(); closeDialog(); boot(); toast('Voortgang geladen');
      } catch (e) { toast('Dit bestand kan ik niet lezen'); }
    };
    input.click();
  }

  /* ================= Home ================= */

  function renderHome() {
    if (!profile()) return renderWelcome();
    show('home');
    updateChip();
    const p = profile();
    const sel = selection();
    const all = unique(ALL_WORDS);
    const known = all.filter(w => box(w) >= 3).length;
    const hard = all.filter(w => box(w) === 1);
    const streak = streakNow();
    app.innerHTML = `
      <section class="hero">
        <div>
          <h1>Salve, ${esc(p.name)}!</h1>
          <p>Kies hieronder wat je wilt oefenen.</p>
          <div class="stats">
            <span class="stat">🔥 <b>${streak}</b> ${streak === 1 ? 'dag' : 'dagen'} op rij</span>
            <span class="stat" title="Woorden die je goed kent">✅ <b>${known}</b> / ${all.length} gekend</span>
            <span class="stat" title="Antwoorden vandaag">📅 <b>${todayCount()}</b> vandaag</span>
          </div>
        </div>
        <div class="hero-actions">
          ${hard.length ? `<button class="btn btn-primary" data-action="hard">💪 Lastige woorden (${hard.length})</button>` : ''}
          <button class="btn" data-action="list-all">📖 Woordenlijst</button>
        </div>
      </section>
      <div class="section-head"><h2>Lessen</h2><p>Tik op een onderdeel om het te kiezen</p></div>
      ${LEGEND}
      <div class="chapters">${CHAPTERS.map(ch => chapterHTML(ch, sel)).join('')}</div>`;
  }

  function chapterHTML(ch, sel) {
    const st = statsFor(ch.lessons.flatMap(l => l.words));
    const nSel = ch.lessons.filter(l => sel.has(l.id)).length;
    const allSel = nSel === ch.lessons.length;
    return `<article class="chapter ${nSel ? 'has-selection' : ''}">
      <div class="chapter-head">
        <button class="chapter-title" data-action="toggle-chapter" data-ch="${ch.n}" aria-label="${allSel ? 'Niets' : 'Alles'} kiezen van les ${ch.n}">
          <span class="chapter-num">${ch.n}</span>
          <span><span class="chapter-name">Les ${ch.n}</span>
          <span class="chapter-meta">${st.n} woorden · ${allSel ? 'alles gekozen' : 'tik hier voor alles'}</span></span>
        </button>
        <span class="chapter-pct" title="Hoe goed je deze les kent">${st.pct}%</span>
      </div>
      <div class="chips">${ch.lessons.map(l => chipHTML(l, sel)).join('')}</div>
      ${CHAPTER_NOTES[ch.n] ? `<p class="chapter-note">${esc(CHAPTER_NOTES[ch.n])}</p>` : ''}
    </article>`;
  }
  function chipHTML(l, sel) {
    const st = statsFor(l.words);
    return `<button class="chip" data-action="toggle" data-id="${l.id}" aria-pressed="${sel.has(l.id)}" title="${esc(l.title)}">
      <span class="chip-check" aria-hidden="true">✓</span>
      ${st.pct === 100 ? '<span class="chip-done" title="Alles gekend!">🏅</span>' : ''}
      <span class="chip-label">${esc(l.short)}</span>
      <span class="chip-sub">${l.words.length} woorden · ${st.pct}%</span>
      ${meterHTML(st)}
    </button>`;
  }

  function renderBar() {
    const sel = selection();
    const ids = LESSONS.filter(l => sel.has(l.id));
    const n = wordsOf(ids.map(l => l.id)).length;
    const labels = ids.map(l => l.label);
    const labelText = labels.length > 6 ? labels.slice(0, 6).join(', ') + ` en nog ${labels.length - 6}` : labels.join(', ');
    bar.innerHTML = `<div class="practice-inner">
      <div class="practice-info">${ids.length
        ? `<strong>${plural(ids.length, 'onderdeel', 'onderdelen')} · ${n} woorden</strong><span>${esc(labelText)}</span>`
        : '<strong>Nog niets gekozen</strong><span>Kies een of meer onderdelen hierboven</span>'}</div>
      <div class="practice-actions">
        ${ids.length ? `<button class="btn btn-ghost" data-action="clear">Wis</button>${view === 'list' ? '' : '<button class="btn" data-action="list">📖 Lijst</button>'}` : ''}
        <button class="btn btn-primary" data-action="setup" ${ids.length ? '' : 'disabled'}>Oefenen ▸</button>
      </div></div>`;
  }

  /* ================= Word list ================= */

  let listIds = [];
  function renderList(ids, q = '') {
    show('list');
    listIds = ids;
    app.innerHTML = `
      <div class="list-tools">
        <button class="btn" data-action="home">← Terug</button>
        <input class="text-input" id="search" type="search" placeholder="Zoek een woord (Latijn of Nederlands)…" value="${esc(q)}" autocomplete="off">
        <button class="btn" data-action="print">🖨️ Print</button>
      </div>
      ${LEGEND}
      <div id="list-body"></div>`;
    fillList(q);
  }
  function fillList(q) {
    const body = $('#list-body');
    let groups;
    if (q.trim()) {
      const ql = normLatin(q), qd = normDutch(q);
      groups = LESSONS.map(l => ({ l, words: l.words.filter(w =>
        (ql && normLatin(w.la).includes(ql)) || (qd && normDutch(meaningPlain(w)).includes(qd))) }))
        .filter(g => g.words.length);
    } else {
      const ls = listIds.length ? LESSONS.filter(l => listIds.includes(l.id)) : LESSONS;
      groups = ls.map(l => ({ l, words: l.words }));
    }
    body.innerHTML = groups.length ? groups.map(({ l, words }) => `
      <section class="word-section">
        <h3>${esc(l.title)} <small>les ${l.chapter} · ${plural(words.length, 'woord', 'woorden')}</small></h3>
        <div class="words">${words.map(w => `
          <div class="word-row">${dotHTML(w)}
            <div class="wl-latin">${esc(w.la)}${noteHTML(w)}</div>
            <div class="wl-meaning">${w.senses.length > 1 ? `<ol>${w.senses.map(s => `<li>${remHTML(s)}</li>`).join('')}</ol>` : remHTML(w.senses[0])}
              ${w.extra ? `<span class="wl-extra">praesens: ${esc(w.extra)}</span>` : ''}</div>
          </div>`).join('')}</div>
      </section>`).join('') : '<p class="empty">Geen woorden gevonden.</p>';
  }

  /* ================= Practice setup ================= */

  let setupCtx = null;
  function segBtn(k, v, cur, label, sub = '', emoji = '') {
    return `<button type="button" data-action="seg" data-k="${k}" data-v="${v}" aria-pressed="${String(cur) === String(v)}">
      ${emoji ? `<span class="emoji" aria-hidden="true">${emoji}</span>` : ''}${label}${sub ? `<small>${sub}</small>` : ''}</button>`;
  }
  function openSetup(words, label) {
    setupCtx = { words, label };
    const pr = prefs();
    const uniq = unique(words);
    const notKnown = uniq.filter(w => box(w) < 3).length;
    const counts = [10, 20].filter(c => c < uniq.length);
    if (pr.count !== 'all' && !counts.includes(pr.count)) pr.count = counts.length ? counts[counts.length - 1] : 'all';
    openDialog(`<div class="dlg">
      <div class="dlg-head"><div><h2 id="dialog-title">Oefenen</h2><div class="chapter-meta">${esc(label)} · ${uniq.length} woorden</div></div>
        <button class="icon-btn" data-action="close" aria-label="Sluiten">✕</button></div>
      <div><div class="field-label">Hoe wil je oefenen?</div>
        <div class="seg">
          ${segBtn('mode', 'cards', pr.mode, 'Kaartjes', 'omdraaien', '🃏')}
          ${segBtn('mode', 'quiz', pr.mode, 'Kiezen', '4 antwoorden', '🔘')}
          ${segBtn('mode', 'type', pr.mode, 'Typen', 'zelf schrijven', '⌨️')}
        </div></div>
      <div><div class="field-label">Richting</div>
        <div class="seg">
          ${segBtn('dir', 'la-nl', pr.dir, 'Latijn → NL')}
          ${segBtn('dir', 'nl-la', pr.dir, 'NL → Latijn')}
          ${segBtn('dir', 'mix', pr.dir, 'Door elkaar')}
        </div></div>
      <div><div class="field-label">Hoeveel woorden?</div>
        <div class="seg">
          ${counts.map(c => segBtn('count', c, pr.count, String(c))).join('')}
          ${segBtn('count', 'all', pr.count, `Alle ${uniq.length}`)}
        </div></div>
      <label class="toggle-row"><span>Alleen woorden die ik nog niet ken<small>${notKnown} van de ${uniq.length} woorden</small></span>
        <input type="checkbox" class="switch" id="only-new" ${pr.onlyNew ? 'checked' : ''}></label>
      <div class="dlg-foot"><button class="btn btn-primary" data-action="start" style="flex:1">Start ▸</button></div>
    </div>`);
  }

  /* ================= Session ================= */

  let S = null;
  function startSession(words, opts, label) {
    let pool = unique(words);
    if (opts.onlyNew) pool = pool.filter(w => box(w) < 3);
    if (!pool.length) { toast('Je kent deze woorden al allemaal! 🎉'); return false; }
    const ranked = pool.map(w => ({ w, r: Math.min(box(w), 4) + Math.random() * 1.6 })).sort((a, b) => a.r - b.r).map(x => x.w);
    const chosen = shuffle(opts.count === 'all' ? ranked : ranked.slice(0, opts.count));
    S = {
      mode: opts.mode, opts, label, src: words,
      queue: chosen.map(w => ({ w, dir: opts.dir === 'mix' ? (Math.random() < .5 ? 'la-nl' : 'nl-la') : opts.dir, tries: 0 })),
      total: chosen.length, done: 0, firstOk: 0, missed: [], cur: null, phase: 'ask', shownPct: 0,
    };
    closeDialog();
    show('session');
    history.pushState({ v: 'session' }, '', '#oefenen');
    next();
    return true;
  }

  function next() {
    clearTimeout(S.autoTimer);
    if (!S.queue.length) return renderResults();
    S.cur = S.queue.shift();
    S.phase = 'ask';
    S.cur.typed = '';
    S.cur.check = null;
    S.cur.chosen = null;
    S.cur.lvl = box(S.cur.w);
    S.cur.again = S.cur.tries > 0;
    if (S.mode === 'quiz') S.cur.options = buildOptions(S.cur, unique(S.src));
    renderSession();
  }

  function grade(ok) {
    const it = S.cur;
    if (it.tries === 0) {
      it.undo = record(it.w, ok);
      if (ok) S.firstOk++; else S.missed.push(it.w);
    }
    it.tries++;
    it.lastOk = ok;
    if (ok) S.done++;
    else S.queue.splice(Math.min(3, S.queue.length), 0, it);
  }

  function override() {
    const it = S.cur;
    const i = S.queue.indexOf(it);
    if (i >= 0) S.queue.splice(i, 1);
    if (it.tries === 1 && it.undo) {
      it.undo();
      it.undo = record(it.w, true);
      S.firstOk++;
      S.missed = S.missed.filter(w => w !== it.w);
    }
    it.lastOk = true;
    S.done++;
    next();
  }

  function faceHTML(it, side) {
    const w = it.w;
    const perf = w.kind === 'perfecta';
    const latinQ = it.dir === 'la-nl';
    const longCls = w.la.length > 22 ? ' long' : '';
    if (side === 'q') {
      return latinQ
        ? `<span class="face-tag">${perf ? 'Perfectum' : 'Latijn'}</span>
           <div class="latin${longCls}">${esc(w.la)}</div>${w.note ? `<span class="note">${esc(w.note)}</span>` : ''}`
        : `<span class="face-tag">Nederlands</span>
           <div class="meaning">${meaningHTML(w)}</div>
           ${perf ? `<div class="extra">${w.extra === '–' ? 'perfectum (zonder praesens)' : `perfectum van ${latinInline(w.extra)}`}</div>` : ''}`;
    }
    return latinQ
      ? `<span class="face-tag">Betekenis</span>
         <div class="small-latin">${esc(w.la)}${noteHTML(w)}</div>
         <div class="meaning">${meaningHTML(w)}</div>${w.extra ? extraHTML(w) : ''}`
      : `<span class="face-tag">Latijn</span>
         <div class="latin${longCls}">${esc(w.la)}</div>${w.note ? `<span class="note">${esc(w.note)}</span>` : ''}
         ${w.extra ? extraHTML(w) : ''}`;
  }

  function renderSession() {
    const it = S.cur;
    const b = it.lvl;
    const lesson = LESSON_BY_ID.get(it.w.lesson);
    const pct = S.done / S.total * 100;
    let body = '';
    if (S.mode === 'cards') body = cardsHTML(it);
    else if (S.mode === 'quiz') body = quizHTML(it);
    else body = typeHTML(it);
    app.innerHTML = `<div class="session">
      <div class="session-top">
        <button class="icon-btn" data-action="quit" aria-label="Stoppen">✕</button>
        <div class="progress" role="progressbar" aria-label="Voortgang" aria-valuemin="0" aria-valuenow="${S.done}" aria-valuemax="${S.total}"><span style="width:${S.shownPct}%"></span></div>
        <span class="counter">${S.done} / ${S.total}</span>
      </div>
      <div class="session-meta"><span>${esc(lesson.label === lesson.id ? `Tekst ${lesson.id}` : lesson.label)}${it.again ? ' · nog een keer' : ''}</span>
        <span class="lvl-badge"><i class="lvl-dot l${b}"></i>${LEVEL_NAMES[b]}</span></div>
      ${body}
    </div>`;
    requestAnimationFrame(() => { const s = $('.progress span'); if (s) s.style.width = pct + '%'; });
    S.shownPct = pct;
    if (S.mode === 'type' && S.phase === 'ask') $('#answer')?.focus();
    else app.focus({ preventScroll: true });
  }

  /* --- flashcards --- */
  function cardsHTML(it) {
    return `<div class="card-wrap">
        <div class="card ${S.phase === 'shown' ? 'flipped' : ''}" data-action="flip" role="button" aria-label="Kaart omdraaien">
          <div class="card-face front">${faceHTML(it, 'q')}<span class="face-hint">Tik om de kaart om te draaien</span></div>
          <div class="card-face back">${faceHTML(it, 'a')}</div>
        </div>
      </div>
      <div id="grade">${gradeHTML()}</div>`;
  }
  function gradeHTML() {
    return S.phase === 'ask'
      ? `<button class="btn btn-primary" data-action="flip" style="width:100%;min-height:60px;font-size:18px">Draai om <kbd>spatie</kbd></button>`
      : `<div class="answer-row">
          <button class="btn btn-bad" data-action="no">✗ Nog niet <kbd>←</kbd></button>
          <button class="btn btn-good" data-action="yes">✓ Ik wist het <kbd>→</kbd></button>
        </div>`;
  }
  function flip() {
    const card = $('.card');
    if (!card) return;
    if (S.phase === 'ask') {
      S.phase = 'shown';
      card.classList.add('flipped');
      $('#grade').innerHTML = gradeHTML();
    } else card.classList.toggle('flipped');
  }

  /* --- multiple choice --- */
  function quizHTML(it) {
    const shown = S.phase === 'shown';
    return `<div class="card-static"><div class="card-face">${faceHTML(it, 'q')}</div></div>
      <div class="options">${it.options.map((o, i) => {
        let cls = '';
        if (shown) cls = o.correct ? 'correct' : i === it.chosen ? 'wrong' : 'dim';
        const content = it.dir === 'la-nl' ? esc(meaningPlain(o.w)) : `${esc(o.w.la)}${o.w.note ? ` <span class="note">${esc(o.w.note)}</span>` : ''}`;
        return `<button class="option ${it.dir === 'nl-la' ? 'lat' : ''} ${cls}" data-action="choose" data-i="${i}" ${shown ? 'disabled' : ''}>
          <span class="key">${i + 1}</span><span>${content}</span></button>`;
      }).join('')}</div>
      ${shown ? feedbackHTML(it) : ''}`;
  }
  function choose(i) {
    if (S.phase !== 'ask') return;
    const it = S.cur;
    it.chosen = i;
    const ok = it.options[i].correct;
    grade(ok);
    S.phase = 'shown';
    renderSession();
    if (ok) S.autoTimer = setTimeout(next, 1100);
  }

  /* --- typing --- */
  function typeHTML(it) {
    const shown = S.phase === 'shown';
    const cls = shown ? (it.check.res === 'ok' || it.check.res === 'almost' ? 'ok' : 'bad') : '';
    return `<div class="card-static"><div class="card-face">${faceHTML(it, 'q')}</div></div>
      <form class="type-form" data-form="type" autocomplete="off">
        <input class="text-input ${cls}" id="answer" name="answer" aria-label="Jouw antwoord"
          placeholder="${it.dir === 'la-nl' ? 'Typ de betekenis…' : 'Typ het Latijnse woord…'}"
          autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="done"
          value="${esc(it.typed || '')}" ${shown ? 'disabled' : ''}>
        ${shown ? '' : '<button class="btn btn-primary" type="submit">Check</button>'}
      </form>
      ${shown ? feedbackHTML(it) : '<div class="hint-line"><button class="btn btn-ghost btn-small" data-action="dontknow">Weet ik niet</button></div>'}`;
  }
  function submitTyped(value) {
    if (S.phase !== 'ask') return;
    const it = S.cur;
    const check = it.dir === 'la-nl' ? checkDutch(value, it.w) : checkLatin(value, it.w);
    if (check.res === 'empty') { $('#answer')?.classList.add('shake'); setTimeout(() => $('#answer')?.classList.remove('shake'), 350); return; }
    it.typed = value;
    it.check = check;
    grade(check.res === 'ok' || check.res === 'almost');
    S.phase = 'shown';
    renderSession();
  }
  function dontKnow() {
    if (S.phase !== 'ask') return;
    const it = S.cur;
    it.typed = '';
    it.check = { res: 'skip' };
    grade(false);
    S.phase = 'shown';
    renderSession();
  }

  const PRAISE_OK = ['Recte!', 'Bene!', 'Optime!', 'Euge!'];
  function feedbackHTML(it) {
    const ok = it.lastOk;
    const res = it.check?.res;
    let cls = ok ? 'good' : 'bad', title;
    if (res === 'almost') { cls = 'almost'; title = 'Bijna goed! Let op de spelling.'; }
    else if (ok) title = `${PRAISE_OK[Math.floor(Math.random() * PRAISE_OK.length)]} Goed zo ✓`;
    else if (res === 'skip') title = 'Geeft niet — zo is het:';
    else title = 'Helaas, nog niet goed';
    const alt = it.check?.alt ? `<div>Ook goed! Hier werd bedoeld: ${latinInline(it.w.la)}</div>` : '';
    const typed = S.mode === 'type' && it.typed && !ok ? `<div>Jij schreef: <i>${esc(it.typed)}</i></div>` : '';
    const canOverride = S.mode === 'type' && !ok && res === 'no';
    return `<div class="feedback ${cls}" role="status">
      <div class="feedback-title">${title}</div>
      ${typed}${alt}
      <div class="fb-answer">${fullAnswerHTML(it.w)}</div>
      <div class="feedback-actions">
        ${canOverride ? '<button class="btn btn-small btn-ghost" data-action="override">Ik had het toch goed</button>' : '<span></span>'}
        <button class="btn btn-primary" data-action="next">Verder <kbd>enter</kbd></button>
      </div>
    </div>`;
  }

  /* --- results --- */
  function renderResults() {
    show('results');
    history.replaceState(null, '', location.pathname + location.search);
    const pct = S.total ? S.firstOk / S.total : 0;
    const [praise, nl, stars] = pct >= .95 ? ['Optime!', 'Uitstekend — alles in één keer goed!', 3]
      : pct >= .75 ? ['Bene!', 'Goed gedaan!', 2]
      : pct >= .5 ? ['Satis bene!', 'Aardig goed — oefen de fouten nog even.', 1]
      : ['Perge!', 'Ga door, het komt steeds beter!', 0];
    const missed = unique(S.missed);
    app.innerHTML = `<div class="results">
      <div class="result-card">
        <div class="stars" aria-label="${stars} van 3 sterren">${[1, 2, 3].map(i => `<span class="${i <= stars ? '' : 'off'}">⭐</span>`).join('')}</div>
        <div class="result-praise">${praise}</div>
        <div class="result-praise-nl">${nl}</div>
        <div class="result-score"><b>${S.firstOk}</b> van ${S.total} in één keer goed</div>
      </div>
      <div class="result-actions">
        ${missed.length ? `<button class="btn btn-primary" data-action="retry-missed">💪 Oefen de ${plural(missed.length, 'fout', 'fouten')}</button>` : ''}
        <button class="btn ${missed.length ? '' : 'btn-primary'}" data-action="again">↻ Nog een ronde</button>
        <button class="btn" data-action="home">Naar overzicht</button>
      </div>
      ${missed.length ? `<div class="missed"><h3>Deze woorden waren lastig</h3>
        <div class="words">${missed.map(w => `<div class="word-row">${dotHTML(w)}
          <div class="wl-latin">${esc(w.la)}${noteHTML(w)}</div><div class="wl-meaning">${meaningInline(w)}</div></div>`).join('')}</div></div>` : ''}
    </div>`;
    app.focus({ preventScroll: true });
    window.scrollTo(0, 0);
    if (stars === 3) confetti();
  }

  /* ================= Events ================= */

  document.addEventListener('click', e => {
    const el = e.target.closest('[data-action]');
    if (!el || el.disabled) return;
    const a = el.dataset.action;
    switch (a) {
      case 'home': closeDialog(); if (view === 'session' && !confirmQuit()) return; renderHome(); window.scrollTo(0, 0); break;
      case 'profiles': openProfiles(); break;
      case 'close': closeDialog(); break;
      case 'switch': state.current = el.dataset.pid; save(); closeDialog(); renderHome(); break;
      case 'new-profile': openProfileForm(null); break;
      case 'edit-profile': openProfileForm(profile()); break;
      case 'pick-avatar':
        el.parentElement.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b === el)));
        break;
      case 'save-profile': {
        const root = el.closest('#profile-form, #welcome-form');
        saveProfile(root, root.dataset.edit || null);
        break;
      }
      case 'reset-progress':
        if (confirm(`Alle voortgang van ${profile().name} wissen? Dit kan niet ongedaan worden.`)) {
          delete state.prog[state.current]; delete state.days[state.current]; save(); closeDialog(); renderHome(); toast('Voortgang gewist');
        }
        break;
      case 'delete-profile': {
        const p = profile();
        if (confirm(`Speler ${p.name} en alle voortgang verwijderen?`)) {
          state.profiles = state.profiles.filter(x => x.id !== p.id);
          delete state.prog[p.id]; delete state.days[p.id]; delete state.sel[p.id];
          state.current = state.profiles[0]?.id || null;
          save(); closeDialog(); boot();
        }
        break;
      }
      case 'export': exportProgress(); break;
      case 'import': importProgress(); break;

      case 'toggle': {
        const sel = selection();
        sel.has(el.dataset.id) ? sel.delete(el.dataset.id) : sel.add(el.dataset.id);
        setSelection(sel); renderHome();
        break;
      }
      case 'toggle-chapter': {
        const sel = selection();
        const ids = CHAPTERS.find(c => c.n === +el.dataset.ch).lessons.map(l => l.id);
        const all = ids.every(id => sel.has(id));
        ids.forEach(id => all ? sel.delete(id) : sel.add(id));
        setSelection(sel); renderHome();
        break;
      }
      case 'clear': setSelection(new Set()); view === 'list' ? renderList([], $('#search')?.value || '') : renderHome(); break;
      case 'list': renderList([...selection()]); window.scrollTo(0, 0); break;
      case 'list-all': renderList([]); window.scrollTo(0, 0); break;
      case 'print': window.print(); break;
      case 'setup': {
        const ids = [...selection()];
        openSetup(wordsOf(ids), LESSONS.filter(l => ids.includes(l.id)).map(l => l.label).join(', '));
        break;
      }
      case 'hard': openSetup(unique(ALL_WORDS).filter(w => box(w) === 1), 'Lastige woorden'); break;
      case 'seg': {
        const pr = prefs();
        const v = el.dataset.v;
        pr[el.dataset.k] = el.dataset.k === 'count' && v !== 'all' ? +v : v;
        save();
        el.parentElement.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b === el)));
        break;
      }
      case 'start': {
        const pr = prefs();
        pr.onlyNew = $('#only-new').checked;
        save();
        startSession(setupCtx.words, { ...pr }, setupCtx.label);
        break;
      }

      case 'quit': if (confirmQuit()) { history.back(); } break;
      case 'flip': flip(); break;
      case 'yes': if (S.phase === 'shown') { grade(true); next(); } break;
      case 'no': if (S.phase === 'shown') { grade(false); next(); } break;
      case 'choose': choose(+el.dataset.i); break;
      case 'dontknow': dontKnow(); break;
      case 'next': next(); break;
      case 'override': override(); break;
      case 'again': startSession(S.src, { ...S.opts }, S.label); break;
      case 'retry-missed': startSession(unique(S.missed), { ...S.opts, count: 'all', onlyNew: false }, 'Fouten'); break;
    }
  });

  function confirmQuit() {
    return !(S && view === 'session' && S.done > 0 && S.queue.length) || confirm('Stoppen met oefenen? Wat je al gedaan hebt, blijft bewaard.');
  }

  document.addEventListener('submit', e => {
    if (e.target.matches('[data-form="type"]')) { e.preventDefault(); submitTyped($('#answer').value); }
  });
  document.addEventListener('input', e => {
    if (e.target.id === 'search') fillList(e.target.value);
  });
  document.addEventListener('keydown', e => {
    if (view !== 'session' || dlg.open || !S?.cur || e.metaKey || e.ctrlKey || e.altKey) return;
    const onControl = e.target.closest?.('button, input, select, textarea, a');
    const k = e.key;
    if ((k === 'Enter' || k === ' ') && onControl) return;
    if (S.mode === 'cards') {
      if (k === ' ' || k === 'Enter' || (S.phase === 'ask' && (k === 'ArrowLeft' || k === 'ArrowRight'))) { e.preventDefault(); flip(); }
      else if (S.phase === 'shown' && (k === 'ArrowLeft' || k === '1')) { grade(false); next(); }
      else if (S.phase === 'shown' && (k === 'ArrowRight' || k === '2')) { grade(true); next(); }
    } else if (S.mode === 'quiz') {
      if (S.phase === 'ask' && /^[1-4]$/.test(k) && +k <= S.cur.options.length) choose(+k - 1);
      else if (S.phase === 'shown' && (k === 'Enter' || k === ' ')) { e.preventDefault(); next(); }
    } else if (S.phase === 'shown' && k === 'Enter') { e.preventDefault(); next(); }
  });
  window.addEventListener('popstate', () => {
    if (view === 'session' || view === 'results') { closeDialog(); renderHome(); }
  });

  function boot() {
    updateChip();
    if (location.hash) history.replaceState(null, '', location.pathname + location.search);
    profile() ? renderHome() : renderWelcome();
  }
  boot();
})();
