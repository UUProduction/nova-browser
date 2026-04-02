// ══════════════════════════════════════════════
//  NOVA BROWSER — app.js
//  Tab system · Quick Links · Greeting · BG
//  UU Production
// ══════════════════════════════════════════════

'use strict';

/* ── QUICK LINKS ── */
const QUICK_LINKS = [
  { name: 'YouTube',  url: 'https://youtube.com',         icon: 'https://cdn-icons-png.flaticon.com/256/1384/1384060.png' },
  { name: 'GitHub',   url: 'https://github.com',          icon: 'https://cdn.pixabay.com/photo/2022/01/30/13/33/github-6980894_960_720.png' },
  { name: 'Reddit',   url: 'https://reddit.com',          icon: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQnee_YMBs_jzSmWDkrWkreR8Uc9RS-2kTgzw&s' },
  { name: 'ChatGPT',  url: 'https://chat.openai.com',     icon: 'https://static.vecteezy.com/system/resources/previews/021/059/827/non_2x/chatgpt-logo-chat-gpt-icon-on-white-background-free-vector.jpg' },
  { name: 'Claude',   url: 'https://claude.ai',           icon: 'https://raw.githubusercontent.com/lobehub/lobe-icons/refs/heads/master/packages/static-png/dark/claude-color.png' },
  { name: 'X',        url: 'https://x.com',               icon: 'https://img.freepik.com/free-vector/new-2023-twitter-logo-x-icon-design_1017-45418.jpg' },
  { name: 'Gmail',    url: 'https://mail.google.com',     icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Gmail_icon_%282020%29.svg/3840px-Gmail_icon_%282020%29.svg.png' },
  { name: 'Spotify',  url: 'https://spotify.com',         icon: 'https://cdn.pixabay.com/photo/2016/10/22/00/15/spotify-1759471_1280.jpg' },
];

/* ── TAB STATE ── */
let tabs = [{ id: 0, title: 'Home', url: 'home' }];
let activeTab = 0;
let nextTabId = 1;

/* ── GREETING ── */
function initGreeting() {
  const h = new Date().getHours();
  const label =
    h < 5  ? 'Good night' :
    h < 12 ? 'Good morning' :
    h < 18 ? 'Good afternoon' : 'Good evening';
  document.getElementById('greeting-text').textContent = label;
  const opts = { weekday:'long', year:'numeric', month:'long', day:'numeric' };
  document.getElementById('date-text').textContent =
    new Date().toLocaleDateString(undefined, opts);
}

/* ── QUICK LINKS ── */
function renderQuickLinks() {
  const grid = document.getElementById('quick-grid');
  grid.innerHTML = '';
  QUICK_LINKS.forEach(lk => {
    const card = document.createElement('div');
    card.className = 'ql-card';
    card.innerHTML = `
      <div class="ql-icon"><img src="${lk.icon}" alt="${lk.name}" loading="lazy"/></div>
      <span class="ql-name">${lk.name}</span>`;
    card.addEventListener('click', () => openUrlInTab(lk.url, lk.name));
    grid.appendChild(card);
  });
}

/* ── TAB SYSTEM ── */
function renderTabs() {
  const list = document.getElementById('tab-list');
  list.innerHTML = '';
  tabs.forEach(tab => {
    const chip = document.createElement('div');
    chip.className = 'tab-chip' + (tab.id === activeTab ? ' active' : '');
    chip.dataset.id = tab.id;
    chip.innerHTML = `
      <span>${tab.title}</span>
      ${tabs.length > 1
        ? `<button class="close-tab" data-id="${tab.id}">✕</button>`
        : ''}`;
    chip.addEventListener('click', e => {
      if (e.target.classList.contains('close-tab')) return;
      switchTab(tab.id);
    });
    const closeBtn = chip.querySelector('.close-tab');
    if (closeBtn) {
      closeBtn.addEventListener('click', e => {
        e.stopPropagation();
        closeTab(tab.id);
      });
    }
    list.appendChild(chip);
  });
}

function switchTab(id) {
  activeTab = id;
  document.querySelectorAll('.tab-page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById(`page-${id}`);
  if (page) page.classList.add('active');
  renderTabs();
}

function addTab(url = 'home', title = 'New Tab') {
  const id = nextTabId++;
  tabs.push({ id, title, url });

  if (url === 'home') {
    const page = document.createElement('div');
    page.className = 'tab-page';
    page.id = `page-${id}`;
    // Clone home content
    const homeClone = document.getElementById('page-home').cloneNode(true);
    homeClone.id = `home-clone-${id}`;
    homeClone.classList.remove('active');
    // Copy inner HTML only
    page.innerHTML = homeClone.innerHTML;
    document.getElementById('viewport').appendChild(page);
  } else {
    const page = document.createElement('div');
    page.className = 'tab-page web-tab';
    page.id = `page-${id}`;
    const iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.sandbox = 'allow-scripts allow-same-origin allow-forms allow-popups allow-navigation';
    page.appendChild(iframe);
    document.getElementById('viewport').appendChild(page);
  }

  switchTab(id);
}

function closeTab(id) {
  if (tabs.length === 1) return;
  tabs = tabs.filter(t => t.id !== id);
  const page = document.getElementById(`page-${id}`);
  if (page) page.remove();
  if (activeTab === id) switchTab(tabs[tabs.length - 1].id);
  renderTabs();
}

function openUrlInTab(url, title) {
  // If active tab is home, navigate in a new tab
  addTab(url, title);
}

/* ── SIDEBAR BUTTONS ── */
document.getElementById('btn-home').addEventListener('click', () => {
  switchTab(0);
  renderTabs();
});
document.getElementById('btn-bookmarks').addEventListener('click', () => {
  addTab('chrome://bookmarks/', 'Bookmarks');
});
document.getElementById('btn-history').addEventListener('click', () => {
  addTab('chrome://history/', 'History');
});
document.getElementById('btn-newtab').addEventListener('click', () => addTab());
document.getElementById('add-tab-btn').addEventListener('click', () => addTab());

/* ── BACKGROUND PICKER ── */
let selectedBg = 'aurora';

document.getElementById('btn-bg').addEventListener('click', () => {
  document.getElementById('bg-modal').classList.remove('hidden');
});
document.getElementById('close-modal-btn').addEventListener('click', () => {
  document.getElementById('bg-modal').classList.add('hidden');
});

document.querySelectorAll('.bg-swatch').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.bg-swatch').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    selectedBg = btn.dataset.bg;
  });
});

