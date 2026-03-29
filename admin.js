// ==============================================
// CONFIG
// ==============================================
const BASE = "http://localhost:5000";
let ADMIN_KEY = "";
let editingCandidateId = null;
let editingPartyId     = null;
let editingNoticeId    = null;
let editingReportId    = null;

// ==============================================
// AUTH
// ==============================================
function doLogin() {
  const pw = document.getElementById("loginPassword").value.trim();
  if (!pw) return;
  fetch(BASE + "/api/admin/login", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ password: pw })
  })
  .then(r => r.json())
  .then(d => {
    if (d.success) {
      ADMIN_KEY = pw;
      document.getElementById("loginScreen").style.display = "none";
      document.getElementById("adminLayout").style.display = "flex";
      loadDashboard();
      loadCandidates();
    } else {
      document.getElementById("loginError").style.display = "block";
    }
  })
  .catch(() => {
    document.getElementById("loginError").style.display = "block";
  });
}

document.getElementById("loginPassword").addEventListener("keydown", function(e) {
  if (e.key === "Enter") doLogin();
});

function doLogout() {
  ADMIN_KEY = "";
  document.getElementById("adminLayout").style.display = "none";
  document.getElementById("loginScreen").style.display = "flex";
  document.getElementById("loginPassword").value = "";
}

// ==============================================
// HELPERS
// ==============================================
function apiReq(path, opts) {
  opts = opts || {};
  return fetch(BASE + path, Object.assign({}, opts, {
    headers: Object.assign(
      { "Content-Type": "application/json", "x-admin-key": ADMIN_KEY },
      opts.headers || {}
    )
  })).then(function(r) { return r.json(); });
}

function esc(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function money(n) {
  if (!n) return "\u20B90";
  if (n >= 1e7) return "\u20B9" + (n / 1e7).toFixed(2) + " Cr";
  if (n >= 1e5) return "\u20B9" + (n / 1e5).toFixed(2) + " L";
  return "\u20B9" + Number(n).toLocaleString("en-IN");
}

function fmtDate(d) {
  if (!d) return "\u2014";
  return new Date(d).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit"
  });
}

function toast(msg, type) {
  var t = document.createElement("div");
  t.textContent = msg;
  t.style.cssText = [
    "position:fixed", "bottom:24px", "right:24px",
    "background:" + (type === "error" ? "#f87171" : "#34d399"),
    "color:#0b1629", "padding:12px 20px", "border-radius:8px",
    "font-weight:600", "font-size:.85rem", "z-index:9999"
  ].join(";");
  document.body.appendChild(t);
  setTimeout(function() { t.remove(); }, 3000);
}

function confirm2(msg, cb) {
  if (window.confirm(msg)) cb();
}

// ==============================================
// SECTION NAVIGATION
// ==============================================
var sectionLoaders = {
  dashboard:  loadDashboard,
  candidates: loadCandidates,
  parties:    loadParties,
  reports:    loadReports,
  notices:    loadNotices,
  audit:      loadAuditLog
};

function showSection(name) {
  document.querySelectorAll(".admin-section").forEach(function(s) {
    s.style.display = "none";
  });
  document.querySelectorAll(".admin-nav-item").forEach(function(n) {
    n.classList.remove("active");
  });
  var sec = document.getElementById("sec-" + name);
  if (sec) sec.style.display = "block";
  var navItem = document.querySelector("[data-section='" + name + "']");
  if (navItem) navItem.classList.add("active");
  if (sectionLoaders[name]) sectionLoaders[name]();
}

