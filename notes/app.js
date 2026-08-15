/* ============================================================
   PrepInterview — multi-subject notes reader
   ------------------------------------------------------------
   How to add a whole new subject later:
   1. Make a folder content/<subject-id>/ and put a manifest.json
      in it (same shape as content/python/manifest.json: title,
      subtitle, parts[] -> chapters[]), plus your .md files.
   2. Add one entry to content/subjects.json:
        { "id": "<subject-id>", "label": "...", "description": "...",
          "accent": "#hex", "manifest": "content/<subject-id>/manifest.json" }
   That's it — app.js does not need to change.

   How to add a chapter to an existing subject:
   1. Drop a new .md file into content/<subject-id>/partN/
   2. Add one entry to that part's "chapters" array in that
      subject's manifest.json.
   ============================================================ */

const READ_KEY = "prepinterview:read";
let SITE = null; // content/subjects.json
let CURRENT_SUBJECT_ID = null;
let MANIFEST = null; // currently loaded subject manifest
let FLAT_CHAPTERS = []; // flattened chapters of the current subject
const manifestCache = {};

const el = (sel) => document.querySelector(sel);
const contentInner = el("#content-inner");
const navTree = el("#nav-tree");

marked.setOptions({ gfm: true, breaks: false });

function getReadSet() {
  try {
    return new Set(JSON.parse(localStorage.getItem(READ_KEY) || "[]"));
  } catch (e) {
    return new Set();
  }
}
function saveReadSet(set) {
  localStorage.setItem(READ_KEY, JSON.stringify([...set]));
}
function chapterKey(subjectId, partId, chId) {
  return `${subjectId}/${partId}/${chId}`;
}

async function loadSite() {
  const res = await fetch("content/subjects.json");
  SITE = await res.json();
  el("#brand-text").textContent = SITE.siteTitle || "PrepInterview";
  document.title = SITE.siteTitle || "PrepInterview";
}

async function loadSubjectManifest(subjectId) {
  if (manifestCache[subjectId]) return manifestCache[subjectId];
  const subj = SITE.subjects.find((s) => s.id === subjectId);
  if (!subj) return null;
  const res = await fetch(subj.manifest);
  const m = await res.json();
  manifestCache[subjectId] = m;
  return m;
}

function flattenChapters(subjectId, manifest) {
  const flat = [];
  manifest.parts.forEach((part) => {
    part.chapters.forEach((ch) => {
      flat.push({ subjectId, partId: part.id, partLabel: part.label, partTitle: part.title, ...ch });
    });
  });
  return flat;
}

/* ---------------- Sidebar ---------------- */

function renderSubjectSwitcher() {
  const box = el("#subject-switcher");
  if (!SITE.subjects.length) {
    box.innerHTML = "";
    return;
  }
  const current = SITE.subjects.find((s) => s.id === CURRENT_SUBJECT_ID);
  const label = current ? current.label : "All subjects";
  const swatch = current ? current.accent : "var(--text-muted)";

  let itemsHtml = SITE.subjects
    .map(
      (s) => `<a class="subject-switcher-item ${s.id === CURRENT_SUBJECT_ID ? "active" : ""}" href="#/${s.id}">
        <span class="swatch" style="background:${s.accent}"></span>${s.label}
      </a>`
    )
    .join("");
  itemsHtml += `<a class="subject-switcher-item all-subjects" href="#/">All subjects</a>`;

  box.innerHTML = `
    <button type="button" class="subject-switcher-btn">
      <span class="swatch" style="background:${swatch}"></span>
      <span class="label">${label}</span>
      <svg class="chevron" width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </button>
    <div class="subject-switcher-menu">${itemsHtml}</div>
  `;

  const btn = box.querySelector(".subject-switcher-btn");
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    box.classList.toggle("open");
  });
  document.addEventListener("click", () => box.classList.remove("open"));
}

