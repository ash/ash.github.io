// Latin paradigm engine — a faithful port of Stemma/Latin/LatinInflector.swift.
//
// paradigm(entry) turns a lexicon entry (the plain JSON object from lexicon.json,
// lang "la") into
//   { title, sections: [{ title, columns: [String], rows: [{ label, cells: [String] }] }] }
// or null. Regular patterns are computed; the handful of truly irregular words
// are tabulated. Output must stay identical to the Swift engine (checked over the
// whole lexicon by web/tests/parity.mjs).
//
// Porting notes: Swift nil is null here, and every "is it there?" test is an
// explicit `!= null` check, because an empty string is a value in Swift. String
// slicing works on UTF-16 code units, which matches Swift's Characters as long as
// the content is precomposed (NFC) without combining marks — true of the whole
// bundled lexicon today.

const CASES = ["Nom.", "Gen.", "Dat.", "Acc.", "Abl.", "Voc."];
const PERSONS = ["1 sg.", "2 sg.", "3 sg.", "1 pl.", "2 pl.", "3 pl."];
const VOWELS = new Set([..."aeiouyāēīōūȳ"]);
const DASH = "—";
const DASHES = Array(6).fill(DASH);

// MARK: - public API

/** The paradigm for a Latin entry, or null when there is none to generate. */
export function paradigm(e) {
  if (!e || e.lang !== "la") return null;
  switch (e.pos) {
    case "noun": return noun(e);
    case "adj": return adjective(e);
    case "verb": return verb(e);
    case "pron": return pronoun(e);
    default: return null;
  }
}

/** Every [description, form] pair — used by the Forms drill (Swift `Paradigm.cells`). */
export function paradigmCells(p) {
  if (!p) return [];
  return p.sections.flatMap((s) =>
    s.rows.flatMap((r) =>
      r.cells.flatMap((f, i) => {
        if (f === DASH || f === "" || i >= s.columns.length) return [];
        return [[trimWS(`${s.title.toLowerCase()} · ${r.label} ${s.columns[i]}`), f]];
      })
    )
  );
}

// MARK: - helpers

const section = (title, columns, rows) => ({ title, columns, rows });
const row = (label, cells) => ({ label, cells });

/** `s` without `suffix`, or null when it does not end in it. */
function strip(s, suffix) {
  return s.endsWith(suffix) ? s.slice(0, s.length - suffix.length) : null;
}

/** Swift `String(s.dropLast(n))`. */
function dropLast(s, n = 1) {
  return s.slice(0, Math.max(0, s.length - n));
}

/** Swift `trimmingCharacters(in: .whitespaces)`: spaces and tabs, not newlines. */
function trimWS(s) {
  return s.replace(/^[\p{Zs}\t]+|[\p{Zs}\t]+$/gu, "");
}

/** Swift `s.split(separator: ",").map { trim }` — split() drops empty pieces. */
function splitList(s) {
  return s.split(",").filter((x) => x !== "").map(trimWS);
}