// ==============================================
// DASHBOARD
// ==============================================
function loadDashboard() {
  Promise.all([
    apiReq("/api/admin/stats"),
    apiReq("/api/admin/audit-logs?limit=8")
  ]).then(function(results) {
    var stats = results[0];
    var logs  = results[1];

    document.getElementById("dashStats").innerHTML =
      statCard(stats.candidates     || 0, "Candidates") +
      statCard(stats.parties        || 0, "Parties") +
      statCard(stats.reports        || 0, "Total Reports") +
      statCard(stats.pendingReports || 0, "Pending Reports", "#f87171") +
      statCard(stats.logs           || 0, "Audit Entries");

    var badge = document.getElementById("pendingBadge");
    if (stats.pendingReports > 0) {
      badge.textContent   = stats.pendingReports;
      badge.style.display = "inline-block";
    } else {
      badge.style.display = "none";
    }

    var logEl = document.getElementById("dashRecentLogs");
    if (!logs.length) {
      logEl.innerHTML = "<span>No activity yet.</span>";
      return;
    }
    logEl.innerHTML = logs.map(function(l) {
      return "<div style='display:flex;gap:12px;padding:8px 0;border-bottom:1px solid #1e2435;align-items:center;font-size:.82rem'>" +
        "<span style='color:#64748b;min-width:130px'>" + fmtDate(l.createdAt) + "</span>" +
        "<span class='audit-action " + l.action.toLowerCase() + "' style='min-width:70px;text-align:center'>" + esc(l.action) + "</span>" +
        "<span style='color:#cbd5e1;flex:1'>" + esc(l.entityName) + " \u2014 " + esc(l.details) + "</span>" +
        "<span style='color:#475569;font-size:.72rem'>" + esc(l.entity) + "</span>" +
        "</div>";
    }).join("");
  }).catch(function(e) { console.error(e); });
}

function statCard(val, label, colour) {
  return "<div class='admin-stat-card'>" +
    "<div class='stat-val'" + (colour ? " style='color:" + colour + "'" : "") + ">" + val + "</div>" +
    "<div class='stat-label'>" + label + "</div>" +
    "</div>";
}

// ==============================================
// CANDIDATES
// ==============================================
function loadCandidates() {
  var tbody = document.getElementById("candidatesTableBody");
  apiReq("/api/candidates").then(function(data) {
    if (!data.length) {
      tbody.innerHTML = "<tr><td colspan='6' style='text-align:center;color:#64748b;padding:32px'>No candidates found.</td></tr>";
      return;
    }
    tbody.innerHTML = data.map(function(c) {
      return "<tr>" +
        "<td><span class='tbl-name'>" + esc(c.name) + "</span></td>" +
        "<td><span style='font-size:.82rem;color:#94a3b8'>" + esc(c.party) + "</span></td>" +
        "<td><span style='font-size:.82rem;color:#94a3b8'>" + esc(c.constituency) + "</span></td>" +
        "<td><span style='font-size:.82rem;color:#f0c040'>" + money(c.assets && c.assets.total) + "</span></td>" +
        "<td><span style='font-size:.82rem;color:" + ((c.criminalCases && c.criminalCases.length) ? "#f87171" : "#34d399") + "'>" +
          ((c.criminalCases && c.criminalCases.length) || 0) + "</span></td>" +
        "<td><div class='tbl-actions'>" +
          "<button class='btn-sm btn-edit' onclick='editCandidate(\"" + c._id + "\")'>\u270F Edit</button>" +
          "<button class='btn-sm btn-delete' onclick='deleteCandidate(\"" + c._id + "\",\"" + esc(c.name) + "\")'>\uD83D\uDDD1 Delete</button>" +
        "</div></td>" +
        "</tr>";
    }).join("");
  }).catch(function(e) {
    tbody.innerHTML = "<tr><td colspan='6' style='color:#f87171;padding:20px'>" + esc(e.message) + "</td></tr>";
  });
}

function openCandidateModal(c) {
  c = c || null;
  editingCandidateId = c ? c._id : null;
  document.getElementById("candidateModalTitle").textContent = c ? "Edit Candidate" : "Add Candidate";
  document.getElementById("c-name").value         = (c && c.name)         || "";
  document.getElementById("c-slug").value         = (c && c.slug)         || "";
  document.getElementById("c-party").value        = (c && c.party)        || "";
  document.getElementById("c-constituency").value = (c && c.constituency) || "Kurla";
  document.getElementById("c-education").value    = (c && c.education)    || "";
  document.getElementById("c-mynetaId").value     = (c && c.mynetaId)     || "";
  document.getElementById("c-movable").value      = (c && c.assets && c.assets.movable)   || 0;
  document.getElementById("c-immovable").value    = (c && c.assets && c.assets.immovable) || 0;
  document.getElementById("c-biography").value    = (c && c.biography)    || "";
  updateAssetTotal();

  document.getElementById("historyItems").innerHTML = "";
  ((c && c.politicalHistory) || []).forEach(function(h) { addHistoryItem(h); });

  document.getElementById("caseItems").innerHTML = "";
  ((c && c.criminalCases) || []).forEach(function(cs) { addCaseItem(cs); });

  document.getElementById("sourceItems").innerHTML = "";
  ((c && c.sources) || []).forEach(function(s) { addSourceItem(s); });

  document.getElementById("candidateModal").style.display = "flex";
}

