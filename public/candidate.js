// ═══════════════════════════════════════════════════════
//  API BASE URL — points to your Render backend
// ═══════════════════════════════════════════════════════
var API_BASE      = "https://myfirstvote-backend1.onrender.com";
var API           = API_BASE + "/api/candidates";
var MYNETA_BASE   = "https://www.myneta.info/Maharashtra2024/candidate.php?candidate_id=";
var ECI_URL       = "https://affidavitarchive.nic.in/";
var ADR_URL       = "https://adrindia.org";
var MYNETA_HOME   = "https://www.myneta.info/";

var hero = document.getElementById("profileHero");
var main = document.getElementById("profile");

// ── HELPERS ───────────────────────────────────────────────────────────────────
function escHtml(s) {
  return String(s || "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function formatMoney(n) {
  if (!n && n !== 0) return "N/A";
  if (n >= 1e7) return "\u20B9" + (n / 1e7).toFixed(2) + " Cr";
  if (n >= 1e5) return "\u20B9" + (n / 1e5).toFixed(2) + " L";
  return "\u20B9" + Number(n).toLocaleString("en-IN");
}

function initials(name) {
  return (name || "?").split(" ").slice(0, 2).map(function(w) { return w[0]; }).join("").toUpperCase();
}

function svgIcon(name) {
  var icons = {
    info:    "<svg width='16' height='16' fill='none' stroke='currentColor' stroke-width='2' viewBox='0 0 24 24'><circle cx='12' cy='12' r='10'/><line x1='12' y1='8' x2='12' y2='12'/><line x1='12' y1='16' x2='12.01' y2='16'/></svg>",
    assets:  "<svg width='16' height='16' fill='none' stroke='currentColor' stroke-width='2' viewBox='0 0 24 24'><rect x='2' y='7' width='20' height='14' rx='2'/><path d='M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2'/></svg>",
    cases:   "<svg width='16' height='16' fill='none' stroke='currentColor' stroke-width='2' viewBox='0 0 24 24'><path d='M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z'/><line x1='12' y1='9' x2='12' y2='13'/><line x1='12' y1='17' x2='12.01' y2='17'/></svg>",
    book:    "<svg width='16' height='16' fill='none' stroke='currentColor' stroke-width='2' viewBox='0 0 24 24'><path d='M4 19.5A2.5 2.5 0 016.5 17H20'/><path d='M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z'/></svg>",
    link:    "<svg width='16' height='16' fill='none' stroke='currentColor' stroke-width='2' viewBox='0 0 24 24'><path d='M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71'/><path d='M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71'/></svg>",
    flag:    "<svg width='16' height='16' fill='none' stroke='currentColor' stroke-width='2' viewBox='0 0 24 24'><path d='M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z'/><line x1='4' y1='22' x2='4' y2='15'/></svg>",
    history: "<svg width='16' height='16' fill='none' stroke='currentColor' stroke-width='2' viewBox='0 0 24 24'><circle cx='12' cy='12' r='10'/><polyline points='12 6 12 12 16 14'/></svg>",
    ext:     "<svg width='12' height='12' fill='none' stroke='currentColor' stroke-width='2' viewBox='0 0 24 24'><path d='M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6'/><polyline points='15 3 21 3 21 9'/><line x1='10' y1='14' x2='21' y2='3'/></svg>"
  };
  return icons[name] || "";
}

// ── TIMELINE ──────────────────────────────────────────────────────────────────
function renderTimeline(history) {
  if (!history || !history.length) return "<p style='font-size:.85rem;color:var(--text-light)'>No political history recorded.</p>";
  var sorted = history.slice().sort(function(a, b) { return (b.fromYear || 0) - (a.fromYear || 0); });
  var now    = new Date().getFullYear();
  return "<div class='timeline'>" + sorted.map(function(h) {
    var isCurrent = !h.toYear || h.toYear === 0;
    var period    = h.fromYear ? (h.fromYear + " \u2013 " + (isCurrent ? "Present" : h.toYear)) : "";
    var span      = h.fromYear ? (isCurrent ? now - h.fromYear : h.toYear - h.fromYear) : 0;
    return "<div class='timeline-item'>" +
      "<div class='timeline-dot" + (isCurrent ? " current" : "") + "'></div>" +
      (period ? "<div class='timeline-period'>" + period + (span > 0 ? " \u00B7 " + span + " yr" + (span > 1 ? "s" : "") : "") + "</div>" : "") +
      "<div class='timeline-position'>" + escHtml(h.position || "Member") + "</div>" +
      (h.party ? "<div><span class='timeline-party'>" + escHtml(h.party) + "</span></div>" : "") +
      (h.notes ? "<div class='timeline-notes'>" + escHtml(h.notes) + "</div>" : "") +
      "</div>";
  }).join("") + "</div>";
}

// ── HERO ──────────────────────────────────────────────────────────────────────
function renderHero(c) {
  var mynetaLink = c.mynetaId ? (MYNETA_BASE + encodeURIComponent(c.mynetaId)) : null;
  hero.innerHTML =
    "<div class='profile-name-row'>" +
      "<div class='profile-avatar'>" + initials(c.name) + "</div>" +
      "<div class='profile-name'>" +
        "<h1 style='font-family:\"Playfair Display\",serif;font-size:clamp(1.6rem,3vw,2.2rem);font-weight:800;margin-bottom:8px'>" + escHtml(c.name) + "</h1>" +
        "<div class='profile-tags'>" +
          "<span class='tag tag-party'>" + escHtml(c.party) + "</span>" +
          "<span class='tag tag-constituency'>" + escHtml(c.constituency) + "</span>" +
          (mynetaLink ? "<a href='" + mynetaLink + "' target='_blank' rel='noopener' class='tag' style='background:rgba(212,160,23,.15);color:var(--gold-light);border:1px solid rgba(212,160,23,.3);display:inline-flex;align-items:center;gap:4px;text-decoration:none'>MyNeta " + svgIcon("ext") + "</a>" : "") +
        "</div>" +
      "</div>" +
    "</div>";
  document.title = c.name + " \u2014 MyFirstVote";
}

// ── PROFILE BODY ──────────────────────────────────────────────────────────────
function renderProfile(c) {
  var cases   = c.criminalCases || [];
  var sources = c.sources       || [];
  var mynetaLink       = c.mynetaId ? (MYNETA_BASE + encodeURIComponent(c.mynetaId)) : null;
  var mynetaCasesLink  = mynetaLink ? (mynetaLink + "#criminal_cases") : null;
  var mynetaAssetsLink = mynetaLink ? (mynetaLink + "#movable_assets")  : null;

  var history     = c.politicalHistory || [];
  var firstYear   = history.length ? history.reduce(function(m, h) { return (h.fromYear && h.fromYear < m) ? h.fromYear : m; }, 9999) : 0;
  var careerYears = firstYear !== 9999 ? new Date().getFullYear() - firstYear : 0;
  var partiesSet  = {};
  history.forEach(function(h) { if (h.party) partiesSet[h.party] = 1; });
  var partiesServed = Object.keys(partiesSet);
  var positionsSet  = {};
  history.forEach(function(h) { if (h.position) positionsSet[h.position] = 1; });
  var positions = Object.keys(positionsSet);

  // Cases HTML
  var casesHtml = "";
  if (!cases.length) {
    casesHtml = "<div class='no-cases'><svg width='18' height='18' fill='none' stroke='currentColor' stroke-width='2' viewBox='0 0 24 24'><polyline points='20 6 9 17 4 12'/></svg>No criminal cases declared in affidavit</div>" +
      (mynetaCasesLink ? "<div style='margin-top:12px'><a href='" + mynetaCasesLink + "' target='_blank' rel='noopener' class='myneta-case-btn'>" + svgIcon("ext") + " Verify on MyNeta.info</a></div>" : "");
  } else {
    casesHtml = cases.map(function(cs) {
      return "<div class='case-item'>" +
        "<div style='display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:8px'>" +
          "<span class='case-status'>" + escHtml(cs.status || "Pending") + "</span>" +
          (mynetaCasesLink ? "<a href='" + mynetaCasesLink + "' target='_blank' rel='noopener' class='myneta-case-btn'>" + svgIcon("ext") + " View on MyNeta.info</a>" : "") +
        "</div>" +
        "<p class='case-desc'>" + escHtml(cs.description || "No description.") + "</p>" +
        "</div>";
    }).join("");
  }

  // Sources
  var standard = [];
  if (mynetaLink) standard.push({ title: "MyNeta — Candidate Affidavit (Maharashtra 2024)", link: mynetaLink });
  standard.push({ title: "Election Commission of India — Affidavit Archive", link: ECI_URL });
  standard.push({ title: "Association for Democratic Reforms (ADR)", link: ADR_URL });
  standard.push({ title: "MyNeta.info — Open Election Data Platform", link: MYNETA_HOME });
  var seen = {};
  var allSources = sources.concat(standard).filter(function(s) {
    if (!s.link || seen[s.link]) return false;
    seen[s.link] = 1; return true;
  });
  var sourcesHtml = allSources.map(function(s) {
    return "<a href='" + escHtml(s.link) + "' target='_blank' rel='noopener' class='source-link'>" +
      svgIcon("link") + " " + escHtml(s.title || s.link) +
      "<span style='margin-left:auto;opacity:.4;flex-shrink:0'>" + svgIcon("ext") + "</span></a>";
  }).join("");

  main.innerHTML =
    "<div class='profile-grid'>" +

    // BASIC INFO
    "<div class='section-card'>" +
      "<div class='section-header'><div class='section-icon'>" + svgIcon("info") + "</div><h2>Basic Information</h2></div>" +
      "<div class='section-body'>" +
        "<div class='info-row'><span class='info-label'>Party</span><span class='info-value'>" + escHtml(c.party) + "</span></div>" +
        "<div class='info-row'><span class='info-label'>Constituency</span><span class='info-value'>" + escHtml(c.constituency) + "</span></div>" +
        "<div class='info-row'><span class='info-label'>City / State</span><span class='info-value'>" + escHtml(c.city || "Mumbai") + ", " + escHtml(c.state || "Maharashtra") + "</span></div>" +
        (c.education ? "<div class='info-row'><span class='info-label'>Education</span><span class='info-value' style='text-align:right;font-size:.82rem'>" + escHtml(c.education) + "</span></div>" : "") +
        (careerYears > 0 ? "<div class='info-row'><span class='info-label'>Career Span</span><span class='info-value'>" + careerYears + "+ years</span></div>" : "") +
        (partiesServed.length ? "<div class='info-row'><span class='info-label'>Parties Served</span><span class='info-value' style='text-align:right;font-size:.82rem'>" + partiesServed.map(escHtml).join("<br>") + "</span></div>" : "") +
        (positions.length ? "<div class='info-row'><span class='info-label'>Positions Held</span><span class='info-value' style='text-align:right;font-size:.82rem'>" + positions.map(escHtml).join("<br>") + "</span></div>" : "") +
        (mynetaLink ? "<div class='info-row'><span class='info-label'>MyNeta</span><span class='info-value'><a href='" + mynetaLink + "' target='_blank' rel='noopener' style='color:var(--navy-light);font-weight:600;display:inline-flex;align-items:center;gap:4px'>Full affidavit " + svgIcon("ext") + "</a></span></div>" : "") +
      "</div>" +
    "</div>" +

    // ASSETS
    "<div class='section-card'>" +
      "<div class='section-header'><div class='section-icon'>" + svgIcon("assets") + "</div><h2>Declared Assets</h2></div>" +
      "<div class='section-body'>" +
        "<div class='asset-row'><span class='asset-label'>Movable Assets</span><span class='asset-value'>" + formatMoney(c.assets && c.assets.movable) + "</span></div>" +
        "<div class='asset-row'><span class='asset-label'>Immovable Assets</span><span class='asset-value'>" + formatMoney(c.assets && c.assets.immovable) + "</span></div>" +
        "<div class='asset-row'><span class='asset-label'>Total (Auto-Calculated)</span><span class='asset-value total'>" + formatMoney(c.assets && c.assets.total) + "</span></div>" +
        (mynetaAssetsLink ? "<div style='margin-top:14px;padding-top:12px;border-top:1px solid #f0ede6'><p style='font-size:.75rem;color:var(--text-light);margin-bottom:6px'>Self-declared affidavit filed with ECI, sourced via MyNeta.info.</p><a href='" + mynetaAssetsLink + "' target='_blank' rel='noopener' class='myneta-case-btn'>" + svgIcon("ext") + " Full breakdown on MyNeta</a></div>" : "") +
      "</div>" +
    "</div>" +

    // BIO
    (c.biography ? "<div class='section-card full-width'><div class='section-header'><div class='section-icon'>" + svgIcon("book") + "</div><h2>Biography</h2></div><div class='section-body'><p class='bio-text'>" + escHtml(c.biography) + "</p></div></div>" : "") +

    // TIMELINE
    "<div class='section-card full-width'>" +
      "<div class='section-header'><div class='section-icon'>" + svgIcon("history") + "</div><h2>Political Career Timeline</h2></div>" +
      "<div class='section-body'>" + renderTimeline(c.politicalHistory) + "</div>" +
    "</div>" +

    // CRIMINAL CASES
    "<div class='section-card full-width'>" +
      "<div class='section-header'><div class='section-icon' style='background:linear-gradient(135deg,#e53e3e,#c53030)'>" + svgIcon("cases") + "</div><h2>Criminal Cases (" + cases.length + ")</h2></div>" +
      "<div class='section-body'>" + casesHtml + "</div>" +
    "</div>" +

    // SOURCES
    "<div class='section-card'>" +
      "<div class='section-header'><div class='section-icon'>" + svgIcon("link") + "</div><h2>Sources &amp; References</h2></div>" +
      "<div class='section-body'>" + (sourcesHtml || "<p style='font-size:.85rem;color:var(--text-light)'>No sources listed.</p>") + "</div>" +
    "</div>" +

    // REPORT
    "<div class='section-card'>" +
      "<div class='section-header'><div class='section-icon'>" + svgIcon("flag") + "</div><h2>Report an Issue</h2></div>" +
      "<div class='section-body'>" +
        "<p style='font-size:.82rem;color:var(--text-light);margin-bottom:12px'>Found an inaccuracy? You'll get a unique Report ID for tracking.</p>" +
        "<div class='report-form'>" +
          "<textarea id='reportMsg' placeholder='Describe the issue or inaccuracy\u2026'></textarea>" +
          "<button class='submit-btn' onclick='submitReport(\"" + escHtml(c._id) + "\",\"" + escHtml(c.slug) + "\")'>Submit Report</button>" +
          "<div id='reportStatus'></div>" +
        "</div>" +
      "</div>" +
    "</div>" +

    "</div>";
}

// ── SUBMIT REPORT ─────────────────────────────────────────────────────────────
function submitReport(pageId, slug) {
  var msg    = document.getElementById("reportMsg").value.trim();
  var status = document.getElementById("reportStatus");
  if (!msg) { status.innerHTML = "<span style='color:var(--danger);font-size:.85rem'>Please enter a message.</span>"; return; }
  fetch(API_BASE + "/api/reports", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ pageId: pageId, pageType: "Candidate", message: msg, entitySlug: slug })
  }).then(function(r) { return r.json(); })
    .then(function(data) {
      if (data.success) {
        document.getElementById("reportMsg").value = "";
        status.innerHTML =
          "<div class='report-success'><svg width='15' height='15' fill='none' stroke='currentColor' stroke-width='2' viewBox='0 0 24 24'><polyline points='20 6 9 17 4 12'/></svg>Report submitted &mdash; our team will review it.</div>" +
          (data.reportId ? "<div style='margin-top:6px;font-size:.8rem;color:var(--text-mid)'>Your Report ID: <span class='report-id-badge'>" + escHtml(data.reportId) + "</span></div>" : "");
      } else {
        status.innerHTML = "<span style='color:var(--danger);font-size:.85rem'>" + escHtml(data.error || "Submission failed") + "</span>";
      }
    }).catch(function() {
      status.innerHTML = "<span style='color:var(--danger);font-size:.85rem'>Could not submit &mdash; check your connection.</span>";
    });
}

// ── INIT ──────────────────────────────────────────────────────────────────────
(function init() {
  var slug = new URLSearchParams(window.location.search).get("slug");
  if (!slug) { hero.innerHTML = "<h1>No candidate specified.</h1>"; return; }
  fetch(API + "/" + encodeURIComponent(slug))
    .then(function(r) {
      if (!r.ok) throw new Error("Candidate not found");
      return r.json();
    })
    .then(function(c) { renderHero(c); renderProfile(c); })
    .catch(function(e) {
      hero.innerHTML = "<h1 style='color:rgba(255,255,255,.7)'>Candidate not found</h1>";
      main.innerHTML = "<div class='empty-state' style='max-width:900px;margin:0 auto;padding:40px'><h2>" + escHtml(e.message) + "</h2></div>";
    });
})();
