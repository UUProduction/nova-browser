// ═══════════════════════════════════════════════
//  NOVA BROWSER — app.js  v3.0
//  UI Controller · Surface Manager
//  Manages: home screen, quick links, recents,
//  sidebar, background, iframe show/hide
//  UU Production
// ═══════════════════════════════════════════════
'use strict';

/* ════════════════════════════════════════
   SHARED IFRAME REFERENCE
   script.js also reads window.NOVA.iframe
════════════════════════════════════════ */
window.NOVA = {
  iframe:      null,   // set on DOMContentLoaded
  homeScreen:  null,
  urlInput:    null,
  statusUrl:   null,
  navigateTo:  null,   // assigned below — callable from script.js
};

/* ── SVG ICON LIBRARY ── */
const ICONS = {
  youtube:`<svg viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#FF0000"/><polygon points="10,8 10,16 17,12" fill="#fff"/></svg>`,
  github:`<svg viewBox="0 0 24 24" fill="#24292e"><path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.49.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.46-1.11-1.46-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.64-1.34-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.26-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.03A9.6 9.6 0 0112 6.84c.85 0 1.7.11 2.5.33 1.91-1.3 2.75-1.03 2.75-1.03.55 1.38.2 2.39.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0022 12c0-5.52-4.48-10-10-10z"/></svg>`,
  reddit:`<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#FF4500"/><path fill="#fff" d="M20 12a2 2 0 00-2-2 2 2 0 00-1.3.5C15.5 9.6 14 9.1 12.3 9l.8-3.7 2.5.5a1.3 1.3 0 102.4-.1 1.3 1.3 0 00-2.5.4l-2.8-.6a.3.3 0 00-.3.2l-.9 4.2c-1.7.1-3.3.6-4.4 1.6A2 2 0 004 12a2 2 0 001 1.7v.5c0 2.5 2.9 4.5 6.5 4.5s6.5-2 6.5-4.5v-.5A2 2 0 0020 12zm-13 1a1 1 0 112 0 1 1 0 01-2 0zm5.6 2.7c-.7.7-2 1-3.1 1s-2.4-.3-3.1-1a.3.3 0 01.4-.4c.5.5 1.6.8 2.7.8s2.2-.3 2.7-.8a.3.3 0 01.4.4zm-.1-1.7a1 1 0 110-2 1 1 0 010 2z"/></svg>`,
  chatgpt:`<svg viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#10a37f"/><path fill="#fff" d="M12 5.5a4.5 4.5 0 00-4.3 5.8A3.5 3.5 0 005 14.5 3.5 3.5 0 008.5 18h7a3.5 3.5 0 003.5-3.5 3.5 3.5 0 00-2.7-3.4A4.5 4.5 0 0012 5.5zm0 1.5a3 3 0 012.9 3.8l-.2.5.5.1a2 2 0 011.8 2 2 2 0 01-2 2H9a2 2 0 01-2-2 2 2 0 011.8-2l.5-.1-.2-.5A3 3 0 0112 7z"/></svg>`,
  claude:`<svg viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#7a5af8"/><path fill="#fff" d="M12 4L6 8v8l6 4 6-4V8z" opacity=".85"/><path fill="rgba(255,255,255,.4)" d="M12 4v16M6 8l6 4 6-4"/></svg>`,
  x:`<svg viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#000"/><path fill="#fff" d="M17.5 4h2.5l-5.4 6.2L21 20h-4.8l-3.5-4.5L8.3 20H5.8l5.8-6.6L4 4h5l3.1 4 3.4-4zm-.9 14.4h1.4L7.5 5.4H6l10.6 13z"/></svg>`,
  gmail:`<svg viewBox="0 0 24 24" fill="none"><path d="M2 6a2 2 0 012-2h16a2 2 0 012 2l-10 7L2 6z" fill="#EA4335"/><path d="M2 6v12a2 2 0 002 2h4V11L2 6z" fill="#C5221F"/><path d="M22 6v12a2 2 0 01-2 2h-4V11l6-5z" fill="#1A73E8"/><path d="M8 11v9h8v-9l-4 3-4-3z" fill="#4285F4"/></svg>`,
  spotify:`<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#1DB954"/><path fill="#fff" d="M17.9 10.9C14.7 9 9.35 8.8 6.3 9.75a.96.96 0 11-.56-1.84c3.5-1.06 9.3-.86 13 1.3a.96.96 0 01-.84 1.7zm-.1 2.8a.8.8 0 01-1.1.26c-2.7-1.66-6.8-2.14-9.97-1.17a.8.8 0 01-.46-1.53c3.63-1.1 8.15-.57 11.26 1.34a.8.8 0 01.27 1.1zm-1.25 2.69a.64.64 0 01-.88.21c-2.36-1.44-5.33-1.77-8.83-.97a.64.64 0 01-.29-1.25c3.83-.87 7.1-.5 9.78 1.13a.64.64 0 01.22.88z"/></svg>`,
};