function editCandidate(id) {
  apiReq("/api/candidates").then(function(arr) {
    var c = arr.find(function(x) { return x._id === id; });
    openCandidateModal(c);
  }).catch(function() { toast("Could not load candidate", "error"); });
}

function updateAssetTotal() {
  var m = parseFloat(document.getElementById("c-movable").value)   || 0;
  var i = parseFloat(document.getElementById("c-immovable").value) || 0;
  document.getElementById("assetTotalDisplay").textContent = money(m + i);
}

function addHistoryItem(h) {
  h = h || {};
  var div = document.createElement("div");
  div.className = "dynamic-list-item";
  div.innerHTML =
    "<button class='remove-item' onclick='this.parentElement.remove()'>\u2715</button>" +
    "<div class='form-row'>" +
      "<div class='form-group' style='margin-bottom:8px'><label>Party</label>" +
        "<input type='text' class='h-party' value='" + esc(h.party || "") + "' placeholder='Party name'/></div>" +
      "<div class='form-group' style='margin-bottom:8px'><label>Position</label>" +
        "<input type='text' class='h-position' value='" + esc(h.position || "") + "' placeholder='e.g. MLA, Minister'/></div>" +
    "</div>" +
    "<div class='form-row'>" +
      "<div class='form-group' style='margin-bottom:8px'><label>From Year</label>" +
        "<input type='number' class='h-from' value='" + esc(h.fromYear || "") + "' placeholder='2019'/></div>" +
      "<div class='form-group' style='margin-bottom:8px'><label>To Year (0 = Present)</label>" +
        "<input type='number' class='h-to' value='" + esc(h.toYear || "") + "' placeholder='2024 or 0'/></div>" +
    "</div>" +
    "<div class='form-group' style='margin-bottom:0'><label>Notes</label>" +
      "<input type='text' class='h-notes' value='" + esc(h.notes || "") + "' placeholder='Optional context\u2026'/></div>";
  document.getElementById("historyItems").appendChild(div);
}

function addCaseItem(cs) {
  cs = cs || {};
  var statuses = ["Alleged","Investigated","Chargesheeted","Convicted","Acquitted","Pending"];
  var opts = statuses.map(function(s) {
    return "<option value='" + s + "'" + (cs.status === s ? " selected" : "") + ">" + s + "</option>";
  }).join("");
  var div = document.createElement("div");
  div.className = "dynamic-list-item";
  div.innerHTML =
    "<button class='remove-item' onclick='this.parentElement.remove()'>\u2715</button>" +
    "<div class='form-group' style='margin-bottom:8px'><label>Status</label>" +
      "<select class='cs-status'>" + opts + "</select></div>" +
    "<div class='form-group' style='margin-bottom:8px'><label>Description</label>" +
      "<textarea class='cs-desc' style='min-height:70px'>" + esc(cs.description || "") + "</textarea></div>" +
    "<div class='form-group' style='margin-bottom:0'><label>Source URL</label>" +
      "<input type='text' class='cs-source' value='" + esc(cs.source || "") + "' placeholder='https://\u2026'/></div>";
  document.getElementById("caseItems").appendChild(div);
}

function addSourceItem(s) {
  s = s || {};
  var div = document.createElement("div");
  div.className = "dynamic-list-item";
  div.innerHTML =
    "<button class='remove-item' onclick='this.parentElement.remove()'>\u2715</button>" +
    "<div class='form-row'>" +
      "<div class='form-group' style='margin-bottom:0'><label>Title</label>" +
        "<input type='text' class='src-title' value='" + esc(s.title || "") + "' placeholder='Source name'/></div>" +
      "<div class='form-group' style='margin-bottom:0'><label>URL *</label>" +
        "<input type='text' class='src-link' value='" + esc(s.link || "") + "' placeholder='https://\u2026'/></div>" +
    "</div>";
  document.getElementById("sourceItems").appendChild(div);
}

