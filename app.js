/* =====================================================================
   app.js - WHAT THE APP DOES

   Sections:
     1. Building an index of every phrase
     2. Saving & loading (favourites, encounters, usage)
     3. Speaking Spanish out loud
     4. Encounters: worked / didn't work, and the backup wording
     5. Screens: Home, Category, Phrase, Encounters, Numbers, Settings
     6. Buttons
     7. Starting the app
   ===================================================================== */

"use strict";

const appEl = document.getElementById("app");
const barEl = document.getElementById("action-bar");
const barInner = document.getElementById("actions");

const view = {
  screen: "home",       // home | category | phrase | encounters | numbers | settings
  catId: null,
  phraseId: null,
  from: [],             // where Back goes
  search: "",
  fillChoice: {},       // phraseId -> chosen option index
  showOriginal: false,  // on a phrase whose backup wording is suggested
  justRated: null,      // the log entry just added, for the note box
  bigText: false,       // "show to them" full-screen mode
  numberValue: "",
  numberAsPrice: true,
};


/* =====================================================================
   1. AN INDEX OF EVERY PHRASE

   Each phrase gets a stable id from its category and English text,
   e.g. "restaurant:the-bill-please", so your history still matches
   if phrases are reordered later.
   ===================================================================== */

function slug(text) {
  return text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const PHRASES = {};          // id -> { ...phrase, id, cat, section }
for (const cat of CATEGORIES) {
  for (const section of cat.sections) {
    for (const phrase of section.phrases) {
      const id = cat.id + ":" + slug(phrase.en);
      PHRASES[id] = Object.assign({}, phrase, { id, cat, section: section.title });
      phrase.id = id;
    }
  }
}

function catById(id) { return CATEGORIES.find((c) => c.id === id); }

// Fill in the ___ blank with the chosen option
function filled(phrase, field) {
  const text = phrase[field];
  if (!phrase.fill) return text;
  const choice = phrase.fill[view.fillChoice[phrase.id] || 0];
  return text.replace("___", field === "en" ? choice[0] : choice[1]);
}

// For searching: lower case, no accents
function plain(text) { return text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); }


/* =====================================================================
   2. SAVING & LOADING

   Everything you do is saved in one small record:
     favs    - your starred phrases
     uses    - how many times you've opened each phrase
     recent  - the last few phrases you opened
     log     - every "worked" / "didn't work", with notes
   It's kept on the phone, and in your Claude account when the app
   runs inside Claude.
   ===================================================================== */

const LOCAL_KEY = "mijas-spanish.v1";

function emptyData() { return { favs: [], uses: {}, recent: [], log: [] }; }

let data = emptyData();

const Store = {
  where: "phone",
  db: null, userId: null,
  saving: false, again: false,

  readPhone() {
    try { return Object.assign(emptyData(), JSON.parse(localStorage.getItem(LOCAL_KEY)) || {}); }
    catch (e) { return emptyData(); }
  },
  writePhone() {
    try { localStorage.setItem(LOCAL_KEY, JSON.stringify(data)); } catch (e) {}
  },

  async connect() {
    if (!window.claude || !window.claude.use) return false;
    try {
      const [db, user] = await Promise.all([claude.use("db"), claude.use("user")]);
      if (!db || !user) return false;
      const id = await user.id();
      if (!id) return false;
      this.db = db; this.userId = id; this.where = "account";
      return true;
    } catch (e) { return false; }
  },
  doc() { return this.db.collection("data/users/" + this.userId).doc("phrasebook"); },

  async loadAccount() {
    try {
      const snap = await this.doc().get();
      if (snap && snap.exists) data = merge(data, snap.data());
    } catch (e) { this.where = "phone"; }
  },

  // Save now; if a save is already running, save once more after it
  async save() {
    this.writePhone();
    if (!this.db) return;
    if (this.saving) { this.again = true; return; }
    this.saving = true;
    try { await this.doc().set(JSON.parse(JSON.stringify(data))); } catch (e) {}
    this.saving = false;
    if (this.again) { this.again = false; this.save(); }
  },
};