const QUICK_LINKS = [
  { name:'YouTube', url:'https://www.youtube.com',       icon:ICONS.youtube  },
  { name:'GitHub',  url:'https://github.com',            icon:ICONS.github   },
  { name:'Reddit',  url:'https://www.reddit.com',        icon:ICONS.reddit   },
  { name:'ChatGPT', url:'https://chat.openai.com',       icon:ICONS.chatgpt  },
  { name:'Claude',  url:'https://claude.ai',             icon:ICONS.claude   },
  { name:'X',       url:'https://x.com',                 icon:ICONS.x        },
  { name:'Gmail',   url:'https://mail.google.com',       icon:ICONS.gmail    },
  { name:'Spotify', url:'https://open.spotify.com',      icon:ICONS.spotify  },
];

/* ════════════════════════════════════════
   STATE
════════════════════════════════════════ */
let isHome    = true;    // true = home screen visible, false = iframe visible
let historyStack = [];   // simple forward/back history
let historyIdx   = -1;

/* ════════════════════════════════════════
   CORE NAVIGATE — shared with script.js
   via window.NOVA.navigateTo(url)
════════════════════════════════════════ */
function navigateTo(url, pushHistory = true) {
  if (!url || url === 'about:blank') return showHome();

  // Animate loading bar
  loadBarStart();

  const iframe = window.NOVA.iframe;
  iframe.src = url;

  // Switch to iframe view
  showViewport();

  // Update address bar
  window.NOVA.urlInput.value = url;
  window.NOVA.statusUrl.textContent = url;

  // History management
  if (pushHistory) {
    historyStack = historyStack.slice(0, historyIdx + 1);
    historyStack.push(url);
    historyIdx = historyStack.length - 1;
  }

  // Save to recent searches via chrome.storage.local (IPC bridge)
  saveRecent(url);
}

window.NOVA.navigateTo = navigateTo;

/* ── SHOW / HIDE ── */
function showHome() {
  isHome = true;
  window.NOVA.homeScreen.classList.remove('hidden');
  window.NOVA.iframe.classList.add('hidden');
  window.NOVA.urlInput.value = '';
  window.NOVA.statusUrl.textContent = 'Nova Browser · UU Production';
  document.getElementById('btn-home').classList.add('active');
}

function showViewport() {
  isHome = false;
  window.NOVA.homeScreen.classList.add('hidden');
  window.NOVA.iframe.classList.remove('hidden');
  document.getElementById('btn-home').classList.remove('active');
}

/* ════════════════════════════════════════
   RECENT SEARCHES  (chrome.storage IPC)
════════════════════════════════════════ */
const RECENTS_KEY = 'novaRecents';
const MAX_RECENTS = 8;