document.getElementById('apply-bg-btn').addEventListener('click', () => {
  const customUrl = document.getElementById('custom-bg-input').value.trim();
  const bgEl = document.getElementById('bg-layer');

  if (customUrl) {
    bgEl.className = 'custom';
    bgEl.style.backgroundImage = `url(${customUrl})`;
    // Save to local storage
    chrome?.storage?.local?.set({ novaBg: 'custom', novaBgUrl: customUrl });
  } else {
    bgEl.className = selectedBg;
    bgEl.style.backgroundImage = '';
    chrome?.storage?.local?.set({ novaBg: selectedBg, novaBgUrl: '' });
  }

  document.getElementById('bg-modal').classList.add('hidden');
});

/* Load saved background */
function loadSavedBg() {
  if (!chrome?.storage?.local) return;
  chrome.storage.local.get(['novaBg', 'novaBgUrl'], result => {
    const bg = result.novaBg;
    const url = result.novaBgUrl;
    if (!bg) return;
    const bgEl = document.getElementById('bg-layer');
    bgEl.className = bg;
    if (bg === 'custom' && url) {
      bgEl.style.backgroundImage = `url(${url})`;
    }
  });
}

/* ── INIT ── */
(function init() {
  initGreeting();
  renderQuickLinks();
  renderTabs();
  loadSavedBg();
})();