// Combine two records without losing anything
function merge(a, b) {
  b = Object.assign(emptyData(), b || {});
  const out = emptyData();
  out.favs = [...new Set([...a.favs, ...b.favs])];
  for (const id of new Set([...Object.keys(a.uses), ...Object.keys(b.uses)])) {
    out.uses[id] = Math.max(a.uses[id] || 0, b.uses[id] || 0);
  }
  const seen = new Set();
  out.log = [...a.log, ...b.log].filter((e) => {
    const key = e.t + e.id;
    if (seen.has(key)) return false;
    seen.add(key); return true;
  }).sort((x, y) => x.t - y.t);
  out.recent = [...new Set([...a.recent, ...b.recent])].slice(0, 8);
  return out;
}

function noteUse(id) {
  data.uses[id] = (data.uses[id] || 0) + 1;
  data.recent = [id, ...data.recent.filter((r) => r !== id)].slice(0, 8);
  Store.save();
}


/* =====================================================================
   3. SPEAKING SPANISH

   Uses the Spanish (Spain) voice built into your iPhone. It works
   offline. The Slow button uses a slower rate.
   ===================================================================== */

function setting(key, fallback) {
  try { const v = localStorage.getItem("mijas-spanish." + key); return v === null ? fallback : v; }
  catch (e) { return fallback; }
}
function saveSetting(key, value) { try { localStorage.setItem("mijas-spanish." + key, value); } catch (e) {} }

const Voice = {
  voice: null,
  rate: parseFloat(setting("rate", "0.85")),
  autoPlay: setting("autoplay", "off") === "on",

  pick() {
    if (this.voice || !window.speechSynthesis) return;
    const voices = speechSynthesis.getVoices();
    this.voice = voices.find((v) => v.lang === "es-ES" && /m[oó]nica|marisol|lucia|lucía/i.test(v.name))
      || voices.find((v) => v.lang === "es-ES")
      || voices.find((v) => v.lang && v.lang.startsWith("es"))
      || null;
  },

  say(text, slow) {
    if (!window.speechSynthesis) return;
    try {
      this.pick();
      speechSynthesis.cancel();
      const words = new SpeechSynthesisUtterance(text.replace(/___/g, ""));
      words.lang = "es-ES";
      if (this.voice) words.voice = this.voice;
      words.rate = slow ? Math.max(0.45, this.rate - 0.3) : this.rate;
      speechSynthesis.speak(words);
    } catch (e) {}
  },
};
if (window.speechSynthesis) speechSynthesis.onvoiceschanged = () => { Voice.voice = null; };


/* =====================================================================
   4. ENCOUNTERS

   Each time you rate a phrase, a line is added to the log:
     { t: time, id: phrase, ok: true/false, alt: used the backup wording?,
       fill: which choice, note: what happened }
   If the last try failed, the app suggests the other wording next time.
   ===================================================================== */

function attempts(id) { return data.log.filter((e) => e.id === id); }

function score(id) {
  const tries = attempts(id);
  const worked = tries.filter((e) => e.ok).length;
  return (data.uses[id] || 0) + worked * 2 - (tries.length - worked);
}

// Should we show the backup wording first?
function suggestAlt(phrase) {
  if (!phrase.alt) return false;
  const tries = attempts(phrase.id);
  const last = tries[tries.length - 1];
  if (!last || last.ok) return last ? !!last.alt : false;  // keep what worked
  return !last.alt;                                        // last failed: switch
}

function usingAlt(phrase) {
  const suggested = suggestAlt(phrase);
  return view.showOriginal ? !suggested : suggested;
}

function spanishFor(phrase) {
  if (usingAlt(phrase)) {
    const alt = phrase.alt;
    if (!phrase.fill) return alt;
    const choice = phrase.fill[view.fillChoice[phrase.id] || 0];
    return alt.replace("___", choice[1]);
  }
  return filled(phrase, "es");
}

function rate(ok) {
  const phrase = PHRASES[view.phraseId];
  const entry = { t: Date.now(), id: phrase.id, ok, alt: usingAlt(phrase),
    fill: phrase.fill ? phrase.fill[view.fillChoice[phrase.id] || 0][0] : null, note: "" };
  data.log.push(entry);
  view.justRated = entry;
  Store.save();
  render();
}

function stats() {
  const worked = data.log.filter((e) => e.ok).length;
  return { worked, failed: data.log.length - worked };
}

