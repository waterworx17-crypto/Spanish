/* =====================================================================
   pronounce.js - HOW TO SAY IT, AND SPANISH NUMBERS

   Spanish spelling is very regular, so instead of typing a pronunciation
   guide for 300 phrases, this code works it out from the Spanish:

       "La cuenta, por favor"  ->  "lah KWEN-tah, por fah-BOR"

   Steps for each word:
     1. split it into syllables        cuen | ta
     2. find the stressed syllable     CUEN
     3. respell each syllable the way an English speaker would read it

   It uses the Andalusian "s" sound for c and z ("gracias" = GRAH-syahs),
   which is what you'll hear around Málaga.

   At the bottom: numberToSpanish(23.5) -> "veintitrés con cincuenta"
   ===================================================================== */

const VOWELS = "aeiouáéíóúü";
const STRONG = "aeoáéóíú";       // accented í and ú count as strong (they break a diphthong)
const ACCENTED = "áéíóú";
const INSEPARABLE = ["pl", "pr", "bl", "br", "fl", "fr", "cl", "cr", "gl", "gr", "tr", "dr", "kl", "kr"];

function isVowel(ch) { return VOWELS.includes(ch); }

// Break a word into letter units: "ch", "ll", "rr", "qu", "gu" (before e/i) stay together
function units(word) {
  const out = [];
  for (let i = 0; i < word.length; i++) {
    const two = word.slice(i, i + 2), next = word[i + 2] || "";
    if (["ch", "ll", "rr"].includes(two)) { out.push(two); i++; continue; }
    if ((two === "qu" || two === "gu") && "eiéí".includes(next)) { out.push(two); i++; continue; }
    out.push(word[i]);
  }
  // "y" at the end of a word after a vowel is a vowel: "muy", "hoy"
  const last = out.length - 1;
  if (out[last] === "y" && last > 0 && isVowel(out[last - 1])) out[last] = "i";
  if (out.length === 1 && out[0] === "y") out[0] = "i";
  return out;
}

// Split into syllables
function syllables(word) {
  const u = units(word);
  // 1. find vowel groups (nuclei); two vowels stay together unless both strong
  const groups = [];   // {start, end} indexes in u
  let i = 0;
  while (i < u.length) {
    if (isVowel(u[i])) {
      let j = i;
      while (j + 1 < u.length && isVowel(u[j + 1])) {
        const a = u[j], b = u[j + 1];
        const bothStrong = STRONG.includes(a) && STRONG.includes(b);
        if (bothStrong) break;
        j++;
      }
      groups.push({ start: i, end: j });
      i = j + 1;
    } else {
      i++;
    }
  }
  if (groups.length <= 1) return [u.join("")];

  // 2. share the consonants between groups
  const cuts = [];
  for (let g = 0; g < groups.length - 1; g++) {
    const from = groups[g].end + 1, to = groups[g + 1].start;  // consonants are u[from..to-1]
    const cons = u.slice(from, to);
    let cut;
    if (cons.length === 0) cut = from;                         // two strong vowels: le-er
    else if (cons.length === 1) cut = from;                    // ca-sa
    else {
      const lastTwo = cons.slice(-2).join("");
      if (INSEPARABLE.includes(lastTwo)) cut = to - 2;         // ha-bla, cons-truir
      else cut = to - 1;                                       // can-ta, ins-tan
    }
    cuts.push(cut);
  }
  const parts = [];
  let start = 0;
  for (const cut of cuts) { parts.push(u.slice(start, cut).join("")); start = cut; }
  parts.push(u.slice(start).join(""));
  return parts;
}

function stressIndex(sylls, word) {
  for (let i = 0; i < sylls.length; i++) {
    if ([...sylls[i]].some((c) => ACCENTED.includes(c))) return i;
  }
  const last = word[word.length - 1];
  if (isVowel(last) || last === "n" || last === "s") return Math.max(0, sylls.length - 2);
  return sylls.length - 1;
}

// Respell one syllable for an English reader
function respell(syl, isFirstOfWord, prevEndsWith) {
  let s = syl.replace(/[áéíóú]/g, (c) => ({ á: "a", é: "e", í: "i", ó: "o", ú: "u" }[c]));
  let out = "";
  let i = 0;
  const vowelIdx = [...s].findIndex((c) => isVowel(c));
  while (i < s.length) {
    const two = s.slice(i, i + 2), ch = s[i], next = s[i + 1] || "", after = s[i + 2] || "";
    if (two === "ch") { out += "ch"; i += 2; continue; }
    if (two === "ll") { out += "y"; i += 2; continue; }
    if (two === "rr") { out += "rr"; i += 2; continue; }
    if (two === "qu") { out += "k"; i += 2; continue; }
    if (two === "gu" && "ei".includes(after)) { out += "g"; i += 2; continue; }
    if (isVowel(ch)) {
      // vowel cluster at this point
      let j = i;
      while (j < s.length && isVowel(s[j])) j++;
      const cluster = s.slice(i, j).replace("ü", "u");
      const closed = j < s.length;   // a consonant follows inside the syllable
      out += vowelSound(cluster, closed, out);
      i = j;
      continue;
    }
    if (ch === "c") { out += "ei".includes(next) ? "s" : "k"; i++; continue; }
    if (ch === "g") { out += "ei".includes(next) ? "h" : "g"; i++; continue; }
    if (ch === "z") { out += "s"; i++; continue; }
    if (ch === "j") { out += "h"; i++; continue; }
    if (ch === "h") { i++; continue; }                       // silent h
    if (ch === "v") { out += "b"; i++; continue; }
    if (ch === "ñ") { out += "ny"; i++; continue; }
    if (ch === "x") { out += "ks"; i++; continue; }
    if (ch === "r" && i === 0 && (isFirstOfWord || "nls".includes(prevEndsWith))) { out += "rr"; i++; continue; }
    out += ch;
    i++;
  }
  return out;
}