function saveCandidate() {
  var body = {
    name:         document.getElementById("c-name").value.trim(),
    slug:         document.getElementById("c-slug").value.trim(),
    party:        document.getElementById("c-party").value.trim(),
    constituency: document.getElementById("c-constituency").value,
    education:    document.getElementById("c-education").value.trim(),
    mynetaId:     document.getElementById("c-mynetaId").value.trim(),
    biography:    document.getElementById("c-biography").value.trim(),
    assets: {
      movable:   parseFloat(document.getElementById("c-movable").value)   || 0,
      immovable: parseFloat(document.getElementById("c-immovable").value) || 0
    },
    politicalHistory: Array.from(document.querySelectorAll("#historyItems .dynamic-list-item")).map(function(el) {
      return {
        party:    el.querySelector(".h-party").value.trim(),
        position: el.querySelector(".h-position").value.trim(),
        fromYear: parseInt(el.querySelector(".h-from").value)  || null,
        toYear:   parseInt(el.querySelector(".h-to").value)    || 0,
        notes:    el.querySelector(".h-notes").value.trim()
      };
    }),
    criminalCases: Array.from(document.querySelectorAll("#caseItems .dynamic-list-item")).map(function(el) {
      return {
        status:      el.querySelector(".cs-status").value,
        description: el.querySelector(".cs-desc").value.trim(),
        source:      el.querySelector(".cs-source").value.trim()
      };
    }),
    sources: Array.from(document.querySelectorAll("#sourceItems .dynamic-list-item")).map(function(el) {
      return {
        title: el.querySelector(".src-title").value.trim(),
        link:  el.querySelector(".src-link").value.trim()
      };
    }).filter(function(s) { return s.link; })
  };

  if (!body.name || !body.slug || !body.party) {
    toast("Name, slug and party are required", "error");
    return;
  }

  var path   = editingCandidateId ? "/api/admin/candidates/" + editingCandidateId : "/api/admin/candidates";
  var method = editingCandidateId ? "PUT" : "POST";

  apiReq(path, { method: method, body: JSON.stringify(body) }).then(function(res) {
    if (res.error) throw new Error(res.error);
    toast(editingCandidateId ? "Candidate updated \u2713" : "Candidate created \u2713");
    closeModal("candidateModal");
    loadCandidates();
  }).catch(function(e) { toast(e.message, "error"); });
}

function deleteCandidate(id, name) {
  confirm2("Delete \"" + name + "\"? This cannot be undone.", function() {
    apiReq("/api/admin/candidates/" + id, { method: "DELETE" }).then(function(r) {
      if (r.error) throw new Error(r.error);
      toast("Candidate deleted");
      loadCandidates();
    }).catch(function(e) { toast(e.message, "error"); });
  });
}

// ==============================================
// PARTIES
// ==============================================
function loadParties() {
  var tbody = document.getElementById("partiesTableBody");
  apiReq("/api/parties").then(function(data) {
    if (!data.length) {
      tbody.innerHTML = "<tr><td colspan='5' style='text-align:center;color:#64748b;padding:32px'>No parties found.</td></tr>";
      return;
    }
    tbody.innerHTML = data.map(function(p) {
      return "<tr>" +
        "<td><span class='tbl-name'>" + esc(p.name) + "</span></td>" +
        "<td><span style='font-size:.9rem;font-weight:700;color:#f0c040'>" + esc(p.abbreviation) + "</span></td>" +
        "<td><span class='tbl-badge " + (p.type || "").toLowerCase() + "'>" + esc(p.type) + "</span></td>" +
        "<td><span style='font-size:.82rem;color:#94a3b8'>" + (p.foundedYear || "\u2014") + "</span></td>" +
        "<td><div class='tbl-actions'>" +
          "<button class='btn-sm btn-edit' onclick='editParty(\"" + p._id + "\")'>\u270F Edit</button>" +
          "<button class='btn-sm btn-delete' onclick='deleteParty(\"" + p._id + "\",\"" + esc(p.name) + "\")'>\uD83D\uDDD1 Delete</button>" +
        "</div></td></tr>";
    }).join("");
  }).catch(function(e) {
    tbody.innerHTML = "<tr><td colspan='5' style='color:#f87171;padding:20px'>" + esc(e.message) + "</td></tr>";
  });
}

