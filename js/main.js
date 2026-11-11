/* ==========================================================================
 * LaunchForge Accelerator — shared runtime
 * --------------------------------------------------------------------------
 * Loaded FIRST on every page (render-blocking on purpose) so the saved
 * theme + direction apply before first paint and nothing flashes.
 *
 * Responsibilities:
 *   - Theme switching (light / dark / system) + persistence
 *   - RTL switching + persistence
 *   - Toast notifications
 *   - Accessible confirmation modal
 *   - FAQ accordions, animated counters, smooth UI helpers
 *   - Form validation helpers
 *   - Broken-image fallback
 *   - Demo localStorage helpers (frontend-only, not secure storage)
 * ========================================================================== */

(function () {
  'use strict';

  /* ----------------------------- storage --------------------------------- */

  var KEYS = {
    theme: 'lf-theme',
    rtl: 'lf-rtl',
    auth: 'lf-auth',
    applications: 'lf-applications',
    founderProfile: 'lf-founder-profile',
    startup: 'lf-startup',
    milestones: 'lf-milestones',
    sessions: 'lf-sessions',
    deck: 'lf-deck',
    documents: 'lf-documents',
    notifications: 'lf-notifications',
    adminSettings: 'lf-admin-settings',
    portfolio: 'lf-portfolio',
    programs: 'lf-programs',
    mentors: 'lf-mentors',
  };

  var store = {
    get: function (key, fallback) {
      try {
        var raw = localStorage.getItem(key);
        if (raw === null) return fallback === undefined ? null : fallback;
        return JSON.parse(raw);
      } catch (e) {
        return fallback === undefined ? null : fallback;
      }
    },
    set: function (key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (e) {
        return false;
      }
    },
    remove: function (key) {
      try {
        localStorage.removeItem(key);
      } catch (e) { /* ignore */ }
    },
  };

  /* ------------------------------ base path ------------------------------ */
  /* Pages under /dashboard/ live one level deeper → relative prefix "../"   */

  var BASE = /\/dashboard\//.test(location.pathname.replace(/\\/g, '/')) ? '../' : '';

  /* ------------------------------- theme --------------------------------- */

  var systemQuery = window.matchMedia('(prefers-color-scheme: dark)');

  function storedTheme() {
    var t = store.get(KEYS.theme);
    return t === 'light' || t === 'dark' || t === 'system' ? t : null;
  }

  function resolvedTheme() {
    var t = storedTheme();
    if (t === 'light' || t === 'dark') return t;
    return systemQuery.matches ? 'dark' : 'light';
  }

  function applyTheme(theme, animate) {
    var root = document.documentElement;
    if (animate && !prefersReducedMotion()) {
      root.classList.add('theme-anim');
      window.setTimeout(function () {
        root.classList.remove('theme-anim');
      }, 360);
    }
    root.classList.toggle('dark', theme === 'dark');
    document.dispatchEvent(new CustomEvent('lf:theme-change', { detail: { theme: theme } }));
  }

  function setTheme(theme) {
    store.set(KEYS.theme, theme);
    applyTheme(theme, true);
  }

  function toggleTheme() {
    var next = resolvedTheme() === 'dark' ? 'light' : 'dark';
    setTheme(next);
    return next;
  }

  /* ------------------------------- RTL ----------------------------------- */

  function isRtl() {
    return document.documentElement.dir === 'rtl';
  }

  function applyRtl(on) {
    document.documentElement.dir = on ? 'rtl' : 'ltr';
    document.dispatchEvent(new CustomEvent('lf:rtl-change', { detail: { rtl: on } }));
  }

  function toggleRtl() {
    var next = !isRtl();
    store.set(KEYS.rtl, next ? 'rtl' : 'ltr');
    applyRtl(next);
    return next;
  }

  /* --------------------------- boot (immediate) --------------------------- */

  applyTheme(resolvedTheme(), false);
  applyRtl(store.get(KEYS.rtl) === 'rtl');

  if (systemQuery.addEventListener) {
    systemQuery.addEventListener('change', function () {
      var t = storedTheme();
      if (t === null || t === 'system') applyTheme(resolvedTheme(), true);
    });
  }

  /* ------------------------------ utilities ------------------------------ */

  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function debounce(fn, wait) {
    var t;
    return function () {
      var args = arguments;
      var ctx = this;
      window.clearTimeout(t);
      t = window.setTimeout(function () {
        fn.apply(ctx, args);
      }, wait || 180);
    };
  }

  function uid(prefix) {
    return (prefix || 'id') + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function formatDate(value) {
    var d = value instanceof Date ? value : new Date(value);
    if (isNaN(d.getTime())) return String(value || '');
    return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  }

  /* ------------------------------- toasts -------------------------------- */

  var TOAST_ICONS = {
    success:
      '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
    error:
      '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/></svg>',
    warning:
      '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4M12 17h.01"/></svg>',
    info:
      '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>',
  };

  var TOAST_COLORS = {
    success: 'text-success',
    error: 'text-danger',
    warning: 'text-warning',
    info: 'text-primary',
  };

  function toast(message, type, duration) {
    type = TOAST_ICONS[type] ? type : 'info';
    var root = document.getElementById('toast-root');
    if (!root) {
      root = document.createElement('div');
      root.id = 'toast-root';
      document.body.appendChild(root);
    }

    var el = document.createElement('div');
    el.className = 'lf-toast';
    el.setAttribute('role', type === 'error' ? 'alert' : 'status');
    el.innerHTML =
      '<span class="mt-0.5 shrink-0 ' + (TOAST_COLORS[type] || 'text-primary') + '">' +
      TOAST_ICONS[type] + '</span>' +
      '<div class="flex-1 text-sm font-medium leading-snug text-ink">' + escapeHtml(message) + '</div>' +
      '<button type="button" class="shrink-0 rounded-md p-1 text-muted transition hover:text-ink" aria-label="Dismiss notification">' +
      '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button>';

    var remove = function () {
      if (!el.isConnected) return;
      el.classList.add('is-leaving');
      window.setTimeout(function () {
        if (el.isConnected) el.remove();
      }, 240);
    };
    el.querySelector('button').addEventListener('click', remove);
    root.appendChild(el);
    window.setTimeout(remove, duration || 4000);
    return el;
  }

  /* ------------------------- confirmation modal --------------------------- */

  function confirmDialog(opts) {
    opts = opts || {};
    var title = opts.title || 'Are you sure?';
    var message = opts.message || '';
    var confirmLabel = opts.confirmLabel || 'Confirm';
    var cancelLabel = opts.cancelLabel || 'Cancel';
    var danger = opts.tone !== 'primary';

    return new Promise(function (resolve) {
      var previous = document.activeElement;
      var backdrop = document.createElement('div');
      backdrop.className = 'lf-modal-backdrop';
      backdrop.innerHTML =
        '<div class="lf-modal" role="dialog" aria-modal="true" aria-labelledby="lf-modal-title" aria-describedby="lf-modal-desc">' +
        '<h2 id="lf-modal-title" class="font-display text-lg font-bold text-ink">' + escapeHtml(title) + '</h2>' +
        '<p id="lf-modal-desc" class="mt-2 text-sm leading-relaxed text-muted">' + escapeHtml(message) + '</p>' +
        '<div class="mt-6 flex flex-wrap justify-end gap-3">' +
        '<button type="button" data-modal-cancel class="btn btn-outline btn-sm">' + escapeHtml(cancelLabel) + '</button>' +
        '<button type="button" data-modal-confirm class="btn btn-sm ' + (danger ? 'bg-danger text-white hover:bg-danger/90' : 'btn-primary') + '">' +
        escapeHtml(confirmLabel) + '</button></div></div>';

      var close = function (result) {
        document.removeEventListener('keydown', onKey, true);
        backdrop.remove();
        if (previous && previous.focus) previous.focus();
        resolve(result);
      };

      var onKey = function (e) {
        if (e.key === 'Escape') {
          e.stopPropagation();
          close(false);
        } else if (e.key === 'Tab') {
          var focusables = backdrop.querySelectorAll('button');
          var first = focusables[0];
          var last = focusables[focusables.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      };

      backdrop.addEventListener('click', function (e) {
        if (e.target === backdrop) close(false);
      });
      backdrop.querySelector('[data-modal-cancel]').addEventListener('click', function () {
        close(false);
      });
      backdrop.querySelector('[data-modal-confirm]').addEventListener('click', function () {
        close(true);
      });
      document.addEventListener('keydown', onKey, true);
      document.body.appendChild(backdrop);
      backdrop.querySelector('[data-modal-confirm]').focus();
    });
  }

  /* ----------------------------- accordions ------------------------------ */

  function initAccordions(root) {
    (root || document).querySelectorAll('[data-accordion]').forEach(function (group) {
      if (group.dataset.accordionReady === '1') return;
      group.dataset.accordionReady = '1';
      var single = group.dataset.accordion !== 'multi';
      var triggers = group.querySelectorAll('[data-accordion-trigger]');
      triggers.forEach(function (trigger) {
        var panelId = trigger.getAttribute('aria-controls');
        var panel = panelId ? document.getElementById(panelId) : null;
        if (!panel) return;
        var open = trigger.getAttribute('aria-expanded') === 'true';
        panel.classList.toggle('is-open', open);
        trigger.addEventListener('click', function () {
          var isOpen = trigger.getAttribute('aria-expanded') === 'true';
          if (single && !isOpen) {
            triggers.forEach(function (other) {
              if (other === trigger) return;
              other.setAttribute('aria-expanded', 'false');
              var otherPanel = document.getElementById(other.getAttribute('aria-controls'));
              if (otherPanel) otherPanel.classList.remove('is-open');
            });
          }
          trigger.setAttribute('aria-expanded', String(!isOpen));
          panel.classList.toggle('is-open', !isOpen);
        });
      });
    });
  }

  /* ---------------------------- counters --------------------------------- */

  function animateCounters(root) {
    var nodes = (root || document).querySelectorAll('[data-count-to]:not([data-counted])');
    var reduce = prefersReducedMotion();

    var run = function (el) {
      el.setAttribute('data-counted', '1');
      var target = parseFloat(el.getAttribute('data-count-to')) || 0;
      var prefix = el.getAttribute('data-count-prefix') || '';
      var suffix = el.getAttribute('data-count-suffix') || '';
      var decimals = parseInt(el.getAttribute('data-count-decimals') || '0', 10);
      var render = function (v) {
        el.textContent = prefix + v.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + suffix;
      };
      if (reduce) {
        render(target);
        return;
      }
      var duration = 1400;
      var start = performance.now();
      var step = function (now) {
        var p = Math.min((now - start) / duration, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        render(target * eased);
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    if (!('IntersectionObserver' in window)) {
      nodes.forEach(run);
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            run(entry.target);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    nodes.forEach(function (n) {
      io.observe(n);
    });
  }

  /* --------------------------- form helpers ------------------------------ */

  function isEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(value || '').trim());
  }

  function isPhone(value) {
    var v = String(value || '').trim();
    if (!v) return false;
    if (!/^[+()\-.\s\d]{7,22}$/.test(v)) return false;
    var digits = v.replace(/\D/g, '');
    return digits.length >= 7 && digits.length <= 15;
  }

  function errorNode(input) {
    var key = input.getAttribute('name') || input.id;
    if (!key) return null;
    return document.querySelector('[data-error-for="' + key + '"]');
  }

  function showFieldError(input, message) {
    var node = errorNode(input);
    if (node) {
      node.textContent = message;
      node.classList.remove('hidden');
    }
    input.classList.add('field-invalid');
    input.setAttribute('aria-invalid', 'true');
  }

  function clearFieldError(input) {
    var node = errorNode(input);
    if (node) {
      node.textContent = '';
      node.classList.add('hidden');
    }
    input.classList.remove('field-invalid');
    input.removeAttribute('aria-invalid');
  }

  /* Validates [required] controls inside a container. Returns true/false. */
  function validateForm(container) {
    var valid = true;
    var controls = container.querySelectorAll('input, select, textarea');
    controls.forEach(function (input) {
      if (!input.hasAttribute('required')) return;
      clearFieldError(input);
      var value = (input.value || '').trim();
      if (!value) {
        showFieldError(input, input.getAttribute('data-error-message') || 'This field is required.');
        valid = false;
        return;
      }
      if (input.type === 'email' && !isEmail(value)) {
        showFieldError(input, 'Please enter a valid email address.');
        valid = false;
      } else if (input.type === 'tel' && !isPhone(value)) {
        showFieldError(input, 'Please enter a valid phone number (7–15 digits).');
        valid = false;
      }
    });
    if (!valid) {
      var firstInvalid = container.querySelector('.field-invalid');
      if (firstInvalid) firstInvalid.focus({ preventScroll: false });
    }
    return valid;
  }

  /* ------------------------ broken image fallback ------------------------ */

  window.addEventListener(
    'error',
    function (e) {
      var el = e.target;
      if (el && el.tagName === 'IMG' && !el.getAttribute('data-fallback-done')) {
        el.setAttribute('data-fallback-done', '1');
        el.classList.add('img-fallback');
        el.src = BASE + 'images/placeholder.svg';
      }
    },
    true
  );

  /* ---------------------- global control delegation ---------------------- */
  /* Works for markup injected later (navbar / footer / page scripts).      */

  document.addEventListener('click', function (e) {
    var themeBtn = e.target.closest && e.target.closest('[data-theme-toggle]');
    if (themeBtn) {
      e.preventDefault();
      toggleTheme();
      return;
    }
    var rtlBtn = e.target.closest && e.target.closest('[data-rtl-toggle]');
    if (rtlBtn) {
      e.preventDefault();
      toggleRtl();
      return;
    }
    var noteBtn = e.target.closest && e.target.closest('[data-demo-note]');
    if (noteBtn) {
      e.preventDefault();
      toast(noteBtn.getAttribute('data-demo-note'), 'info');
      return;
    }
    var resetBtn = e.target.closest && e.target.closest('[data-reset-demo]');
    if (resetBtn) {
      e.preventDefault();
      confirmDialog({
        title: 'Reset demo data?',
        message:
          'This clears every locally stored demo item (applications, milestones, sessions, profile changes) on this browser. Your theme choice is kept.',
        confirmLabel: 'Reset data',
      }).then(function (ok) {
        if (!ok) return;
        try {
          Object.keys(localStorage).forEach(function (key) {
            if (key.indexOf('lf-') === 0 && key !== KEYS.theme && key !== KEYS.rtl) {
              localStorage.removeItem(key);
            }
          });
        } catch (err) { /* ignore */ }
        toast('Demo data has been reset.', 'success');
        window.setTimeout(function () {
          location.reload();
        }, 650);
      });
    }
  });

  /* -------------------------------- boot --------------------------------- */

  ready(function () {
    initAccordions(document);
    animateCounters(document);
    document.querySelectorAll('[data-current-year]').forEach(function (el) {
      el.textContent = String(new Date().getFullYear());
    });
  });

  /* --------------------------- public API -------------------------------- */

  window.LaunchForge = {
    KEYS: KEYS,
    store: store,
    base: BASE,
    theme: {
      get: resolvedTheme,
      set: setTheme,
      toggle: toggleTheme,
      stored: storedTheme,
    },
    rtl: {
      is: isRtl,
      toggle: toggleRtl,
      set: applyRtl,
    },
    toast: toast,
    confirm: confirmDialog,
    escapeHtml: escapeHtml,
    debounce: debounce,
    uid: uid,
    formatDate: formatDate,
    ready: ready,
    prefersReducedMotion: prefersReducedMotion,
    initAccordions: initAccordions,
    animateCounters: animateCounters,
    form: {
      isEmail: isEmail,
      isPhone: isPhone,
      validate: validateForm,
      showError: showFieldError,
      clearError: clearFieldError,
    },
  };
})();
