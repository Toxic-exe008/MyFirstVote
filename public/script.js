// ═══════════════════════════════════════════════════════
//  API BASE URL
//  When running locally:  change to "http://localhost:5000"
//  When deployed:         keep as your Render backend URL
// ═══════════════════════════════════════════════════════
var API_BASE = "https://myfirstvote-backend1.onrender.com";
var API      = API_BASE + "/api/candidates";

var container = document.getElementById("candidatesContainer");
var searchEl  = document.getElementById("search");
var filterEl  = document.getElementById("filter");
var countEl   = document.getElementById("resultsCount");

// ── MARQUEE — loads live from DB ──────────────────────────────────────────────
function loadMarquee() {
  fetch(API_BASE + "/api/election-notice")
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (!data || !data.title) return;
      var bar  = document.getElementById("marqueeBar");
      var text = document.getElementById("marqueeText");
      if (!bar || !text) return;

      var parts = [
        "\uD83D\uDCE2 " + data.title,
        "\uD83D\uDCC5 Voting Date: " + data.electionDate,
        "\u23F0 Voting Time: " + data.votingStart + " \u2013 " + data.votingEnd,
        "\uD83D\uDCCD " + data.constituency
      ];
      if (data.resultDate) parts.push("\uD83D\uDCCA Result Date: " + data.resultDate);
      parts.push("\u2139\uFE0F " + data.description);
      parts.push("\uD83D\uDDF3\uFE0F Exercise your right to vote!");

      text.innerHTML = parts.map(function(p) { return escHtml(p); }).join("&nbsp;&nbsp;&#9679;&nbsp;&nbsp;");
      bar.style.display = "block";
    })
    .catch(function() { /* marquee is optional */ });
}

// ── HELPERS ───────────────────────────────────────────────────────────────────
function debounce(fn, ms) {
  var t;
  return function() {
    var a = arguments;
    clearTimeout(t);
    t = setTimeout(function() { fn.apply(null, a); }, ms);
  };
}