function buildChapterSidebar() {
  navTree.innerHTML = "";
  const collapsedState = JSON.parse(localStorage.getItem("prepinterview:collapsed") || "{}");
  const readSet = getReadSet();

  MANIFEST.parts.forEach((part) => {
    const partEl = document.createElement("div");
    partEl.className = "nav-part";
    const stateKey = `${CURRENT_SUBJECT_ID}/${part.id}`;
    if (collapsedState[stateKey]) partEl.classList.add("collapsed");

    const head = document.createElement("button");
    head.className = "nav-part-head";
    head.innerHTML = `<span>${part.label} · ${part.title}</span>
      <svg class="chevron" width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    head.addEventListener("click", () => {
      partEl.classList.toggle("collapsed");
      collapsedState[stateKey] = partEl.classList.contains("collapsed");
      localStorage.setItem("prepinterview:collapsed", JSON.stringify(collapsedState));
    });

    const chaptersEl = document.createElement("div");
    chaptersEl.className = "nav-chapters";

    part.chapters.forEach((ch) => {
      const a = document.createElement("a");
      const key = chapterKey(CURRENT_SUBJECT_ID, part.id, ch.id);
      a.href = `#/${CURRENT_SUBJECT_ID}/${part.id}/${ch.id}`;
      a.className = "nav-chapter-link";
      a.dataset.key = key;
      if (readSet.has(key)) a.classList.add("read");
      a.innerHTML = `<span class="check"></span><span>${ch.num}. ${ch.title}</span>`;
      chaptersEl.appendChild(a);
    });

    partEl.appendChild(head);
    partEl.appendChild(chaptersEl);
    navTree.appendChild(partEl);
  });

  updateProgress();
}

function clearChapterSidebar() {
  navTree.innerHTML = `<div class="add-subject-hint">Pick a subject to see its chapters, or add a new one — see README.md.</div>`;
  el("#progress-text").textContent = "";
  el("#progress-fill").style.width = "0%";
}

function updateProgress() {
  if (!FLAT_CHAPTERS.length) return;
  const readSet = getReadSet();
  const total = FLAT_CHAPTERS.length;
  const read = FLAT_CHAPTERS.filter((c) => readSet.has(chapterKey(c.subjectId, c.partId, c.id))).length;
  el("#progress-text").textContent = `${read} / ${total} read`;
  el("#progress-fill").style.width = total ? `${(read / total) * 100}%` : "0%";
}

function setActiveNav(partId, chId) {
  document.querySelectorAll(".nav-chapter-link").forEach((a) => a.classList.remove("active"));
  if (partId && chId) {
    const key = chapterKey(CURRENT_SUBJECT_ID, partId, chId);
    const activeLink = document.querySelector(`.nav-chapter-link[data-key="${key}"]`);
    if (activeLink) {
      activeLink.classList.add("active");
      activeLink.scrollIntoView({ block: "nearest" });
    }
  }
}

/* ---------------- Pages ---------------- */

function renderSubjectsHome() {
  CURRENT_SUBJECT_ID = null;
  MANIFEST = null;
  FLAT_CHAPTERS = [];
  clearChapterSidebar();
  renderSubjectSwitcher();
  document.title = SITE.siteTitle || "PrepInterview";
  el("#mobile-title").textContent = SITE.siteTitle || "PrepInterview";

  let html = `
    <div class="home-hero">
      <div class="section-label">${SITE.siteSubtitle || ""}</div>
      <h1>${SITE.siteTitle || "PrepInterview"}</h1>
      <p>Pick a subject to start reading. Progress is tracked per subject and saved on this device.</p>
    </div>
    <div class="subject-cards">
  `;
  SITE.subjects.forEach((s) => {
    html += `
      <a class="subject-card" href="#/${s.id}">
        <span class="swatch" style="background:${s.accent}"></span>
        <div class="sc-body">
          <div class="sc-title">${s.label}</div>
          <div class="sc-desc">${s.description}</div>
        </div>
        <span class="sc-arrow">→</span>
      </a>
    `;
  });
  html += `</div>
    <div class="add-subject-hint">Want to add another subject — Java, SQL, System Design, whatever you're studying next? Drop its notes in as markdown and add one entry to <code>content/subjects.json</code>. See <code>README.md</code>.</div>
  `;
  contentInner.innerHTML = html;
  closeMobileSidebar();
  window.scrollTo({ top: 0, behavior: "instant" });
}

async function renderSubjectHome(subjectId) {
  const subj = SITE.subjects.find((s) => s.id === subjectId);
  if (!subj) return renderNotFound();

  if (CURRENT_SUBJECT_ID !== subjectId) {
    MANIFEST = await loadSubjectManifest(subjectId);
    CURRENT_SUBJECT_ID = subjectId;
    FLAT_CHAPTERS = flattenChapters(subjectId, MANIFEST);
    buildChapterSidebar();
    setupSearch();
  }
  renderSubjectSwitcher();
  setActiveNav(null, null);
  document.title = `${MANIFEST.title} — ${SITE.siteTitle}`;
  el("#mobile-title").textContent = MANIFEST.title;

  let html = `
    <div class="crumb"><a href="#/">${SITE.siteTitle}</a> / ${MANIFEST.title}</div>
    <div class="home-hero">
      <div class="section-label">${MANIFEST.subtitle || ""}</div>
      <h1>${MANIFEST.title}</h1>
    </div>
    <div class="part-cards">
  `;
  MANIFEST.parts.forEach((part) => {
    const firstCh = part.chapters[0];
    html += `
      <a class="part-card" href="#/${subjectId}/${part.id}/${firstCh.id}">
        <div class="plabel">${part.label}</div>
        <div class="ptitle">${part.title}</div>
        <div class="pcount">${part.chapters.length} chapters</div>
      </a>
    `;
  });
  html += `</div>`;
  contentInner.innerHTML = html;
  closeMobileSidebar();
  window.scrollTo({ top: 0, behavior: "instant" });
}

