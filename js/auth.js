/* ==========================================================================
 * LaunchForge Accelerator — demo authentication module (frontend-only)
 * --------------------------------------------------------------------------
 * Exposes window.LFAuth:
 *
 *   LFAuth.DEMO            // hardcoded demo accounts (founder / admin)
 *   LFAuth.login(email, password, remember)
 *       -> { ok:true,  user:{ name, email, role } }
 *       -> { ok:false, error:'message' }
 *   LFAuth.logout()        // clears the session + redirects to login.html
 *   LFAuth.getSession()    // stored session object or null
 *   LFAuth.currentUser()   // session, or a demo founder fallback so the
 *                          // dashboards work without logging in
 *
 * The module NEVER auto-redirects on page load — only logout() navigates.
 * It also auto-wires the login form when one exists on the page (#login-form).
 *
 * ---------------------------------------------------------------------------
 * NOT production security. Credentials are stored and compared in plaintext,
 * and the session lives in localStorage, which is NOT secure storage. This
 * exists purely so the frontend demo has believable sign-in flows.
 * ========================================================================== */

(function () {
  'use strict';

  var LF = window.LaunchForge || {};

  var AUTH_KEY = (LF.KEYS && LF.KEYS.auth) || 'lf-auth';

  var store = (LF.store && {
    get: LF.store.get,
    set: LF.store.set,
    remove: LF.store.remove,
  }) || {
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

  var escapeHtml = LF.escapeHtml || function (v) {
    return String(v == null ? '' : v)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  };
  var isEmail = LF.form && LF.form.isEmail
    ? LF.form.isEmail
    : function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v || '').trim()); };
  var toast = function (msg, type) { if (LF.toast) LF.toast(msg, type); };
  var ready = LF.ready || function (fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn, { once: true });
    else fn();
  };

  var BASE = LF.base || '';

  /* --------------------------- demo credentials -------------------------- */

  var DEMO = {
    founder: {
      email: 'founder@launchforge.demo',
      password: 'Founder123!',
      name: 'Alex Carter',
      role: 'founder',
    },
    admin: {
      email: 'admin@launchforge.demo',
      password: 'Admin123!',
      name: 'Jordan Blake',
      role: 'admin',
    },
  };

  var FALLBACK_USER = {
    name: 'Demo Founder',
    email: 'founder@launchforge.demo',
    role: 'founder',
  };

  function dashboardHref(role) {
    return BASE + 'dashboard/' + (role === 'admin' ? 'admin-dashboard.html' : 'founder-dashboard.html');
  }

  /* -------------------------------- API ---------------------------------- */

  function login(email, password, remember) {
    var mail = String(email || '').trim().toLowerCase();
    var pass = String(password || '');

    if (!mail || !pass) {
      return { ok: false, error: 'Email and password are required.' };
    }
    if (!isEmail(mail)) {
      return { ok: false, error: 'Please enter a valid email address.' };
    }

    var match = null;
    Object.keys(DEMO).forEach(function (key) {
      if (DEMO[key].email.toLowerCase() === mail && DEMO[key].password === pass) match = DEMO[key];
    });

    if (!match) {
      return { ok: false, error: 'Email or password is incorrect. Try the demo credentials below.' };
    }

    var session = {
      name: match.name,
      email: match.email,
      role: match.role,
      remember: !!remember,
      loginAt: new Date().toISOString(),
    };
    store.set(AUTH_KEY, session);

    return { ok: true, user: { name: session.name, email: session.email, role: session.role } };
  }

  function logout() {
    store.remove(AUTH_KEY);
    /* Relative-aware: '' at the project root, '../' from /dashboard/ */
    location.href = BASE + 'login.html';
  }

  function getSession() {
    var session = store.get(AUTH_KEY, null);
    if (!session || typeof session !== 'object' || !session.role) return null;
    return session;
  }

  function currentUser() {
    return getSession() || FALLBACK_USER;
  }

  /* --------------------------- login form wiring -------------------------- */

  function fillCredentials(role) {
    var account = DEMO[role];
    if (!account) return;
    var email = document.getElementById('login-email');
    var password = document.getElementById('login-password');
    if (email) email.value = account.email;
    if (password) {
      password.value = account.password;
      password.dispatchEvent(new Event('input', { bubbles: true }));
    }
    if (email) email.dispatchEvent(new Event('input', { bubbles: true }));
    toast(account.name + ' credentials filled in — press Log in.', 'info');
  }

  function wireLoginForm() {
    var form = document.getElementById('login-form');
    if (!form || form.dataset.authReady === '1') return;
    form.dataset.authReady = '1';

    var emailInput = form.querySelector('[name="email"]');
    var passwordInput = form.querySelector('[name="password"]');
    var rememberInput = form.querySelector('[name="remember"]');
    var submit = form.querySelector('[type="submit"]');
    var submitLabel = submit ? submit.querySelector('[data-submit-label]') : null;

    /* Prefill the email of the last account that chose "Remember me". */
    var previous = getSession();
    if (previous && previous.remember && emailInput && !emailInput.value) {
      emailInput.value = previous.email;
    }

    /* Show / hide password */
    var toggle = form.querySelector('[data-password-toggle]');
    if (toggle && passwordInput) {
      toggle.addEventListener('click', function () {
        var show = passwordInput.type === 'password';
        passwordInput.type = show ? 'text' : 'password';
        toggle.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
        toggle.setAttribute('aria-pressed', String(show));
        toggle.innerHTML = show ? EYE_OFF : EYE;
        passwordInput.focus({ preventScroll: true });
      });
    }

    /* "Use these credentials" demo buttons */
    document.querySelectorAll('[data-fill-credentials]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        fillCredentials(btn.getAttribute('data-fill-credentials'));
      });
    });

    /* Clear stale errors while typing */
    form.addEventListener('input', function (e) {
      if (e.target && e.target.name && LF.form) LF.form.clearError(e.target);
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      if (LF.form && !LF.form.validate(form)) {
        toast('Please enter your email and password.', 'error');
        return;
      }

      var remember = rememberInput ? rememberInput.checked : false;
      var result = login(emailInput ? emailInput.value : '', passwordInput ? passwordInput.value : '', remember);

      if (!result.ok) {
        if (LF.form && passwordInput) LF.form.showError(passwordInput, result.error);
        toast(result.error, 'error');
        if (passwordInput) passwordInput.focus({ preventScroll: false });
        return;
      }

      if (submit) submit.disabled = true;
      if (submitLabel) submitLabel.textContent = 'Signing in…';
      toast('Welcome back, ' + result.user.name + '!', 'success');

      window.setTimeout(function () {
        location.href = dashboardHref(result.user.role);
      }, 650);
    });
  }

  var EYE =
    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" ' +
    'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>';

  var EYE_OFF =
    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" ' +
    'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M10.7 5.1A11 11 0 0 1 12 5c6.5 0 10 7 10 7a17.4 17.4 0 0 1-3.2 4.2"/>' +
    '<path d="M6.6 6.6A17.6 17.6 0 0 0 2 12s3.5 7 10 7a10.9 10.9 0 0 0 5.4-1.4"/>' +
    '<path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/><path d="M2 2l20 20"/></svg>';

  /* -------------------------------- boot --------------------------------- */

  ready(function () {
    try {
      wireLoginForm();
    } catch (e) { /* never break the page because of demo auth wiring */ }
  });

  window.LFAuth = {
    DEMO: DEMO,
    login: login,
    logout: logout,
    getSession: getSession,
    currentUser: currentUser,
  };
})();
