// ══════════════════════════════════════════════
//  NOVA BROWSER — engine.js
//  UU Production | Manifest V3
// ══════════════════════════════════════════════

'use strict';

/* ── QUICK LINKS DATA ── */
const QUICK_LINKS = [
  { name: 'YouTube',   url: 'https://youtube.com',   emoji: '▶️',  bg: '#ff0000' },
  { name: 'GitHub',    url: 'https://github.com',    emoji: '🐙',  bg: '#24292e' },
  { name: 'Reddit',    url: 'https://reddit.com',    emoji: '👾',  bg: '#ff4500' },
  { name: 'ChatGPT',   url: 'https://chat.openai.com', emoji: '🤖', bg: '#10a37f' },
  { name: 'X',         url: 'https://x.com',         emoji: '✖️',  bg: '#1da1f2' },
  { name: 'Claude',    url: 'https://claude.ai',     emoji: '🌐',  bg: '#7a5af8' },
  { name: 'Gmail',     url: 'https://mail.google.com', emoji: '📧', bg: '#ea4335' },
  { name: 'Spotify',   url: 'https://spotify.com',   emoji: '🎵',  bg: '#1db954' },
];

/* ── RENDER QUICK LINKS ── */
function renderQuickLinks() {
  const grid = document.getElementById('quick-links');
  grid.innerHTML = '';
  QUICK_LINKS.forEach(link => {
    const a = document.createElement('a');
    a.href = link.url;
    a.className = 'ql-card';
    a.target = '_self';
    a.innerHTML = `
      <div class="ql-icon" style="background:${link.bg}22;">${link.emoji}</div>
      <span class="ql-name">${link.name}</span>
    `;
    grid.appendChild(a);
  });
}

/* ── GREETING & DATE ── */
function setGreeting() {
  const h = new Date().getHours();
  const greets = [
    [5,  'Good morning'],
    [12, 'Good afternoon'],
    [18, 'Good evening'],
    [24, 'Good night'],
  ];
  const label = greets.find(([cap]) => h < cap)?.[1] ?? 'Hello';
  document.getElementById('greeting-text').innerHTML =
    `${label}, <span>Nova</span>`;
}

function setDate() {
  const now = new Date();
  const opts = { weekday:'long', year:'numeric', month:'long', day:'numeric' };
  document.getElementById('date-text').textContent =
    now.toLocaleDateString(undefined, opts);
}

/* ── LIVE CLOCK ── */
function updateClock() {
  const now = new Date();
  const t = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  document.getElementById('clock-display').textContent = t;
}

/* ── SEARCH ── */
function doSearch() {
  const q = document.getElementById('search-input').value.trim();
  if (!q) return;
  const isUrl = /^(https?:\/\/|www\.)\S+/.test(q);
  window.location.href = isUrl
    ? (q.startsWith('http') ? q : 'https://' + q)
    : `https://www.google.com/search?q=${encodeURIComponent(q)}`;
}

document.getElementById('search-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') doSearch();
});
document.getElementById('search-btn').addEventListener('click', doSearch);

/* ── SIDEBAR BUTTONS ── */
document.getElementById('btn-home').addEventListener('click', () => {
  window.location.reload();
});
document.getElementById('btn-bookmarks').addEventListener('click', () => {
  chrome?.bookmarks
    ? chrome.tabs.create({ url: 'chrome://bookmarks' })
    : (window.location.href = 'chrome://bookmarks');
});
document.getElementById('btn-history').addEventListener('click', () => {
  chrome?.history
    ? chrome.tabs.create({ url: 'chrome://history' })
    : (window.location.href = 'chrome://history');
});

/* ── 2-MINUTE IDLE RAM PURGE ── */
const IDLE_MS = 120_000; // 2 minutes
let idleTimer = null;
let isIdle = false;

const overlay = document.getElementById('idle-overlay');

function resetIdle() {
  if (isIdle) wakeUp();
  clearTimeout(idleTimer);
  idleTimer = setTimeout(goIdle, IDLE_MS);
}

function goIdle() {
  if (isIdle) return;
  isIdle = true;

  // Show overlay
  overlay.classList.add('show');

  // Clear heavy DOM nodes to free layout memory
  document.getElementById('quick-links').innerHTML = '';
  document.getElementById('mesh-bg').style.animation = 'none';
}

function wakeUp() {
  if (!isIdle) return;
  isIdle = false;
  overlay.classList.remove('show');

  // Restore DOM
  renderQuickLinks();
  document.getElementById('mesh-bg').style.animation = '';
  document.getElementById('search-input').focus();
}

// Listen for activity
['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click']
  .forEach(evt => document.addEventListener(evt, resetIdle, { passive: true }));

// Wake on overlay click/keydown
overlay.addEventListener('click', wakeUp);
overlay.addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') wakeUp();
});

/* ── INIT ── */
(function init() {
  setGreeting();
  setDate();
  renderQuickLinks();
  updateClock();
  setInterval(updateClock, 10_000);
  resetIdle(); // start idle countdown
})();