async function renderChapter(subjectId, partId, chId) {
  const subj = SITE.subjects.find((s) => s.id === subjectId);
  if (!subj) return renderNotFound();

  if (CURRENT_SUBJECT_ID !== subjectId) {
    MANIFEST = await loadSubjectManifest(subjectId);
    CURRENT_SUBJECT_ID = subjectId;
    FLAT_CHAPTERS = flattenChapters(subjectId, MANIFEST);
    buildChapterSidebar();
    setupSearch();
  }
  renderSubjectSwitcher();

  const part = MANIFEST.parts.find((p) => p.id === partId);
  if (!part) return renderNotFound();
  const ch = part.chapters.find((c) => c.id === chId);
  if (!ch) return renderNotFound();

  contentInner.innerHTML = `<div class="loading">Loading chapter…</div>`;
  setActiveNav(partId, chId);

  let mdText;
  try {
    const res = await fetch(ch.file);
    if (!res.ok) throw new Error("not found");
    mdText = await res.text();
  } catch (e) {
    contentInner.innerHTML = `<div class="loading">Could not load this chapter (${ch.file}). If you're opening this file directly, serve it over http:// instead — see README.md.</div>`;
    return;
  }

  const htmlBody = marked.parse(mdText);
  const readSet = getReadSet();
  const key = chapterKey(subjectId, partId, chId);
  const isRead = readSet.has(key);

  const idx = FLAT_CHAPTERS.findIndex((c) => c.partId === partId && c.id === chId);
  const prev = idx > 0 ? FLAT_CHAPTERS[idx - 1] : null;
  const next = idx < FLAT_CHAPTERS.length - 1 ? FLAT_CHAPTERS[idx + 1] : null;

  let nav = `<div class="chapter-nav">`;
  nav += prev
    ? `<a class="chapter-nav-link" href="#/${subjectId}/${prev.partId}/${prev.id}"><span class="chapter-nav-label">← ${prev.partLabel}</span><span class="chapter-nav-title">${prev.title}</span></a>`
    : `<div class="chapter-nav-spacer"></div>`;
  nav += next
    ? `<a class="chapter-nav-link next" href="#/${subjectId}/${next.partId}/${next.id}"><span class="chapter-nav-label">${next.partLabel} →</span><span class="chapter-nav-title">${next.title}</span></a>`
    : `<div class="chapter-nav-spacer"></div>`;
  nav += `</div>`;

  contentInner.innerHTML = `
    <div class="crumb"><a href="#/">${SITE.siteTitle}</a> / <a href="#/${subjectId}">${MANIFEST.title}</a> / ${part.label} / Chapter ${ch.num}</div>
    <button id="mark-read-btn" class="mark-read-btn ${isRead ? "is-read" : ""}">
      <span class="dot"></span>${isRead ? "Marked as read" : "Mark as read"}
    </button>
    <div class="md-body">${htmlBody}</div>
    ${nav}
  `;

  document.title = `${ch.title} — ${MANIFEST.title}`;
  el("#mobile-title").textContent = ch.title;

  contentInner.querySelectorAll("pre code").forEach((block) => hljs.highlightElement(block));

  el("#mark-read-btn").addEventListener("click", () => {
    const set = getReadSet();
    const btn = el("#mark-read-btn");
    if (set.has(key)) {
      set.delete(key);
      btn.classList.remove("is-read");
      btn.innerHTML = `<span class="dot"></span>Mark as read`;
    } else {
      set.add(key);
      btn.classList.add("is-read");
      btn.innerHTML = `<span class="dot"></span>Marked as read`;
    }
    saveReadSet(set);
    const navLink = document.querySelector(`.nav-chapter-link[data-key="${key}"]`);
    if (navLink) navLink.classList.toggle("read", set.has(key));
    updateProgress();
  });

  window.scrollTo({ top: 0, behavior: "instant" });
  closeMobileSidebar();
}

