const API  = "http://localhost:5000/api/parties";
const grid = document.getElementById("partiesGrid");

function escHtml(s) { return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function partyTypeBadge(type) {
  const map = { National: 'national', State: 'state', Regional: 'regional', Alliance: 'alliance' };
  return `<span class="party-type-badge ${map[type]||'state'}">${escHtml(type)}</span>`;
}

function render(parties) {
  if (!parties.length) {
    grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1"><h2>No parties found</h2></div>';
    return;
  }
  grid.innerHTML = parties.map((p, i) => {
    const colour = p.colour || '#1e3a8a';
    const electionsHtml = (p.electionHistory||[]).length
      ? (p.electionHistory||[]).sort((a,b)=>b.year-a.year).map(e => `
          <div class="election-row">
            <span class="election-year">${e.year}</span>
            <span class="election-name">${escHtml(e.election)}</span>
            <span class="election-seats">${e.seatsWon !== undefined ? e.seatsWon + (e.totalSeats ? '/' + e.totalSeats : '') + ' seats' : '—'}</span>
          </div>`).join('')
      : '<div style="padding:12px 20px;font-size:.82rem;color:var(--text-light)">No election history recorded.</div>';

    return `
      <div class="party-card" style="animation-delay:${i*80}ms">
        <div class="party-card-top">
          <div class="party-emblem" style="background:${colour}">${escHtml(p.abbreviation)}</div>
          <div class="party-card-name">
            <h3>${escHtml(p.name)}</h3>
            ${partyTypeBadge(p.type)}
          </div>
        </div>
        <div class="party-meta">
          ${p.foundedYear ? `<div class="party-meta-row"><strong>Founded</strong> ${p.foundedYear}</div>` : ''}
          ${p.foundedBy   ? `<div class="party-meta-row"><strong>Founded by</strong> ${escHtml(p.foundedBy)}</div>` : ''}
          ${p.ideology    ? `<div class="party-meta-row"><strong>Ideology</strong> ${escHtml(p.ideology)}</div>` : ''}
          ${p.symbol      ? `<div class="party-meta-row"><strong>Symbol</strong> ${escHtml(p.symbol)}</div>` : ''}
          ${p.headquarters? `<div class="party-meta-row"><strong>HQ</strong> ${escHtml(p.headquarters)}</div>` : ''}
        </div>
        ${p.description ? `<div class="party-desc">${escHtml(p.description)}</div>` : ''}
        <div class="party-elections">
          <div class="party-elections-header">Election History</div>
          ${electionsHtml}
        </div>
      </div>`;
  }).join('');
}

async function load() {
  try {
    const data = await (await fetch(API)).json();
    render(data);
  } catch (e) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><h2>Could not load parties</h2><p>${e.message}</p></div>`;
  }
}

load();