function openPartyModal(p) {
  p = p || null;
  editingPartyId = p ? p._id : null;
  document.getElementById("partyModalTitle").textContent  = p ? "Edit Party" : "Add Party";
  document.getElementById("p-name").value         = (p && p.name)         || "";
  document.getElementById("p-slug").value         = (p && p.slug)         || "";
  document.getElementById("p-abbreviation").value = (p && p.abbreviation) || "";
  document.getElementById("p-type").value         = (p && p.type)         || "National";
  document.getElementById("p-foundedYear").value  = (p && p.foundedYear)  || "";
  document.getElementById("p-colour").value       = (p && p.colour)       || "#1e3a8a";
  document.getElementById("p-foundedBy").value    = (p && p.foundedBy)    || "";
  document.getElementById("p-ideology").value     = (p && p.ideology)     || "";
  document.getElementById("p-symbol").value       = (p && p.symbol)       || "";
  document.getElementById("p-headquarters").value = (p && p.headquarters) || "";
  document.getElementById("p-description").value  = (p && p.description)  || "";

  document.getElementById("partyElectionItems").innerHTML = "";
  ((p && p.electionHistory) || []).forEach(function(e) { addPartyElectionItem(e); });

  document.getElementById("partyModal").style.display = "flex";
}

function editParty(id) {
  apiReq("/api/parties").then(function(data) {
    var p = data.find(function(x) { return x._id === id; });
    openPartyModal(p);
  }).catch(function() { toast("Could not load party", "error"); });
}

function addPartyElectionItem(e) {
  e = e || {};
  var div = document.createElement("div");
  div.className = "dynamic-list-item";
  div.innerHTML =
    "<button class='remove-item' onclick='this.parentElement.remove()'>\u2715</button>" +
    "<div class='form-row'>" +
      "<div class='form-group' style='margin-bottom:8px'><label>Year</label>" +
        "<input type='number' class='pe-year' value='" + esc(e.year || "") + "' placeholder='2024'/></div>" +
      "<div class='form-group' style='margin-bottom:8px'><label>Election Name</label>" +
        "<input type='text' class='pe-election' value='" + esc(e.election || "") + "' placeholder='Maharashtra Assembly'/></div>" +
    "</div>" +
    "<div class='form-row'>" +
      "<div class='form-group' style='margin-bottom:8px'><label>Seats Won</label>" +
        "<input type='number' class='pe-won' value='" + esc(e.seatsWon != null ? e.seatsWon : "") + "' placeholder='105'/></div>" +
      "<div class='form-group' style='margin-bottom:8px'><label>Total Seats</label>" +
        "<input type='number' class='pe-total' value='" + esc(e.totalSeats != null ? e.totalSeats : "") + "' placeholder='288'/></div>" +
    "</div>" +
    "<div class='form-group' style='margin-bottom:0'><label>Notes</label>" +
      "<input type='text' class='pe-notes' value='" + esc(e.notes || "") + "' placeholder='Optional context\u2026'/></div>";
  document.getElementById("partyElectionItems").appendChild(div);
}