// Phrases that fail more often than they work
function needsWork() {
  const byId = {};
  for (const e of data.log) {
    byId[e.id] = byId[e.id] || { ok: 0, bad: 0, notes: [] };
    if (e.ok) byId[e.id].ok++; else byId[e.id].bad++;
    if (e.note) byId[e.id].notes.push(e.note);
  }
  return Object.entries(byId).filter(([, s]) => s.bad > s.ok)
    .map(([id, s]) => ({ id, ...s })).filter((x) => PHRASES[x.id]);
}


/* =====================================================================
   5. SCREENS
   ===================================================================== */

function esc(text) {
  return String(text).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// Small line icons, drawn on a 24×24 grid
const ICONS = {
  chat: '<path d="M4 5h16v10H9l-5 4z"/>',
  utensils: '<path d="M6 3v6a2 2 0 0 0 4 0V3M8 9v12M17 3c-2 2-2 7 0 9v9"/>',
  basket: '<path d="M3 10h18l-2 10H5zM8 10l4-6 4 6M9 14v3M15 14v3"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5"/>',
  plane: '<path d="M21 3L3 10.5l7 3 3 7.5zM10 13.5L21 3"/>',
  shirt: '<path d="M8 3L3 6l2 4 3-1v12h8V9l3 1 2-4-5-3c-.6 1.8-2 3-4 3S8.6 4.8 8 3z"/>',
  flag: '<path d="M6 21V3M6 4l11 4-11 4M3 21h8"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
  cross: '<path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6z"/>',
  alert: '<path d="M12 3l10 18H2zM12 10v5M12 18v.5"/>',
  car: '<path d="M3 16v-4l2.5-5h13l2.5 5v4zM3 16v3h3v-3M18 16v3h3v-3M7 13h.5M16.5 13h.5"/>',
  box: '<path d="M3 7l9-4 9 4v10l-9 4-9-4zM3 7l9 4 9-4M12 11v10"/>',
  wrench: '<path d="M14.5 5.5a4 4 0 0 0 5 5L10 20a2.1 2.1 0 0 1-3-3l9.5-9.5a4 4 0 0 0-2-2z"/>',
  scissors: '<circle cx="6" cy="6" r="2.5"/><circle cx="6" cy="18" r="2.5"/><path d="M8 7.5L20 19M8 16.5L20 5"/>',
  euro: '<path d="M17 6.5a7 7 0 1 0 0 11M4 10h9M4 14h9"/>',
  hash: '<path d="M5 9h14M5 15h14M10 4l-2 16M16 4l-2 16"/>',
  list: '<path d="M4 6h2M4 12h2M4 18h2M9 6h11M9 12h11M9 18h11"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9L7 7M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>',
  star: '<path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z"/>',
  play: '<path d="M7 4l13 8-13 8z"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M16 16l5 5"/>',
};
function icon(name, cls) {
  return `<svg class="icon ${cls || ""}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ""}</svg>`;
}

function setActions(buttons) {
  barInner.innerHTML = buttons.map((b) =>
    `<button class="btn ${b.kind || ""}" data-act="${b.act}">${b.icon ? icon(b.icon) : ""}${esc(b.label)}</button>`).join("");
  barEl.hidden = buttons.length === 0;
}

function render() {
  document.body.classList.toggle("show-mode", view.bigText);
  if (view.screen === "home") renderHome();
  if (view.screen === "category") renderCategory();
  if (view.screen === "phrase") renderPhrase();
  if (view.screen === "encounters") renderEncounters();
  if (view.screen === "numbers") renderNumbers();
  if (view.screen === "settings") renderSettings();
}

function go(screen, extra) {
  view.from.push({ screen: view.screen, catId: view.catId, phraseId: view.phraseId });
  Object.assign(view, { screen, justRated: null, showOriginal: false, bigText: false }, extra || {});
  render();
  window.scrollTo(0, 0);
}

function back() {
  const last = view.from.pop() || { screen: "home" };
  Object.assign(view, last, { justRated: null, showOriginal: false, bigText: false });
  if (window.speechSynthesis) speechSynthesis.cancel();
  render();
  window.scrollTo(0, 0);
}

function topbar(title) {
  return `<div class="topbar">
      <button class="btn-ghost" data-act="back">‹ Back</button>
      <span class="topbar-title">${esc(title)}</span>
      <button class="btn-ghost" data-act="home">Home</button>
    </div>`;
}

// One tappable phrase line
function phraseRow(phrase, showCat) {
  const tries = attempts(phrase.id);
  const worked = tries.filter((e) => e.ok).length, bad = tries.length - worked;
  const marks = (data.favs.includes(phrase.id) ? icon("star", "mark-star") : "")
    + (worked ? `<span class="mark ok">${worked}✓</span>` : "")
    + (bad ? `<span class="mark bad">${bad}✗</span>` : "");
  return `<button class="phrase-row" data-act="open" data-id="${phrase.id}">
      <span class="row-en">${esc(phrase.en)}</span>
      <span class="row-es">${esc(phrase.es)}</span>
      ${showCat ? `<span class="row-cat">${esc(phrase.cat.name)}</span>` : ""}
      ${marks ? `<span class="row-marks">${marks}</span>` : ""}
    </button>`;
}

/* ---------- HOME ---------- */

function searchResults(query) {
  const q = plain(query.trim());
  if (q.length < 2) return [];
  const words = q.split(/\s+/);
  return Object.values(PHRASES).filter((ph) => {
    const hay = plain(ph.en + " " + ph.es + " " + (ph.alt || "") + " "
      + (ph.fill ? ph.fill.map((f) => f.join(" ")).join(" ") : ""));
    return words.every((w) => hay.includes(w));
  }).slice(0, 40);
}

function renderHome() {
  const favs = data.favs.map((id) => PHRASES[id]).filter(Boolean);
  const recent = data.recent.map((id) => PHRASES[id]).filter(Boolean).slice(0, 6);
  const chip = (ph) => `<button class="chip" data-act="open" data-id="${ph.id}">${esc(ph.en)}</button>`;

  const tiles = CATEGORIES.map((c) => `
    <button class="tile tone-${c.tone}" data-act="cat" data-id="${c.id}">
      <span class="tile-icon">${icon(c.icon)}</span>
      <span class="tile-name">${esc(c.name)}</span>
      <span class="tile-es">${esc(c.es)}</span>
    </button>`).join("");

  appEl.innerHTML = `
    <div class="screen">
      <header class="masthead">
        <div>
          <div class="eyebrow">Andalusian Spanish</div>
          <h1>Mijas Spanish</h1>
        </div>
      </header>

      <label class="search">
        ${icon("search")}
        <input id="search" type="search" placeholder="Search English or Spanish" autocomplete="off"
               value="${esc(view.search)}" data-act-input="search">
      </label>

      <div id="home-body">${homeBody(favs, recent, chip, tiles)}</div>
    </div>`;
  setActions([]);
}

function homeBody(favs, recent, chip, tiles) {
  if (view.search.trim().length >= 2) {
    const results = searchResults(view.search);
    return results.length
      ? `<div class="list">${results.map((ph) => phraseRow(ph, true)).join("")}</div>`
      : `<p class="empty">No phrases match "${esc(view.search)}". Try one key word, like "bill" or "tornillos".</p>`;
  }
  return `
    ${favs.length ? `<section class="strip"><h3>${icon("star")} Favourites</h3><div class="chips">${favs.map(chip).join("")}</div></section>` : ""}
    ${recent.length ? `<section class="strip"><h3>Recent</h3><div class="chips">${recent.map(chip).join("")}</div></section>` : ""}
    <div class="tiles">${tiles}</div>
    <div class="tools">
      <button class="tool" data-act="numbers">${icon("hash")}<span>Numbers & prices</span></button>
      <button class="tool" data-act="encounters">${icon("list")}<span>Encounters</span></button>
      <button class="tool" data-act="settings">${icon("gear")}<span>Settings</span></button>
    </div>`;
}

function refreshSearch() {
  const favs = data.favs.map((id) => PHRASES[id]).filter(Boolean);
  const recent = data.recent.map((id) => PHRASES[id]).filter(Boolean).slice(0, 6);
  const chip = (ph) => `<button class="chip" data-act="open" data-id="${ph.id}">${esc(ph.en)}</button>`;
  const tiles = CATEGORIES.map((c) => `
    <button class="tile tone-${c.tone}" data-act="cat" data-id="${c.id}">
      <span class="tile-icon">${icon(c.icon)}</span>
      <span class="tile-name">${esc(c.name)}</span>
      <span class="tile-es">${esc(c.es)}</span>
    </button>`).join("");
  document.getElementById("home-body").innerHTML = homeBody(favs, recent, chip, tiles);
}

/* ---------- CATEGORY ---------- */

function replyList(replies) {
  return `<ul class="replies">${replies.map(([es, en]) => `
    <li><button class="reply" data-act="sayReply" data-text="${esc(es)}">
      ${icon("play", "small-play")}<span class="reply-es">${esc(es)}</span><span class="reply-en">${esc(en)}</span>
    </button></li>`).join("")}</ul>`;
}

function renderCategory() {
  const cat = catById(view.catId);
  const top = cat.sections.flatMap((s) => s.phrases).map((ph) => PHRASES[ph.id])
    .filter((ph) => score(ph.id) > 0).sort((a, b) => score(b.id) - score(a.id)).slice(0, 5);

  appEl.innerHTML = `
    <div class="screen">
      ${topbar("")}
      <header class="cat-head tone-${cat.tone}">
        <span class="tile-icon">${icon(cat.icon)}</span>
        <div><h1>${esc(cat.name)}</h1><div class="cat-es">${esc(cat.es)}</div></div>
      </header>
      ${cat.info ? `<div class="info">${esc(cat.info)}</div>` : ""}
      ${top.length ? `<section><h3>Your most used</h3><div class="list">${top.map((ph) => phraseRow(ph)).join("")}</div></section>` : ""}
      ${cat.sections.map((s) => `
        <section>
          <h3>${esc(s.title)}</h3>
          <div class="list">${s.phrases.map((ph) => phraseRow(PHRASES[ph.id])).join("")}</div>
        </section>`).join("")}
      <section>
        <h3>You might hear</h3>
        ${replyList(cat.replies)}
      </section>
    </div>`;
  setActions([]);
}

/* ---------- PHRASE CARD ---------- */

function renderPhrase() {
  const phrase = PHRASES[view.phraseId];
  const cat = phrase.cat;
  const spanish = spanishFor(phrase);
  const suggested = suggestAlt(phrase);
  const isFav = data.favs.includes(phrase.id);
  const tries = attempts(phrase.id);
  const worked = tries.filter((e) => e.ok).length;

  if (view.bigText) {
    appEl.innerHTML = `
      <button class="show-card" data-act="bigText" aria-label="Close">
        <span class="show-es">${esc(spanish)}</span>
        <span class="show-hint">Tap to close</span>
      </button>`;
    setActions([{ label: "Play", act: "play", icon: "play", kind: "btn-primary" }]);
    return;
  }

  const fillChips = phrase.fill ? `
    <div class="fill-row">${phrase.fill.map(([en], i) => `
      <button class="fill" data-act="fill" data-i="${i}" aria-pressed="${(view.fillChoice[phrase.id] || 0) === i}">${esc(en)}</button>`).join("")}
    </div>` : "";

  const altBanner = phrase.alt && suggested && !view.showOriginal ? `
    <div class="alt-banner">
      Last time "${esc(phrase.fill ? phrase.es.replace("___", "…") : phrase.es)}" didn't work, so try this one.
      <button class="link" data-act="toggleOriginal">Use the original</button>
    </div>` : phrase.alt ? `
    <button class="link other-way" data-act="toggleOriginal">${usingAlt(phrase) ? "Show the first wording" : "Another way to say it"}</button>` : "";

  const replies = phrase.replies || cat.replies.slice(0, 4);
  const rated = view.justRated;

  appEl.innerHTML = `
    <div class="screen">
      <div class="topbar">
        <button class="btn-ghost" data-act="back">‹ Back</button>
        <span class="topbar-title">${esc(cat.name)}</span>
        <button class="btn-ghost fav ${isFav ? "on" : ""}" data-act="fav" aria-pressed="${isFav}" aria-label="Favourite">${icon("star")}</button>
      </div>

      <section class="card phrase-card tone-${cat.tone}">
        <div class="phrase-en">${esc(filled(phrase, "en"))}</div>
        ${fillChips}
        <button class="phrase-es" data-act="bigText" title="Tap to show full screen">${esc(spanish)}</button>
        <div class="phrase-say">${esc(pronounce(spanish))}</div>
        <div class="play-row">
          <button class="btn btn-primary" data-act="play">${icon("play")}Play</button>
          <button class="btn" data-act="playSlow">Slow</button>
          <button class="btn" data-act="bigText">Show</button>
        </div>
        ${altBanner}
        ${phrase.note ? `<p class="note">${esc(phrase.note)}</p>` : ""}
      </section>

      ${rated ? `
      <section class="card rated ${rated.ok ? "ok" : "bad"}">
        <strong>${rated.ok ? "Saved: it worked." : "Saved: it didn't work."}</strong>
        <label class="small" for="note">${rated.ok ? "Anything to remember? (optional)" : "What happened? What did they say? (optional)"}</label>
        <textarea id="note" rows="2" data-act-input="note" placeholder="${rated.ok ? "e.g. they answered with ‘¿algo más?’" : "e.g. they said ‘¿cómo?’ or didn't understand ‘cuenta’"}">${esc(rated.note)}</textarea>
        <button class="btn" data-act="doneNote">Done</button>
      </section>` : ""}

      <section>
        <h3>They might say</h3>
        ${replyList(replies)}
      </section>

      ${tries.length ? `<p class="history-line">You've used this ${tries.length} ${tries.length === 1 ? "time" : "times"}: ${worked} worked, ${tries.length - worked} didn't.</p>` : ""}
    </div>`;

  setActions([
    { label: "Didn't work", act: "rateBad", kind: "btn-bad" },
    { label: "It worked", act: "rateOk", kind: "btn-ok" },
  ]);
}

/* ---------- ENCOUNTERS ---------- */

function niceDate(t) {
  return new Date(t).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

function renderEncounters() {
  const s = stats();
  const work = needsWork();
  const log = data.log.slice().reverse();
  appEl.innerHTML = `
    <div class="screen">
      ${topbar("")}
      <h1>Encounters</h1>
      <section class="card stats">
        <div><span class="big ok">${s.worked}</span><span class="small">worked</span></div>
        <div><span class="big bad">${s.failed}</span><span class="small">didn't work</span></div>
      </section>

      ${work.length ? `
      <section>
        <h3>Needs work</h3>
        <p class="small muted">These failed more often than they worked. Copy your log and paste it to Claude to get better wording.</p>
        <div class="list">${work.map((w) => phraseRow(PHRASES[w.id], true)).join("")}</div>
      </section>` : ""}

      <section class="card">
        <h3>Improve your phrasebook</h3>
        <p class="small muted">Copies a readable summary of every encounter. Paste it into your chat with Claude and ask for improvements.</p>
        <button class="btn btn-primary" data-act="copyLog" ${data.log.length ? "" : "disabled"}>Copy log for Claude</button>
        <p class="small" id="copy-status" aria-live="polite"></p>
        <textarea id="copy-box" class="copy-box" rows="6" hidden readonly></textarea>
      </section>

      <section>
        <h3>History</h3>
        ${log.length ? `<ul class="log">${log.map((e) => {
          const ph = PHRASES[e.id];
          if (!ph) return "";
          return `<li class="${e.ok ? "ok" : "bad"}">
            <span class="log-mark">${e.ok ? "✓" : "✗"}</span>
            <span class="log-body"><strong>${esc(ph.en)}</strong>${e.fill ? ` (${esc(e.fill)})` : ""}
              <span class="log-es">${esc(e.alt ? ph.alt : ph.es)}</span>
              ${e.note ? `<span class="log-note">${esc(e.note)}</span>` : ""}</span>
            <span class="log-date">${niceDate(e.t)}</span></li>`;
        }).join("")}</ul>` : `<p class="empty">No encounters yet. After you use a phrase, tap "It worked" or "Didn't work" and it's recorded here.</p>`}
      </section>
    </div>`;
  setActions([]);
}

function logForClaude() {
  const line = (e) => {
    const ph = PHRASES[e.id];
    if (!ph) return "";
    const said = e.alt ? ph.alt : ph.es;
    return `- [${ph.cat.name}] "${ph.en}"${e.fill ? ` (${e.fill})` : ""} → "${said}" (${niceDate(e.t)})${e.note ? ` | note: ${e.note}` : ""}`;
  };
  const bad = data.log.filter((e) => !e.ok), good = data.log.filter((e) => e.ok);
  return [`Mijas Spanish phrasebook: encounter log (${data.log.length} entries)`, "",
    `DIDN'T WORK (${bad.length}):`, ...bad.map(line), "",
    `WORKED (${good.length}):`, ...good.map(line)].join("\n");
}

/* ---------- NUMBERS ---------- */

function renderNumbers() {
  const n = parseFloat(String(view.numberValue).replace(",", "."));
  const words = isNaN(n) ? "" : numberToSpanish(n, view.numberAsPrice);
  appEl.innerHTML = `
    <div class="screen">
      ${topbar("")}
      <h1>Numbers & prices</h1>
      <p class="muted">Type a number or price and hear it in Spanish. Useful for checking what you were told, or for saying an amount.</p>
      <section class="card">
        <div class="seg">
          <button class="fill" data-act="numMode" data-price="1" aria-pressed="${view.numberAsPrice}">Price in €</button>
          <button class="fill" data-act="numMode" data-price="0" aria-pressed="${!view.numberAsPrice}">Number</button>
        </div>
        <input id="number" class="number-input" type="text" inputmode="decimal" placeholder="e.g. 23.50"
               value="${esc(view.numberValue)}" data-act-input="number">
        <div id="number-out">${numberOut(words)}</div>
      </section>
    </div>`;
  setActions(words ? [{ label: "Play", act: "playNumber", icon: "play", kind: "btn-primary" }] : []);
}

function numberOut(words) {
  if (!words) return `<p class="small muted">The Spanish appears here.</p>`;
  return `<div class="phrase-es static">${esc(words)}</div><div class="phrase-say">${esc(pronounce(words))}</div>`;
}

/* ---------- SETTINGS ---------- */

function renderSettings() {
  const speeds = [["Slower", 0.7], ["Normal", 0.85], ["Faster", 1.0]];
  appEl.innerHTML = `
    <div class="screen">
      ${topbar("")}
      <h1>Settings</h1>
      <section class="card">
        <h3>Voice</h3>
        <div class="row-between"><span>Speaking speed</span>
          <div class="seg">${speeds.map(([name, r]) => `<button class="fill" data-act="speed" data-rate="${r}" aria-pressed="${Voice.rate === r}">${name}</button>`).join("")}</div>
        </div>
        <div class="row-between"><span>Play automatically when a phrase opens</span>
          <button class="btn btn-small" data-act="autoplay">${Voice.autoPlay ? "On" : "Off"}</button></div>
        <button class="btn btn-small" data-act="testVoice">Test the voice</button>
        <p class="small muted">If you hear an English accent, add a Spanish (Spain) voice in iPhone Settings → Accessibility → Spoken Content → Voices → Spanish.</p>
      </section>
      <section class="card">
        <h3>Backup</h3>
        <p class="small muted">Copy everything (favourites and encounters) to paste into Notes, or to move to another phone.</p>
        <div class="row-buttons">
          <button class="btn" data-act="copyBackup">Copy backup</button>
          <button class="btn" data-act="showRestore">Restore</button>
        </div>
        <div id="restore-area" class="restore-area" hidden>
          <textarea id="restore-text" rows="4" placeholder="Paste a backup here"></textarea>
          <button class="btn btn-primary" data-act="restore">Restore</button>
        </div>
        <p class="small" id="backup-status" aria-live="polite"></p>
      </section>
      <p class="status-line">${Store.where === "account" ? "Saved to your Claude account and this phone." : "Saved on this phone."}
        ${Object.keys(PHRASES).length} phrases.</p>
    </div>`;
  setActions([]);
}


/* =====================================================================
   6. BUTTONS
   ===================================================================== */

function copyText(text, statusEl, boxEl, okMessage) {
  const showBox = () => {
    boxEl.hidden = false; boxEl.value = text; boxEl.select();
    statusEl.textContent = "Select all the text in the box and copy it.";
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => { statusEl.textContent = okMessage; }).catch(showBox);
  } else showBox();
}

