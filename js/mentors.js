/* ==========================================================================
 * LaunchForge Accelerator — Mentors page
 * --------------------------------------------------------------------------
 * Renders the fictional mentor directory into #mentor-directory, filters it
 * from the Expertise Categories section, keeps a local "requested sessions"
 * list, and drives ONE reusable accessible modal root for:
 *   - Mentor profile (View Profile)
 *   - Session booking (Book a Session) + confirmation state
 *
 * Every mentor below is invented demo content — no real people or companies.
 * ========================================================================== */

(function () {
  'use strict';

  var LF = window.LaunchForge || {};
  var SESSIONS_KEY = (LF.KEYS && LF.KEYS.sessions) || 'lf-sessions';

  /* ------------------------------ dataset ------------------------------- */

  var MENTORS = [
    {
      id: 'mentor-01',
      name: 'Amara Okafor',
      title: 'Former Product Lead, Enterprise SaaS',
      category: 'Product Strategy',
      tags: ['Product Discovery', 'Roadmapping', 'B2B SaaS'],
      blurb: 'Former product lead who helps founders find focus, validate faster and ship the things customers actually want.',
      bio: 'Amara has spent more than a decade shaping enterprise software products, taking multiple teams from fuzzy ideas to shipped, measurable outcomes. She is at her best in the messy early phase — turning a wall of feature requests into one clear problem worth solving. Founders describe her sessions as direct, practical and refreshingly free of jargon.',
      image: 'images/mentors/mentor-01.jpg',
    },
    {
      id: 'mentor-02',
      name: 'Daniel Reyes',
      title: 'Growth Marketing Advisor',
      category: 'Marketing & Growth',
      tags: ['Growth Loops', 'Positioning', 'Paid Acquisition'],
      blurb: 'Growth specialist who has taken early products from zero to repeatable, measurable traction.',
      bio: 'Daniel has led growth for early-stage products across marketplaces and subscription apps, building acquisition systems that survive past the first channel. He focuses on positioning first: get the message right and every channel works harder. His demo sessions typically cover channel audits, activation funnels and a 90-day experiment plan.',
      image: 'images/mentors/mentor-02.jpg',
    },
    {
      id: 'mentor-03',
      name: 'Priya Natarajan',
      title: 'Startup Finance & Fundraising Advisor',
      category: 'Finance & Fundraising',
      tags: ['Runway Planning', 'Pitch Decks', 'Investor Readiness'],
      blurb: 'Advisor on runway models, pitch decks and staying calm in investor conversations.',
      bio: 'Priya has coached dozens of founding teams through the numbers that decide their next raise — runway, burn multiple, cohort economics and the story that ties them together. She rebuilds broken financial models in a single session and rehearses pitch Q&A until founders stop guessing. All companies referenced in her background are illustrative demo details.',
      image: 'images/mentors/mentor-03.jpg',
    },
    {
      id: 'mentor-04',
      name: 'Marcus Chen',
      title: 'Engineering Leader & CTO Advisor',
      category: 'Technology',
      tags: ['Architecture', 'Technical Hiring', 'Delivery'],
      blurb: 'Engineering leader guiding architecture decisions, hiring plans and shipping cadence.',
      bio: 'Marcus has built and scaled engineering organisations from a handful of engineers to multi-team delivery organisations. He helps non-technical founders understand their own stack, and helps technical founders escape the founder-as-single-point-of-failure trap. Expect honest trade-off conversations about build-versus-buy, quality and speed.',
      image: 'images/mentors/mentor-04.jpg',
    },
    {
      id: 'mentor-05',
      name: 'Sofia Almeida',
      title: 'Partnerships & Business Development Lead',
      category: 'Business Development',
      tags: ['Partnerships', 'Pilot Deals', 'Distribution'],
      blurb: 'Partnerships lead who turns warm intros into signed pilots and distribution channels.',
      bio: 'Sofia has negotiated pilot programmes and channel partnerships for B2B products in regulated industries. She teaches founders to qualify opportunities fast, design pilots that convert and keep leverage at the table. Her sessions are built around live deal reviews — bring the email thread and the deck.',
      image: 'images/mentors/mentor-05.jpg',
    },
    {
      id: 'mentor-06',
      name: 'Kwame Boateng',
      title: 'Executive Coach & Founder Advisor',
      category: 'Leadership',
      tags: ['Founder Coaching', 'Team Culture', 'Hiring'],
      blurb: 'Executive coach helping founders grow from doers into leaders of teams.',
      bio: 'Kwame works with founding teams on the human side of building: hard feedback conversations, first leadership hires and the personal stamina a long company takes. He combines structured coaching frameworks with operator experience, so sessions end with concrete behaviour changes rather than vague inspiration.',
      image: 'images/mentors/mentor-06.jpg',
    },
    {
      id: 'mentor-07',
      name: 'Aisha Rahman',
      title: 'Brand & Lifecycle Marketing Lead',
      category: 'Marketing & Growth',
      tags: ['Brand Strategy', 'Lifecycle Email', 'Content'],
      blurb: 'Brand and lifecycle marketer who makes small teams look unmistakably credible.',
      bio: 'Aisha has shaped brand systems and lifecycle programmes for consumer and prosumer products, from first landing page to retention journeys. She helps founders sound like themselves instead of a template, and shows teams how to keep a consistent story across every touchpoint without a big agency budget.',
      image: 'images/mentors/mentor-07.jpg',
    },
    {
      id: 'mentor-08',
      name: 'Lin Wei',
      title: 'Data & Platform Engineering Advisor',
      category: 'Technology',
      tags: ['Data Platforms', 'ML Systems', 'Reliability'],
      blurb: 'Platform advisor who makes data pipelines and reliability boring — in the best way.',
      bio: 'Lin Wei has led platform and data engineering teams, setting up the pipelines, monitoring and ML infrastructure that let startups scale without weekend incidents. She is the mentor founders call when the demo works but production keeps waking them up at night. All prior work described here is fictional demo detail.',
      image: 'images/mentors/mentor-08.jpg',
    },
  ];

  var TIME_SLOTS = ['09:00', '09:30', '10:00', '10:30', '11:00', '13:00', '13:30', '14:00', '15:00', '16:00'];

  var LINKEDIN_NOTE = 'LinkedIn profiles will be added when mentors publish their links.';

  var state = { category: 'All' };

  /* ------------------------------ utilities ----------------------------- */

  function esc(value) {
    return LF.escapeHtml ? LF.escapeHtml(value) : String(value == null ? '' : value);
  }

  function svg(inner, size, extraClass) {
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" width="' + (size || 15) + '" height="' + (size || 15) +
      '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" ' +
      'stroke-linejoin="round" class="' + (extraClass || 'lf-flip') + '" aria-hidden="true">' + inner + '</svg>'
    );
  }

  var ICON_ARROW = '<path d="M5 12h14M12 5l7 7-7 7"/>';
  var ICON_CLOSE = '<path d="M18 6 6 18M6 6l12 12"/>';
  var ICON_CHECK = '<path d="M20 6 9 17l-5-5"/>';
  var ICON_CLOCK = '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>';
  var ICON_USER =
    '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>';
  var ICON_CALENDAR = '<path d="M8 2v4M16 2v4"/><rect width="16" height="18" x="4" y="4" rx="2"/><path d="M8 12h8M8 16h5"/>';
  var ICON_LINKEDIN =
    '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/>';

  function mentorById(id) {
    for (var i = 0; i < MENTORS.length; i++) {
      if (MENTORS[i].id === id) return MENTORS[i];
    }
    return null;
  }

  function todayIso() {
    var d = new Date();
    var month = String(d.getMonth() + 1);
    var day = String(d.getDate());
    return d.getFullYear() + '-' + (month.length < 2 ? '0' + month : month) + '-' + (day.length < 2 ? '0' + day : day);
  }

  function timeLabel(value) {
    var parts = String(value || '').split(':');
    var hour = parseInt(parts[0], 10);
    var minute = parts[1] || '00';
    if (isNaN(hour)) return String(value || '');
    var suffix = hour >= 12 ? 'PM' : 'AM';
    var h12 = hour % 12;
    if (h12 === 0) h12 = 12;
    return h12 + ':' + minute + ' ' + suffix;
  }

  /* --------------------------- directory rendering ---------------------- */

  function mentorCardHtml(mentor, index) {
    var tags = mentor.tags
      .map(function (tag) {
        return '<li class="badge bg-softindigo text-primary">' + esc(tag) + '</li>';
      })
      .join('');

    return (
      '<article class="card card-hover group flex flex-col overflow-hidden animate-fade-up" style="animation-delay:' +
      (index * 0.05).toFixed(2) + 's">' +
      '<div class="relative overflow-hidden">' +
      '<img src="' + esc(mentor.image) + '" alt="Portrait of ' + esc(mentor.name) + ', ' + esc(mentor.category) +
      ' mentor (fictional demo)" width="800" height="1000" loading="lazy" ' +
      'class="aspect-[4/5] w-full object-cover transition duration-500 group-hover:scale-105" />' +
      '<span class="badge absolute top-3 end-3 bg-primary text-white">' + esc(mentor.category) + '</span>' +
      '</div>' +
      '<div class="flex flex-1 flex-col p-5">' +
      '<h3 class="font-display text-base font-bold text-ink">' + esc(mentor.name) + '</h3>' +
      '<p class="mt-1 text-xs font-bold uppercase tracking-wider text-secondary">' + esc(mentor.title) + '</p>' +
      '<ul class="mt-3 flex flex-wrap gap-2">' + tags + '</ul>' +
      '<p class="mt-3 flex-1 text-sm leading-relaxed text-muted">' + esc(mentor.blurb) + '</p>' +
      '<div class="mt-4 flex flex-wrap items-center gap-2">' +
      '<button type="button" class="btn btn-primary btn-sm" data-view-profile="' + esc(mentor.id) + '">View Profile</button>' +
      '<button type="button" class="btn btn-outline btn-sm" data-book-session="' + esc(mentor.id) + '">Book a Session</button>' +
      '<button type="button" class="social-btn ms-auto" data-demo-note="' + esc(LINKEDIN_NOTE) + '" aria-label="LinkedIn profile for ' +
      esc(mentor.name) + ' (demo)">' + svg(ICON_LINKEDIN, 18, '') + '</button>' +
      '</div></div></article>'
    );
  }

  function emptyDirectoryHtml() {
    return (
      '<div class="rounded-2xl border border-dashed border-line bg-surface p-10 text-center sm:col-span-2 lg:col-span-3 xl:col-span-4">' +
      '<span class="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-softindigo text-primary">' +
      svg(ICON_USER, 24, '') + '</span>' +
      '<h3 class="mt-4 font-display text-lg font-bold text-ink">No mentors in this category yet</h3>' +
      '<p class="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted">Try another expertise area — or show the full fictional directory again.</p>' +
      '<button type="button" class="btn btn-primary mt-6" data-mentor-filter="All">Show all mentors</button>' +
      '</div>'
    );
  }

  function renderDirectory() {
    var mount = document.getElementById('mentor-directory');
    if (!mount) return;

    var list =
      state.category === 'All'
        ? MENTORS.slice()
        : MENTORS.filter(function (m) {
            return m.category === state.category;
          });

    mount.innerHTML = list.length
      ? list.map(mentorCardHtml).join('')
      : emptyDirectoryHtml();

    var count = document.getElementById('mentor-count');
    if (count) {
      count.textContent = 'Showing ' + list.length + ' of ' + MENTORS.length + ' mentors';
    }
  }

  function syncFilterControls() {
    document.querySelectorAll('[data-mentor-filter]').forEach(function (el) {
      var active = (el.getAttribute('data-mentor-filter') || 'All') === state.category;

      if (el.classList.contains('chip')) {
        el.classList.toggle('chip-active', active);
      } else {
        el.classList.toggle('border-primary', active);
        el.classList.toggle('bg-softindigo', active);
        el.classList.toggle('ring-2', active);
        el.classList.toggle('ring-primary/30', active);
        var icon = el.querySelector('[data-category-icon]');
        if (icon) {
          icon.classList.toggle('bg-primary', active);
          icon.classList.toggle('text-white', active);
          icon.classList.toggle('bg-softindigo', !active);
          icon.classList.toggle('text-primary', !active);
        }
      }
      el.setAttribute('aria-pressed', String(active));
    });
  }

  function setCategory(category) {
    state.category = category || 'All';
    syncFilterControls();
    renderDirectory();

    var section = document.getElementById('section-mentors-directory');
    if (section && section.scrollIntoView) {
      var reduce = LF.prefersReducedMotion && LF.prefersReducedMotion();
      section.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    }
  }

  /* --------------------------- requested sessions ----------------------- */

  function getSessions() {
    var list = LF.store ? LF.store.get(SESSIONS_KEY, []) : [];
    return Array.isArray(list) ? list : [];
  }

  function saveSessions(list) {
    if (LF.store) LF.store.set(SESSIONS_KEY, list);
  }

  function sessionItemHtml(session) {
    var dateLabel = LF.formatDate ? LF.formatDate(session.date) : session.date;
    var timeLabelled = timeLabel(session.time);
    return (
      '<li class="rounded-xl border border-line bg-page p-4">' +
      '<div class="flex items-start justify-between gap-3">' +
      '<div class="min-w-0">' +
      '<p class="truncate text-sm font-semibold text-ink">' + esc(session.mentor) + '</p>' +
      '<p class="mt-1 flex items-center gap-1.5 text-xs text-muted">' + svg(ICON_CLOCK, 13, '') +
      esc(dateLabel) + ' · ' + esc(timeLabelled) + '</p>' +
      '</div>' +
      '<span class="badge shrink-0 bg-softorange text-secondary">' + esc(session.status) + '</span>' +
      '</div>' +
      '<p class="mt-2 line-clamp-2 text-xs leading-relaxed text-muted">' + esc(session.goals) + '</p>' +
      '<div class="mt-3 flex justify-end">' +
      '<button type="button" class="btn btn-ghost btn-sm text-danger" data-cancel-session="' + esc(session.id) + '">Cancel</button>' +
      '</div></li>'
    );
  }

  function renderSessions() {
    var mount = document.getElementById('sessions-list');
    if (!mount) return;

    var list = getSessions();

    var countEl = document.getElementById('sessions-count');
    if (countEl) countEl.textContent = String(list.length);

    if (!list.length) {
      mount.innerHTML =
        '<div class="rounded-xl border border-dashed border-line bg-page p-6 text-center">' +
        '<span class="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-softindigo text-primary">' +
        svg(ICON_CALENDAR, 20, '') + '</span>' +
        '<p class="mt-3 text-sm font-semibold text-ink">No session requests yet</p>' +
        '<p class="mt-1 text-xs leading-relaxed text-muted">Book a mentor above and your demo requests will show up here.</p>' +
        '</div>';
      return;
    }

    mount.innerHTML = '<ul class="flex flex-col gap-3">' + list.map(sessionItemHtml).join('') + '</ul>';
  }

  function cancelSession(id) {
    var list = getSessions();
    var target = null;
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) target = list[i];
    }
    if (!target) return;

    var ask = LF.confirm
      ? LF.confirm({
          title: 'Cancel this session request?',
          message:
            'This removes the demo request for ' + target.mentor + ' on ' +
            (LF.formatDate ? LF.formatDate(target.date) : target.date) +
            ' from this browser. It cannot be undone.',
          confirmLabel: 'Cancel request',
        })
      : Promise.resolve(true);

    Promise.resolve(ask).then(function (ok) {
      if (!ok) return;
      var next = getSessions().filter(function (s) {
        return s.id !== id;
      });
      saveSessions(next);
      renderSessions();
      if (LF.toast) LF.toast('Session request cancelled (demo).', 'info');
    });
  }

  /* ------------------------------ modal root ---------------------------- */
  /* ONE dynamically created backdrop reused for every dialog. Listeners on
     children die with innerHTML replacement; the document-level key handler
     is added on open and removed on close.                                */

  var modalRoot = null;
  var lastFocused = null;

  function ensureRoot() {
    if (modalRoot) return modalRoot;
    modalRoot = document.createElement('div');
    modalRoot.className = 'lf-modal-backdrop';
    modalRoot.setAttribute('data-mentor-modal-root', '');
    modalRoot.addEventListener('click', function (e) {
      if (e.target === modalRoot) closeModal();
    });
    return modalRoot;
  }

  function modalFocusables() {
    if (!modalRoot) return [];
    var nodes = Array.prototype.slice.call(
      modalRoot.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    );
    return nodes.filter(function (el) {
      return el.offsetParent !== null || el === document.activeElement;
    });
  }

  function onModalKey(e) {
    if (!modalRoot || !modalRoot.isConnected) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      closeModal();
      return;
    }
    if (e.key !== 'Tab') return;
    var items = modalFocusables();
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

  function openDialog(html, bind) {
    var root = ensureRoot();
    var fresh = !root.isConnected;

    root.innerHTML = html;

    if (fresh) {
      document.body.appendChild(root);
      lastFocused = document.activeElement;
      document.body.classList.add('no-scroll');
      document.addEventListener('keydown', onModalKey, true);
    }

    if (typeof bind === 'function') bind(root);

    var initial = root.querySelector('[data-modal-initial-focus]') || modalFocusables()[0];
    if (initial && initial.focus) initial.focus();
  }

  function closeModal() {
    if (!modalRoot) return;
    document.removeEventListener('keydown', onModalKey, true);
    modalRoot.innerHTML = '';
    if (modalRoot.isConnected) modalRoot.remove();
    document.body.classList.remove('no-scroll');
    var restore = lastFocused;
    lastFocused = null;
    if (restore && restore.isConnected && restore.focus) restore.focus();
  }

  function bindCloseButtons(root) {
    root.querySelectorAll('[data-modal-close]').forEach(function (btn) {
      btn.addEventListener('click', closeModal);
    });
  }

  /* ---------------------------- profile dialog -------------------------- */

  function profileDialogHtml(mentor) {
    var tags = mentor.tags
      .map(function (tag) {
        return '<li class="badge bg-softindigo text-primary">' + esc(tag) + '</li>';
      })
      .join('');

    return (
      '<div class="lf-modal max-h-[86vh] overflow-y-auto" style="width:min(34rem,100%)" role="dialog" aria-modal="true" ' +
      'aria-labelledby="lf-mentor-modal-title" aria-describedby="lf-mentor-modal-desc">' +
      '<div class="flex items-start justify-between gap-4">' +
      '<div class="flex items-center gap-4">' +
      '<img src="' + esc(mentor.image) + '" alt="Portrait of ' + esc(mentor.name) + '" width="800" height="1000" ' +
      'class="h-20 w-20 shrink-0 rounded-2xl border border-line object-cover" />' +
      '<div>' +
      '<span class="eyebrow">' + esc(mentor.category) + '</span>' +
      '<h2 id="lf-mentor-modal-title" class="mt-2 font-display text-xl font-bold text-ink" tabindex="-1" data-modal-initial-focus>' +
      esc(mentor.name) + '</h2>' +
      '<p class="text-sm font-semibold text-secondary">' + esc(mentor.title) + '</p>' +
      '</div></div>' +
      '<button type="button" class="icon-btn shrink-0" data-modal-close aria-label="Close dialog">' + svg(ICON_CLOSE, 18, '') + '</button>' +
      '</div>' +
      '<div class="mt-5 border-t border-line pt-5">' +
      '<p id="lf-mentor-modal-desc" class="text-sm leading-relaxed text-muted">' + esc(mentor.bio) + '</p>' +
      '<p class="mt-4 text-[11px] font-bold uppercase tracking-wider text-muted">Expertise</p>' +
      '<ul class="mt-2 flex flex-wrap gap-2">' + tags + '</ul>' +
      '<p class="mt-4 rounded-xl bg-page p-3 text-xs leading-relaxed text-muted">' +
      'Fictional demo profile — written for this prototype. Bookings are stored in your browser only.</p>' +
      '</div>' +
      '<div class="mt-6 flex flex-wrap justify-end gap-3">' +
      '<button type="button" class="btn btn-outline" data-modal-close>Close</button>' +
      '<button type="button" class="btn btn-primary" data-book-session="' + esc(mentor.id) + '">' +
      'Book a Session ' + svg(ICON_ARROW, 15) + '</button>' +
      '</div></div>'
    );
  }

  function openProfile(mentor) {
    if (!mentor) return;
    openDialog(profileDialogHtml(mentor), bindCloseButtons);
  }

  /* ---------------------------- booking dialog -------------------------- */

  function bookingDialogHtml(mentor) {
    var slots = TIME_SLOTS.map(function (slot) {
      return '<option value="' + slot + '">' + timeLabel(slot) + '</option>';
    }).join('');

    return (
      '<div class="lf-modal max-h-[86vh] overflow-y-auto" style="width:min(34rem,100%)" role="dialog" aria-modal="true" ' +
      'aria-labelledby="lf-mentor-modal-title" aria-describedby="lf-mentor-modal-desc">' +
      '<div class="flex items-start justify-between gap-4">' +
      '<div>' +
      '<span class="eyebrow">Book a session</span>' +
      '<h2 id="lf-mentor-modal-title" class="mt-3 font-display text-xl font-bold text-ink" tabindex="-1" data-modal-initial-focus>Request a session</h2>' +
      '<p id="lf-mentor-modal-desc" class="mt-1 text-sm leading-relaxed text-muted">Demo booking — nothing is sent to a server.</p>' +
      '</div>' +
      '<button type="button" class="icon-btn shrink-0" data-modal-close aria-label="Close dialog">' + svg(ICON_CLOSE, 18, '') + '</button>' +
      '</div>' +
      '<form class="mt-5" data-booking-form novalidate>' +
      '<div class="field">' +
      '<label class="label" for="booking-mentor">Mentor</label>' +
      '<input class="input" type="text" id="booking-mentor" name="booking-mentor" value="' + esc(mentor.name) + '" readonly required />' +
      '<p class="field-hint">Prefilled from the mentor you selected.</p>' +
      '<p class="field-error hidden" data-error-for="booking-mentor" role="alert"></p>' +
      '</div>' +
      '<div class="field">' +
      '<label class="label" for="booking-date">Preferred date</label>' +
      '<input class="input" type="date" id="booking-date" name="booking-date" min="' + todayIso() + '" required />' +
      '<p class="field-error hidden" data-error-for="booking-date" role="alert"></p>' +
      '</div>' +
      '<div class="field">' +
      '<label class="label" for="booking-time">Preferred time</label>' +
      '<select class="input" id="booking-time" name="booking-time" required>' +
      '<option value="">Select a time slot</option>' + slots +
      '</select>' +
      '<p class="field-hint">Sample slots in your local time — illustrative demo scheduling.</p>' +
      '<p class="field-error hidden" data-error-for="booking-time" role="alert"></p>' +
      '</div>' +
      '<div class="field">' +
      '<label class="label" for="booking-goals">Session goals</label>' +
      '<textarea class="input" id="booking-goals" name="booking-goals" maxlength="300" rows="4" required ' +
      'placeholder="What do you want to get out of this session?" data-error-message="Please share at least one goal for the session."></textarea>' +
      '<p class="field-hint"><span data-goals-count>0</span>/300 characters</p>' +
      '<p class="field-error hidden" data-error-for="booking-goals" role="alert"></p>' +
      '</div>' +
      '<div class="mt-6 flex flex-wrap justify-end gap-3">' +
      '<button type="button" class="btn btn-outline" data-modal-close>Cancel</button>' +
      '<button type="submit" class="btn btn-primary" data-booking-submit>' +
      'Send request ' + svg(ICON_ARROW, 15) + '</button>' +
      '</div></form></div>'
    );
  }

  function confirmationDialogHtml(record) {
    return (
      '<div class="lf-modal max-h-[86vh] overflow-y-auto text-center" style="width:min(30rem,100%)" role="dialog" aria-modal="true" ' +
      'aria-labelledby="lf-mentor-modal-title" aria-describedby="lf-mentor-modal-desc">' +
      '<span class="mx-auto grid h-14 w-14 place-items-center rounded-full bg-success/15 text-success">' +
      svg(ICON_CHECK, 26, '') + '</span>' +
      '<h2 id="lf-mentor-modal-title" class="mt-4 font-display text-xl font-bold text-ink" tabindex="-1" data-modal-initial-focus>' +
      'Session request saved</h2>' +
      '<p id="lf-mentor-modal-desc" class="mt-2 text-sm leading-relaxed text-muted">' +
      'Demo mode: your request was stored in this browser only — nothing was sent to a server.</p>' +
      '<dl class="mt-5 rounded-xl border border-line bg-page p-4 text-start text-sm">' +
      '<div class="flex items-center justify-between gap-3 py-1.5"><dt class="text-muted">Mentor</dt><dd class="font-semibold text-ink">' +
      esc(record.mentor) + '</dd></div>' +
      '<div class="flex items-center justify-between gap-3 py-1.5"><dt class="text-muted">Date</dt><dd class="font-semibold text-ink">' +
      esc(LF.formatDate ? LF.formatDate(record.date) : record.date) + '</dd></div>' +
      '<div class="flex items-center justify-between gap-3 py-1.5"><dt class="text-muted">Time</dt><dd class="font-semibold text-ink">' +
      esc(timeLabel(record.time)) + '</dd></div>' +
      '<div class="flex items-center justify-between gap-3 py-1.5"><dt class="text-muted">Status</dt>' +
      '<dd><span class="badge bg-softorange text-secondary">' + esc(record.status) + '</span></dd></div>' +
      '</dl>' +
      '<div class="mt-6 flex flex-wrap justify-center gap-3">' +
      '<button type="button" class="btn btn-outline" data-modal-close>Close</button>' +
      '<button type="button" class="btn btn-primary" data-view-sessions>View my sessions</button>' +
      '</div></div>'
    );
  }

  function bindBooking(root, mentor) {
    bindCloseButtons(root);

    var form = root.querySelector('[data-booking-form]');
    if (!form) return;

    var goals = form.querySelector('[name="booking-goals"]');
    var counter = root.querySelector('[data-goals-count]');
    if (goals && counter) {
      var updateCounter = function () {
        counter.textContent = String(goals.value.length);
      };
      goals.addEventListener('input', updateCounter);
      updateCounter();
    }

    if (goals) {
      goals.addEventListener('input', function () {
        if (LF.form && LF.form.clearError) LF.form.clearError(goals);
      });
    }
    ['booking-date', 'booking-time'].forEach(function (name) {
      var control = form.querySelector('[name="' + name + '"]');
      if (control && LF.form && LF.form.clearError) {
        control.addEventListener('input', function () {
          LF.form.clearError(control);
        });
        control.addEventListener('change', function () {
          LF.form.clearError(control);
        });
      }
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      submitBooking(form, mentor, root);
    });
  }

  function submitBooking(form, mentor, root) {
    var valid = LF.form && LF.form.validate ? LF.form.validate(form) : true;

    var dateInput = form.querySelector('[name="booking-date"]');
    if (dateInput && dateInput.value && dateInput.value < todayIso()) {
      if (LF.form && LF.form.showError) {
        LF.form.showError(dateInput, 'Please choose a date from today onwards.');
      }
      valid = false;
    }

    if (!valid) return;

    var record = {
      id: LF.uid ? LF.uid('session') : 'session-' + Date.now(),
      mentor: mentor.name,
      date: dateInput.value,
      time: form.querySelector('[name="booking-time"]').value,
      goals: form.querySelector('[name="booking-goals"]').value.trim(),
      status: 'Requested',
      createdAt: new Date().toISOString(),
    };

    var sessions = getSessions();
    sessions.unshift(record);
    saveSessions(sessions);
    renderSessions();

    if (LF.toast) LF.toast('Session request saved (demo).', 'success');

    openDialog(confirmationDialogHtml(record), function (dialogRoot) {
      bindCloseButtons(dialogRoot);
      var viewBtn = dialogRoot.querySelector('[data-view-sessions]');
      if (viewBtn) {
        viewBtn.addEventListener('click', function () {
          closeModal();
          var card = document.getElementById('sessions-card');
          if (card && card.scrollIntoView) {
            var reduce = LF.prefersReducedMotion && LF.prefersReducedMotion();
            card.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
          }
        });
      }
    });
  }

  function openBooking(mentor) {
    if (!mentor) return;
    openDialog(bookingDialogHtml(mentor), function (root) {
      bindBooking(root, mentor);
    });
  }

  /* -------------------------------- boot -------------------------------- */

  function init() {
    var mount = document.getElementById('mentor-directory');
    if (!mount || mount.dataset.mentorsReady === '1') return;
    mount.dataset.mentorsReady = '1';

    syncFilterControls();
    renderDirectory();
    renderSessions();

    /* Global delegation: category chips, profile / booking buttons */
    document.addEventListener('click', function (e) {
      var target = e.target;
      if (!target || !target.closest) return;

      var filterEl = target.closest('[data-mentor-filter]');
      if (filterEl) {
        setCategory(filterEl.getAttribute('data-mentor-filter') || 'All');
        return;
      }

      var profileBtn = target.closest('[data-view-profile]');
      if (profileBtn) {
        openProfile(mentorById(profileBtn.getAttribute('data-view-profile')));
        return;
      }

      var bookBtn = target.closest('[data-book-session]');
      if (bookBtn) {
        openBooking(mentorById(bookBtn.getAttribute('data-book-session')));
        return;
      }
    });

    /* Cancel actions inside the requested-sessions list */
    var sessionsList = document.getElementById('sessions-list');
    if (sessionsList) {
      sessionsList.addEventListener('click', function (e) {
        var cancelBtn = e.target.closest && e.target.closest('[data-cancel-session]');
        if (!cancelBtn) return;
        cancelSession(cancelBtn.getAttribute('data-cancel-session'));
      });
    }
  }

  if (LF.ready) LF.ready(init);
  else if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
