// Prototype settings drawer — gear (bottom-right) opens a right slide-in drawer
// with toggle groups. Auto-loaded by the chrome on every page. Adapted from the
// Fairs proto's proto-settings.js.
//
// Two sections:
//   - Global: toggles that apply prototype-wide (defined in GLOBAL_TOGGLES;
//     currently a light/dark Theme toggle — the platform bundle ships full .dark
//     tokens, so this flips the whole proto).
//   - This page: toggles a page opts into by setting window.__protoToggles = [...]
//     before the chrome script runs. Each sets body[data-<key>]=<val>; the page
//     owns the CSS/JS that reacts. Hidden if the page declares none.
//
// State persists to localStorage under proto-toggle-<key> so it survives
// navigation. The "theme" key is special-cased onto <html class="dark">.

(function () {
  const CSS = `
    .proto-settings-btn {
      position: fixed; bottom: 16px; right: 16px; z-index: 100;
      width: 40px; height: 40px; border-radius: 50%; border: 1px solid #e5e5e5;
      background: #fff; color: #666; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }
    .proto-settings-btn:hover { color: #333; background: #fafafa; }
    .proto-settings-overlay {
      position: fixed; inset: 0; z-index: 200; pointer-events: none;
      background: rgba(0,0,0,0); transition: background 0.2s ease;
    }
    .proto-settings-overlay.open { pointer-events: auto; background: rgba(0,0,0,0.3); }
    .proto-settings-drawer {
      position: absolute; top: 0; right: 0; bottom: 0;
      width: 280px; background: #fff;
      box-shadow: -4px 0 24px rgba(0,0,0,0.12);
      transform: translateX(100%); transition: transform 0.25s ease;
      display: flex; flex-direction: column; overflow-y: auto;
    }
    .proto-settings-overlay.open .proto-settings-drawer { transform: translateX(0); }
    .proto-settings-header {
      padding: 20px 20px 12px; border-bottom: 1px solid #eee;
      font-size: 14px; font-weight: 700; color: #111;
      display: flex; align-items: center; justify-content: space-between;
    }
    .proto-settings-close {
      width: 28px; height: 28px; border: none; background: none;
      font-size: 18px; color: #999; cursor: pointer; border-radius: 6px;
      display: flex; align-items: center; justify-content: center;
    }
    .proto-settings-close:hover { background: #f0f0f0; color: #555; }
    .proto-group { padding: 14px 20px 6px; }
    .proto-label {
      font-size: 10px; font-weight: 700; color: #999; text-transform: uppercase;
      letter-spacing: 0.06em; margin-bottom: 8px;
    }
    .proto-toggle-bar {
      display: flex; align-items: center; gap: 3px;
      background: #f5f5f5; border-radius: 8px; padding: 3px; margin-bottom: 8px;
    }
    .proto-toggle-bar button {
      height: 28px; border: none; background: none; border-radius: 5px;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      color: #999; transition: all 0.15s; padding: 0 10px; flex: 1;
      font-size: 13px; font-weight: 500;
    }
    .proto-toggle-bar button.active { background: #fff; color: #111; box-shadow: 0 1px 2px rgba(0,0,0,0.1); }
    .proto-empty { padding: 24px 20px; font-size: 13px; color: #999; font-style: italic; }
    .proto-section + .proto-section { border-top: 1px solid #e5e5e5; }
    .proto-section-title {
      font-size: 10px; font-weight: 700; color: #555;
      text-transform: uppercase; letter-spacing: 0.08em;
      padding: 14px 20px 0;
    }
    .proto-section-title + .proto-group { padding-top: 8px; }
  `;

  // Global toggles — rendered on every page's drawer.
  const GLOBAL_TOGGLES = [
    { key: 'theme', label: 'Theme', default: 'light', options: [
      { val: 'light', text: 'Light' },
      { val: 'dark',  text: 'Dark'  }
    ]}
  ];

  const GEAR_SVG = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>';

  function escapeHTML(str) {
    return String(str).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  function init() {
    if (document.getElementById('proto-settings-overlay')) return; // idempotent

    const pageToggles = Array.isArray(window.__protoToggles) ? window.__protoToggles : [];
    const allToggles = [...GLOBAL_TOGGLES, ...pageToggles];

    if (!document.getElementById('proto-settings-styles')) {
      const style = document.createElement('style');
      style.id = 'proto-settings-styles';
      style.textContent = CSS;
      document.head.appendChild(style);
    }

    const gear = document.createElement('button');
    gear.className = 'proto-settings-btn';
    gear.setAttribute('aria-label', 'Prototype settings');
    gear.innerHTML = GEAR_SVG;
    gear.addEventListener('click', toggle);
    document.body.appendChild(gear);

    const renderGroup = (g) => `
      <div class="proto-group">
        <div class="proto-label">${escapeHTML(g.label)}</div>
        <div class="proto-toggle-bar" data-toggle="${escapeHTML(g.key)}">
          ${g.options.map(o => `<button data-val="${escapeHTML(o.val)}">${escapeHTML(o.text)}</button>`).join('')}
        </div>
      </div>
    `;
    const renderSection = (title, groups) => groups.length === 0 ? '' : `
      <div class="proto-section">
        <div class="proto-section-title">${escapeHTML(title)}</div>
        ${groups.map(renderGroup).join('')}
      </div>
    `;

    const bodyHTML = renderSection('Global', GLOBAL_TOGGLES) + renderSection('This page', pageToggles);

    const overlay = document.createElement('div');
    overlay.className = 'proto-settings-overlay';
    overlay.id = 'proto-settings-overlay';
    overlay.innerHTML = `
      <div class="proto-settings-drawer">
        <div class="proto-settings-header">
          Prototype settings
          <button class="proto-settings-close" aria-label="Close">&times;</button>
        </div>
        ${bodyHTML}
      </div>
    `;
    overlay.addEventListener('click', (e) => { if (e.target === overlay) toggle(); });
    overlay.querySelector('.proto-settings-close').addEventListener('click', toggle);
    overlay.querySelectorAll('[data-toggle] button').forEach(btn => {
      btn.addEventListener('click', () => {
        const group = btn.closest('[data-toggle]').dataset.toggle;
        setProto(group, btn.dataset.val);
      });
    });
    document.body.appendChild(overlay);

    // Hydrate every toggle. Precedence: localStorage > body dataset > default.
    allToggles.forEach(g => {
      const valid = new Set(g.options.map(o => o.val));
      const stored = readToggle(g.key);
      let val;
      if (stored && valid.has(stored)) val = stored;
      else if (valid.has(document.body.dataset[g.key])) val = document.body.dataset[g.key];
      else val = g.default || g.options[0].val;
      applyProto(g.key, val);
    });
    updateActives();
  }

  function readToggle(key) {
    try { return localStorage.getItem('proto-toggle-' + key); }
    catch (e) { return null; }
  }
  function writeToggle(key, val) {
    try { localStorage.setItem('proto-toggle-' + key, val); }
    catch (e) {}
  }

  function toggle() {
    document.getElementById('proto-settings-overlay').classList.toggle('open');
  }

  // Apply a toggle's effect. theme is special-cased onto <html class="dark">;
  // everything else is exposed as body[data-<key>] for the page to react to.
  function applyProto(key, val) {
    document.body.dataset[key] = val;
    if (key === 'theme') document.documentElement.classList.toggle('dark', val === 'dark');
  }

  function setProto(key, val) {
    applyProto(key, val);
    writeToggle(key, val);
    updateActives();
  }

  function updateActives() {
    document.querySelectorAll('[data-toggle] button').forEach(btn => {
      const group = btn.closest('[data-toggle]').dataset.toggle;
      btn.classList.toggle('active', btn.dataset.val === document.body.dataset[group]);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
