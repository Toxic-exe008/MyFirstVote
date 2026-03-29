const API         = "http://localhost:5000/api/candidates";
const hero        = document.getElementById("profileHero");
const main        = document.getElementById("profile");
const MYNETA_BASE = "https://www.myneta.info/Maharashtra2024/candidate.php?candidate_id=";
const ECI_URL     = "https://affidavitarchive.nic.in/";
const ADR_URL     = "https://adrindia.org";
const MYNETA_HOME = "https://www.myneta.info/";

// ─── HELPERS ──────────────────────────────────────────────────
function escHtml(s) { return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function formatMoney(n) {
  if (!n && n !== 0) return 'N/A';
  if (n >= 1e7) return '₹' + (n/1e7).toFixed(2) + ' Cr';
  if (n >= 1e5) return '₹' + (n/1e5).toFixed(2) + ' L';
  return '₹' + n.toLocaleString('en-IN');
}
function initials(name) { return (name||'?').split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase(); }

function svgIcon(name) {
  const icons = {
    info:    `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
    assets:  `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>`,
    cases:   `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
    book:    `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>`,
    link:    `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>`,
    flag:    `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>`,
    history: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
    ext:     `<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`
  };
  return icons[name] || '';
}

// ─── POLITICAL HISTORY TIMELINE ───────────────────────────────
function renderTimeline(history) {
  if (!history?.length) return '<p style="font-size:.85rem;color:var(--text-light)">No political history recorded.</p>';
  const sorted = [...history].sort((a, b) => (b.fromYear||0) - (a.fromYear||0));
  const now    = new Date().getFullYear();
  return `<div class="timeline">${sorted.map(h => {
    const isCurrent = !h.toYear || h.toYear === 0;
    const period    = h.fromYear
      ? `${h.fromYear} – ${isCurrent ? 'Present' : h.toYear}`
      : '';
    return `
      <div class="timeline-item">
        <div class="timeline-dot ${isCurrent ? 'current' : ''}"></div>
        ${period ? `<div class="timeline-period">${period} ${h.fromYear && (isCurrent ? now - h.fromYear : h.toYear - h.fromYear) > 0 ? `· ${isCurrent ? now - h.fromYear : h.toYear - h.fromYear} yr${(isCurrent ? now - h.fromYear : h.toYear - h.fromYear) > 1 ? 's':'' }` : ''}</div>` : ''}
        <div class="timeline-position">${escHtml(h.position || 'Member')}</div>
        ${h.party ? `<div><span class="timeline-party">${escHtml(h.party)}</span></div>` : ''}
        ${h.notes ? `<div class="timeline-notes">${escHtml(h.notes)}</div>` : ''}
      </div>`;
  }).join('')}</div>`;
}

// ─── RENDER HERO ──────────────────────────────────────────────
function renderHero(c) {
  const mynetaLink = c.mynetaId ? `${MYNETA_BASE}${encodeURIComponent(c.mynetaId)}` : null;
  hero.innerHTML = `
    <div class="profile-name-row">
      <div class="profile-avatar">${initials(c.name)}</div>
      <div class="profile-name">
        <h1 style="font-family:'Playfair Display',serif;font-size:clamp(1.6rem,3vw,2.2rem);font-weight:800;margin-bottom:8px;">${escHtml(c.name)}</h1>
        <div class="profile-tags">
          <span class="tag tag-party">${escHtml(c.party)}</span>
          <span class="tag tag-constituency">${escHtml(c.constituency)}</span>
          ${mynetaLink ? `<a href="${mynetaLink}" target="_blank" rel="noopener"
            class="tag" style="background:rgba(212,160,23,.15);color:var(--gold-light);border:1px solid rgba(212,160,23,.3);display:inline-flex;align-items:center;gap:4px;text-decoration:none;">
            MyNeta ${svgIcon('ext')}</a>` : ''}
        </div>
      </div>
    </div>`;
  document.title = `${c.name} — VoteSmart Mumbai`;
}

// ─── RENDER PROFILE BODY ──────────────────────────────────────
function renderProfile(c) {
  const cases   = c.criminalCases || [];
  const sources = c.sources || [];
  const mynetaLink       = c.mynetaId ? `${MYNETA_BASE}${encodeURIComponent(c.mynetaId)}` : null;
  const mynetaCasesLink  = mynetaLink ? `${mynetaLink}#criminal_cases` : null;
  const mynetaAssetsLink = mynetaLink ? `${mynetaLink}#movable_assets` : null;

  // Career stats
  const history = c.politicalHistory || [];
  const firstYear = history.length ? history.reduce((m, h) => (h.fromYear && h.fromYear < m) ? h.fromYear : m, 9999) : 0;
  const careerYears = firstYear !== 9999 ? new Date().getFullYear() - firstYear : 0;
  const partiesServed = [...new Set(history.map(h => h.party).filter(Boolean))];
  const positions     = [...new Set(history.map(h => h.position).filter(Boolean))];

  // Criminal cases HTML
  let casesHtml = '';
  if (cases.length === 0) {
    casesHtml = `<div class="no-cases"><svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>No criminal cases declared in 2024 affidavit</div>
    ${mynetaCasesLink ? `<div style="margin-top:12px"><a href="${mynetaCasesLink}" target="_blank" rel="noopener" class="myneta-case-btn">${svgIcon('ext')} Verify on MyNeta.info</a></div>` : ''}`;
  } else {
    casesHtml = cases.map(cs => `
      <div class="case-item">
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:8px;">
          <span class="case-status">${escHtml(cs.status||'Pending')}</span>
          ${mynetaCasesLink ? `<a href="${mynetaCasesLink}" target="_blank" rel="noopener" class="myneta-case-btn">${svgIcon('ext')} View on MyNeta.info</a>` : ''}
        </div>
        <p class="case-desc">${escHtml(cs.description||'No description available.')}</p>
      </div>`).join('');
  }

  // Sources (merge DB sources + standard, dedupe)
  const standard = [
    ...(mynetaLink ? [{ title: 'MyNeta — Candidate Affidavit (Maharashtra 2024)', link: mynetaLink }] : []),
    { title: 'Election Commission of India (ECI) — Affidavit Archive', link: ECI_URL },
    { title: 'Association for Democratic Reforms (ADR)', link: ADR_URL },
    { title: 'MyNeta.info — Open Election Data Platform', link: MYNETA_HOME }
  ];
  const seen = new Set();
  const allSources = [...sources, ...standard].filter(s => { if (!s.link || seen.has(s.link)) return false; seen.add(s.link); return true; });
  const sourcesHtml = allSources.map(s => `
    <a href="${escHtml(s.link)}" target="_blank" rel="noopener" class="source-link">
      ${svgIcon('link')} ${escHtml(s.title||s.link)}
      <span style="margin-left:auto;opacity:.4;flex-shrink:0">${svgIcon('ext')}</span>
    </a>`).join('');

  main.innerHTML = `
    <div class="profile-grid">

      <!-- BASIC INFO -->
      <div class="section-card">
        <div class="section-header"><div class="section-icon">${svgIcon('info')}</div><h2>Basic Information</h2></div>
        <div class="section-body">
          <div class="info-row"><span class="info-label">Party</span><span class="info-value">${escHtml(c.party)}</span></div>
          <div class="info-row"><span class="info-label">Constituency</span><span class="info-value">${escHtml(c.constituency)}</span></div>
          <div class="info-row"><span class="info-label">City / State</span><span class="info-value">${escHtml(c.city||'Mumbai')}, ${escHtml(c.state||'Maharashtra')}</span></div>
          ${c.education ? `<div class="info-row"><span class="info-label">Education</span><span class="info-value" style="text-align:right;font-size:.82rem">${escHtml(c.education)}</span></div>` : ''}
          ${careerYears > 0 ? `<div class="info-row"><span class="info-label">Career Span</span><span class="info-value">${careerYears}+ years</span></div>` : ''}
          ${partiesServed.length ? `<div class="info-row"><span class="info-label">Parties Served</span><span class="info-value" style="text-align:right;font-size:.82rem">${partiesServed.map(p=>escHtml(p)).join('<br>')}</span></div>` : ''}
          ${positions.length ? `<div class="info-row"><span class="info-label">Positions Held</span><span class="info-value" style="text-align:right;font-size:.82rem">${[...new Set(positions)].map(p=>escHtml(p)).join('<br>')}</span></div>` : ''}
          ${mynetaLink ? `<div class="info-row"><span class="info-label">MyNeta</span><span class="info-value"><a href="${mynetaLink}" target="_blank" rel="noopener" style="color:var(--navy-light);font-weight:600;display:inline-flex;align-items:center;gap:4px;">Full affidavit ${svgIcon('ext')}</a></span></div>` : ''}
        </div>
      </div>

      <!-- ASSETS -->
      <div class="section-card">
        <div class="section-header"><div class="section-icon">${svgIcon('assets')}</div><h2>Declared Assets</h2></div>
        <div class="section-body">
          <div class="asset-row"><span class="asset-label">Movable Assets</span><span class="asset-value">${formatMoney(c.assets?.movable)}</span></div>
          <div class="asset-row"><span class="asset-label">Immovable Assets</span><span class="asset-value">${formatMoney(c.assets?.immovable)}</span></div>
          <div class="asset-row"><span class="asset-label">Total (Auto-Calculated)</span><span class="asset-value total">${formatMoney(c.assets?.total)}</span></div>
          ${mynetaAssetsLink ? `<div style="margin-top:14px;padding-top:12px;border-top:1px solid #f0ede6"><p style="font-size:.75rem;color:var(--text-light);margin-bottom:6px">Self-declared affidavit filed with ECI, sourced via MyNeta.info.</p><a href="${mynetaAssetsLink}" target="_blank" rel="noopener" class="myneta-case-btn">${svgIcon('ext')} Full breakdown on MyNeta</a></div>` : ''}
        </div>
      </div>

      <!-- BIO -->
      ${c.biography ? `
      <div class="section-card full-width">
        <div class="section-header"><div class="section-icon">${svgIcon('book')}</div><h2>Biography</h2></div>
        <div class="section-body"><p class="bio-text">${escHtml(c.biography)}</p></div>
      </div>` : ''}

      <!-- POLITICAL HISTORY -->
      <div class="section-card full-width">
        <div class="section-header"><div class="section-icon">${svgIcon('history')}</div><h2>Political Career Timeline</h2></div>
        <div class="section-body">${renderTimeline(c.politicalHistory)}</div>
      </div>

      <!-- CRIMINAL CASES -->
      <div class="section-card full-width">
        <div class="section-header"><div class="section-icon" style="background:linear-gradient(135deg,#e53e3e,#c53030)">${svgIcon('cases')}</div><h2>Criminal Cases (${cases.length})</h2></div>
        <div class="section-body">${casesHtml}</div>
      </div>

      <!-- SOURCES -->
      <div class="section-card">
        <div class="section-header"><div class="section-icon">${svgIcon('link')}</div><h2>Sources &amp; References</h2></div>
        <div class="section-body">${sourcesHtml || '<p style="font-size:.85rem;color:var(--text-light)">No sources listed.</p>'}</div>
      </div>

      <!-- REPORT -->
      <div class="section-card">
        <div class="section-header"><div class="section-icon">${svgIcon('flag')}</div><h2>Report an Issue</h2></div>
        <div class="section-body">
          <div class="report-form">
            <textarea id="reportMsg" placeholder="Describe the issue or inaccuracy you've noticed…"></textarea>
            <button class="submit-btn" onclick="submitReport('${escHtml(c._id)}')">Submit Report</button>
            <div id="reportStatus"></div>
          </div>
        </div>
      </div>

    </div>`;
}

// ─── SUBMIT REPORT ────────────────────────────────────────────
async function submitReport(pageId) {
  const msg    = document.getElementById('reportMsg').value.trim();
  const status = document.getElementById('reportStatus');
  if (!msg) { status.innerHTML = `<span style="color:var(--danger);font-size:.85rem">Please enter a message.</span>`; return; }
  try {
    const res = await fetch('http://localhost:5000/api/reports', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pageId, message: msg })
    });
    if (res.ok) {
      document.getElementById('reportMsg').value = '';
      status.innerHTML = `<div class="report-success"><svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>Report submitted. Thank you — our team will review it.</div>`;
    } else {
      const err = await res.json();
      status.innerHTML = `<span style="color:var(--danger);font-size:.85rem">${escHtml(err.error)}</span>`;
    }
  } catch (e) { status.innerHTML = `<span style="color:var(--danger);font-size:.85rem">Could not submit — check your connection.</span>`; }
}

// ─── INIT ─────────────────────────────────────────────────────
async function init() {
  const slug = new URLSearchParams(window.location.search).get('slug');
  if (!slug) { hero.innerHTML = `<h1>No candidate specified.</h1>`; return; }
  try {
    const res = await fetch(`${API}/${encodeURIComponent(slug)}`);
    if (!res.ok) throw new Error('Candidate not found');
    const c = await res.json();
    renderHero(c);
    renderProfile(c);
  } catch (e) {
    hero.innerHTML = `<h1 style="color:rgba(255,255,255,.7)">Candidate not found</h1>`;
    main.innerHTML = `<div class="empty-state" style="max-width:900px;margin:0 auto;padding:40px"><h2>${e.message}</h2></div>`;
  }
}
init();