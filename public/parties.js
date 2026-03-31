// ═══════════════════════════════════════════════════════
//  API BASE URL — points to your Render backend
// ═══════════════════════════════════════════════════════
var API_BASE = "https://myfirstvote-backend1.onrender.com";
var API      = API_BASE + "/api/parties";
var grid     = document.getElementById("partiesGrid");

function escHtml(s) {
  return String(s || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

function partyTypeBadge(type) {
  var map = { National: "national", State: "state", Regional: "regional", Alliance: "alliance" };
  var cls = map[type] || "state";
  return "<span class='party-type-badge " + cls + "'>" + escHtml(type) + "</span>";
}

function render(parties) {
  if (!parties || !parties.length) {
    grid.innerHTML = "<div class='empty-state' style='grid-column:1/-1'><h2>No parties found</h2></div>";
    return;
  }

  grid.innerHTML = parties.map(function(p, i) {
    var colour = p.colour || "#1e3a8a";

    var abbr = (p.abbreviation || "?")
      .toUpperCase()
      .replace(/[()]/g, "")
      .trim();
    var len  = abbr.length;

    var electionsHtml;
    if (p.electionHistory && p.electionHistory.length) {
      electionsHtml = p.electionHistory
        .slice()
        .sort(function(a, b) { return b.year - a.year; })
        .map(function(e) {
          var seats = (e.seatsWon != null)
            ? e.seatsWon + (e.totalSeats ? "/" + e.totalSeats : "") + " seats"
            : "\u2014";
          return "<div class='election-row'>" +
            "<span class='election-year'>" + escHtml(String(e.year)) + "</span>" +
            "<span class='election-name'>" + escHtml(e.election || "") + "</span>" +
            "<span class='election-seats'>" + escHtml(seats) + "</span>" +
            "</div>";
        }).join("");
    } else {
      electionsHtml = "<div style='padding:12px 20px;font-size:.82rem;color:var(--text-light)'>No election history recorded.</div>";
    }

    return "<div class='party-card' style='animation-delay:" + (i * 80) + "ms'>" +

      "<div class='party-card-top'>" +
        "<div class='party-emblem' data-len='" + len + "' style='background:" + escHtml(colour) + "'>" +
          escHtml(abbr) +
        "</div>" +
        "<div class='party-card-name'>" +
          "<h3>" + escHtml(p.name) + "</h3>" +
          partyTypeBadge(p.type) +
        "</div>" +
      "</div>" +

      "<div class='party-meta'>" +
        (p.foundedYear ? "<div class='party-meta-row'><strong>Founded</strong>" + p.foundedYear + "</div>" : "") +
        (p.foundedBy   ? "<div class='party-meta-row'><strong>Founded by</strong>" + escHtml(p.foundedBy) + "</div>" : "") +
        (p.ideology    ? "<div class='party-meta-row'><strong>Ideology</strong>" + escHtml(p.ideology) + "</div>" : "") +
        (p.symbol      ? "<div class='party-meta-row'><strong>Symbol</strong>" + escHtml(p.symbol) + "</div>" : "") +
        (p.headquarters? "<div class='party-meta-row'><strong>HQ</strong>" + escHtml(p.headquarters) + "</div>" : "") +
      "</div>" +

      (p.description ? "<div class='party-desc'>" + escHtml(p.description) + "</div>" : "") +

      "<div class='party-elections'>" +
        "<div class='party-elections-header'>Election History</div>" +
        electionsHtml +
      "</div>" +

    "</div>";
  }).join("");
}

fetch(API)
  .then(function(r) { return r.json(); })
  .then(render)
  .catch(function(e) {
    grid.innerHTML = "<div class='empty-state' style='grid-column:1/-1'><h2>Could not load parties</h2><p>" + escHtml(e.message) + "</p></div>";
  });