function saveParty() {
  var body = {
    name:         document.getElementById("p-name").value.trim(),
    slug:         document.getElementById("p-slug").value.trim(),
    abbreviation: document.getElementById("p-abbreviation").value.trim(),
    type:         document.getElementById("p-type").value,
    foundedYear:  parseInt(document.getElementById("p-foundedYear").value) || undefined,
    colour:       document.getElementById("p-colour").value,
    foundedBy:    document.getElementById("p-foundedBy").value.trim(),
    ideology:     document.getElementById("p-ideology").value.trim(),
    symbol:       document.getElementById("p-symbol").value.trim(),
    headquarters: document.getElementById("p-headquarters").value.trim(),
    description:  document.getElementById("p-description").value.trim(),
    electionHistory: Array.from(document.querySelectorAll("#partyElectionItems .dynamic-list-item")).map(function(el) {
      return {
        year:       parseInt(el.querySelector(".pe-year").value)  || null,
        election:   el.querySelector(".pe-election").value.trim(),
        seatsWon:   parseInt(el.querySelector(".pe-won").value)   || 0,
        totalSeats: parseInt(el.querySelector(".pe-total").value) || undefined,
        notes:      el.querySelector(".pe-notes").value.trim()
      };
    }).filter(function(e) { return e.year; })
  };

  if (!body.name || !body.slug || !body.abbreviation) {
    toast("Name, slug and abbreviation are required", "error");
    return;
  }

  var path   = editingPartyId ? "/api/admin/parties/" + editingPartyId : "/api/admin/parties";
  var method = editingPartyId ? "PUT" : "POST";

  apiReq(path, { method: method, body: JSON.stringify(body) }).then(function(res) {
    if (res.error) throw new Error(res.error);
    toast(editingPartyId ? "Party updated \u2713" : "Party created \u2713");
    closeModal("partyModal");
    loadParties();
  }).catch(function(e) { toast(e.message, "error"); });
}

function deleteParty(id, name) {
  confirm2("Delete party \"" + name + "\"?", function() {
    apiReq("/api/admin/parties/" + id, { method: "DELETE" }).then(function() {
      toast("Party deleted");
      loadParties();
    }).catch(function(e) { toast(e.message, "error"); });
  });
}

// ==============================================
// REPORTS
// ==============================================
function loadReports() {
  var tbody  = document.getElementById("reportsTableBody");
  var filter = document.getElementById("reportFilter") ? document.getElementById("reportFilter").value : "";
  var url    = "/api/admin/reports" + (filter ? "?status=" + filter : "");

  apiReq(url).then(function(data) {
    if (!data.length) {
      tbody.innerHTML = "<tr><td colspan='5' style='text-align:center;color:#64748b;padding:32px'>No reports found.</td></tr>";
      return;
    }
    tbody.innerHTML = data.map(function(r) {
      var replyPreview = r.adminReply
        ? "<div style='margin-top:4px;font-size:.75rem;color:#34d399'>\u21A9 Reply: " +
          esc(r.adminReply.slice(0, 80)) + (r.adminReply.length > 80 ? "\u2026" : "") + "</div>"
        : "";
      // ── Show reportId badge under candidate name
      var candidateCell =
        "<span style='font-size:.82rem;color:#e2e8f0'>" + esc(r.candidateName || "Unknown") + "</span>" +
        (r.reportId
          ? "<div style='font-size:.7rem;color:#f0c040;margin-top:3px;font-family:monospace;word-break:break-all'>" + esc(r.reportId) + "</div>"
          : "");
      return "<tr>" +
        "<td style='font-size:.78rem;color:#64748b;white-space:nowrap'>" + fmtDate(r.createdAt) + "</td>" +
        "<td>" + candidateCell + "</td>" +
        "<td><div class='report-msg-preview'>" + esc(r.message) + "</div>" + replyPreview + "</td>" +
        "<td><span class='tbl-badge " + esc(r.status) + "'>" + esc(r.status) + "</span></td>" +
        "<td><div class='tbl-actions'>" +
          "<button class='btn-sm btn-reply' onclick='openReportModal(reports_cache[\"" + r._id + "\"])'>\u21A9 Reply</button>" +
          "<button class='btn-sm btn-delete' onclick='deleteReport(\"" + r._id + "\")'>\uD83D\uDDD1</button>" +
        "</div></td></tr>";
    }).join("");

    // Cache reports so openReportModal can access full object
    window.reports_cache = {};
    data.forEach(function(r) { window.reports_cache[r._id] = r; });

  }).catch(function(e) {
    tbody.innerHTML = "<tr><td colspan='5' style='color:#f87171;padding:20px'>" + esc(e.message) + "</td></tr>";
  });
}

