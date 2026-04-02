// ══════════════════════════════════════════════
//  NOVA BROWSER — script.js
//  Search Router · Idle Timer · Clock
//  UU Production
// ══════════════════════════════════════════════

'use strict';

/* ── SEARCH ENGINES ── */
const ENGINES = [
  { name: 'DuckDuckGo · Private', icon: '🦆', base: 'https://duckduckgo.com/?q=' },
  { name: 'Bing',                 icon: '🔷', base: 'https://www.bing.com/search?q=' },
  { name: 'Brave Search',         icon: '🦁', base: 'https://search.brave.com/search?q=' },
  { name: 'Google',               icon: '🔍', base: 'https://www.google.com/search?q=' },
];
let engineIndex = 0;

function getEngine() { return ENGINES[engineIndex]; }

function updateEngineUI() {
  document.getElementById('engine-toggle').textContent = getEngine().icon;
  document.getElementById('engine-label').textContent = getEngine().name;
}

/* Cycle engine on icon click */
document.getElementById('engine-toggle').addEventListener('click', () => {
  engineIndex = (engineIndex + 1) % ENGINES.length;
  updateEngineUI();
  // Persist preference
  chrome?.storage?.local?.set({ novaEngineIndex: engineIndex });
});

/* Load saved engine */
chrome?.storage?.local?.get?.(['novaEngineIndex'], result => {
  if (result?.novaEngineIndex != null) {
    engineIndex = result.novaEngineIndex;
    updateEngineUI();
  }
});

/* ── SEARCH HANDLER ── */
function doSearch() {
  const input = document.getElementById('search-input');
  const q = input.value.trim();
  if (!q) return;

  // Detect if it's a URL
  const isUrl = /^(https?:\/\/|www\.)\S+/.test(q) || /^[\w-]+\.\w{2,}(\/|$)/.test(q);
  const destination = isUrl
    ? (q.startsWith('http') ? q : 'https://' + q)
    : getEngine().base + encodeURIComponent(q);

  // Open in a new tab within Nova
  if (typeof openUrlInTab === 'function') {
    openUrlInTab(destination, q.length > 20 ? q.slice(0, 20) + '…' : q);
  } else {
    window.location.href = destination;
  }
  input.value = '';
}

document.getElementById('search-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') doSearch();
});
document.getElementById('search-btn').addEventListener('click', doSearch);

/* ── LIVE CLOCK ── */
function updateClock() {
  const t = new Date().toLocaleTimeString([], {
    hour: '2-digit', minute: '2-digit'
  });
  document.getElementById('clock').textContent = t;
}
updateClock();
setInterval(updateClock, 15_000); // every 15s — saves CPU vs every second

/* ── 2-MINUTE IDLE PURGE ── */
const IDLE_MS   = 120_000; // 2 minutes
let idleTimer   = null;
let idleSeconds = 120;
let countdownInterval = null;
let isIdle      = false;

const idleOverlay   = document.getElementById('idle-overlay');
const idleCountEl   = document.getElementById('idle-countdown');
const idleResumeBtn = document.getElementById('idle-resume');

function startCountdown() {
  idleSeconds = 120;
  clearInterval(countdownInterval);
  countdownInterval = setInterval(() => {
    idleSeconds--;
    if (idleSeconds > 0 && idleSeconds <= 30) {
      idleCountEl.textContent = `Idle purge in ${idleSeconds}s`;
    } else if (idleSeconds <= 0) {
      idleCountEl.textContent = '';
      clearInterval(countdownInterval);
    } else {
      idleCountEl.textContent = '';
    }
  }, 1000);
}

function goIdle() {
  if (isIdle) return;
  isIdle = true;
  idleCountEl.textContent = '';
  clearInterval(countdownInterval);

  // Show overlay
  idleOverlay.classList.remove('hidden');

  // Purge heavy DOM — suspend iframes
  document.querySelectorAll('.tab-page.web-tab iframe').forEach(f => {
    f.dataset.savedSrc = f.src;
    f.src = 'about:blank';
  });

  // Stop background animation
  document.getElementById('bg-layer').style.animation = 'none';
}

function wakeUp() {
  if (!isIdle) return;
  isIdle = false;
  idleOverlay.classList.add('hidden');

  // Restore iframes
  document.querySelectorAll('.tab-page.web-tab iframe').forEach(f => {
    if (f.dataset.savedSrc) {
      f.src = f.dataset.savedSrc;
      delete f.dataset.savedSrc;
    }
  });

  // Restore animation
  document.getElementById('bg-layer').style.animation = '';

  // Re-focus search
  document.getElementById('search-input').focus();
  resetIdle();
}

function resetIdle() {
  if (isIdle) { wakeUp(); return; }
  clearTimeout(idleTimer);
  startCountdown();
  idleTimer = setTimeout(goIdle, IDLE_MS);
}

// Activity listeners — passive for performance
['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll']
  .forEach(evt => document.addEventListener(evt, resetIdle, { passive: true }));

// Resume button
idleResumeBtn.addEventListener('click', wakeUp);
document.addEventListener('keydown', e => {
  if (isIdle && (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape')) wakeUp();
}, { passive: true });

/* ── START IDLE TIMER ON LOAD ── */
window.addEventListener('load', () => resetIdle());