function saveRecent(url) {
  if (!chrome?.storage?.local) return;
  chrome.storage.local.get([RECENTS_KEY], r => {
    let list = r[RECENTS_KEY] || [];
    list = [url, ...list.filter(u => u !== url)].slice(0, MAX_RECENTS);
    chrome.storage.local.set({ [RECENTS_KEY]: list });
    renderRecents(list);
  });
}

function loadRecents() {
  if (!chrome?.storage?.local) return;
  chrome.storage.local.get([RECENTS_KEY], r => {
    const list = r[RECENTS_KEY] || [];
    renderRecents(list);
  });
}

function renderRecents(list) {
  const wrap = document.getElementById('recents-wrap');
  const container = document.getElementById('recents-list');
  if (!list.length) { wrap.classList.add('hidden'); return; }
  wrap.classList.remove('hidden');
  container.innerHTML = '';
  list.forEach(url => {
    const chip = document.createElement('div');
    chip.className = 'recent-chip';
    // Display host only for readability
    let label = url;
    try { label = new URL(url).hostname.replace('www.',''); } catch {}
    chip.textContent = label;
    chip.title = url;
    chip.addEventListener('click', () => navigateTo(url));
    container.appendChild(chip);
  });
}

/* ════════════════════════════════════════
   QUICK LINKS
════════════════════════════════════════ */
function renderQuickLinks() {
  const grid = document.getElementById('quick-grid');
  grid.innerHTML = '';
  QUICK_LINKS.forEach(lk => {
    const card = document.createElement('div');
    card.className = 'ql-card';
    card.innerHTML = `<div class="ql-icon">${lk.icon}</div>
                      <span class="ql-name">${lk.name}</span>`;
    card.addEventListener('click', () => {
      // Bounce then navigate
      card.classList.remove('bouncing');
      void card.offsetWidth;
      card.classList.add('bouncing');
      card.addEventListener('animationend', () => {
        card.classList.remove('bouncing');
        navigateTo(lk.url);
      }, { once:true });
    });
    grid.appendChild(card);
  });
}

/* ════════════════════════════════════════
   LOADING BAR
════════════════════════════════════════ */
function loadBarStart() {
  const bar = document.getElementById('load-bar-inner');
  if (!bar) return;
  bar.style.transition = 'none';
  bar.style.opacity = '1';
  bar.style.width = '0';
  requestAnimationFrame(() => {
    bar.style.transition = 'width 1.6s cubic-bezier(.1,0,.2,1)';
    bar.style.width = '75%';
  });
}
function loadBarFinish() {
  const bar = document.getElementById('load-bar-inner');
  if (!bar) return;
  bar.style.transition = 'width .25s ease, opacity .4s .2s';
  bar.style.width = '100%';
  setTimeout(() => { bar.style.opacity = '0'; }, 400);
  setTimeout(() => { bar.style.width = '0'; bar.style.opacity = '1'; }, 700);
}

/* ════════════════════════════════════════
   GREETING + DATE
════════════════════════════════════════ */
function initGreeting() {
  const h = new Date().getHours();
  document.getElementById('greeting-text').textContent =
    h < 5  ? 'Good night'      :
    h < 12 ? 'Good morning'    :
    h < 18 ? 'Good afternoon'  : 'Good evening';
  document.getElementById('date-text').textContent =
    new Date().toLocaleDateString(undefined,
      { weekday:'long', year:'numeric', month:'long', day:'numeric' });
}