function openReportModal(r) {
  if (!r) return;
  editingReportId = r._id;

  var statusOpts = ["pending", "reviewed", "resolved"].map(function(s) {
    return "<option value='" + s + "'" + (r.status === s ? " selected" : "") + ">" +
      s.charAt(0).toUpperCase() + s.slice(1) + "</option>";
  }).join("");

  document.getElementById("reportModalContent").innerHTML =
    "<div style='margin-bottom:16px'>" +
      "<div style='font-size:.78rem;color:#64748b;margin-bottom:6px'>" +
        "Candidate: <strong style='color:#e2e8f0'>" + esc(r.candidateName || "\u2014") + "</strong>" +
        "&nbsp;\u00B7&nbsp; Received: " + fmtDate(r.createdAt) +
      "</div>" +
      (r.reportId
        ? "<div style='font-size:.72rem;color:#f0c040;font-family:monospace;margin-bottom:10px'>Report ID: " + esc(r.reportId) + "</div>"
        : "") +
      "<div style='background:#0f1117;border-left:3px solid #f0c040;padding:12px 14px;border-radius:4px;" +
        "font-size:.88rem;color:#cbd5e1;margin-bottom:16px'>" + esc(r.message) + "</div>" +
    "</div>" +
    "<div class='form-group'><label>Status</label>" +
      "<select id='reply-status' class='admin-input' style='margin:0'>" + statusOpts + "</select></div>" +
    "<div class='form-group'><label>Admin Reply (visible to team)</label>" +
      "<textarea id='reply-text' class='admin-input' style='min-height:80px;resize:vertical;margin:0' " +
      "placeholder='Optional reply / notes\u2026'>" + esc(r.adminReply || "") + "</textarea></div>";

  document.getElementById("reportModal").style.display = "flex";
}

function submitReply() {
  var status     = document.getElementById("reply-status").value;
  var adminReply = document.getElementById("reply-text").value.trim();

  apiReq("/api/admin/reports/" + editingReportId, {
    method: "PUT",
    body:   JSON.stringify({ status: status, adminReply: adminReply })
  }).then(function(res) {
    if (res.error) throw new Error(res.error);
    toast("Report updated \u2713");
    closeModal("reportModal");
    loadReports();
    loadDashboard();
  }).catch(function(e) { toast(e.message, "error"); });
}

function deleteReport(id) {
  confirm2("Delete this report permanently?", function() {
    apiReq("/api/admin/reports/" + id, { method: "DELETE" }).then(function() {
      toast("Report deleted");
      loadReports();
    }).catch(function(e) { toast(e.message, "error"); });
  });
}

// ==============================================
// ELECTION NOTICES
// ==============================================
function loadNotices() {
  var tbody = document.getElementById("noticesTableBody");
  apiReq("/api/admin/election-notices").then(function(data) {
    if (!data.length) {
      tbody.innerHTML = "<tr><td colspan='5' style='text-align:center;color:#64748b;padding:32px'>No notices found.</td></tr>";
      return;
    }
    tbody.innerHTML = data.map(function(n) {
      var activeBadge = n.isActive
        ? "<span class='tbl-badge' style='background:rgba(16,185,129,.15);color:#34d399'>\u25CF Active</span>"
        : "<span class='tbl-badge' style='background:rgba(100,116,139,.15);color:#64748b'>Inactive</span>";
      return "<tr>" +
        "<td><span class='tbl-name'>" + esc(n.title) + "</span></td>" +
        "<td style='font-size:.82rem;color:#94a3b8'>" + esc(n.electionDate) + "</td>" +
        "<td style='font-size:.82rem;color:#94a3b8'>" + esc(n.votingStart) + " \u2013 " + esc(n.votingEnd) + "</td>" +
        "<td>" + activeBadge + "</td>" +
        "<td><div class='tbl-actions'>" +
          "<button class='btn-sm btn-edit' onclick='editNotice(\"" + n._id + "\")'>\u270F Edit</button>" +
          "<button class='btn-sm btn-delete' onclick='deleteNotice(\"" + n._id + "\")'>\uD83D\uDDD1</button>" +
        "</div></td></tr>";
    }).join("");
  }).catch(function(e) {
    tbody.innerHTML = "<tr><td colspan='5' style='color:#f87171;padding:20px'>" + esc(e.message) + "</td></tr>";
  });
}

