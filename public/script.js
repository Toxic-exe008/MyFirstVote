const API       = "http://localhost:5000/api/candidates";
const container = document.getElementById("candidatesContainer");
const searchEl  = document.getElementById("search");
const filterEl  = document.getElementById("filter");
const countEl   = document.getElementById("resultsCount");

// ─── MARQUEE ──────────────────────────────────────────────────
async function loadMarquee() {
  try {
    const res  = await fetch("http://localhost:5000/api/election-notice");
    const data = await res.json();
    if (!data) return;
    const bar  = document.getElementById("marqueeBar");
    const text = document.getElementById("marqueeText");
    if (bar && text) {
      const sep = '&nbsp;&nbsp;●&nbsp;&nbsp;';
      text.innerHTML =
        `📢 ${data.title}` + sep +
        `📅 Voting Date: <strong>${data.electionDate}</strong>` + sep +
        `⏰ Voting Time: ${data.votingStart} – ${data.votingEnd}` + sep +
        `📍 ${data.constituency}` + sep +
        (data.resultDate ? `📊 Result Date: ${data.resultDate}` + sep : '') +
        `ℹ️  ${data.description}` + sep +
        `🗳️  Exercise your right to vote!`;
      bar.style.display = "block";
    }
  } catch (e) { /* marquee is optional — no crash if missing */ }
}

// ─── HELPERS ──────────────────────────────────────────────────
function debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }
function escHtml(s) { return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function formatMoney(n) {
  if (!n) return 'N/A';
  if (n >= 1e7) return '₹' + (n/1e7).toFixed(2) + ' Cr';
  if (n >= 1e5) return '₹' + (n/1e5).toFixed(2) + ' L';
  return '₹' + n.toLocaleString('en-IN');
}

function careerSummary(history) {
  if (!history?.length) return '';
  const first = history.reduce((min, h) => (h.fromYear && h.fromYear < min) ? h.fromYear : min, 9999);
  if (first === 9999) return '';
  const years = new Date().getFullYear() - first;
  return `${years}+ yrs in politics`;
}

// ─── RENDER CARDS ─────────────────────────────────────────────
function displayCandidates(data) {
  container.innerHTML = '';
  if (countEl) countEl.textContent = `${data.length} candidate${data.length !== 1 ? 's' : ''} found`;
  if (!data.length) {
    container.innerHTML = '<div class="empty-state"><h2>No candidates found</h2><p>Try a different search or constituency.</p></div>';
    return;
  }
  data.forEach((c, i) => {
    const cases   = c.criminalCases?.length ?? 0;
    const total   = c.assets?.total;
    const yearStr = careerSummary(c.politicalHistory);
    const card    = document.createElement('div');
    card.className = 'card';
    card.style.animationDelay = `${i * 60}ms`;
    card.innerHTML = `
      <div class="card-accent"></div>
      <div class="card-body">
        <span class="card-party-badge">${escHtml(c.party)}</span>
        <h3>${escHtml(c.name)}</h3>
        <div class="card-meta">
          <div class="card-meta-item">
            <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
            ${escHtml(c.constituency)}
          </div>
          ${total ? `<div class="card-meta-item">
            <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>
            Total Assets: ${formatMoney(total)}
          </div>` : ''}
          ${yearStr ? `<div class="card-meta-item">
            <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            ${yearStr}
          </div>` : ''}
        </div>
        <div class="card-cases ${cases > 0 ? 'has-cases' : 'clean'}">
          ${cases > 0
            ? `<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> ${cases} criminal case${cases>1?'s':''} declared`
            : `<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> No criminal cases`}
        </div>
      </div>
      <div class="card-footer">
        <span class="view-profile">View full profile
          <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
        </span>
      </div>`;
    card.addEventListener('click', () => { window.location.href = `candidate.html?slug=${c.slug}`; });
    container.appendChild(card);
  });
}

// ─── FETCH ────────────────────────────────────────────────────
function showLoading() { container.innerHTML = '<div class="spinner-wrap"><div class="spinner"></div><p>Loading candidates…</p></div>'; }

async function loadCandidates() {
  showLoading();
  try {
    const constituency = filterEl.value;
    const url  = constituency ? `${API}?constituency=${encodeURIComponent(constituency)}` : API;
    const data = await (await fetch(url)).json();
    displayCandidates(data);
  } catch (e) { container.innerHTML = `<div class="empty-state"><h2>Could not load data</h2><p>${e.message}</p></div>`; }
}

async function searchCandidates(text) {
  showLoading();
  try {
    const data = await (await fetch(`${API}/search/${encodeURIComponent(text)}`)).json();
    const constituency = filterEl.value;
    displayCandidates(constituency ? data.filter(c => c.constituency === constituency) : data);
  } catch (e) { container.innerHTML = `<div class="empty-state"><h2>Search failed</h2><p>${e.message}</p></div>`; }
}

// ─── EVENTS ───────────────────────────────────────────────────
const debouncedSearch = debounce(val => val.trim() ? searchCandidates(val.trim()) : loadCandidates(), 350);
searchEl.addEventListener('input', e => debouncedSearch(e.target.value));
filterEl.addEventListener('change', () => searchEl.value.trim() ? searchCandidates(searchEl.value.trim()) : loadCandidates());

// ─── INIT ─────────────────────────────────────────────────────
loadMarquee();
loadCandidates();