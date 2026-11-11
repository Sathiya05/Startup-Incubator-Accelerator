/* ==========================================================================
 * LaunchForge Accelerator — shared navbar
 * --------------------------------------------------------------------------
 * The COMPLETE navbar markup lives only in this file. Every page renders it
 * with a single empty mount:  <div id="navbar"></div>
 *
 * Behaviour:
 *   - Desktop (>=1024px): full navigation with Home + Dashboard dropdowns,
 *     theme toggle, RTL toggle, Login and the Apply Now CTA.
 *   - Tablet & mobile (<1024px): ONLY the brand logo and the hamburger icon
 *     are visible. Everything else lives inside an accessible drawer.
 *   - Active link highlighting, keyboard support, ARIA, scroll locking.
 * ========================================================================== */

(function () {
  'use strict';

  var BASE = (window.LaunchForge && window.LaunchForge.base) || '';

  /* ------------------------------- icons --------------------------------- */

  function svg(inner, size) {
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" width="' + (size || 20) + '" height="' + (size || 20) +
      '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" ' +
      'stroke-linejoin="round" aria-hidden="true" focusable="false">' + inner + '</svg>'
    );
  }

  var ICONS = {
    menu: svg('<path d="M4 6h16M4 12h16M4 18h16"/>', 22),
    close: svg('<path d="M18 6 6 18M6 6l12 12"/>', 22),
    chevron: svg('<path d="m6 9 6 6 6-6"/>', 16),
    sun: svg('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>'),
    moon: svg('<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>'),
    languages: svg('<path d="M8 3 4 7l4 4"/><path d="M4 7h16"/><path d="m16 21 4-4-4-4"/><path d="M20 17H4"/>'),
    login: svg('<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><path d="m10 17 5-5-5-5"/><path d="M15 12H3"/>'),
    rocket: svg('<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>'),
  };

  /* --------------------------- navigation data --------------------------- */

  var NAV_ITEMS = [
    {
      label: 'Home',
      key: 'home',
      children: [
        { label: 'Home 1', href: 'index.html', match: 'index.html' },
        { label: 'Home 2', href: 'home2.html', match: 'home2.html' },
      ],
    },
    { label: 'About', href: 'about.html', match: 'about.html' },
    { label: 'Program', href: 'program.html', match: 'program.html' },
    { label: 'Portfolio', href: 'portfolio.html', match: 'portfolio.html' },
    { label: 'Mentors', href: 'mentors.html', match: 'mentors.html' },
    {
      label: 'Dashboard',
      key: 'dashboard',
      children: [
        { label: 'Founder Dashboard', href: 'dashboard/founder-dashboard.html', match: 'founder-dashboard.html' },
        { label: 'Admin Dashboard', href: 'dashboard/admin-dashboard.html', match: 'admin-dashboard.html' },
      ],
    },
    { label: 'Contact', href: 'contact.html', match: 'contact.html' },
  ];

  /* -------------------------- active page state -------------------------- */

  function pageInfo() {
    var path = location.pathname.replace(/\\/g, '/');
    var parts = path.split('/').filter(Boolean);
    var file = parts.length ? parts[parts.length - 1] : 'index.html';
    if (!file) file = 'index.html';
    var inDashboard = parts.indexOf('dashboard') !== -1;
    return { file: file, inDashboard: inDashboard };
  }

  function isItemActive(item, info) {
    if (item.children) {
      return item.children.some(function (child) {
        return child.match === info.file;
      });
    }
    if (info.inDashboard) return false;
    return item.match === info.file;
  }

  function activeClass(active) {
    return active ? ' is-active' : '';
  }

  function ariaCurrent(active) {
    return active ? ' aria-current="page"' : '';
  }

  /* ------------------------------ markup --------------------------------- */

  function brandMarkup(extraClass) {
    return (
      '<a href="' + BASE + 'index.html" class="flex shrink-0 items-center gap-3 ' + (extraClass || '') + '" aria-label="LaunchForge Accelerator — home">' +
      '<img src="' + BASE + 'images/logo/launchforge-mark.svg" alt="" width="40" height="40" class="h-10 w-10 shrink-0" />' +
      '<span class="leading-tight">' +
      '<span class="block font-display text-lg font-bold tracking-tight text-ink">LaunchForge</span>' +
      '<span class="block text-[10px] font-bold uppercase tracking-[0.18em] text-muted">Startup Accelerator</span>' +
      '</span></a>'
    );
  }

  function desktopDropdown(item, info) {
    var active = isItemActive(item, info);
    var id = 'lf-menu-' + item.key;
    var links = item.children
      .map(function (child) {
        var childActive = child.match === info.file;
        return (
          '<a href="' + BASE + child.href + '"' + ariaCurrent(childActive) +
          ' class="flex items-center justify-between gap-6 rounded-lg px-3.5 py-2.5 text-sm font-semibold text-ink transition hover:bg-softindigo hover:text-primary' +
          (childActive ? ' bg-softindigo text-primary' : '') + '" role="menuitem">' +
          '<span>' + child.label + '</span></a>'
        );
      })
      .join('');

    return (
      '<div class="relative" data-dropdown>' +
      '<button type="button" class="nav-trigger' + activeClass(active) + '" aria-expanded="false" aria-controls="' + id + '" aria-haspopup="true" data-dropdown-trigger>' +
      item.label + '<span class="lf-chevron">' + ICONS.chevron + '</span></button>' +
      '<div class="lf-menu absolute top-full z-50 mt-2 min-w-64 rounded-2xl border border-line bg-surface p-2 shadow-card start-0" id="' + id + '" role="menu" data-dropdown-menu>' +
      links + '</div></div>'
    );
  }

  function desktopLink(item, info) {
    var active = isItemActive(item, info);
    return (
      '<a href="' + BASE + item.href + '"' + ariaCurrent(active) +
      ' class="nav-link' + activeClass(active) + '" data-nav-link>' + item.label + '</a>'
    );
  }

  function desktopMarkup(info) {
    var nav = NAV_ITEMS.map(function (item) {
      return item.children ? desktopDropdown(item, info) : desktopLink(item, info);
    }).join('');

    return (
      /* Center navigation — hidden below 1024px */
      '<nav class="hidden items-center gap-1 lg:flex" aria-label="Primary navigation">' + nav + '</nav>' +

      /* Right actions — hidden below 1024px */
      '<div class="hidden items-center gap-2 lg:flex">' +
      '<button type="button" class="icon-btn" data-theme-toggle aria-label="Toggle colour theme" title="Toggle light / dark mode">' +
      '<span class="lf-theme-icon-sun">' + ICONS.sun + '</span><span class="lf-theme-icon-moon">' + ICONS.moon + '</span></button>' +
      '<button type="button" class="icon-btn" data-rtl-toggle aria-label="Toggle text direction (LTR / RTL)" title="Toggle left-to-right / right-to-left layout">' +
      ICONS.languages + '</button>' +
      '<a href="' + BASE + 'login.html" class="btn btn-primary btn-sm gap-1.5">' + ICONS.login + 'Login</a>' +
      '<a href="' + BASE + 'apply.html" class="btn btn-secondary btn-sm">Apply Now</a>' +
      '</div>'
    );
  }

  function mobileSubmenu(item, info) {
    var id = 'lf-mobile-' + item.key;
    var links = item.children
      .map(function (child) {
        var childActive = child.match === info.file;
        return (
          '<a href="' + BASE + child.href + '"' + ariaCurrent(childActive) +
          ' class="mobile-sub-link' + (childActive ? ' is-active' : '') + '" data-drawer-link>' + child.label + '</a>'
        );
      })
      .join('');

    return (
      '<li>' +
      '<button type="button" class="mobile-link" aria-expanded="false" aria-controls="' + id + '" data-mobile-sub-trigger>' +
      '<span>' + item.label + '</span><span class="lf-chevron">' + ICONS.chevron + '</span></button>' +
      '<div class="lf-sub ml-3 border-s-2 border-line ps-3" id="' + id + '"><div class="min-h-0 overflow-hidden"><div class="flex flex-col gap-1 py-1.5">' + links + '</div></div></div>' +
      '</li>'
    );
  }

  function mobileLink(item, info) {
    var active = isItemActive(item, info);
    return (
      '<li><a href="' + BASE + item.href + '"' + ariaCurrent(active) +
      ' class="mobile-link' + (active ? ' is-active' : '') + '" data-drawer-link>' + item.label + '</a></li>'
    );
  }

  function drawerMarkup(info) {
    var items = NAV_ITEMS.map(function (item) {
      return item.children ? mobileSubmenu(item, info) : mobileLink(item, info);
    }).join('');

    return (
      /* Backdrop */
      '<div id="lf-drawer-backdrop" class="fixed inset-0 z-40 bg-ink/60 opacity-0 pointer-events-none transition-opacity duration-300 lg:hidden" aria-hidden="true"></div>' +

      /* Drawer panel */
      '<div id="lf-drawer" class="lf-drawer fixed inset-y-0 z-50 flex w-[min(92vw,400px)] flex-col border-s border-line bg-surface lg:hidden" role="dialog" aria-modal="true" aria-label="Site menu">' +

      '<div class="flex items-center justify-between gap-3 border-b border-line px-5 py-4">' +
      brandMarkup('pointer-events-none') +
      '<button type="button" class="icon-btn shrink-0" data-drawer-close aria-label="Close menu">' + ICONS.close + '</button>' +
      '</div>' +

      '<nav class="flex-1 overflow-y-auto overscroll-contain px-4 py-5" aria-label="Mobile navigation">' +
      '<ul class="flex flex-col gap-1.5">' + items + '</ul>' +

      '<div class="mt-6 flex flex-col gap-2 border-t border-line pt-5">' +
      '<button type="button" class="mobile-control-row" data-theme-toggle>' +
      '<span class="flex items-center gap-3">' +
      '<span class="control-icon"><span class="lf-theme-icon-sun">' + ICONS.sun + '</span><span class="lf-theme-icon-moon">' + ICONS.moon + '</span></span>' +
      '<span data-theme-label>Theme</span></span>' +
      '<span class="text-xs font-bold uppercase tracking-wider text-muted" data-theme-state>Light</span></button>' +

      '<button type="button" class="mobile-control-row" data-rtl-toggle>' +
      '<span class="flex items-center gap-3">' +
      '<span class="control-icon">' + ICONS.languages + '</span>' +
      '<span data-rtl-label>Layout direction</span></span>' +
      '<span class="text-xs font-bold uppercase tracking-wider text-muted" data-rtl-state>LTR</span></button>' +
      '</div>' +

      '<div class="mt-6">' +
      '<a href="' + BASE + 'apply.html" class="btn btn-secondary btn-lg btn-block" data-drawer-link>Apply Now</a>' +
      '<p class="mt-5 text-center text-xs font-medium leading-relaxed text-muted">From Bold Ideas to Breakthrough Businesses.</p>' +
      '</div>' +
      '</nav></div>'
    );
  }

  function navbarMarkup() {
    var info = pageInfo();
    return (
      '<header class="border-b border-line bg-surface/90 backdrop-blur-lg" data-site-header>' +
      '<a href="#main-content" class="skip-link">Skip to main content</a>' +
      '<div class="container-x flex h-16 items-center justify-between gap-4 lg:h-20">' +
      brandMarkup() +
      desktopMarkup(info) +
      /* Hamburger — the ONLY control visible below 1024px besides the logo */
      '<button type="button" class="icon-btn shrink-0 lg:hidden" id="lf-drawer-open" aria-expanded="false" aria-controls="lf-drawer" aria-label="Open menu" aria-haspopup="dialog">' +
      ICONS.menu + '</button>' +
      '</div></header>' +
      drawerMarkup(info)
    );
  }

  /* ---------------------------- interactions ----------------------------- */

  var openDropdowns = [];

  function closeDropdown(trigger, refocus) {
    var menu = document.getElementById(trigger.getAttribute('aria-controls'));
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('data-pinned', 'false');
    if (menu) menu.classList.remove('is-open');
    openDropdowns = openDropdowns.filter(function (t) {
      return t !== trigger;
    });
    if (refocus) trigger.focus();
  }

  function closeAllDropdowns(refocus) {
    openDropdowns.slice().forEach(function (trigger) {
      closeDropdown(trigger, refocus);
    });
  }

  function openDropdown(trigger) {
    var menu = document.getElementById(trigger.getAttribute('aria-controls'));
    if (!menu) return;
    trigger.setAttribute('aria-expanded', 'true');
    menu.classList.add('is-open');
    if (openDropdowns.indexOf(trigger) === -1) openDropdowns.push(trigger);
  }

  function setupDesktopDropdowns(root) {
    root.querySelectorAll('[data-dropdown]').forEach(function (dropdown) {
      var trigger = dropdown.querySelector('[data-dropdown-trigger]');
      var menu = dropdown.querySelector('[data-dropdown-menu]');
      if (!trigger || !menu) return;

      trigger.addEventListener('click', function () {
        var open = trigger.getAttribute('aria-expanded') === 'true';
        var pinned = trigger.getAttribute('data-pinned') === 'true';
        if (!open) {
          closeAllDropdowns();
          openDropdown(trigger);
          trigger.setAttribute('data-pinned', 'true');
        } else if (pinned) {
          closeDropdown(trigger);
        } else {
          /* opened by hover — first click pins it instead of closing it
             (keeps touch devices working: mouseenter + click both fire) */
          trigger.setAttribute('data-pinned', 'true');
        }
      });

      dropdown.addEventListener('mouseenter', function () {
        if (window.matchMedia('(min-width: 1100px)').matches) {
          closeAllDropdowns();
          openDropdown(trigger);
        }
      });
      dropdown.addEventListener('mouseleave', function () {
        if (window.matchMedia('(min-width: 1100px)').matches && trigger.getAttribute('data-pinned') !== 'true') {
          closeDropdown(trigger);
        }
      });

      trigger.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          openDropdown(trigger);
          var first = menu.querySelector('a');
          if (first) first.focus();
        }
      });

      menu.addEventListener('keydown', function (e) {
        var links = Array.prototype.slice.call(menu.querySelectorAll('a'));
        var idx = links.indexOf(document.activeElement);
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          (links[idx + 1] || links[0]).focus();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (idx <= 0) trigger.focus();
          else links[idx - 1].focus();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          closeDropdown(trigger, true);
        }
      });
    });

    document.addEventListener('click', function (e) {
      if (!e.target.closest || !e.target.closest('[data-dropdown]')) closeAllDropdowns();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeAllDropdowns(true);
    });
  }

  /* ------------------------------- drawer -------------------------------- */

  var drawerState = { open: false };

  function focusables() {
    var drawer = document.getElementById('lf-drawer');
    if (!drawer) return [];
    return Array.prototype.slice.call(
      drawer.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')
    ).filter(function (el) {
      return el.offsetParent !== null || el === document.activeElement;
    });
  }

  function setDrawer(open) {
    var drawer = document.getElementById('lf-drawer');
    var backdrop = document.getElementById('lf-drawer-backdrop');
    var opener = document.getElementById('lf-drawer-open');
    if (!drawer || !opener) return;
    drawerState.open = open;
    drawer.classList.toggle('is-open', open);
    if (backdrop) {
      backdrop.classList.toggle('opacity-100', open);
      backdrop.classList.toggle('pointer-events-auto', open);
      backdrop.classList.toggle('opacity-0', !open);
      backdrop.classList.toggle('pointer-events-none', !open);
    }
    opener.setAttribute('aria-expanded', String(open));
    opener.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    opener.innerHTML = open ? ICONS.close : ICONS.menu;
    document.body.classList.toggle('no-scroll', open);
    drawer.setAttribute('aria-hidden', String(!open));

    if (open) {
      drawer.removeAttribute('inert');
      window.setTimeout(function () {
        var items = focusables();
        if (items.length) items[0].focus();
      }, 120);
    } else {
      drawer.setAttribute('inert', '');
      opener.focus();
      /* collapse any open mobile submenus */
      drawer.querySelectorAll('[data-mobile-sub-trigger][aria-expanded="true"]').forEach(function (btn) {
        btn.setAttribute('aria-expanded', 'false');
        var panel = document.getElementById(btn.getAttribute('aria-controls'));
        if (panel) panel.classList.remove('is-open');
      });
    }
  }

  function setupDrawer(root) {
    var opener = root.getElementById('lf-drawer-open') || root.querySelector('#lf-drawer-open');
    var drawer = root.querySelector('#lf-drawer');
    var backdrop = root.querySelector('#lf-drawer-backdrop');
    if (!opener || !drawer) return;

    if (drawer.hasAttribute('inert') === false && !drawerState.open) drawer.setAttribute('inert', '');

    opener.addEventListener('click', function () {
      setDrawer(!drawerState.open);
    });
    root.querySelector('[data-drawer-close]').addEventListener('click', function () {
      setDrawer(false);
    });
    if (backdrop) {
      backdrop.addEventListener('click', function () {
        setDrawer(false);
      });
    }

    /* Expandable mobile submenus */
    drawer.querySelectorAll('[data-mobile-sub-trigger]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var open = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!open));
        var panel = document.getElementById(btn.getAttribute('aria-controls'));
        if (panel) panel.classList.toggle('is-open', !open);
      });
    });

    /* Any link inside the drawer closes it before navigating */
    drawer.querySelectorAll('[data-drawer-link], a[href]').forEach(function (link) {
      link.addEventListener('click', function () {
        setDrawer(false);
      });
    });

    /* Escape closes, Tab is trapped while open */
    document.addEventListener('keydown', function (e) {
      if (!drawerState.open) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        setDrawer(false);
      } else if (e.key === 'Tab') {
        var items = focusables();
        if (!items.length) return;
        var first = items[0];
        var last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });

    /* Clicking anywhere outside the open drawer closes it (backdrop covers all) */
    document.addEventListener('click', function (e) {
      if (!drawerState.open) return;
      if (drawer.contains(e.target) || (e.target.closest && e.target.closest('#lf-drawer-open'))) return;
      if (e.target === backdrop) setDrawer(false);
    });

    /* Leaving the mobile breakpoint always closes the drawer */
    window.addEventListener('resize', window.LaunchForge.debounce(function () {
      if (drawerState.open && window.matchMedia('(min-width: 1100px)').matches) setDrawer(false);
    }, 150));
  }

  /* ------------------------- toggle state labels ------------------------- */

  function syncToggleLabels() {
    var theme = (window.LaunchForge && window.LaunchForge.theme.get()) || 'light';
    var rtl = document.documentElement.dir === 'rtl';

    document.querySelectorAll('[data-theme-label]').forEach(function (el) {
      el.textContent = theme === 'dark' ? 'Dark mode' : 'Light mode';
    });
    document.querySelectorAll('[data-theme-state]').forEach(function (el) {
      el.textContent = theme === 'dark' ? 'On' : 'Off';
    });
    document.querySelectorAll('[data-theme-toggle]').forEach(function (el) {
      if (el.tagName === 'BUTTON' && !el.hasAttribute('data-theme-label')) {
        el.setAttribute(
          'aria-label',
          theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
        );
        el.setAttribute('title', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
      }
    });

    document.querySelectorAll('[data-rtl-label]').forEach(function (el) {
      el.textContent = 'Layout direction';
    });
    document.querySelectorAll('[data-rtl-state]').forEach(function (el) {
      el.textContent = rtl ? 'RTL' : 'LTR';
    });
    document.querySelectorAll('[data-rtl-toggle]').forEach(function (el) {
      if (el.tagName === 'BUTTON' && !el.hasAttribute('data-rtl-label')) {
        el.setAttribute('aria-label', rtl ? 'Switch to left-to-right layout' : 'Switch to right-to-left layout');
      }
    });
  }

  /* ------------------------------- inject -------------------------------- */

  function init() {
    var mount = document.getElementById('navbar');
    if (!mount || mount.dataset.rendered === '1') return;
    mount.dataset.rendered = '1';
    mount.innerHTML = navbarMarkup();

    setupDesktopDropdowns(document);
    setupDrawer(document);
    syncToggleLabels();

    document.addEventListener('lf:theme-change', syncToggleLabels);
    document.addEventListener('lf:rtl-change', syncToggleLabels);
    window.addEventListener('pageshow', syncToggleLabels);
  }

  if (window.LaunchForge) window.LaunchForge.ready(init);
  else document.addEventListener('DOMContentLoaded', init);
})();