/* ════════════════════════════════════════
   SIDEBAR BUTTONS
════════════════════════════════════════ */
function initSidebar() {
  document.getElementById('btn-home').addEventListener('click', showHome);

  document.getElementById('btn-back').addEventListener('click', () => {
    if (historyIdx > 0) {
      historyIdx--;
      navigateTo(historyStack[historyIdx], false);
    }
  });

  document.getElementById('btn-forward').addEventListener('click', () => {
    if (historyIdx < historyStack.length - 1) {
      historyIdx++;
      navigateTo(historyStack[historyIdx], false);
    }
  });

  document.getElementById('btn-reload').addEventListener('click', () => {
    const iframe = window.NOVA.iframe;
    if (!iframe.classList.contains('hidden') && iframe.src !== 'about:blank') {
      loadBarStart();
      iframe.src = iframe.src;
    }
  });

  document.getElementById('btn-bookmarks').addEventListener('click', () =>
    navigateTo('https://www.google.com/bookmarks'));

  document.getElementById('btn-history').addEventListener('click', () => {
    // Show local history
    chrome?.storage?.local?.get([RECENTS_KEY], r => {
      const list = r[RECENTS_KEY] || [];
      if (list.length) navigateTo(list[0]);
    });
  });
}

/* ════════════════════════════════════════
   BACKGROUND PICKER
════════════════════════════════════════ */
let selectedBg = 'aurora';

function initBgPicker() {
  document.getElementById('btn-bg').addEventListener('click', () =>
    document.getElementById('bg-modal').classList.remove('hidden'));
  document.getElementById('close-modal-btn').addEventListener('click', () =>
    document.getElementById('bg-modal').classList.add('hidden'));

  document.querySelectorAll('.bg-swatch').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.bg-swatch').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedBg = btn.dataset.bg;
    });
  });

  document.getElementById('apply-bg-btn').addEventListener('click', () => {
    const url = document.getElementById('custom-bg-input').value.trim();
    const el  = document.getElementById('bg-layer');
    if (url) {
      el.className = 'custom';
      el.style.backgroundImage = `url(${url})`;
      chrome?.storage?.local?.set({ novaBg:'custom', novaBgUrl:url });
    } else {
      el.className = selectedBg;
      el.style.backgroundImage = '';
      chrome?.storage?.local?.set({ novaBg:selectedBg, novaBgUrl:'' });
    }
    document.getElementById('bg-modal').classList.add('hidden');
  });

  // Load saved
  chrome?.storage?.local?.get?.(['novaBg','novaBgUrl'], r => {
    if (!r?.novaBg) return;
    const el = document.getElementById('bg-layer');
    el.className = r.novaBg;
    if (r.novaBg === 'custom' && r.novaBgUrl)
      el.style.backgroundImage = `url(${r.novaBgUrl})`;
  });
}

/* ════════════════════════════════════════
   IFRAME EVENTS
════════════════════════════════════════ */
function initIframeEvents() {
  const iframe = window.NOVA.iframe;

  iframe.addEventListener('load', () => {
    loadBarFinish();
    // Try to read title / URL (same-origin only — cross-origin will throw)
    try {
      const loc = iframe.contentWindow.location.href;
      if (loc && loc !== 'about:blank') {
        window.NOVA.urlInput.value = loc;
        window.NOVA.statusUrl.textContent = loc;
        // Update history stack on natural navigation inside iframe
        if (historyStack[historyIdx] !== loc) {
          historyStack = historyStack.slice(0, historyIdx + 1);
          historyStack.push(loc);
          historyIdx = historyStack.length - 1;
          saveRecent(loc);
        }
      }
    } catch { /* cross-origin — expected */ }
  });
}

/* ════════════════════════════════════════
   INIT
════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  // Populate NOVA shared object
  window.NOVA.iframe     = document.getElementById('nova-viewport');
  window.NOVA.homeScreen = document.getElementById('home-screen');
  window.NOVA.urlInput   = document.getElementById('url-input');
  window.NOVA.statusUrl  = document.getElementById('status-url');

  // Inject load bar into DOM
  const lb = document.createElement('div');
  lb.id = 'load-bar';
  lb.innerHTML = '<div id="load-bar-inner"></div>';
  document.getElementById('main').appendChild(lb);

  initGreeting();
  renderQuickLinks();
  loadRecents();
  initSidebar();
  initBgPicker();
  initIframeEvents();
});