function escHtml(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatMoney(n) {
  if (!n) return "N/A";
  if (n >= 1e7) return "\u20B9" + (n / 1e7).toFixed(2) + " Cr";
  if (n >= 1e5) return "\u20B9" + (n / 1e5).toFixed(2) + " L";
  return "\u20B9" + Number(n).toLocaleString("en-IN");
}

function careerSummary(history) {
  if (!history || !history.length) return "";
  var first = 9999;
  for (var i = 0; i < history.length; i++) {
    if (history[i].fromYear && history[i].fromYear < first) first = history[i].fromYear;
  }
  if (first === 9999) return "";
  return (new Date().getFullYear() - first) + "+ yrs in politics";
}

// ── RENDER CARDS ──────────────────────────────────────────────────────────────
function displayCandidates(data) {
  container.innerHTML = "";
  if (countEl) countEl.textContent = data.length + " candidate" + (data.length !== 1 ? "s" : "") + " found";

  if (!data.length) {
    container.innerHTML = "<div class='empty-state'><h2>No candidates found</h2><p>Try a different search or constituency filter.</p></div>";
    return;
  }

  data.forEach(function(c, i) {
    var cases   = (c.criminalCases && c.criminalCases.length) ? c.criminalCases.length : 0;
    var total   = c.assets && c.assets.total;
    var yearStr = careerSummary(c.politicalHistory);

    var card = document.createElement("div");
    card.className = "card";
    card.style.animationDelay = (i * 60) + "ms";

    card.innerHTML =
      "<div class='card-accent'></div>" +
      "<div class='card-body'>" +
        "<span class='card-party-badge'>" + escHtml(c.party) + "</span>" +
        "<h3>" + escHtml(c.name) + "</h3>" +
        "<div class='card-meta'>" +
          "<div class='card-meta-item'>" +
            "<svg width='13' height='13' fill='none' stroke='currentColor' stroke-width='2' viewBox='0 0 24 24'><path d='M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z'/><circle cx='12' cy='10' r='3'/></svg>" +
            escHtml(c.constituency) +
          "</div>" +
          (total ? "<div class='card-meta-item'>" +
            "<svg width='13' height='13' fill='none' stroke='currentColor' stroke-width='2' viewBox='0 0 24 24'><rect x='2' y='7' width='20' height='14' rx='2'/><path d='M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2'/></svg>" +
            "Total Assets: " + formatMoney(total) + "</div>" : "") +
          (yearStr ? "<div class='card-meta-item'>" +
            "<svg width='13' height='13' fill='none' stroke='currentColor' stroke-width='2' viewBox='0 0 24 24'><circle cx='12' cy='12' r='10'/><polyline points='12 6 12 12 16 14'/></svg>" +
            escHtml(yearStr) + "</div>" : "") +
        "</div>" +
        "<div class='card-cases " + (cases > 0 ? "has-cases" : "clean") + "'>" +
          (cases > 0
            ? "<svg width='13' height='13' fill='none' stroke='currentColor' stroke-width='2' viewBox='0 0 24 24'><path d='M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z'/><line x1='12' y1='9' x2='12' y2='13'/><line x1='12' y1='17' x2='12.01' y2='17'/></svg> " + cases + " criminal case" + (cases > 1 ? "s" : "") + " declared"
            : "<svg width='13' height='13' fill='none' stroke='currentColor' stroke-width='2' viewBox='0 0 24 24'><polyline points='20 6 9 17 4 12'/></svg> No criminal cases") +
        "</div>" +
      "</div>" +
      "<div class='card-footer'>" +
        "<span class='view-profile'>View full profile " +
          "<svg width='13' height='13' fill='none' stroke='currentColor' stroke-width='2' viewBox='0 0 24 24'><polyline points='9 18 15 12 9 6'/></svg>" +
        "</span>" +
      "</div>";

    card.addEventListener("click", function() {
      window.location.href = "candidate.html?slug=" + encodeURIComponent(c.slug);
    });
    container.appendChild(card);
  });
}

// ── FETCH ─────────────────────────────────────────────────────────────────────
function showLoading() {
  container.innerHTML = "<div class='spinner-wrap'><div class='spinner'></div><p>Loading candidates&hellip;</p></div>";
}

function loadCandidates() {
  showLoading();
  var constituency = filterEl.value;
  var url = constituency ? API + "?constituency=" + encodeURIComponent(constituency) : API;
  fetch(url)
    .then(function(r) { return r.json(); })
    .then(displayCandidates)
    .catch(function(e) {
      container.innerHTML = "<div class='empty-state'><h2>Could not load data</h2><p>" + escHtml(e.message) + "</p><p style='font-size:.8rem;color:#999;margin-top:8px'>The server may be waking up (Render free tier). Please wait 30 seconds and refresh.</p></div>";
    });
}

function searchCandidates(text) {
  showLoading();
  fetch(API + "/search/" + encodeURIComponent(text))
    .then(function(r) { return r.json(); })
    .then(function(data) {
      var constituency = filterEl.value;
      if (constituency) data = data.filter(function(c) { return c.constituency === constituency; });
      displayCandidates(data);
    })
    .catch(function(e) {
      container.innerHTML = "<div class='empty-state'><h2>Search failed</h2><p>" + escHtml(e.message) + "</p></div>";
    });
}

// ── EVENTS ────────────────────────────────────────────────────────────────────
var debouncedSearch = debounce(function(val) {
  if (val.trim()) searchCandidates(val.trim());
  else loadCandidates();
}, 350);

searchEl.addEventListener("input", function(e) { debouncedSearch(e.target.value); });
filterEl.addEventListener("change", function() {
  if (searchEl.value.trim()) searchCandidates(searchEl.value.trim());
  else loadCandidates();
});

// ── INIT ──────────────────────────────────────────────────────────────────────
loadMarquee();
loadCandidates();
