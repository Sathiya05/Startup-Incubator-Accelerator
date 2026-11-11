/* ==========================================================================
 * LaunchForge Accelerator — startup application form (frontend demo)
 * --------------------------------------------------------------------------
 * Handles:
 *   - Live character counters  ([data-count-for] hints, warn near limits)
 *   - Extra validation on top of LaunchForge.form.validate()
 *   - Saving submissions to localStorage (LF.KEYS.applications = lf-applications)
 *   - Loading state + in-page confirmation panel (never claims a real send)
 *
 * NOT production security — submissions live only in this browser's
 * localStorage, which is not secure storage.
 * ========================================================================== */

(function () {
  'use strict';

  var LF = window.LaunchForge;
  if (!LF) return;

  var FORM_ID = 'startup-application-form';
  var PANEL_ID = 'application-confirmation';

  /* Character limits that need an explicit message (mirrors the markup). */
  var RULES = {
    description: { min: 40, max: 600 },
    problem: { min: 1, max: 500 },
    solution: { min: 1, max: 500 },
    targetAudience: { min: 1, max: 200 },
    currentProgress: { min: 1, max: 400 },
    whyLaunchForge: { min: 1, max: 500 },
  };

  var SUBMIT_FIELDS = [
    'founderName', 'email', 'phone', 'startupName', 'website', 'industry',
    'stage', 'teamSize', 'description', 'problem', 'solution',
    'targetAudience', 'currentProgress', 'fundingStatus', 'whyLaunchForge',
  ];

  /* --------------------------- character counters ------------------------ */

  function setupCounters(form) {
    form.querySelectorAll('[data-count-for]').forEach(function (hint) {
      var name = hint.getAttribute('data-count-for');
      var control = form.querySelector('[name="' + name + '"]');
      if (!control) return;
      var out = hint.querySelector('[data-count-value]') || hint;

      var max = parseInt(hint.getAttribute('data-count-max'), 10);
      if (isNaN(max)) max = parseInt(control.getAttribute('maxlength'), 10);
      var min = parseInt(hint.getAttribute('data-count-min'), 10);
      if (isNaN(min)) min = parseInt(control.getAttribute('minlength'), 10);

      var update = function () {
        var len = (control.value || '').length;
        if (max) {
          out.textContent = len + ' / ' + max;
          hint.classList.remove('text-warning', 'text-danger');
          if (len >= max) hint.classList.add('text-danger');
          else if (len >= Math.ceil(max * 0.9)) hint.classList.add('text-warning');
          else if (min && len > 0 && len < min) hint.classList.add('text-warning');
        } else {
          out.textContent = String(len);
        }
      };

      control.addEventListener('input', update);
      control.addEventListener('blur', update);
      update();
    });
  }

  /* After form.reset() the counters are resynced by replaying the input event
     (the listeners bound in setupCounters handle the repaint + warning state). */
  function resetCounters(form) {
    form.querySelectorAll('[data-count-for]').forEach(function (hint) {
      var control = form.querySelector('[name="' + hint.getAttribute('data-count-for') + '"]');
      if (control) control.dispatchEvent(new Event('input', { bubbles: true }));
    });
  }

  /* ------------------------------ validation ----------------------------- */

  function focusFirstInvalid(form) {
    var first = form.querySelector('.field-invalid');
    if (first && first.focus) first.focus({ preventScroll: false });
  }

  function validateExtra(form) {
    var valid = true;

    /* Website is optional, but a partial URL is a mistake worth flagging. */
    var website = form.querySelector('[name="website"]');
    if (website && website.value.trim()) {
      var url = website.value.trim();
      if (!/^https?:\/\/[^\s.]+\.[^\s]{2,}$/i.test(url)) {
        LF.form.showError(website, 'Please enter a full URL starting with https://');
        valid = false;
      } else {
        LF.form.clearError(website);
      }
    }

    /* Team size must be an integer between 1 and 999. */
    var teamSize = form.querySelector('[name="teamSize"]');
    if (teamSize && teamSize.value.trim()) {
      var n = Number(teamSize.value);
      if (!Number.isInteger(n) || n < 1 || n > 999) {
        LF.form.showError(teamSize, 'Team size must be a whole number between 1 and 999.');
        valid = false;
      } else {
        LF.form.clearError(teamSize);
      }
    }

    /* Character minimum / maximum rules. */
    Object.keys(RULES).forEach(function (name) {
      var control = form.querySelector('[name="' + name + '"]');
      if (!control || !control.value.trim()) return;
      var rule = RULES[name];
      var len = control.value.trim().length;
      if (rule.min && len < rule.min) {
        LF.form.showError(
          control,
          'Please write at least ' + rule.min + ' characters (currently ' + len + ').'
        );
        valid = false;
      } else if (rule.max && len > rule.max) {
        LF.form.showError(
          control,
          'Please keep this under ' + rule.max + ' characters (currently ' + len + ').'
        );
        valid = false;
      } else {
        LF.form.clearError(control);
      }
    });

    if (!valid) focusFirstInvalid(form);
    return valid;
  }

  /* ---------------------------- confirmation ----------------------------- */

  function summaryRow(label, value) {
    return (
      '<div class="rounded-xl border border-line bg-page px-4 py-3">' +
      '<dt class="text-[11px] font-bold uppercase tracking-wider text-muted">' + LF.escapeHtml(label) + '</dt>' +
      '<dd class="mt-1 break-words text-sm font-semibold text-ink">' + LF.escapeHtml(value) + '</dd>' +
      '</div>'
    );
  }

  function showConfirmation(record) {
    var form = document.getElementById(FORM_ID);
    var panel = document.getElementById(PANEL_ID);
    if (!form || !panel) return;

    document.getElementById('application-summary').innerHTML =
      summaryRow('Founder', record.founderName) +
      summaryRow('Email', record.email) +
      summaryRow('Phone', record.phone) +
      summaryRow('Startup', record.startupName) +
      summaryRow('Industry', record.industry) +
      summaryRow('Stage', record.stage) +
      summaryRow('Team size', String(record.teamSize)) +
      summaryRow('Funding status', record.fundingStatus) +
      summaryRow('Submitted', LF.formatDate(record.submittedAt)) +
      summaryRow('Status', record.status);

    document.getElementById('application-reference').textContent = record.id;

    form.classList.add('hidden');
    panel.classList.remove('hidden');
    panel.focus({ preventScroll: false });
    panel.scrollIntoView({ behavior: LF.prefersReducedMotion() ? 'auto' : 'smooth', block: 'center' });
  }

  function resetToForm() {
    var form = document.getElementById(FORM_ID);
    var panel = document.getElementById(PANEL_ID);
    if (!form || !panel) return;

    panel.classList.add('hidden');
    form.classList.remove('hidden');
    form.reset();
    form.querySelectorAll('input, select, textarea').forEach(function (el) {
      LF.form.clearError(el);
    });
    resetCounters(form);

    var first = form.querySelector('input, select, textarea');
    if (first) first.focus({ preventScroll: false });
    form.scrollIntoView({ behavior: LF.prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
  }

  /* ------------------------------- submit -------------------------------- */

  function collect(form) {
    var data = {};
    SUBMIT_FIELDS.forEach(function (name) {
      var el = form.querySelector('[name="' + name + '"]');
      data[name] = el ? String(el.value || '').trim() : '';
    });
    data.teamSize = Number(data.teamSize) || 0;
    return data;
  }

  function handleSubmit(form) {
    var button = document.getElementById('application-submit');
    var label = button ? button.querySelector('[data-submit-label]') : null;

    if (!LF.form.validate(form)) {
      LF.toast('Please fix the highlighted fields before submitting.', 'error');
      return;
    }
    if (!validateExtra(form)) {
      LF.toast('Some answers still need attention.', 'error');
      return;
    }

    var record = collect(form);
    record.id = LF.uid('app');
    record.submittedAt = new Date().toISOString();
    record.status = 'Pending';

    if (button) button.disabled = true;
    if (label) label.textContent = 'Submitting…';

    window.setTimeout(function () {
      var list = LF.store.get(LF.KEYS.applications, []);
      if (!Array.isArray(list)) list = [];
      list.push(record);
      LF.store.set(LF.KEYS.applications, list);

      if (button) button.disabled = false;
      if (label) label.textContent = 'Submit Application';

      showConfirmation(record);
      LF.toast('Application saved locally (demo) — reference ' + record.id, 'success');
    }, 800);
  }

  /* -------------------------------- boot --------------------------------- */

  LF.ready(function () {
    var form = document.getElementById(FORM_ID);
    if (!form) return;

    setupCounters(form);

    /* Keep counters/errors fresh while typing. */
    form.addEventListener('input', function (e) {
      if (e.target && e.target.name) LF.form.clearError(e.target);
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      handleSubmit(form);
    });

    var resetBtn = document.getElementById('application-reset');
    if (resetBtn) resetBtn.addEventListener('click', resetToForm);
  });
})();
