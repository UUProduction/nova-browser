// ═══════════════════════════════════════════════
//  NOVA BROWSER — script.js  v3.0
//  Logic Engine · Search Router · RAM Purge
//  Uses window.NOVA (set by app.js) for IPC
//  UU Production
// ═══════════════════════════════════════════════
'use strict';

/* ════════════════════════════════════════
   WAIT FOR APP.JS TO FINISH INIT
   (DOMContentLoaded fires for both files)
════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {

  /* ── SEARCH ENGINES ── */
  const ENGINES = [
    {
      label: 'DuckDuckGo · Private',
      base:  'https://duckduckgo.com/?q=',
      svg: `<svg viewBox="0 0 24 24" width="20" height="20">
        <circle cx="12" cy="12" r="12" fill="#DE5833"/>
        <circle cx="12" cy="10" r="5" fill="#fff"/>
        <circle cx="10.2" cy="9" r="1.3" fill="#222"/>
        <circle cx="13.8" cy="9" r="1.3" fill="#222"/>
        <circle cx="10.7" cy="8.5" r=".5" fill="#fff"/>
        <circle cx="14.3" cy="8.5" r=".5" fill="#fff"/>
        <path d="M10 13c.8 1.2 4.2 1.2 4 0" stroke="#222" stroke-width=".8"
              fill="none" stroke-linecap="round"/>
      </svg>`
    },
    {
      label: 'Bing',
      base:  'https://www.bing.com/search?q=',
      svg: `<svg viewBox="0 0 24 24" width="20" height="20">
        <rect width="24" height="24" rx="5" fill="#008373"/>
        <path fill="#fff" d="M8 4l3 1.2v9.8l3.5-2 1 1.8-4.5 2.6L8 16V4z"/>
      </svg>`
    },
    {
      label: 'Brave Search',
      base:  'https://search.brave.com/search?q=',
      svg: `<svg viewBox="0 0 24 24" width="20" height="20">
        <rect width="24" height="24" rx="5" fill="#FB542B"/>
        <path fill="#fff" d="M12 3.5l7 3.5-1.2 8.5L12 20.5l-5.8-5-1.2-8.5z"/>
      </svg>`
    },
    {
      label: 'Google',
      base:  'https://www.google.com/search?q=',
      svg: `<svg viewBox="0 0 24 24" width="20" height="20">
        <circle cx="12" cy="12" r="12" fill="#fff"/>
        <path fill="#4285F4" d="M21.8 12.2c0-.7-.06-1.4-.18-2H12v3.8h5.5a4.7 4.7 0 01-2 3.2v2.6h3.3c2-1.8 3-4.5 3-7.6z"/>
        <path fill="#34A853" d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5a6 6 0 01-9-3.6H3v2.6A10 10 0 0012 22z"/>
        <path fill="#FBBC05" d="M6.4 13.5A6 6 0 016.1 12c0-.5.1-1 .3-1.5V8H3a10 10 0 000 8l3.4-2.5z"/>
        <path fill="#EA4335" d="M12 6.3c1.5 0 2.8.5 3.9 1.5l2.9-2.9A10 10 0 003 8l3.4 2.5C7.3 8.3 9.5 6.3 12 6.3z"/>
      </svg>`
    },
  ];

  let engineIdx = 0;

  /* Load saved engine preference */
  chrome?.storage?.local?.get?.(['novaEngine'], r => {
    if (r?.novaEngine != null) { engineIdx = r.novaEngine; updateEngineUI(); }
  });

  function updateEngineUI() {
    const btn = document.getElementById('engine-toggle');
    const lbl = document.getElementById('engine-label-bar');
    if (btn) btn.innerHTML = ENGINES[engineIdx].svg;
    if (lbl) lbl.textContent = ENGINES[engineIdx].label;
  }

  // Cycle engine on icon click
  document.getElementById('engine-toggle')?.addEventListener('click', () => {
    engineIdx = (engineIdx + 1) % ENGINES.length;
    updateEngineUI();
    chrome?.storage?.local?.set({ novaEngine: engineIdx });
  });

  updateEngineUI();

  /* ════════════════════════════════════════
     SEARCH ROUTER
     Reads from #url-input. Determines:
       1. Valid URL → navigate directly
       2. String    → route to search engine
     Then calls window.NOVA.navigateTo(url)
  ════════════════════════════════════════ */
  function isValidURL(str) {
    // Matches http/https URLs or bare domains like "github.com/user"
    return /^(https?:\/\/)/.test(str) ||
           /^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/\S*)?$/.test(str);
  }

  function processInput() {
    const input = document.getElementById('url-input');
    if (!input) return;
    const raw = input.value.trim();
    if (!raw) return;

    let destination;

    if (isValidURL(raw)) {
      // Add scheme if missing
      destination = raw.startsWith('http') ? raw : 'https://' + raw;
    } else {
      // Search query — route through selected engine
      destination = ENGINES[engineIdx].base + encodeURIComponent(raw);
    }

    // IPC: Call app.js navigate function via shared window.NOVA
    if (typeof window.NOVA?.navigateTo === 'function') {
      window.NOVA.navigateTo(destination);
    } else {
      // Fallback: write directly to iframe
      const iframe = document.getElementById('nova-viewport');
      if (iframe) iframe.src = destination;
    }
  }

  // Enter key on URL input
  document.getElementById('url-input')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); processInput(); }
  });

  // Go button
  document.getElementById('go-btn')?.addEventListener('click', processInput);

  // Click on URL bar selects all for quick overtype
  document.getElementById('url-input')?.addEventListener('focus', function() {
    this.select();
  });

  /* ════════════════════════════════════════
     2-MINUTE RAM PURGE
     On timeout: sets iframe.src = 'about:blank'
     This terminates the renderer process for
     the loaded site, releasing RAM to the OS.
  ════════════════════════════════════════ */
  const IDLE_TOTAL_MS = 120_000;   // 2 minutes
  const WARN_AT_MS    = 90_000;    // warn at 1:30

  let idleTimer    = null;
  let warnTimer    = null;
  let countdownInt = null;
  let secsLeft     = 30;
  let isIdle       = false;

  const overlay    = document.getElementById('idle-overlay');
  const countEl    = document.getElementById('idle-countdown');
  const resumeBtn  = document.getElementById('idle-resume');

  /* Start the 30-second visible countdown */
  function startWarning() {
    secsLeft = 30;
    clearInterval(countdownInt);
    countdownInt = setInterval(() => {
      secsLeft--;
      if (secsLeft > 0) {
        countEl.textContent = `RAM purge in ${secsLeft}s`;
      } else {
        countEl.textContent = '';
        clearInterval(countdownInt);
      }
    }, 1000);
  }

  /* Execute purge */
  function executePurge() {
    if (isIdle) return;
    isIdle = true;

    clearInterval(countdownInt);
    countEl.textContent = '';

    // CORE PURGE: blank the iframe → kills site renderer process
    const iframe = window.NOVA?.iframe || document.getElementById('nova-viewport');
    if (iframe) {
      iframe.dataset.savedSrc = iframe.src;
      iframe.src = 'about:blank';
    }

    // Suspend background animation
    document.getElementById('bg-layer').style.animation = 'none';

    // Show idle overlay
    overlay?.classList.remove('hidden');
  }

  /* Wake up — restore iframe and reset timer */
  function wakeUp() {
    if (!isIdle) return;
    isIdle = false;

    overlay?.classList.add('hidden');

    // Restore iframe src
    const iframe = window.NOVA?.iframe || document.getElementById('nova-viewport');
    if (iframe && iframe.dataset.savedSrc && iframe.dataset.savedSrc !== 'about:blank') {
      iframe.src = iframe.dataset.savedSrc;
      delete iframe.dataset.savedSrc;
    }

    // Restore background animation
    document.getElementById('bg-layer').style.animation = '';

    // Re-focus URL bar
    document.getElementById('url-input')?.focus();

    resetIdleTimer();
  }

  /* Reset all timers on any activity */
  function resetIdleTimer() {
    if (isIdle) { wakeUp(); return; }

    clearTimeout(idleTimer);
    clearTimeout(warnTimer);
    clearInterval(countdownInt);
    countEl.textContent = '';

    warnTimer = setTimeout(startWarning, WARN_AT_MS);
    idleTimer = setTimeout(executePurge, IDLE_TOTAL_MS);
  }

  /* Activity listeners — passive for lowest CPU overhead */
  ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click']
    .forEach(evt =>
      document.addEventListener(evt, resetIdleTimer, { passive: true }));

  /* Resume button */
  resumeBtn?.addEventListener('click', wakeUp);

  /* Any key when idle = wake */
  document.addEventListener('keydown', () => { if (isIdle) wakeUp(); },
    { passive: true });

  /* ════════════════════════════════════════
     LIVE CLOCK  (15s interval saves CPU)
  ════════════════════════════════════════ */
  function updateClock() {
    const el = document.getElementById('clock');
    if (el) el.textContent =
      new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });
  }
  updateClock();
  setInterval(updateClock, 15_000);

  /* ── KICK OFF IDLE TIMER ── */
  resetIdleTimer();

}); // end DOMContentLoaded