function vowelSound(cluster, closed, before) {
  const open = (v) => ({ a: closed ? "a" : "ah", e: closed ? "e" : "eh", i: "ee", o: closed ? "o" : "oh", u: "oo" }[v]);
  if (cluster.length === 1) return open(cluster);
  const glide = { ia: "ya", ie: "ye", io: "yo", iu: "yoo", ua: "wa", ue: "we", uo: "wo", ui: "wee",
                  ai: "eye", ei: "ay", oi: "oy", au: "ow", eu: "eh-oo" };
  const key = cluster.slice(0, 2);
  let base = glide[key] || cluster;
  if (["ya", "ye", "yo", "wa", "we", "wo"].includes(base) && !closed) base += "h";
  // after a consonant like k or g, "w" reads fine: kwen, gwah
  return base + (cluster.length > 2 ? open(cluster[2]) : "");
}

function pronounceWord(word) {
  const lower = word.toLowerCase();
  if (!/[a-záéíóúüñ]/.test(lower)) return word;
  const sylls = syllables(lower);
  const stress = sylls.length > 1 ? stressIndex(sylls, lower) : -1;
  let prevEnd = "";
  return sylls.map((syl, i) => {
    const r = respell(syl, i === 0, prevEnd);
    prevEnd = syl[syl.length - 1];
    // stressed syllable in capitals ("eh-oo" in "euros" only capitalises the first part)
    return i === stress ? r.replace(/^[^-]+/, (m) => m.toUpperCase()) : r;
  }).join("-");
}

// The whole phrase: keep punctuation, respell each word
function pronounce(text) {
  return text
    .replace(/[¿¡]/g, "")
    .split(/(\s+|[,.!?;:()]+)/)
    .map((part) => /[a-záéíóúüñ]/i.test(part) ? pronounceWord(part) : part)
    .join("")
    .replace(/\s+/g, " ")
    .trim();
}


/* ---------------- numbers in Spanish ---------------- */

const ONES = ["cero", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve",
  "diez", "once", "doce", "trece", "catorce", "quince", "dieciséis", "diecisiete", "dieciocho", "diecinueve",
  "veinte", "veintiuno", "veintidós", "veintitrés", "veinticuatro", "veinticinco", "veintiséis",
  "veintisiete", "veintiocho", "veintinueve"];
const TENS = ["", "", "", "treinta", "cuarenta", "cincuenta", "sesenta", "setenta", "ochenta", "noventa"];
const HUNDREDS = ["", "ciento", "doscientos", "trescientos", "cuatrocientos", "quinientos",
  "seiscientos", "setecientos", "ochocientos", "novecientos"];

function under1000(n) {
  if (n === 100) return "cien";
  const h = Math.floor(n / 100), rest = n % 100;
  const parts = [];
  if (h) parts.push(HUNDREDS[h]);
  if (rest) {
    if (rest < 30) parts.push(ONES[rest]);
    else {
      const t = Math.floor(rest / 10), o = rest % 10;
      parts.push(o ? `${TENS[t]} y ${ONES[o]}` : TENS[t]);
    }
  }
  return parts.join(" ");
}

function wholeToSpanish(n) {
  if (n === 0) return "cero";
  if (n >= 1000000) return String(n);
  const thousands = Math.floor(n / 1000), rest = n % 1000;
  const parts = [];
  if (thousands === 1) parts.push("mil");
  else if (thousands > 1) parts.push(under1000(thousands).replace(/uno$/, "un") + " mil");
  if (rest) parts.push(under1000(rest));
  return parts.join(" ");
}

// 23.5 as a price -> "veintitrés euros con cincuenta"
function numberToSpanish(value, asPrice) {
  const n = Math.round(value * 100) / 100;
  const whole = Math.floor(n);
  const cents = Math.round((n - whole) * 100);
  let words = wholeToSpanish(whole);
  if (asPrice) {
    words = words.replace(/veintiuno$/, "veintiún").replace(/uno$/, "un") + (whole === 1 ? " euro" : " euros");
    if (cents) words += " con " + wholeToSpanish(cents);
  } else if (cents) {
    words += " coma " + wholeToSpanish(cents);
  }
  return words;
}