/** Swift `s.components(separatedBy: CharacterSet(charactersIn: " /(")).first`. */
function firstToken(s) {
  return s.split(/[ /(]/)[0];
}

function syllables(s) {
  let n = 0;
  let prevVowel = false;
  const chars = Array.from(s.toLowerCase());
  for (let i = 0; i < chars.length; i++) {
    const c = chars[i];
    const isV = VOWELS.has(c);
    // ae, au, oe, ei (in -ei-) count as one syllable when both short
    if (isV && prevVowel && i > 0) {
      const pair = chars[i - 1] + c;
      if (pair === "ae" || pair === "au" || pair === "oe") continue;
    }
    if (isV) n += 1;
    prevVowel = isV;
  }
  return Math.max(n, 1);
}

function endsInTwoConsonants(stem) {
  const tail = Array.from(stem).slice(-2);
  return tail.length === 2 && !VOWELS.has(tail[0]) && !VOWELS.has(tail[1]);
}

// MARK: - nouns

function noun(e) {
  const nom = e.lemma;
  const g = e.g ?? "m";
  const neuter = g === "n";
  const decl = e.decl;
  const gen = e.gen;
  if (decl == null || gen == null) return null;
  if (decl === "indecl") return null;
  const irr = irregularNoun(e);
  if (irr) return irr;
  const pluralOnly = e.pluralOnly === true;
  let sg = [];
  let pl = [];
  switch (decl) {
    case "1": {
      const st = strip(gen, "ae");
      if (st == null) return null;
      const abus = nom === "dea" || nom === "fīlia";
      sg = [nom, st + "ae", st + "ae", st + "am", st + "ā", nom];
      pl = [st + "ae", st + "ārum", st + (abus ? "ābus" : "īs"), st + "ās", st + (abus ? "ābus" : "īs"), st + "ae"];
      const st2 = pluralOnly ? strip(gen, "ārum") : null;
      if (st2 != null) {
        pl = [st2 + "ae", st2 + "ārum", st2 + "īs", st2 + "ās", st2 + "īs", st2 + "ae"];
      }
      break;
    }
    case "2": {
      let st = strip(gen, "ī") ?? "";
      if (pluralOnly) {
        const s2 = strip(gen, "ōrum");
        if (s2 != null) st = s2;
      }
      if (neuter) {
        sg = [nom, st + "ī", st + "ō", nom, st + "ō", nom];
        pl = [st + "a", st + "ōrum", st + "īs", st + "a", st + "īs", st + "a"];
      } else {
        let voc = nom;
        if (nom.endsWith("ius")) voc = dropLast(nom, 3) + "ī";
        else if (nom.endsWith("us")) voc = dropLast(nom, 2) + "e";
        sg = [nom, st + "ī", st + "ō", st + "um", st + "ō", voc];
        pl = [st + "ī", st + "ōrum", st + "īs", st + "ōs", st + "īs", st + "ī"];
      }
      break;
    }
    case "3": {
      let st = strip(gen, "is") ?? "";
      if (pluralOnly) {
        const ium = strip(gen, "ium");
        const um = strip(gen, "um");
        if (ium != null) st = ium;
        else if (um != null) st = um;
      }
      const iStem = e.istem ?? guessIStem(nom, gen, st, neuter);
      if (neuter) {
        const neutI = iStem;
        sg = [nom, st + "is", st + "ī", nom, st + (neutI ? "ī" : "e"), nom];
        pl = [st + (neutI ? "ia" : "a"), st + (neutI ? "ium" : "um"), st + "ibus",
              st + (neutI ? "ia" : "a"), st + "ibus", st + (neutI ? "ia" : "a")];
      } else {
        sg = [nom, st + "is", st + "ī", st + "em", st + "e", nom];
        pl = [st + "ēs", st + (iStem ? "ium" : "um"), st + "ibus", st + "ēs", st + "ibus", st + "ēs"];
      }
      break;
    }
    case "4": {
      const st = strip(gen, "ūs") ?? "";
      if (neuter) {
        sg = [nom, st + "ūs", st + "ū", nom, st + "ū", nom];
        pl = [st + "ua", st + "uum", st + "ibus", st + "ua", st + "ibus", st + "ua"];
      } else {
        sg = [nom, st + "ūs", st + "uī", st + "um", st + "ū", nom];
        pl = [st + "ūs", st + "uum", st + "ibus", st + "ūs", st + "ibus", st + "ūs"];
      }
      break;
    }
    case "5": {
      const st = strip(gen, "ēī") ?? strip(gen, "eī");
      if (st == null) return null;
      const gd = gen.endsWith("ēī") ? "ēī" : "eī";
      sg = [nom, st + gd, st + gd, st + "em", st + "ē", nom];
      pl = [st + "ēs", st + "ērum", st + "ēbus", st + "ēs", st + "ēbus", st + "ēs"];
      break;
    }
    default:
      return null;
  }
  if (pluralOnly) {
    const rows = CASES.map((c, i) => row(c, [pl[i]]));
    return { title: "Declension", sections: [section("Plural only", ["Plural"], rows)] };
  }
  const rows = CASES.map((c, i) => row(c, [sg[i], pl[i]]));
  const name = { 1: "First", 2: "Second", 3: "Third", 4: "Fourth", 5: "Fifth" }[decl] ?? "";
  return { title: "Declension", sections: [section(`${name} declension`, ["Singular", "Plural"], rows)] };
}

function guessIStem(nom, gen, stem, neuter) {
  if (neuter) {
    return nom.endsWith("e") || nom.endsWith("al") || nom.endsWith("ar");
  }
  const exceptions = new Set(["canis", "iuvenis", "senex", "pater", "māter", "frāter", "accipiter", "vātēs", "sēdēs", "mēnsis"]);
  if (exceptions.has(nom)) return nom === "mēnsis";
  if ((nom.endsWith("is") || nom.endsWith("ēs")) && syllables(nom) === syllables(gen)) return true;
  if (syllables(nom) === 1 && endsInTwoConsonants(stem)) return true;
  return false;
}

const IRREGULAR_NOUNS = new Map([
  ["deus", [["deus", "deī", "deō", "deum", "deō", "deus"], ["dī (deī)", "deōrum (deum)", "dīs (deīs)", "deōs", "dīs (deīs)", "dī (deī)"]]],
  ["domus", [["domus", "domūs", "domuī (domō)", "domum", "domō (domū)", "domus"], ["domūs", "domuum (domōrum)", "domibus", "domōs (domūs)", "domibus", "domūs"]]],
  ["vīs", [["vīs", "—", "—", "vim", "vī", "vīs"], ["vīrēs", "vīrium", "vīribus", "vīrēs (vīrīs)", "vīribus", "vīrēs"]]],
  ["Iuppiter", [["Iuppiter", "Iovis", "Iovī", "Iovem", "Iove", "Iuppiter"], ["—", "—", "—", "—", "—", "—"]]],
  ["bōs", [["bōs", "bovis", "bovī", "bovem", "bove", "bōs"], ["bovēs", "boum", "bōbus (būbus)", "bovēs", "bōbus (būbus)", "bovēs"]]],
  ["senex", [["senex", "senis", "senī", "senem", "sene", "senex"], ["senēs", "senum", "senibus", "senēs", "senibus", "senēs"]]],
  ["iter", [["iter", "itineris", "itinerī", "iter", "itinere", "iter"], ["itinera", "itinerum", "itineribus", "itinera", "itineribus", "itinera"]]],
]);

function irregularNoun(e) {
  const t = IRREGULAR_NOUNS.get(e.lemma);
  if (!t) return null;
  const [sg, pl] = t;
  const rows = CASES.map((c, i) => row(c, [sg[i], pl[i]]));
  return { title: "Declension", sections: [section("Irregular", ["Singular", "Plural"], rows)] };
}

// MARK: - adjectives

const PRONOMINAL = new Set(["ūnus", "sōlus", "tōtus", "nūllus", "ūllus", "alius", "alter", "uter", "neuter", "uterque"]);
const LLIMUS = new Set(["facilis", "difficilis", "similis", "dissimilis", "gracilis", "humilis"]);
const CONSONANT_ADJ = new Set(["vetus", "pauper", "dīves", "particeps", "prīnceps", "supplex", "compos", "memor", "dēgener"]);
const GENDERS = ["Masc.", "Fem.", "Neut."];

function adjective(e) {
  const a = adjectiveForms(e);
  if (!a) return null;
  const sections = [
    section("Singular", GENDERS, CASES.map((c, i) => row(c, [a.m[i], a.f[i], a.n[i]]))),
    section("Plural", GENDERS, CASES.map((c, i) => row(c, [a.m[i + 6], a.f[i + 6], a.n[i + 6]]))),
  ];
  const c = comparison(e, a);
  if (c) sections.push(section("Degrees", GENDERS, c));
  return { title: "Declension", sections };
}

/** { m, f, n }: 12 cells each (6 sg + 6 pl), or null. */
function adjectiveForms(e) {
  const lemma = e.lemma;
  const forms = splitList(e.forms ?? "");
  // free-text forms ("pēius, gen. pēiōris") are for reading, not for generating
  if (forms.some((f) => f.includes(" ") || f.includes(".") || f.startsWith("-"))) return null;
  if (e.decl === "12") {
    if (forms.length < 2) return null;
    const fem = forms[0];
    const neu = forms[1];
    const st = strip(fem, "a");
    if (st == null) return null;
    const pron = PRONOMINAL.has(lemma);
    let mVoc = lemma;
    if (lemma.endsWith("us")) mVoc = st + "e";
    if (lemma === "meus") mVoc = "mī";
    const gsg = pron ? st + "īus" : null;
    const dsg = pron ? st + "ī" : null;
    const m = [lemma, gsg ?? st + "ī", dsg ?? st + "ō", st + "um", st + "ō", mVoc,
               st + "ī", st + "ōrum", st + "īs", st + "ōs", st + "īs", st + "ī"];
    const f = [fem, gsg ?? st + "ae", dsg ?? st + "ae", st + "am", st + "ā", fem,
               st + "ae", st + "ārum", st + "īs", st + "ās", st + "īs", st + "ae"];
    const n = [neu, gsg ?? st + "ī", dsg ?? st + "ō", neu, st + "ō", neu,
               st + "a", st + "ōrum", st + "īs", st + "a", st + "īs", st + "a"];
    if (lemma === "alius") {
      const nn = [...n];
      nn[0] = "aliud"; nn[3] = "aliud"; nn[5] = "aliud";
      const alt = (xs) => xs.map((x, i) => (i === 1 ? "alterīus" : x));
      return { m: alt(m), f: alt(f), n: alt(nn) };
    }
    return { m, f, n };
  }
  if (e.decl === "3") {
    let fNom = lemma;
    let nNom = lemma;
    let st = "";
    const one = forms.length > 0 ? forms[0] : null;
    if (lemma.endsWith("ior") && one != null && one.endsWith("ius")) {
      // comparatives (melior, dēterior, exterior): consonant stem in -iōr-
      const s0 = dropLast(lemma, 2) + "ōr";
      const m = [lemma, s0 + "is", s0 + "ī", s0 + "em", s0 + "e", lemma,
                 s0 + "ēs", s0 + "um", s0 + "ibus", s0 + "ēs", s0 + "ibus", s0 + "ēs"];
      const n = [one, s0 + "is", s0 + "ī", one, s0 + "e", one,
                 s0 + "a", s0 + "um", s0 + "ibus", s0 + "a", s0 + "ibus", s0 + "a"];
      return { m, f: m, n };
    }
    if (forms.length >= 2) {                                          // ācer, ācris, ācre
      fNom = forms[0]; nNom = forms[1];
      st = strip(fNom, "is") ?? "";
    } else if (one != null && one.endsWith("e") && lemma.endsWith("is")) {   // fortis, forte
      nNom = one; st = strip(lemma, "is") ?? "";
    } else if (one != null && one.endsWith("is")) {                   // fēlīx, fēlīcis
      st = strip(one, "is") ?? "";
    } else {
      return null;
    }
    const mNom = lemma;
    const cons = CONSONANT_ADJ.has(lemma);
    const abl = cons ? "e" : "ī";
    const gpl = cons ? "um" : "ium";
    const npl = cons ? "a" : "ia";
    const m = [mNom, st + "is", st + "ī", st + "em", st + abl, mNom,
               st + "ēs", st + gpl, st + "ibus", st + "ēs", st + "ibus", st + "ēs"];
    const f = [fNom, st + "is", st + "ī", st + "em", st + abl, fNom,
               st + "ēs", st + gpl, st + "ibus", st + "ēs", st + "ibus", st + "ēs"];
    const n = [nNom, st + "is", st + "ī", nNom, st + abl, nNom,
               st + npl, st + gpl, st + "ibus", st + npl, st + "ibus", st + npl];
    return { m, f, n };
  }
  return null;
}

function comparison(e, a) {
  if (PRONOMINAL.has(e.lemma) || e.lemma.endsWith("ior")) return null;
  const no = new Set(["meus", "tuus", "suus", "noster", "vester", "cēterus"]);
  if (no.has(e.lemma)) return null;
  if (e.cmp != null) {
    const parts = splitList(e.cmp);
    if (parts.length < 2) return null;
    const comp = parts[0];
    const sup = parts[1];
    const compN = comp.endsWith("ior") ? dropLast(comp, 3) + "ius" : comp;
    const supSt = strip(sup, "us") ?? sup;
    return [row("Comp.", [comp, comp, compN]),
            row("Sup.", [sup, supSt + "a", supSt + "um"])];
  }
  // stem = genitive singular minus ending
  const gen = a.m[1];
  const st = strip(gen, "ī") ?? strip(gen, "is") ?? "";
  if (st === "") return null;
  let sup;
  if (e.lemma.endsWith("er")) sup = e.lemma + "rimus";
  else if (LLIMUS.has(e.lemma)) sup = st + "limus";
  else sup = st + "issimus";
  const supSt = dropLast(sup, 2);
  return [row("Comp.", [st + "ior", st + "ior", st + "ius"]),
          row("Sup.", [sup, supSt + "a", supSt + "um"])];
}

// MARK: - pronouns (the common ones, tabulated)

const PERSONAL_PRONOUNS = new Map([
  ["ego", [["ego", "nōs"], ["meī", "nostrum / nostrī"], ["mihi", "nōbīs"], ["mē", "nōs"], ["mē", "nōbīs"]]],
  ["tū", [["tū", "vōs"], ["tuī", "vestrum / vestrī"], ["tibi", "vōbīs"], ["tē", "vōs"], ["tē", "vōbīs"]]],
]);

// five singular rows (m, f, n), then five plural rows
const GENDERED_PRONOUNS = new Map([
  ["hic", [["hic", "haec", "hoc"], ["huius", "huius", "huius"], ["huic", "huic", "huic"], ["hunc", "hanc", "hoc"], ["hōc", "hāc", "hōc"],
           ["hī", "hae", "haec"], ["hōrum", "hārum", "hōrum"], ["hīs", "hīs", "hīs"], ["hōs", "hās", "haec"], ["hīs", "hīs", "hīs"]]],
  ["ille", [["ille", "illa", "illud"], ["illīus", "illīus", "illīus"], ["illī", "illī", "illī"], ["illum", "illam", "illud"], ["illō", "illā", "illō"],
            ["illī", "illae", "illa"], ["illōrum", "illārum", "illōrum"], ["illīs", "illīs", "illīs"], ["illōs", "illās", "illa"], ["illīs", "illīs", "illīs"]]],
  ["iste", [["iste", "ista", "istud"], ["istīus", "istīus", "istīus"], ["istī", "istī", "istī"], ["istum", "istam", "istud"], ["istō", "istā", "istō"],
            ["istī", "istae", "ista"], ["istōrum", "istārum", "istōrum"], ["istīs", "istīs", "istīs"], ["istōs", "istās", "ista"], ["istīs", "istīs", "istīs"]]],
  ["is", [["is", "ea", "id"], ["eius", "eius", "eius"], ["eī", "eī", "eī"], ["eum", "eam", "id"], ["eō", "eā", "eō"],
          ["eī (iī)", "eae", "ea"], ["eōrum", "eārum", "eōrum"], ["eīs (iīs)", "eīs (iīs)", "eīs (iīs)"], ["eōs", "eās", "ea"], ["eīs (iīs)", "eīs (iīs)", "eīs (iīs)"]]],
  ["ipse", [["ipse", "ipsa", "ipsum"], ["ipsīus", "ipsīus", "ipsīus"], ["ipsī", "ipsī", "ipsī"], ["ipsum", "ipsam", "ipsum"], ["ipsō", "ipsā", "ipsō"],
            ["ipsī", "ipsae", "ipsa"], ["ipsōrum", "ipsārum", "ipsōrum"], ["ipsīs", "ipsīs", "ipsīs"], ["ipsōs", "ipsās", "ipsa"], ["ipsīs", "ipsīs", "ipsīs"]]],
  ["īdem", [["īdem", "eadem", "idem"], ["eiusdem", "eiusdem", "eiusdem"], ["eīdem", "eīdem", "eīdem"], ["eundem", "eandem", "idem"], ["eōdem", "eādem", "eōdem"],
            ["eīdem (īdem)", "eaedem", "eadem"], ["eōrundem", "eārundem", "eōrundem"], ["eīsdem (īsdem)", "eīsdem", "eīsdem"], ["eōsdem", "eāsdem", "eadem"], ["eīsdem", "eīsdem", "eīsdem"]]],
  ["quī", [["quī", "quae", "quod"], ["cuius", "cuius", "cuius"], ["cui", "cui", "cui"], ["quem", "quam", "quod"], ["quō", "quā", "quō"],
           ["quī", "quae", "quae"], ["quōrum", "quārum", "quōrum"], ["quibus", "quibus", "quibus"], ["quōs", "quās", "quae"], ["quibus", "quibus", "quibus"]]],
]);

function pronoun(e) {
  const personal = PERSONAL_PRONOUNS.get(e.lemma);
  if (personal) {
    const rows = personal.map((cells, i) => row(CASES[i], cells));
    return { title: "Declension", sections: [section("Personal pronoun", ["Singular", "Plural"], rows)] };
  }
  const p = GENDERED_PRONOUNS.get(e.lemma);
  if (!p) return null;
  const five = CASES.slice(0, 5);
  return {
    title: "Declension",
    sections: [
      section("Singular", GENDERS, five.map((c, i) => row(c, p[i]))),
      section("Plural", GENDERS, five.map((c, i) => row(c, p[i + 5]))),
    ],
  };
}

// MARK: - verbs

const CONJS = new Set(["1", "2", "3", "3io", "4"]);

function verb(e) {
  const pp = e.pp;
  if (pp == null || pp.length < 2) return null;
  const irr = irregularVerb(e);
  if (irr) return irr;
  const conj = e.conj;
  if (conj == null || !CONJS.has(conj)) return null;
  const s = stems(e, conj);
  if (!s) return null;
  return regular(s, e.lemma);
}

/**
 * { conj, root (am-, mon-, reg-, cap-, aud-), inf (amāre / hortārī), perfect (amāv- | null),
 *   supine (amāt- | null), deponent, semideponent, shortA (dō, dare),
 *   supineIsFuture (4th part is a future participle — parcō … parsūrus: no passive perfect) }
 */
function stems(e, conj) {
  const pp = e.pp;
  if (pp == null) return null;
  const dep = e.dep === true;
  const inf = pp[1];
  let root;
  if (dep) {
    switch (conj) {
      case "1": root = strip(inf, "ārī"); break;
      case "2": root = strip(inf, "ērī"); break;
      case "3": case "3io": root = strip(inf, "ī"); break;
      case "4": root = strip(inf, "īrī"); break;
    }
  } else {
    switch (conj) {
      case "1": root = strip(inf, "āre") ?? strip(inf, "are"); break;
      case "2": root = strip(inf, "ēre"); break;
      case "3": case "3io": root = strip(inf, "ere"); break;
      case "4": root = strip(inf, "īre"); break;
    }
  }
  if (root == null) return null;
  let perfect = null;
  let supine = null;
  let futureOnly = false;
  if (dep) {
    const p = pp.length >= 3 ? strip(pp[2], " sum") : null;
    if (p != null) supine = strip(p, "us");
  } else {
    if (pp.length >= 3 && pp[2] !== DASH) {
      perfect = strip(firstToken(pp[2]), "ī");
    }
    if (pp.length >= 4 && pp[3] !== DASH) {
      const sup = firstToken(pp[3]);
      const fut = strip(sup, "ūrus");
      if (fut != null) {
        supine = fut; futureOnly = true;
      } else {
        supine = strip(sup, "um") ?? strip(sup, "us");
      }
    }
    const p = e.semidep === true && pp.length >= 3 ? strip(pp[2], " sum") : null;
    if (p != null) {
      perfect = null;
      supine = strip(p, "us");
    }
  }
  const shortA = e.lemma === "dō" || (conj === "1" && inf.endsWith("dare") && !inf.endsWith("dāre") && e.lemma.endsWith("dō"));
  return {
    conj, root, inf, perfect, supine,
    deponent: dep, semideponent: e.semidep === true, shortA, supineIsFuture: futureOnly,
  };
}

/** Endings tables keyed by tense/mood, then conjugation. */
const ENDINGS = {
  pres: {
    1: ["ō", "ās", "at", "āmus", "ātis", "ant"],
    2: ["eō", "ēs", "et", "ēmus", "ētis", "ent"],
    3: ["ō", "is", "it", "imus", "itis", "unt"],
    "3io": ["iō", "is", "it", "imus", "itis", "iunt"],
    4: ["iō", "īs", "it", "īmus", "ītis", "iunt"],
  },
  impf: {
    1: ["ābam", "ābās", "ābat", "ābāmus", "ābātis", "ābant"],
    2: ["ēbam", "ēbās", "ēbat", "ēbāmus", "ēbātis", "ēbant"],
    3: ["ēbam", "ēbās", "ēbat", "ēbāmus", "ēbātis", "ēbant"],
    "3io": ["iēbam", "iēbās", "iēbat", "iēbāmus", "iēbātis", "iēbant"],
    4: ["iēbam", "iēbās", "iēbat", "iēbāmus", "iēbātis", "iēbant"],
  },
  fut: {
    1: ["ābō", "ābis", "ābit", "ābimus", "ābitis", "ābunt"],
    2: ["ēbō", "ēbis", "ēbit", "ēbimus", "ēbitis", "ēbunt"],
    3: ["am", "ēs", "et", "ēmus", "ētis", "ent"],
    "3io": ["iam", "iēs", "iet", "iēmus", "iētis", "ient"],
    4: ["iam", "iēs", "iet", "iēmus", "iētis", "ient"],
  },
  presP: {
    1: ["or", "āris", "ātur", "āmur", "āminī", "antur"],
    2: ["eor", "ēris", "ētur", "ēmur", "ēminī", "entur"],
    3: ["or", "eris", "itur", "imur", "iminī", "untur"],
    "3io": ["ior", "eris", "itur", "imur", "iminī", "iuntur"],
    4: ["ior", "īris", "ītur", "īmur", "īminī", "iuntur"],
  },
  impfP: {
    1: ["ābar", "ābāris", "ābātur", "ābāmur", "ābāminī", "ābantur"],
    2: ["ēbar", "ēbāris", "ēbātur", "ēbāmur", "ēbāminī", "ēbantur"],
    3: ["ēbar", "ēbāris", "ēbātur", "ēbāmur", "ēbāminī", "ēbantur"],
    "3io": ["iēbar", "iēbāris", "iēbātur", "iēbāmur", "iēbāminī", "iēbantur"],
    4: ["iēbar", "iēbāris", "iēbātur", "iēbāmur", "iēbāminī", "iēbantur"],
  },
  futP: {
    1: ["ābor", "āberis", "ābitur", "ābimur", "ābiminī", "ābuntur"],
    2: ["ēbor", "ēberis", "ēbitur", "ēbimur", "ēbiminī", "ēbuntur"],
    3: ["ar", "ēris", "ētur", "ēmur", "ēminī", "entur"],
    "3io": ["iar", "iēris", "iētur", "iēmur", "iēminī", "ientur"],
    4: ["iar", "iēris", "iētur", "iēmur", "iēminī", "ientur"],
  },
  subj: {
    1: ["em", "ēs", "et", "ēmus", "ētis", "ent"],
    2: ["eam", "eās", "eat", "eāmus", "eātis", "eant"],
    3: ["am", "ās", "at", "āmus", "ātis", "ant"],
    "3io": ["iam", "iās", "iat", "iāmus", "iātis", "iant"],
    4: ["iam", "iās", "iat", "iāmus", "iātis", "iant"],
  },
  subjP: {
    1: ["er", "ēris", "ētur", "ēmur", "ēminī", "entur"],
    2: ["ear", "eāris", "eātur", "eāmur", "eāminī", "eantur"],
    3: ["ar", "āris", "ātur", "āmur", "āminī", "antur"],
    "3io": ["iar", "iāris", "iātur", "iāmur", "iāminī", "iantur"],
    4: ["iar", "iāris", "iātur", "iāmur", "iāminī", "iantur"],
  },
};

function endings(c, table) {
  return ENDINGS[table]?.[c] ?? [];
}

/** The present infinitive active, also the base of the imperfect subjunctive. */
function activeInfinitive(s) {
  if (!s.deponent) return s.inf;
  switch (s.conj) {
    case "1": return s.root + "āre";
    case "2": return s.root + "ēre";
    case "3": case "3io": return s.root + "ere";
    case "4": return s.root + "īre";
  }
}

function passiveInfinitive(s) {
  switch (s.conj) {
    case "1": return s.root + (s.shortA ? "arī" : "ārī");
    case "2": return s.root + "ērī";
    case "3": case "3io": return s.root + "ī";
    case "4": return s.root + "īrī";
  }
}

function apply(root, ends, shortA = false) {
  return ends.map((end) => {
    let e = end;
    if (shortA && e.startsWith("ā")) {
      // dō: damus, datis, dabam, dabō — but dās and dā keep the long vowel
      if (!(e === "ās" || e === "ā")) e = "a" + e.slice(1);
    }
    return root + e;
  });
}

const personRows = (forms) => PERSONS.map((p, i) => row(p, [forms[i]]));

function twoCol(title, a, b, cols = ["Active", "Passive"]) {
  return section(title, cols, PERSONS.map((p, i) => row(p, [a[i], b[i]])));
}

/** One-column section of six persons (deponents, semi-deponents, irregular tables). */
const oneCol = (title, forms) => section(title, [""], personRows(forms));

function perfPassive(sup, aux) {
  if (sup == null) return DASHES;
  return aux.map((a, i) => (i < 3 ? sup + "us" : sup + "ī") + " " + a);
}

function regular(s, lemma) {
  const r = s.root;
  const c = s.conj;
  const hasActive = !s.deponent;
  const hasPassiveSystem = !s.semideponent;
  const act = (t) => (hasActive ? apply(r, endings(c, t), s.shortA) : DASHES);
  const pas = (t) => (hasPassiveSystem ? apply(r, endings(c, t), s.shortA) : DASHES);

  let presA = act("pres");
  if (s.shortA && hasActive) presA = [r + "ō", r + "ās", r + "at", r + "amus", r + "atis", r + "ant"];
  const impfA = act("impf");
  const futA = act("fut");
  const presP = pas("presP");
  const impfP = pas("impfP");
  const futP = pas("futP");

  // perfect system
  const pf = s.perfect;
  const perf = (ends) => (pf != null ? ends.map((x) => pf + x) : DASHES);
  const perfA = perf(["ī", "istī", "it", "imus", "istis", "ērunt"]);
  const plupA = perf(["eram", "erās", "erat", "erāmus", "erātis", "erant"]);
  const futPA = perf(["erō", "eris", "erit", "erimus", "eritis", "erint"]);
  const sumF = ["sum", "es", "est", "sumus", "estis", "sunt"];
  const eramF = ["eram", "erās", "erat", "erāmus", "erātis", "erant"];
  const eroF = ["erō", "eris", "erit", "erimus", "eritis", "erunt"];
  const passiveSup = s.supineIsFuture ? null : s.supine;
  const perfP = perfPassive(passiveSup, sumF);
  const plupP = perfPassive(passiveSup, eramF);
  const futPP = perfPassive(passiveSup, eroF);

  // subjunctive
  const subjA = act("subj");
  const subjP = pas("subjP");
  const ai = activeInfinitive(s);
  const base = dropLast(ai);   // amār-
  const impfSA = hasActive ? ["em", "ēs", "et", "ēmus", "ētis", "ent"].map((x) => base + x) : DASHES;
  const impfSP = hasPassiveSystem ? ["er", "ēris", "ētur", "ēmur", "ēminī", "entur"].map((x) => base + x) : DASHES;
  const perfSA = perf(["erim", "erīs", "erit", "erīmus", "erītis", "erint"]);
  const plupSA = perf(["issem", "issēs", "isset", "issēmus", "issētis", "issent"]);
  const perfSP = perfPassive(passiveSup, ["sim", "sīs", "sit", "sīmus", "sītis", "sint"]);
  const plupSP = perfPassive(passiveSup, ["essem", "essēs", "esset", "essēmus", "essētis", "essent"]);

  const sections = [];
  if (s.deponent) {
    // deponents: passive forms, active meaning — one column
    sections.push(oneCol("Present", presP), oneCol("Imperfect", impfP), oneCol("Future", futP),
                  oneCol("Perfect", perfP), oneCol("Pluperfect", plupP), oneCol("Future perfect", futPP),
                  oneCol("Present subjunctive", subjP), oneCol("Imperfect subjunctive", impfSP),
                  oneCol("Perfect subjunctive", perfSP), oneCol("Pluperfect subjunctive", plupSP));
  } else if (s.semideponent) {
    sections.push(oneCol("Present", presA), oneCol("Imperfect", impfA), oneCol("Future", futA),
                  oneCol("Perfect", perfP), oneCol("Pluperfect", plupP), oneCol("Future perfect", futPP),
                  oneCol("Present subjunctive", subjA), oneCol("Imperfect subjunctive", impfSA),
                  oneCol("Perfect subjunctive", perfSP), oneCol("Pluperfect subjunctive", plupSP));
  } else {
    sections.push(twoCol("Present", presA, presP), twoCol("Imperfect", impfA, impfP), twoCol("Future", futA, futP),
                  twoCol("Perfect", perfA, perfP), twoCol("Pluperfect", plupA, plupP), twoCol("Future perfect", futPA, futPP),
                  twoCol("Present subjunctive", subjA, subjP), twoCol("Imperfect subjunctive", impfSA, impfSP),
                  twoCol("Perfect subjunctive", perfSA, perfSP), twoCol("Pluperfect subjunctive", plupSA, plupSP));
  }

  // imperative
  let impSg;
  let impPl;
  switch (c) {
    case "1": impSg = r + "ā"; impPl = r + (s.shortA ? "ate" : "āte"); break;
    case "2": impSg = r + "ē"; impPl = r + "ēte"; break;
    case "3": impSg = r + "e"; impPl = r + "ite"; break;
    case "3io": impSg = r + "e"; impPl = r + "ite"; break;
    case "4": impSg = r + "ī"; impPl = r + "īte"; break;
  }
  let sg = impSg;
  if (["dīcō", "dūcō", "faciō"].includes(lemma) || (lemma.endsWith("dūcō") && lemma !== "dūcō")) {
    sg = lemma === "faciō" ? "fac" : (lemma === "dīcō" ? "dīc" : dropLast(lemma, 4) + "dūc");
  }
  if (s.deponent) {
    const ps = presP;
    sections.push(section("Imperative", [""], [
      row("2 sg.", [ps[1].endsWith("ris") ? dropLast(ps[1], 3) + "re" : ps[1]]),
      row("2 pl.", [ps[4]]),
    ]));
  } else {
    sections.push(section("Imperative", [""], [row("2 sg.", [sg]), row("2 pl.", [impPl])]));
  }

  // infinitives
  const sup = s.supine;
  const inf = [];
  if (s.deponent) {
    inf.push(row("Present", [s.inf]));
    inf.push(row("Perfect", [sup != null ? sup + "us esse" : DASH]));
    inf.push(row("Future", [sup != null ? sup + "ūrus esse" : DASH]));
    sections.push(section("Infinitives", [""], inf));
  } else {
    const hasPerfPassive = hasPassiveSystem && !s.supineIsFuture;
    inf.push(row("Present", [ai, hasPassiveSystem ? passiveInfinitive(s) : DASH]));
    inf.push(row("Perfect", [
      pf != null ? pf + "isse" : (s.semideponent ? (sup != null ? sup + "us esse" : DASH) : DASH),
      hasPerfPassive ? (sup != null ? sup + "us esse" : DASH) : DASH,
    ]));
    inf.push(row("Future", [
      sup != null ? sup + "ūrus esse" : DASH,
      hasPerfPassive ? (sup != null ? sup + "um īrī" : DASH) : DASH,
    ]));
    sections.push(section("Infinitives", ["Active", "Passive"], inf));
  }

  // participles, gerund, gerundive
  let presPt;
  switch (c) {
    case "1": presPt = r + "āns, " + r + "antis"; break;
    case "2": presPt = r + "ēns, " + r + "entis"; break;
    case "3": presPt = r + "ēns, " + r + "entis"; break;
    case "3io": case "4": presPt = r + "iēns, " + r + "ientis"; break;
  }
  let gerSt;
  switch (c) {
    case "1": gerSt = r + "and"; break;
    case "2": case "3": gerSt = r + "end"; break;
    case "3io": case "4": gerSt = r + "iend"; break;
  }
  const pt = [row("Present active", [presPt])];
  if (sup != null) {
    if (hasPassiveSystem && !s.deponent && !s.supineIsFuture) pt.push(row("Perfect passive", [sup + "us, -a, -um"]));
    if (s.deponent || s.semideponent) pt.push(row("Perfect", [sup + "us, -a, -um"]));
    pt.push(row("Future active", [sup + "ūrus, -a, -um"]));
  }
  pt.push(row("Gerundive", [gerSt + "us, -a, -um"]));
  pt.push(row("Gerund", [gerSt + "ī, " + gerSt + "ō, " + gerSt + "um"]));
  if (sup != null && !s.deponent && !s.supineIsFuture) pt.push(row("Supine", [sup + "um, " + sup + "ū"]));
  sections.push(section("Participles", [""], pt));

  return { title: "Conjugation", sections };
}

// MARK: - irregular verbs

// compounds of sum
const SUM_COMPOUNDS = new Map([
  ["absum", "ab"], ["adsum", "ad"], ["dēsum", "dē"], ["intersum", "inter"], ["obsum", "ob"],
  ["praesum", "prae"], ["subsum", "sub"], ["supersum", "super"], ["prōsum", "prō"],
]);

function irregularVerb(e) {
  const l = e.lemma;
  const pp = e.pp;
  const at = (i) => (pp != null && i < pp.length ? pp[i] : null);   // Swift pp?[safe: i]
  if (l === "sum") return sumLike("");
  if (SUM_COMPOUNDS.has(l)) return sumLike(SUM_COMPOUNDS.get(l));
  if (l === "possum") return possum();
  if (l === "eō") return eoLike("", pp);
  const inf = at(1);
  if (e.conj === "irr" && l.endsWith("eō") && inf != null && inf.endsWith("īre")) {
    return eoLike(dropLast(l, 2), pp);
  }
  if (l === "ferō" || (e.conj === "irr" && l.endsWith("ferō"))) {
    return feroLike(e);
  }
  if (l === "volō" || l === "nōlō" || l === "mālō") return voloFamily(l);
  if (l === "fīō") return fio();
  if (at(0)?.endsWith("ī") === true && at(1)?.endsWith("isse") === true) {
    // ōdī, meminī, coepī: perfect only
    const p = strip(pp[0], "ī");
    if (p == null) return null;
    const perfA = ["ī", "istī", "it", "imus", "istis", "ērunt"].map((x) => p + x);
    const plupA = ["eram", "erās", "erat", "erāmus", "erātis", "erant"].map((x) => p + x);
    const futPA = ["erō", "eris", "erit", "erimus", "eritis", "erint"].map((x) => p + x);
    return {
      title: "Conjugation (perfect only)",
      sections: [oneCol("Perfect (present sense)", perfA), oneCol("Pluperfect (past sense)", plupA),
                 oneCol("Future perfect (future sense)", futPA)],
    };
  }
  return null;
}

/** A paradigm of one-column person tables, plus any extra sections. */
function table(title, secs, extra = []) {
  return { title, sections: [...secs.map(([t, forms]) => oneCol(t, forms)), ...extra] };
}

function sumLike(p) {
  // prōsum inserts -d- before forms of sum that begin with a vowel
  const f = (s) => {
    if (p === "prō" && (s[0] === "e" || s[0] === "ē")) return "prōd" + s;
    return p + s;
  };
  const pre = (s) => p + s;
  const pres = ["sum", "es", "est", "sumus", "estis", "sunt"].map(f);
  const impf = ["eram", "erās", "erat", "erāmus", "erātis", "erant"].map(f);
  const fut = ["erō", "eris", "erit", "erimus", "eritis", "erunt"].map(f);
  const perf = ["fuī", "fuistī", "fuit", "fuimus", "fuistis", "fuērunt"].map(pre);
  const plup = ["fueram", "fuerās", "fuerat", "fuerāmus", "fuerātis", "fuerant"].map(pre);
  const futp = ["fuerō", "fueris", "fuerit", "fuerimus", "fueritis", "fuerint"].map(pre);
  const subj = ["sim", "sīs", "sit", "sīmus", "sītis", "sint"].map(pre);
  const isubj = ["essem", "essēs", "esset", "essēmus", "essētis", "essent"].map(f);
  const psubj = ["fuerim", "fuerīs", "fuerit", "fuerīmus", "fuerītis", "fuerint"].map(pre);
  const plsubj = ["fuissem", "fuissēs", "fuisset", "fuissēmus", "fuissētis", "fuissent"].map(pre);
  const infs = section("Infinitives", [""], [
    row("Present", [f("esse")]), row("Perfect", [p + "fuisse"]),
    row("Future", [p + "futūrus esse (" + p + "fore)"]),
  ]);
  const imp = section("Imperative", [""], [row("2 sg.", [f("es")]), row("2 pl.", [f("este")])]);
  return table("Conjugation (irregular)", [
    ["Present", pres], ["Imperfect", impf], ["Future", fut], ["Perfect", perf],
    ["Pluperfect", plup], ["Future perfect", futp], ["Present subjunctive", subj],
    ["Imperfect subjunctive", isubj], ["Perfect subjunctive", psubj], ["Pluperfect subjunctive", plsubj],
  ], [imp, infs]);
}

function possum() {
  return table("Conjugation (irregular)", [
    ["Present", ["possum", "potes", "potest", "possumus", "potestis", "possunt"]],
    ["Imperfect", ["poteram", "poterās", "poterat", "poterāmus", "poterātis", "poterant"]],
    ["Future", ["poterō", "poteris", "poterit", "poterimus", "poteritis", "poterunt"]],
    ["Perfect", ["potuī", "potuistī", "potuit", "potuimus", "potuistis", "potuērunt"]],
    ["Pluperfect", ["potueram", "potuerās", "potuerat", "potuerāmus", "potuerātis", "potuerant"]],
    ["Future perfect", ["potuerō", "potueris", "potuerit", "potuerimus", "potueritis", "potuerint"]],
    ["Present subjunctive", ["possim", "possīs", "possit", "possīmus", "possītis", "possint"]],
    ["Imperfect subjunctive", ["possem", "possēs", "posset", "possēmus", "possētis", "possent"]],
    ["Perfect subjunctive", ["potuerim", "potuerīs", "potuerit", "potuerīmus", "potuerītis", "potuerint"]],
    ["Pluperfect subjunctive", ["potuissem", "potuissēs", "potuisset", "potuissēmus", "potuissētis", "potuissent"]],
  ], [
    section("Infinitives", [""], [row("Present", ["posse"]), row("Perfect", ["potuisse"])]),
    section("Participles", [""], [row("Present (adj.)", ["potēns, potentis"])]),
  ]);
}

function eoLike(p, pp) {
  const part = (i) => (pp != null && i < pp.length ? pp[i] : null);   // Swift pp?[safe: i]
  const pp2 = part(2);
  const pp3 = part(3);
  const perfSt = (pp2 != null ? strip(firstToken(pp2), "ī") : null) ?? p + "i";
  const sup = (pp3 != null && pp3 !== DASH ? strip(pp3, "um") : null) ?? p + "it";
  let perfForms;
  if (perfSt.endsWith("i") && !perfSt.endsWith("īv")) {
    // iī, īstī (contracted), iit, iimus, īstis, iērunt
    const b = dropLast(perfSt);
    perfForms = [b + "iī", b + "īstī", b + "iit", b + "iimus", b + "īstis", b + "iērunt"];
  } else {
    perfForms = ["ī", "istī", "it", "imus", "istis", "ērunt"].map((x) => perfSt + x);
  }
  const pre = (s) => p + s;
  return table("Conjugation (irregular)", [
    ["Present", ["eō", "īs", "it", "īmus", "ītis", "eunt"].map(pre)],
    ["Imperfect", ["ībam", "ībās", "ībat", "ībāmus", "ībātis", "ībant"].map(pre)],
    ["Future", ["ībō", "ībis", "ībit", "ībimus", "ībitis", "ībunt"].map(pre)],
    ["Perfect", perfForms],
    ["Pluperfect", ["eram", "erās", "erat", "erāmus", "erātis", "erant"].map((x) => perfSt + x)],
    ["Present subjunctive", ["eam", "eās", "eat", "eāmus", "eātis", "eant"].map(pre)],
    ["Imperfect subjunctive", ["īrem", "īrēs", "īret", "īrēmus", "īrētis", "īrent"].map(pre)],
    ["Pluperfect subjunctive", ["īssem", "īssēs", "īsset", "īssēmus", "īssētis", "īssent"].map((x) => dropLast(perfSt) + x)],
  ], [
    section("Imperative", [""], [row("2 sg.", [p + "ī"]), row("2 pl.", [p + "īte"])]),
    section("Infinitives", [""], [row("Present", [p + "īre"]), row("Perfect", [dropLast(perfSt) + "īsse"]), row("Future", [sup + "ūrus esse"])]),
    section("Participles", [""], [row("Present", [p + "iēns, " + p + "euntis"]), row("Future", [sup + "ūrus, -a, -um"]), row("Gerund", [p + "eundī"])]),
  ]);
}

function feroLike(e) {
  const pp = e.pp;
  if (pp == null || pp.length < 4) return null;
  const p = dropLast(e.lemma, 4);       // "" for ferō, "af" for afferō, "re" for referō …
  const perf = strip(pp[2].split(" ")[0], "ī") ?? p + "tul";
  const sup = strip(pp[3], "um") ?? p + "lāt";
  const f = (s) => p + s;
  const pres = ["ferō", "fers", "fert", "ferimus", "fertis", "ferunt"].map(f);
  const presP = ["feror", "ferris", "fertur", "ferimur", "feriminī", "feruntur"].map(f);
  const impf = ["ferēbam", "ferēbās", "ferēbat", "ferēbāmus", "ferēbātis", "ferēbant"].map(f);
  const impfP = ["ferēbar", "ferēbāris", "ferēbātur", "ferēbāmur", "ferēbāminī", "ferēbantur"].map(f);
  const fut = ["feram", "ferēs", "feret", "ferēmus", "ferētis", "ferent"].map(f);
  const futP = ["ferar", "ferēris", "ferētur", "ferēmur", "ferēminī", "ferentur"].map(f);
  const perfA = ["ī", "istī", "it", "imus", "istis", "ērunt"].map((x) => perf + x);
  const perfP = perfPassive(sup, ["sum", "es", "est", "sumus", "estis", "sunt"]);
  const plupA = ["eram", "erās", "erat", "erāmus", "erātis", "erant"].map((x) => perf + x);
  const plupP = perfPassive(sup, ["eram", "erās", "erat", "erāmus", "erātis", "erant"]);
  const subj = ["feram", "ferās", "ferat", "ferāmus", "ferātis", "ferant"].map(f);
  const subjP = ["ferar", "ferāris", "ferātur", "ferāmur", "ferāminī", "ferantur"].map(f);
  const isubj = ["ferrem", "ferrēs", "ferret", "ferrēmus", "ferrētis", "ferrent"].map(f);
  const isubjP = ["ferrer", "ferrēris", "ferrētur", "ferrēmur", "ferrēminī", "ferrentur"].map(f);
  return {
    title: "Conjugation (irregular)",
    sections: [
      twoCol("Present", pres, presP), twoCol("Imperfect", impf, impfP), twoCol("Future", fut, futP),
      twoCol("Perfect", perfA, perfP), twoCol("Pluperfect", plupA, plupP),
      twoCol("Present subjunctive", subj, subjP), twoCol("Imperfect subjunctive", isubj, isubjP),
      section("Imperative", [""], [row("2 sg.", [f("fer")]), row("2 pl.", [f("ferte")])]),
      section("Infinitives", ["Active", "Passive"], [
        row("Present", [f("ferre"), f("ferrī")]),
        row("Perfect", [perf + "isse", sup + "us esse"]),
        row("Future", [sup + "ūrus esse", sup + "um īrī"]),
      ]),
      section("Participles", [""], [
        row("Present active", [f("ferēns, ") + f("ferentis")]),
        row("Perfect passive", [sup + "us, -a, -um"]),
        row("Future active", [sup + "ūrus, -a, -um"]),
        row("Gerundive", [f("ferendus, -a, -um")]),
      ]),
    ],
  };
}

function voloFamily(l) {
  switch (l) {
    case "volō":
      return table("Conjugation (irregular)", [
        ["Present", ["volō", "vīs", "vult", "volumus", "vultis", "volunt"]],
        ["Imperfect", ["volēbam", "volēbās", "volēbat", "volēbāmus", "volēbātis", "volēbant"]],
        ["Future", ["volam", "volēs", "volet", "volēmus", "volētis", "volent"]],
        ["Perfect", ["voluī", "voluistī", "voluit", "voluimus", "voluistis", "voluērunt"]],
        ["Present subjunctive", ["velim", "velīs", "velit", "velīmus", "velītis", "velint"]],
        ["Imperfect subjunctive", ["vellem", "vellēs", "vellet", "vellēmus", "vellētis", "vellent"]],
      ], [section("Infinitives", [""], [row("Present", ["velle"]), row("Perfect", ["voluisse"])])]);
    case "nōlō":
      return table("Conjugation (irregular)", [
        ["Present", ["nōlō", "nōn vīs", "nōn vult", "nōlumus", "nōn vultis", "nōlunt"]],
        ["Imperfect", ["nōlēbam", "nōlēbās", "nōlēbat", "nōlēbāmus", "nōlēbātis", "nōlēbant"]],
        ["Future", ["nōlam", "nōlēs", "nōlet", "nōlēmus", "nōlētis", "nōlent"]],
        ["Perfect", ["nōluī", "nōluistī", "nōluit", "nōluimus", "nōluistis", "nōluērunt"]],
        ["Present subjunctive", ["nōlim", "nōlīs", "nōlit", "nōlīmus", "nōlītis", "nōlint"]],
        ["Imperfect subjunctive", ["nōllem", "nōllēs", "nōllet", "nōllēmus", "nōllētis", "nōllent"]],
      ], [
        section("Imperative", [""], [row("2 sg.", ["nōlī"]), row("2 pl.", ["nōlīte"])]),
        section("Infinitives", [""], [row("Present", ["nōlle"]), row("Perfect", ["nōluisse"])]),
      ]);
    default:
      return table("Conjugation (irregular)", [
        ["Present", ["mālō", "māvīs", "māvult", "mālumus", "māvultis", "mālunt"]],
        ["Imperfect", ["mālēbam", "mālēbās", "mālēbat", "mālēbāmus", "mālēbātis", "mālēbant"]],
        ["Future", ["mālam", "mālēs", "mālet", "mālēmus", "mālētis", "mālent"]],
        ["Perfect", ["māluī", "māluistī", "māluit", "māluimus", "māluistis", "māluērunt"]],
        ["Present subjunctive", ["mālim", "mālīs", "mālit", "mālīmus", "mālītis", "mālint"]],
        ["Imperfect subjunctive", ["māllem", "māllēs", "māllet", "māllēmus", "māllētis", "māllent"]],
      ], [section("Infinitives", [""], [row("Present", ["mālle"]), row("Perfect", ["māluisse"])])]);
  }
}

function fio() {
  return table("Conjugation (irregular)", [
    ["Present", ["fīō", "fīs", "fit", "fīmus", "fītis", "fīunt"]],
    ["Imperfect", ["fīēbam", "fīēbās", "fīēbat", "fīēbāmus", "fīēbātis", "fīēbant"]],
    ["Future", ["fīam", "fīēs", "fīet", "fīēmus", "fīētis", "fīent"]],
    ["Perfect", ["factus sum", "factus es", "factus est", "factī sumus", "factī estis", "factī sunt"]],
    ["Present subjunctive", ["fīam", "fīās", "fīat", "fīāmus", "fīātis", "fīant"]],
    ["Imperfect subjunctive", ["fierem", "fierēs", "fieret", "fierēmus", "fierētis", "fierent"]],
  ], [section("Infinitives", [""], [row("Present", ["fierī"]), row("Perfect", ["factus esse"])])]);
}
