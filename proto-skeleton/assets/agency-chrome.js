// Agency chrome — injects the shadcn Sidebar shell around each page's content
// and applies active-nav state. PolicyLift counterpart to the Fairs proto's
// chrome.js, but simpler: shadcn drives active styling off data attributes, so
// we don't swap classes — we just set data-active="true" on the link matching
// <body data-page-active="...">, and the compiled CSS (app.css) does the rest.
//
// Each agency page is just its content in the body:
//   <body ... data-page-active="dashboard"> ...page content... </body>
//
// To edit the sidebar / nav itself, edit assets/chrome/agency-shell.html.

const SHELL = '/assets/chrome/agency-shell.html';

async function wrapPage() {
  const active = document.body.dataset.pageActive;

  // Capture the page's content (everything currently in body).
  const contentNodes = Array.from(document.body.childNodes);

  // Fetch the shell and drop it into body.
  const shell = await fetch(SHELL).then(r => r.text());
  document.body.innerHTML = shell;

  // Move the original content into the content slot. DOM nodes carry their
  // listeners with them, so any page-specific inline scripts keep working.
  const slot = document.getElementById('agency-content');
  contentNodes.forEach(n => slot.appendChild(n));

  applyActive(active);
  wireSidebarToggle();
  wireGroups();
  dimUnbuilt();

  document.body.style.visibility = 'visible';
  loadProtoSettings();
}

// Highlight the active nav item. shadcn styles via data-[active=true]; we only
// move the flag to the link the page declares with data-page-active.
function applyActive(active) {
  document.querySelectorAll('[data-nav]').forEach(a => a.setAttribute('data-active', 'false'));
  if (!active) return;
  const link = document.querySelector(`[data-nav="${active}"]`);
  if (link) link.setAttribute('data-active', 'true');
}

// Sidebar collapse: toggle the shadcn group between expanded and icon-rail.
// Both the in-sidebar trigger and the mobile trigger carry data-sidebar="trigger".
function wireSidebarToggle() {
  const group = document.querySelector('[data-slot="sidebar"]');
  if (!group) return;
  document.querySelectorAll('[data-sidebar="trigger"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const collapsed = group.getAttribute('data-state') === 'collapsed';
      group.setAttribute('data-state', collapsed ? 'expanded' : 'collapsed');
      group.setAttribute('data-collapsible', collapsed ? '' : 'icon');
    });
  });
}

// Collapsible nav groups (Marketing, Tools): each is a [data-slot="sidebar-group"]
// whose direct <ul> holds a toggle <button> and whose direct <div> holds the
// submenu. Clicking the button shows/hides the submenu and rotates the chevron.
// Groups start collapsed, except the group that contains the active page.
// Using display='' (not 'block') when open lets the icon-collapsed CSS rule
// still hide submenus.
function wireGroups() {
  document.querySelectorAll('[data-slot="sidebar-group"]').forEach(group => {
    const btn = group.querySelector(':scope > ul button[data-slot="sidebar-menu-button"]');
    const submenu = group.querySelector(':scope > div');
    if (!btn || !submenu) return;
    const chevron = btn.querySelector('.lucide-chevron-right');
    const setOpen = open => {
      submenu.style.display = open ? '' : 'none';
      if (chevron) chevron.style.transform = open ? 'rotate(90deg)' : 'rotate(0deg)';
    };
    // Collapsed by default; open only the group holding the active page.
    setOpen(!!submenu.querySelector('[data-nav][data-active="true"]'));
    btn.addEventListener('click', () => setOpen(submenu.style.display === 'none'));
  });
}

// Subtly grey out nav links that point nowhere yet (href="#").
function dimUnbuilt() {
  document.querySelectorAll('a[data-nav][href="#"]').forEach(a => a.classList.add('opacity-50'));
}

// Load the prototype settings drawer (gear + slide-in). Runs after the body has
// been rewritten so chrome doesn't clobber the drawer elements.
function loadProtoSettings() {
  if (document.getElementById('proto-settings-script')) return;
  const s = document.createElement('script');
  s.id = 'proto-settings-script';
  s.src = '/assets/proto-settings.js';
  document.head.appendChild(s);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', wrapPage);
} else {
  wrapPage();
}