const actions = {
  back,
  home() { view.from = []; view.search = ""; view.screen = "home"; view.bigText = false; render(); window.scrollTo(0, 0); },
  cat(btn) { go("category", { catId: btn.dataset.id }); },
  open(btn) {
    const id = btn.dataset.id;
    noteUse(id);
    go("phrase", { phraseId: id, catId: PHRASES[id].cat.id });
    if (Voice.autoPlay) Voice.say(spanishFor(PHRASES[id]));
  },
  numbers() { go("numbers"); },
  encounters() { go("encounters"); },
  settings() { go("settings"); },

  play() { Voice.say(spanishFor(PHRASES[view.phraseId])); },
  playSlow() { Voice.say(spanishFor(PHRASES[view.phraseId]), true); },
  sayReply(btn) { Voice.say(btn.dataset.text); },
  bigText() {
    view.bigText = !view.bigText;
    render();
    window.scrollTo(0, 0);
  },
  fill(btn) {
    view.fillChoice[view.phraseId] = Number(btn.dataset.i);
    render();
    Voice.say(spanishFor(PHRASES[view.phraseId]));
  },
  toggleOriginal() { view.showOriginal = !view.showOriginal; render(); },
  fav() {
    const id = view.phraseId;
    data.favs = data.favs.includes(id) ? data.favs.filter((f) => f !== id) : [...data.favs, id];
    Store.save(); render();
  },
  rateOk() { rate(true); },
  rateBad() { rate(false); },
  doneNote() { view.justRated = null; render(); },

  copyLog() {
    copyText(logForClaude(), document.getElementById("copy-status"), document.getElementById("copy-box"),
      "Copied. Paste it into your chat with Claude.");
  },

  numMode(btn) { view.numberAsPrice = btn.dataset.price === "1"; render(); },
  playNumber() {
    const n = parseFloat(String(view.numberValue).replace(",", "."));
    if (!isNaN(n)) Voice.say(numberToSpanish(n, view.numberAsPrice));
  },

  speed(btn) { Voice.rate = parseFloat(btn.dataset.rate); saveSetting("rate", Voice.rate); render(); actions.testVoice(); },
  autoplay() { Voice.autoPlay = !Voice.autoPlay; saveSetting("autoplay", Voice.autoPlay ? "on" : "off"); render(); },
  testVoice() { Voice.say("Hola, buenas. ¿Me pone un café con leche, por favor?"); },

  copyBackup() {
    copyText(JSON.stringify({ app: "mijas-spanish", version: 1, data }),
      document.getElementById("backup-status"), document.getElementById("restore-text"),
      "Copied. Paste it into a note to keep it safe.");
    document.getElementById("restore-area").hidden = true;
  },
  showRestore() {
    document.getElementById("restore-area").hidden = false;
    const box = document.getElementById("restore-text");
    box.value = ""; box.focus();
    document.getElementById("backup-status").textContent = "Paste a backup, then tap Restore.";
  },
  restore() {
    const status = document.getElementById("backup-status");
    try {
      const incoming = JSON.parse(document.getElementById("restore-text").value).data;
      if (!incoming || !Array.isArray(incoming.log)) throw new Error("bad");
      const before = data.log.length;
      data = merge(data, incoming);
      Store.save();
      render();
      document.getElementById("backup-status").textContent =
        `Restored. ${data.log.length - before} new encounters, ${data.favs.length} favourites.`;
    } catch (e) {
      status.textContent = "That doesn't look like a backup from this app. Copy it again and paste the whole thing.";
    }
  },
};