function renderNotFound() {
  contentInner.innerHTML = `<div class="loading">Not found. <a href="#/">Go home</a></div>`;
}

/* ---------------- Router ---------------- */

function router() {
  const hash = location.hash.replace(/^#\/?/, "");
  const segs = hash.split("/").filter(Boolean);
  if (segs.length === 0) return renderSubjectsHome();
  if (segs.length === 1) return renderSubjectHome(segs[0]);
  if (segs.length >= 3) return renderChapter(segs[0], segs[1], segs[2]);
  return renderSubjectHome(segs[0]);
}

/* ---------------- Search (scoped to current subject) ---------------- */

function setupSearch() {
  const input = el("#search-input");
  const box = el(".search-box");
  let results = box.querySelector(".search-results");
  if (!results) {
    results = document.createElement("div");
    results.className = "search-results";
    box.appendChild(results);
  }

  input.placeholder = CURRENT_SUBJECT_ID ? "Search chapters..." : "Search...";
  input.oninput = () => {
    const q = input.value.trim().toLowerCase();
    if (!q || !FLAT_CHAPTERS.length) {
      results.classList.remove("open");
      results.innerHTML = "";
      return;
    }
    const matches = FLAT_CHAPTERS.filter((c) =>
      `${c.title} ${c.partTitle}`.toLowerCase().includes(q)
    ).slice(0, 12);
    results.innerHTML = matches.length
      ? matches
          .map(
            (c) => `<a class="search-result-item" href="#/${c.subjectId}/${c.partId}/${c.id}">
              <div class="srp">${c.partLabel}</div>
              <div class="srt">${c.num}. ${c.title}</div>
            </a>`
          )
          .join("")
      : `<div class="search-result-item">No matches</div>`;
    results.classList.add("open");
  };

  document.addEventListener("click", (e) => {
    if (!box.contains(e.target)) results.classList.remove("open");
  });

  el("#search-toggle")?.addEventListener("click", () => {
    openMobileSidebar();
    setTimeout(() => input.focus(), 200);
  });
}

/* ---------------- Theme ---------------- */

const SUN_ICON = `<svg width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="3.25" stroke="currentColor" stroke-width="1.4"/><path d="M8 1.5V3M8 13V14.5M14.5 8H13M3 8H1.5M12.36 3.64L11.3 4.7M4.7 11.3L3.64 12.36M12.36 12.36L11.3 11.3M4.7 4.7L3.64 3.64" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>`;
const MOON_ICON = `<svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M13.5 9.53A6 6 0 016.47 2.5 6 6 0 1013.5 9.53z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>`;

function getTheme() {
  return document.documentElement.getAttribute("data-theme") || "light";
}
function applyThemeIcon() {
  const theme = getTheme();
  const icon = theme === "dark" ? SUN_ICON : MOON_ICON;
  const t1 = el("#theme-toggle");
  const t2 = el("#theme-toggle-mobile");
  if (t1) t1.innerHTML = icon;
  if (t2) t2.innerHTML = icon;
  const hljsLight = el("#hljs-light");
  const hljsDark = el("#hljs-dark");
  if (hljsLight && hljsDark) {
    hljsLight.disabled = theme === "dark";
    hljsDark.disabled = theme !== "dark";
  }
}
function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("prepinterview:theme", theme);
  applyThemeIcon();
}
function toggleTheme() {
  setTheme(getTheme() === "dark" ? "light" : "dark");
}
function setupTheme() {
  applyThemeIcon();
  el("#theme-toggle")?.addEventListener("click", toggleTheme);
  el("#theme-toggle-mobile")?.addEventListener("click", toggleTheme);
}

/* ---------------- Mobile sidebar ---------------- */

function openMobileSidebar() {
  el("#sidebar").classList.add("open");
  el("#sidebar-backdrop").classList.add("open");
}
function closeMobileSidebar() {
  el("#sidebar").classList.remove("open");
  el("#sidebar-backdrop").classList.remove("open");
}
function setupMobileNav() {
  el("#menu-toggle").addEventListener("click", () => {
    const sidebar = el("#sidebar");
    sidebar.classList.contains("open") ? closeMobileSidebar() : openMobileSidebar();
  });
  el("#sidebar-backdrop").addEventListener("click", closeMobileSidebar);
}

/* ---------------- Init ---------------- */

async function init() {
  await loadSite();
  clearChapterSidebar();
  renderSubjectSwitcher();
  setupSearch();
  setupMobileNav();
  setupTheme();
  window.addEventListener("hashchange", router);
  router();
}

init();
