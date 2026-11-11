/* ==========================================================================
 * LaunchForge Accelerator — Contact form
 * Stores fictional demo messages locally; no data leaves the browser.
 * ========================================================================== */

(function () {
  'use strict';

  var LF = window.LaunchForge;
  if (!LF) return;

  var MESSAGES_KEY = 'lf-contact-messages';
  var FORM_ID = 'contact-form';

  function fieldValue(form, name) {
    var field = form.elements[name];
    return field ? String(field.value || '').trim() : '';
  }

  function recordContact(message) {
    var messages = LF.store.get(MESSAGES_KEY, []);
    if (!Array.isArray(messages)) messages = [];
    messages.unshift(Object.assign({ id: LF.uid('msg') }, message));
    LF.store.set(MESSAGES_KEY, messages);
  }

  function clearForm(form) {
    form.reset();
    form.querySelectorAll('.field-invalid').forEach(function (field) {
      field.classList.remove('field-invalid');
      field.removeAttribute('aria-invalid');
    });
    form.querySelectorAll('[data-error-for]').forEach(function (error) {
      error.textContent = '';
      error.classList.add('hidden');
    });
  }

  function init() {
    var form = document.getElementById(FORM_ID);
    if (!form) return;

    var message = form.elements.message;
    var counter = form.querySelector('[data-message-count]');
    if (message && counter) {
      var updateCounter = function () {
        counter.textContent = String(message.value.length);
      };
      message.addEventListener('input', updateCounter);
      updateCounter();
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();

      if (!LF.form.validate(form)) {
        LF.toast('Please fix the highlighted fields before sending.', 'error');
        return;
      }

      var email = fieldValue(form, 'email');
      var phone = fieldValue(form, 'phone');

      if (phone && !LF.form.isPhone(phone)) {
        LF.form.showError(form.elements.phone, 'Please enter a valid phone number (7–15 digits).');
        LF.toast('Please fix the highlighted fields before sending.', 'error');
        return;
      }

      recordContact({
        name: fieldValue(form, 'name'),
        email: email,
        phone: phone,
        subject: fieldValue(form, 'subject'),
        message: fieldValue(form, 'message'),
        submittedAt: new Date().toISOString(),
      });

      clearForm(form);

      var status = document.getElementById('contact-form-status');
      if (status) {
        status.textContent = 'Demo message saved locally. We will be in touch soon.';
        status.classList.remove('hidden');
      }

      LF.toast('Message saved locally — thanks! (Demo only, nothing was sent.)', 'success');
    });

    form.querySelectorAll('input, select, textarea').forEach(function (input) {
      input.addEventListener('input', function () {
        LF.form.clearError(input);
      });
    });
  }

  if (window.LaunchForge) window.LaunchForge.ready(init);
  else document.addEventListener('DOMContentLoaded', init);
})();