function openNoticeModal(n) {
  n = n || null;
  editingNoticeId = n ? n._id : null;
  document.getElementById("noticeModalTitle").textContent  = n ? "Edit Notice" : "Add Election Notice";
  document.getElementById("n-title").value        = (n && n.title)        || "";
  document.getElementById("n-electionDate").value = (n && n.electionDate) || "";
  document.getElementById("n-resultDate").value   = (n && n.resultDate)   || "";
  document.getElementById("n-votingStart").value  = (n && n.votingStart)  || "7:00 AM";
  document.getElementById("n-votingEnd").value    = (n && n.votingEnd)    || "6:00 PM";
  document.getElementById("n-constituency").value = (n && n.constituency) || "";
  document.getElementById("n-description").value  = (n && n.description)  || "";
  document.getElementById("n-isActive").checked   = n ? (n.isActive !== false) : true;
  document.getElementById("noticeModal").style.display = "flex";
}

function editNotice(id) {
  apiReq("/api/admin/election-notices").then(function(data) {
    var n = data.find(function(x) { return x._id === id; });
    openNoticeModal(n);
  }).catch(function() { toast("Could not load notice", "error"); });
}

function saveNotice() {
  var body = {
    title:        document.getElementById("n-title").value.trim(),
    electionDate: document.getElementById("n-electionDate").value.trim(),
    resultDate:   document.getElementById("n-resultDate").value.trim(),
    votingStart:  document.getElementById("n-votingStart").value.trim(),
    votingEnd:    document.getElementById("n-votingEnd").value.trim(),
    constituency: document.getElementById("n-constituency").value.trim(),
    description:  document.getElementById("n-description").value.trim(),
    isActive:     document.getElementById("n-isActive").checked
  };
  if (!body.title || !body.electionDate) {
    toast("Title and election date are required", "error");
    return;
  }
  var path   = editingNoticeId ? "/api/admin/election-notices/" + editingNoticeId : "/api/admin/election-notices";
  var method = editingNoticeId ? "PUT" : "POST";
  apiReq(path, { method: method, body: JSON.stringify(body) }).then(function(res) {
    if (res.error) throw new Error(res.error);
    toast("Notice saved \u2713 \u2014 marquee updates on next page load");
    closeModal("noticeModal");
    loadNotices();
  }).catch(function(e) { toast(e.message, "error"); });
}

function deleteNotice(id) {
  confirm2("Delete this election notice?", function() {
    apiReq("/api/admin/election-notices/" + id, { method: "DELETE" }).then(function() {
      toast("Notice deleted");
      loadNotices();
    }).catch(function(e) { toast(e.message, "error"); });
  });
}

// ==============================================
// AUDIT LOG
// ==============================================
function loadAuditLog() {
  var container = document.getElementById("auditLogBody");
  apiReq("/api/admin/audit-logs?limit=200").then(function(logs) {
    if (!logs.length) {
      container.innerHTML = "<div style='padding:32px;text-align:center;color:#64748b'>No audit entries yet.</div>";
      return;
    }
    container.innerHTML = logs.map(function(l) {
      return "<div class='audit-row'>" +
        "<span class='audit-ts'>" + fmtDate(l.createdAt) + "</span>" +
        "<span class='audit-action " + l.action.toLowerCase() + "'>" + esc(l.action) + "</span>" +
        "<span style='color:#cbd5e1;font-size:.82rem'>" + esc(l.entityName) + " \u2014 " + esc(l.details) + "</span>" +
        "<span class='audit-entity'>" + esc(l.entity) + "</span>" +
        "</div>";
    }).join("");
  }).catch(function(e) {
    container.innerHTML = "<div style='padding:20px;color:#f87171'>" + esc(e.message) + "</div>";
  });
}

// ==============================================
// MODAL CLOSE
// ==============================================
function closeModal(id) {
  document.getElementById(id).style.display = "none";
  editingCandidateId = null;
  editingPartyId     = null;
  editingNoticeId    = null;
  editingReportId    = null;
}

document.querySelectorAll(".admin-modal-backdrop").forEach(function(backdrop) {
  backdrop.addEventListener("click", function(e) {
    if (e.target === backdrop) backdrop.style.display = "none";
  });
});