document.addEventListener("click", (event) => {
  const btn = event.target.closest("[data-act]");
  if (!btn || btn.disabled) return;
  const handler = actions[btn.dataset.act];
  if (handler) handler(btn);
});

document.addEventListener("input", (event) => {
  const kind = event.target.dataset.actInput;
  if (kind === "search") { view.search = event.target.value; refreshSearch(); }
  if (kind === "note" && view.justRated) { view.justRated.note = event.target.value; Store.save(); }
  if (kind === "number") {
    view.numberValue = event.target.value;
    const n = parseFloat(view.numberValue.replace(",", "."));
    const words = isNaN(n) ? "" : numberToSpanish(n, view.numberAsPrice);
    document.getElementById("number-out").innerHTML = numberOut(words);
    setActions(words ? [{ label: "Play", act: "playNumber", icon: "play", kind: "btn-primary" }] : []);
  }
});


/* =====================================================================
   7. STARTING THE APP
   ===================================================================== */

async function boot() {
  data = Store.readPhone();
  render();
  // On your home screen, this keeps a copy of the app for use with no signal
  if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost") && !window.claude) {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
  if (await Store.connect()) {
    await Store.loadAccount();
    Store.writePhone();
    if (view.screen === "home" && !view.search) render();
  }
}

boot();
