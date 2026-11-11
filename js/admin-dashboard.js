/* ==========================================================================
 * LaunchForge Accelerator — Admin Dashboard
 * --------------------------------------------------------------------------
 * Single IIFE. Renders every admin route into <main id="dash-content"> using
 * hash routing (#/overview, #/applications, …). Demo data persists through
 * the shared LaunchForge localStorage helpers.
 *
 *   - every dynamic string passes through LaunchForge.escapeHtml()
 *   - destructive actions go through LaunchForge.confirm()
 *   - every success / failure surfaces as a LaunchForge.toast()
 *   - no frameworks, no chart libraries (charts are hand-rolled SVG)
 *   - all content is clearly-labelled fictional demo data
 *   - NOTE: this is a frontend demonstration. Nothing here securely manages
 *     real applications or confidential pitch decks.
 * ========================================================================== */

(function () {
  'use strict';

  var LF = window.LaunchForge;
  if (!LF) return;

  var K = LF.KEYS;
  var esc = LF.escapeHtml;
  var BASE = LF.base || '';

  var ADMIN_NOTIFICATIONS_KEY = 'lf-admin-notifications';
  var ADMIN_DECKS_KEY = 'lf-admin-decks';
  var FOUNDERS_KEY = 'lf-founders';
  var SIDEBAR_KEY = 'lf-admin-sidebar';

  /* =============================== ICONS ================================= */

  function svg(inner, size) {
    var s = size || 18;
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" width="' + s + '" height="' + s +
      '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
      inner + '</svg>'
    );
  }

  var I = {
    plus: '<path d="M12 5v14M5 12h14"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    checkCircle: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
    xCircle: '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/>',
    pencil: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
    trash: '<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M10 11v6M14 11v6"/>',
    calendar: '<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><path d="M4 22v-7"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    file: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v5h6"/>',
    fileText: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8M16 17H8M10 9H8"/>',
    presentation: '<path d="M2 3h20"/><path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3"/><path d="m7 21 5-5 5 5"/>',
    rocket: '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    userCheck: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/><path d="m16 11 2 2 4-4"/>',
    mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
    phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z"/>',
    globe: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
    alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4M12 17h.01"/>',
    trending: '<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="m7 15 4-4 4 3 5-6"/>',
    target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    layers: '<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>',
    megaphone: '<path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>',
    shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
    settings: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
    refresh: '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    briefcase: '<rect width="20" height="14" x="2" y="7" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
    chevLeft: '<path d="m15 18-6-6 6-6"/>',
    chevRight: '<path d="m9 18 6-6-6-6"/>',
    external: '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
    eye: '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
    sparkles: '<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/>',
  };

  /* ============================== IDENTITY =============================== */

  var FALLBACK_USER = { name: 'Demo Admin', email: 'admin@launchforge.demo', role: 'admin' };

  function authUser() {
    try {
      if (window.LFAuth && typeof window.LFAuth.getSession === 'function') {
        var s = window.LFAuth.getSession();
        if (s && s.name) return s;
      }
    } catch (e) { /* fall through to demo admin */ }
    return FALLBACK_USER;
  }

  function adminUser() {
    var u = authUser();
    var s = LF.store.get(K.adminSettings, null);
    return {
      name: (s && s.adminName) || u.name || FALLBACK_USER.name,
      email: (s && s.adminEmail) || u.email || FALLBACK_USER.email,
      role: u.role || 'admin'
    };
  }

  function initials(name) {
    var parts = String(name || '').trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return 'A';
    var last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (parts[0][0] + last).toUpperCase();
  }

  /* ================================ DATES ================================ */

  function today() {
    var d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function addDays(n) {
    var d = today();
    d.setDate(d.getDate() + n);
    return d;
  }

  function toIso(d) {
    var m = ('0' + (d.getMonth() + 1)).slice(-2);
    var day = ('0' + d.getDate()).slice(-2);
    return d.getFullYear() + '-' + m + '-' + day;
  }

  function fromIso(value) {
    var p = String(value || '').slice(0, 10).split('-');
    return new Date(Number(p[0]) || 1970, (Number(p[1]) || 1) - 1, Number(p[2]) || 1);
  }

  function daysUntil(value) {
    return Math.round((fromIso(value).getTime() - today().getTime()) / 86400000);
  }

  function dateLabel(value) {
    if (!value) return '—';
    return LF.formatDate(value);
  }

  function fileSize(bytes) {
    var n = Number(bytes) || 0;
    if (n < 1024) return n + ' B';
    if (n < 1024 * 1024) return Math.round(n / 1024) + ' KB';
    return (n / (1024 * 1024)).toFixed(1).replace(/\.0$/, '') + ' MB';
  }

  /* ============================== UI ATOMS =============================== */

  var APP_STATUS_TONE = {
    'Pending': 'bg-warning/15 text-warning',
    'Under Review': 'bg-primary/15 text-primary',
    'Approved': 'bg-success/15 text-success',
    'Rejected': 'bg-danger/15 text-danger'
  };

  var SESSION_TONE = {
    'Requested': 'bg-warning/15 text-warning',
    'Confirmed': 'bg-primary/15 text-primary',
    'Completed': 'bg-success/15 text-success',
    'Cancelled': 'bg-muted/15 text-muted'
  };

  var FOUNDER_TONE = {
    'Active': 'bg-success/15 text-success',
    'Onboarding': 'bg-primary/15 text-primary',
    'Applicant': 'bg-warning/15 text-warning',
    'Completed': 'bg-muted/15 text-muted',
    'Withdrawn': 'bg-danger/15 text-danger'
  };

  var MILESTONE_TONE = {
    'Completed': 'bg-success/15 text-success',
    'In Progress': 'bg-primary/15 text-primary',
    'Overdue': 'bg-danger/15 text-danger',
    'Not Started': 'bg-muted/15 text-muted'
  };

  var AVAILABILITY_TONE = {
    'Available': 'bg-success/15 text-success',
    'Booked': 'bg-warning/15 text-warning',
    'Unavailable': 'bg-muted/15 text-muted'
  };

  function badge(label, toneClass) {
    return '<span class="badge ' + (toneClass || 'bg-muted/15 text-muted') + '">' + esc(label) + '</span>';
  }

  function progressBar(pct) {
    var p = Math.max(0, Math.min(100, Number(pct) || 0));
    return '<div class="lf-progress" role="progressbar" aria-valuenow="' + p + '" aria-valuemin="0" aria-valuemax="100">' +
      '<span style="width:' + p + '%"></span></div>';
  }

  function pageHead(title, lead, actions) {
    return '<header class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">' +
      '<div class="max-w-2xl">' +
      '<span class="eyebrow">Admin Console</span>' +
      '<h2 class="mt-4 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">' + esc(title) + '</h2>' +
      '<p class="mt-2 text-sm leading-relaxed text-muted sm:text-base">' + esc(lead) + '</p>' +
      '</div>' + (actions || '') + '</header>';
  }

  function demoNote(text) {
    return '<p class="flex items-start gap-2.5 rounded-xl border border-line bg-surface px-4 py-3 text-xs leading-relaxed text-muted">' +
      '<span class="mt-0.5 shrink-0 text-secondary">' + svg(I.info, 15) + '</span>' +
      '<span>' + esc(text) + '</span></p>';
  }

  function emptyState(opts) {
    return '<div class="card px-6 py-12 text-center">' +
      '<span class="mx-auto grid h-14 w-14 place-items-center rounded-2xl ' + opts.tone + '">' + svg(opts.icon, 24) + '</span>' +
      '<h3 class="mt-4 font-display text-lg font-bold text-ink">' + esc(opts.title) + '</h3>' +
      '<p class="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted">' + esc(opts.body) + '</p>' +
      (opts.action || '') + '</div>';
  }

  function sectionCard(title, subtitle, actions, body, extraClass) {
    return '<section class="card ' + (extraClass || '') + '">' +
      '<div class="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4 sm:px-6">' +
      '<div class="min-w-0 flex-1">' +
      '<h3 class="font-display text-base font-bold text-ink sm:text-lg">' + esc(title) + '</h3>' +
      (subtitle ? '<p class="mt-1 text-xs leading-relaxed text-muted">' + esc(subtitle) + '</p>' : '') +
      '</div>' + (actions || '') + '</div>' +
      '<div class="p-5 sm:p-6">' + body + '</div></section>';
  }

  /* ------------------------------ form atoms ----------------------------- */

  function fieldWrap(id, labelText, control, hint, required) {
    return '<div class="field">' +
      '<label class="label" for="' + id + '">' + esc(labelText) + (required ? ' <span class="text-danger">*</span>' : '') + '</label>' +
      control +
      (hint ? '<p class="field-hint">' + esc(hint) + '</p>' : '') +
      '<p class="field-error hidden" data-error-for="' + id + '" role="alert"></p>' +
      '</div>';
  }

  function textField(id, labelText, opts) {
    opts = opts || {};
    var control = '<input class="input" id="' + id + '" name="' + id + '" type="' + (opts.type || 'text') + '"' +
      (opts.value ? ' value="' + esc(opts.value) + '"' : '') +
      (opts.placeholder ? ' placeholder="' + esc(opts.placeholder) + '"' : '') +
      (opts.required ? ' required' : '') +
      (opts.min ? ' min="' + opts.min + '"' : '') +
      (opts.maxlength ? ' maxlength="' + opts.maxlength + '"' : '') + '>';
    return fieldWrap(id, labelText, control, opts.hint, opts.required);
  }

  function textareaField(id, labelText, opts) {
    opts = opts || {};
    var control = '<textarea class="input" id="' + id + '" name="' + id + '"' +
      (opts.placeholder ? ' placeholder="' + esc(opts.placeholder) + '"' : '') +
      (opts.maxlength ? ' maxlength="' + opts.maxlength + '"' : '') +
      (opts.required ? ' required' : '') + '>' + esc(opts.value || '') + '</textarea>';
    return fieldWrap(id, labelText, control, opts.hint, opts.required);
  }

  function selectField(id, labelText, options, current, required, hint) {
    var opts = options
      .map(function (o) {
        var value = typeof o === 'string' ? o : o.value;
        var label = typeof o === 'string' ? o : o.label;
        return '<option value="' + esc(value) + '"' + (value === current ? ' selected' : '') + '>' + esc(label) + '</option>';
      })
      .join('');
    var control = '<select class="input" id="' + id + '" name="' + id + '"' + (required ? ' required' : '') + '>' +
      '<option value="">Select…</option>' + opts + '</select>';
    return fieldWrap(id, labelText, control, hint, required);
  }

  function searchInput(id, placeholder, value, inputAttr) {
    return '<div class="relative">' +
      '<span class="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 text-muted">' + svg(I.search, 16) + '</span>' +
      '<input class="input ps-10" id="' + id + '" type="search" placeholder="' + esc(placeholder) + '" value="' + esc(value || '') + '" aria-label="' + esc(placeholder) + '"' +
      (inputAttr ? ' data-input="' + inputAttr + '"' : '') + '>' +
      '</div>';
  }

  function filterSelect(id, options, current, label, changeAttr) {
    var opts = options
      .map(function (o) {
        var value = typeof o === 'string' ? o : o.value;
        var text = typeof o === 'string' ? o : o.label;
        return '<option value="' + esc(value) + '"' + (value === current ? ' selected' : '') + '>' + esc(text) + '</option>';
      })
      .join('');
    return '<select class="input w-auto" id="' + id + '" aria-label="' + esc(label) + '"' +
      (changeAttr ? ' data-change="' + changeAttr + '"' : '') + '>' + opts + '</select>';
  }

  /* ============================== DATA MODEL ============================= */

  var APP_STATUSES = ['Pending', 'Under Review', 'Approved', 'Rejected'];
  var INDUSTRIES = ['Technology', 'Healthcare', 'FinTech', 'Education', 'Sustainability', 'Consumer Products', 'Other'];
  var STAGES = ['Idea', 'Pre-Seed', 'Seed', 'Growth'];

  function appSeed(rec) {
    return Object.assign(
      {
        id: LF.uid('app'),
        submittedAt: new Date().toISOString(),
        status: 'Pending'
      },
      rec
    );
  }

  function sampleApplications() {
    var seed = [
      appSeed({
        founderName: 'Amelia Hart', email: 'amelia@novamind.example', phone: '+1 555 010 1001',
        startupName: 'NovaMind AI', website: '', industry: 'Technology', stage: 'Idea', teamSize: 3,
        description: 'An AI copilot that turns scattered team knowledge into instant, trustworthy answers for support teams.',
        problem: 'Support agents waste hours searching scattered documentation while customers wait.',
        solution: 'A retrieval-first copilot that drafts answers from verified internal sources with citations.',
        targetAudience: 'B2B SaaS support teams with 50+ agents.',
        currentProgress: 'Working prototype with 5 pilot customers; 78% answer accuracy.',
        fundingStatus: 'Bootstrapped', whyLaunchForge: 'Mentor access and a structured path to our first enterprise pilot.'
      }),
      appSeed({
        founderName: 'Ravi Menon', email: 'ravi@paypilot.example', phone: '+1 555 010 1002',
        startupName: 'PayPilot', website: 'https://paypilot.example', industry: 'FinTech', stage: 'Pre-Seed', teamSize: 4,
        description: 'Cross-border payouts for freelance teams with transparent fees and instant settlement.',
        problem: 'Freelancers lose 6-9% and 5 days per payment on cross-border transfers.',
        solution: 'Local rail aggregation with a single dashboard for batch payouts.',
        targetAudience: 'Remote-first companies paying 10+ international contractors.',
        currentProgress: 'Beta live, $120k processed, two design partners.',
        fundingStatus: 'Angel', whyLaunchForge: 'Fundraising preparation and investor introductions.'
      }),
      appSeed({
        founderName: 'Sofia Delgado', email: 'sofia@careloop.example', phone: '+1 555 010 1003',
        startupName: 'CareLoop', website: '', industry: 'Healthcare', stage: 'Seed', teamSize: 6,
        description: 'Remote monitoring that keeps chronic-care patients connected to their care teams.',
        problem: 'Clinics cannot monitor high-risk patients between visits.',
        solution: 'A device-agnostic patient app with nurse triage workflows.',
        targetAudience: 'Mid-size cardiology and diabetes clinics.',
        currentProgress: 'Pilot with 2 clinics, 400 active patients.',
        fundingStatus: 'Seeking Investment', whyLaunchForge: 'Healthcare regulatory mentorship and pilot design.'
      }),
      appSeed({
        founderName: 'Tom Osei', email: 'tom@skillspark.example', phone: '+1 555 010 1004',
        startupName: 'SkillSpark', website: 'https://skillspark.example', industry: 'Education', stage: 'Idea', teamSize: 2,
        description: 'Project-based learning paths that help career switchers build portfolio-ready skills.',
        problem: 'Career switchers struggle to prove practical skills to employers.',
        solution: 'Mentor-reviewed project paths with shareable portfolio evidence.',
        targetAudience: 'Bootcamp graduates and self-taught developers.',
        currentProgress: 'Curriculum for the first two paths; 30 beta learners.',
        fundingStatus: 'Bootstrapped', whyLaunchForge: 'Product guidance and early traction strategy.'
      }),
      appSeed({
        founderName: 'Hannah Kim', email: 'hannah@greengrid.example', phone: '+1 555 010 1005',
        startupName: 'GreenGrid', website: '', industry: 'Sustainability', stage: 'Pre-Seed', teamSize: 5,
        description: 'Smart energy analytics that help small manufacturers cut waste and operating costs.',
        problem: 'Small manufacturers lack visibility into energy waste.',
        solution: 'Plug-and-play metering with AI-driven efficiency recommendations.',
        targetAudience: 'Manufacturers with 50-500 employees.',
        currentProgress: 'Two paid pilots; 11% average energy reduction.',
        fundingStatus: 'Friends & Family', whyLaunchForge: 'Go-to-market strategy and partner network.'
      }),
      appSeed({
        founderName: 'Lucas Ferreira', email: 'lucas@kindred.example', phone: '+1 555 010 1006',
        startupName: 'Kindred Goods', website: 'https://kindred.example', industry: 'Consumer Products', stage: 'Seed', teamSize: 7,
        description: 'A direct-to-consumer essentials brand built on refillable packaging and honest pricing.',
        problem: 'Consumers want sustainable options without premium pricing.',
        solution: 'Refill subscriptions with transparent unit economics.',
        targetAudience: 'Urban households, 25-45.',
        currentProgress: '3 SKUs live, 2,100 subscribers, 64% retention at 6 months.',
        fundingStatus: 'Seed Round', whyLaunchForge: 'Scaling operations and retail partnerships.'
      }),
      appSeed({
        founderName: 'Nadia Ali', email: 'nadia@looply.example', phone: '+1 555 010 1007',
        startupName: 'Looply', website: '', industry: 'Technology', stage: 'Idea', teamSize: 2,
        description: 'A feedback analytics layer that turns product comments into prioritised engineering work.',
        problem: 'Product teams drown in unstructured user feedback.',
        solution: 'Clustering plus sentiment trends linked to roadmap items.',
        targetAudience: 'B2B product teams, 10-200 engineers.',
        currentProgress: 'MVP built; 3 design partners signed.',
        fundingStatus: 'Bootstrapped', whyLaunchForge: 'Validation mentorship and pricing experiments.'
      }),
      appSeed({
        founderName: 'Marcus Webb', email: 'marcus@medbridge.example', phone: '+1 555 010 1008',
        startupName: 'MedBridge', website: 'https://medbridge.example', industry: 'Healthcare', stage: 'Growth', teamSize: 12,
        description: 'Care-navigation software connecting patients with the right specialist at the right time.',
        problem: 'Primary care referrals are slow and opaque.',
        solution: 'Rules-based triage with live specialist availability.',
        targetAudience: 'Regional hospital networks.',
        currentProgress: 'Live in 4 networks, 18k referrals processed.',
        fundingStatus: 'Seeking Investment', whyLaunchForge: 'Enterprise sales mentorship and Demo Day exposure.'
      })
    ];
    /* Stagger submission dates across the last six months so the demo
       activity chart and submitted dates look realistic. */
    var gaps = [3, 18, 40, 65, 90, 120, 150, 175];
    seed.forEach(function (r, i) {
      r.submittedAt = new Date(addDays(-gaps[i % gaps.length]).toISOString()).toISOString();
    });
    return seed;
  }

  function applications() {
    var list = LF.store.get(K.applications, null);
    if (Array.isArray(list) && list.length) return list;
    /* Seed demo data only when nothing exists yet — never overwrite real entries. */
    var seed = sampleApplications();
    LF.store.set(K.applications, seed);
    return seed;
  }

  function saveApplications(list) {
    return LF.store.set(K.applications, list);
  }

  /* ------------------------------- founders ------------------------------ */

  var FOUNDER_STATUSES = ['Active', 'Onboarding', 'Applicant', 'Completed', 'Withdrawn'];

  function sampleFounders() {
    return [
      { id: 'fo-1', name: 'Amelia Hart', email: 'amelia@novamind.example', phone: '+1 555 010 1001', startup: 'NovaMind AI', program: 'Pre-Seed Acceleration', status: 'Active', joined: toIso(addDays(-90)) },
      { id: 'fo-2', name: 'Ravi Menon', email: 'ravi@paypilot.example', phone: '+1 555 010 1002', startup: 'PayPilot', program: 'Seed Growth', status: 'Active', joined: toIso(addDays(-160)) },
      { id: 'fo-3', name: 'Sofia Delgado', email: 'sofia@careloop.example', phone: '+1 555 010 1003', startup: 'CareLoop', program: 'Seed Growth', status: 'Onboarding', joined: toIso(addDays(-20)) },
      { id: 'fo-4', name: 'Tom Osei', email: 'tom@skillspark.example', phone: '+1 555 010 1004', startup: 'SkillSpark', program: 'Idea Validation', status: 'Onboarding', joined: toIso(addDays(-12)) },
      { id: 'fo-5', name: 'Hannah Kim', email: 'hannah@greengrid.example', phone: '+1 555 010 1005', startup: 'GreenGrid', program: 'Pre-Seed Acceleration', status: 'Active', joined: toIso(addDays(-75)) },
      { id: 'fo-6', name: 'Lucas Ferreira', email: 'lucas@kindred.example', phone: '+1 555 010 1006', startup: 'Kindred Goods', program: 'Founder Launch', status: 'Completed', joined: toIso(addDays(-400)) },
      { id: 'fo-7', name: 'Nadia Ali', email: 'nadia@looply.example', phone: '+1 555 010 1007', startup: 'Looply', program: 'Idea Validation', status: 'Active', joined: toIso(addDays(-40)) },
      { id: 'fo-8', name: 'Marcus Webb', email: 'marcus@medbridge.example', phone: '+1 555 010 1008', startup: 'MedBridge', program: 'Seed Growth', status: 'Active', joined: toIso(addDays(-210)) }
    ];
  }

  function founders() {
    var list = LF.store.get(FOUNDERS_KEY, null);
    if (!Array.isArray(list) || !list.length) {
      list = sampleFounders();
      LF.store.set(FOUNDERS_KEY, list);
    }
    /* Merge applicants from the application pipeline (dedupe by email). */
    var byEmail = {};
    list.forEach(function (f) {
      byEmail[String(f.email || '').toLowerCase()] = f;
    });
    applications().forEach(function (a) {
      var key = String(a.email || '').toLowerCase();
      if (key && !byEmail[key]) {
        list.push({
          id: 'fo-app-' + a.id,
          name: a.founderName,
          email: a.email,
          phone: a.phone || '',
          startup: a.startupName,
          program: 'Applicant review',
          status: a.status === 'Approved' ? 'Onboarding' : 'Applicant',
          joined: String(a.submittedAt || '').slice(0, 10)
        });
        byEmail[key] = list[list.length - 1];
      }
    });
    return list;
  }

  function saveFounders(list) {
    return LF.store.set(FOUNDERS_KEY, list);
  }

  /* ------------------------------- startups ------------------------------ */

  function sampleStartups() {
    return [
      { id: 'st-1', name: 'NovaMind AI', industry: 'Technology', stage: 'Pre-Seed', description: 'AI copilot turning scattered team knowledge into instant, trustworthy answers.', image: BASE + 'images/portfolio/portfolio-ai.jpg' },
      { id: 'st-2', name: 'PayPilot', industry: 'FinTech', stage: 'Seed', description: 'Cross-border payouts for freelance teams with transparent fees.', image: BASE + 'images/portfolio/portfolio-fintech.jpg' },
      { id: 'st-3', name: 'CareLoop', industry: 'Healthcare', stage: 'Seed', description: 'Remote monitoring keeping chronic-care patients connected to clinicians.', image: BASE + 'images/portfolio/portfolio-healthcare.jpg' },
      { id: 'st-4', name: 'SkillSpark', industry: 'Education', stage: 'Idea', description: 'Project-based learning paths for career switchers.', image: BASE + 'images/portfolio/portfolio-edtech.jpg' },
      { id: 'st-5', name: 'GreenGrid', industry: 'Sustainability', stage: 'Pre-Seed', description: 'Smart energy analytics for small manufacturers.', image: BASE + 'images/portfolio/portfolio-sustainability.jpg' },
      { id: 'st-6', name: 'Kindred Goods', industry: 'Consumer Products', stage: 'Seed', description: 'Refillable, honestly-priced everyday essentials.', image: BASE + 'images/portfolio/portfolio-commerce.jpg' },
      { id: 'st-7', name: 'SwiftBox', industry: 'Technology', stage: 'Growth', description: 'Last-mile logistics coordination for regional carriers.', image: BASE + 'images/portfolio/portfolio-logistics.jpg' },
      { id: 'st-8', name: 'NorthStar Analytics', industry: 'FinTech', stage: 'Growth', description: 'Portfolio analytics dashboards for independent advisors.', image: BASE + 'images/portfolio/portfolio-analytics.jpg' }
    ];
  }

  function startups() {
    var list = LF.store.get(K.portfolio, null);
    if (!Array.isArray(list) || !list.length) {
      list = sampleStartups();
      LF.store.set(K.portfolio, list);
    }
    return list;
  }

  function saveStartups(list) {
    return LF.store.set(K.portfolio, list);
  }

  /* ------------------------------- programs ------------------------------ */

  var PROGRAM_STATUSES = ['Open', 'Upcoming', 'Closed'];

  function samplePrograms() {
    return [
      { id: 'pr-1', name: 'Idea Validation', duration: '4 weeks', eligibility: 'First-time and repeat founders with an early concept.', status: 'Open', description: 'Customer discovery, problem framing and value-proposition design.' },
      { id: 'pr-2', name: 'Pre-Seed Acceleration', duration: '8 weeks', eligibility: 'Teams with a working prototype and early signals.', status: 'Open', description: 'MVP milestones, metrics and investor-readiness sprint.' },
      { id: 'pr-3', name: 'Seed Growth', duration: '12 weeks', eligibility: 'Post-launch startups with initial traction.', status: 'Upcoming', description: 'Growth loops, pricing and a repeatable go-to-market engine.' },
      { id: 'pr-4', name: 'Product Development', duration: '6 weeks', eligibility: 'Founders preparing a first or second release.', status: 'Closed', description: 'Focused sprint on architecture, UX and launch execution.' }
    ];
  }

  function programs() {
    var list = LF.store.get(K.programs, null);
    if (!Array.isArray(list) || !list.length) {
      list = samplePrograms();
      LF.store.set(K.programs, list);
    }
    return list;
  }

  function savePrograms(list) {
    return LF.store.set(K.programs, list);
  }

  /* -------------------------------- mentors ------------------------------ */

  var AVAILABILITY = ['Available', 'Booked', 'Unavailable'];

  function sampleMentors() {
    return [
      { id: 'me-1', name: 'Amara Okafor', expertise: ['Product Strategy', 'Roadmapping'], bio: 'Former product lead helping founders find focus and ship faster.', availability: 'Available', sessions: 24, image: BASE + 'images/mentors/mentor-01.jpg' },
      { id: 'me-2', name: 'Daniel Reyes', expertise: ['Marketing & Growth', 'Pricing'], bio: 'Growth specialist who has scaled early products from zero to traction.', availability: 'Available', sessions: 31, image: BASE + 'images/mentors/mentor-02.jpg' },
      { id: 'me-3', name: 'Priya Natarajan', expertise: ['Finance & Fundraising', 'Metrics'], bio: 'Advisor on runway planning, pitch decks and investor conversations.', availability: 'Booked', sessions: 42, image: BASE + 'images/mentors/mentor-03.jpg' },
      { id: 'me-4', name: 'Marcus Chen', expertise: ['Technology', 'Architecture'], bio: 'Engineering leader guiding architecture decisions and technical hiring.', availability: 'Available', sessions: 18, image: BASE + 'images/mentors/mentor-04.jpg' },
      { id: 'me-5', name: 'Elena Brooks', expertise: ['Leadership', 'Operations'], bio: ' operator who has scaled two startups from 5 to 80 people.', availability: 'Unavailable', sessions: 27, image: BASE + 'images/mentors/mentor-05.jpg' },
      { id: 'me-6', name: 'Victor Hale', expertise: ['Business Development', 'Enterprise Sales'], bio: 'Former sales director opening enterprise accounts for early teams.', availability: 'Available', sessions: 35, image: BASE + 'images/mentors/mentor-06.jpg' },
      { id: 'me-7', name: 'Jonas Weber', expertise: ['Technology', 'AI & Data'], bio: 'Data scientist turned founder; advises on applied AI products.', availability: 'Booked', sessions: 15, image: BASE + 'images/mentors/mentor-07.jpg' },
      { id: 'me-8', name: 'Camila Duarte', expertise: ['Marketing & Growth', 'Brand'], bio: 'Brand strategist helping founders find a message that lands.', availability: 'Available', sessions: 22, image: BASE + 'images/mentors/mentor-08.jpg' }
    ];
  }

  function mentors() {
    var list = LF.store.get(K.mentors, null);
    if (!Array.isArray(list) || !list.length) {
      list = sampleMentors();
      LF.store.set(K.mentors, list);
    }
    return list;
  }

  function saveMentors(list) {
    return LF.store.set(K.mentors, list);
  }

  /* -------------------------------- sessions ----------------------------- */

  function sampleSessions() {
    return [
      { id: 'se-1', founder: 'Amelia Hart', startup: 'NovaMind AI', mentor: 'Amara Okafor', mentorRole: 'Product Strategy', date: toIso(addDays(3)), time: '10:00 – 11:00', goals: 'Pressure-test pricing before investor meetings.', status: 'Requested' },
      { id: 'se-2', founder: 'Ravi Menon', startup: 'PayPilot', mentor: 'Priya Natarajan', mentorRole: 'Finance & Fundraising', date: toIso(addDays(5)), time: '14:00 – 15:00', goals: 'Review the seed round narrative and metrics.', status: 'Requested' },
      { id: 'se-3', founder: 'Hannah Kim', startup: 'GreenGrid', mentor: 'Daniel Reyes', mentorRole: 'Marketing & Growth', date: toIso(addDays(8)), time: '11:00 – 12:00', goals: 'Positioning for manufacturing buyers.', status: 'Confirmed' },
      { id: 'se-4', founder: 'Tom Osei', startup: 'SkillSpark', mentor: 'Marcus Chen', mentorRole: 'Technology', date: toIso(addDays(-3)), time: '09:00 – 10:00', goals: 'Architecture review for the MVP sprint.', status: 'Completed' },
      { id: 'se-5', founder: 'Nadia Ali', startup: 'Looply', mentor: 'Camila Duarte', mentorRole: 'Marketing & Growth', date: toIso(addDays(-9)), time: '16:00 – 17:00', goals: 'Launch messaging for the beta.', status: 'Cancelled' }
    ];
  }

  function sessions() {
    var list = LF.store.get(K.sessions, null);
    if (!Array.isArray(list) || !list.length) {
      list = sampleSessions();
      LF.store.set(K.sessions, list);
    }
    return list;
  }

  function saveSessions(list) {
    return LF.store.set(K.sessions, list);
  }

  /* ------------------------------- milestones ---------------------------- */

  function sampleMilestones() {
    return [
      { id: 'ms-1', title: 'Idea Validation', startup: 'NovaMind AI', founder: 'Amelia Hart', dueDate: toIso(addDays(-30)), progress: 100 },
      { id: 'ms-2', title: 'Market Research', startup: 'PayPilot', founder: 'Ravi Menon', dueDate: toIso(addDays(-14)), progress: 100 },
      { id: 'ms-3', title: 'MVP Development', startup: 'NovaMind AI', founder: 'Amelia Hart', dueDate: toIso(addDays(9)), progress: 55 },
      { id: 'ms-4', title: 'Customer Interviews', startup: 'GreenGrid', founder: 'Hannah Kim', dueDate: toIso(addDays(-2)), progress: 40 },
      { id: 'ms-5', title: 'Pricing Experiment', startup: 'Kindred Goods', founder: 'Lucas Ferreira', dueDate: toIso(addDays(16)), progress: 20 },
      { id: 'ms-6', title: 'Fundraising Prep', startup: 'CareLoop', founder: 'Sofia Delgado', dueDate: toIso(addDays(34)), progress: 10 },
      { id: 'ms-7', title: 'Beta Launch', startup: 'SkillSpark', founder: 'Tom Osei', dueDate: toIso(addDays(6)), progress: 65 },
      { id: 'ms-8', title: 'Enterprise Pilot', startup: 'MedBridge', founder: 'Marcus Webb', dueDate: toIso(addDays(-6)), progress: 80 }
    ];
  }

  function milestones() {
    var list = LF.store.get(K.milestones, null);
    if (!Array.isArray(list) || !list.length) {
      list = sampleMilestones();
      LF.store.set(K.milestones, list);
    }
    return list;
  }

  function saveMilestones(list) {
    return LF.store.set(K.milestones, list);
  }

  function milestoneStatus(m) {
    var p = Number(m.progress) || 0;
    if (p >= 100) return 'Completed';
    if (daysUntil(m.dueDate) < 0) return 'Overdue';
    if (p > 0) return 'In Progress';
    return 'Not Started';
  }

  /* --------------------------------- decks ------------------------------- */

  function sampleDecks() {
    return [
      { id: 'dk-1', founder: 'Amelia Hart', startup: 'NovaMind AI', name: 'novamind-seed-deck.pdf', type: 'PDF', size: 4_820_000, uploadedAt: new Date(addDays(-2).toISOString()).toISOString(), status: 'Reviewed' },
      { id: 'dk-2', founder: 'Ravi Menon', startup: 'PayPilot', name: 'paypilot-pitch.pptx', type: 'PPTX', size: 9_130_000, uploadedAt: new Date(addDays(-5).toISOString()).toISOString(), status: 'Pending review' },
      { id: 'dk-3', founder: 'Sofia Delgado', startup: 'CareLoop', name: 'careloop-investor-deck.pdf', type: 'PDF', size: 6_480_000, uploadedAt: new Date(addDays(-9).toISOString()).toISOString(), status: 'Reviewed' },
      { id: 'dk-4', founder: 'Lucas Ferreira', startup: 'Kindred Goods', name: 'kindred-goods-deck.pdf', type: 'PDF', size: 3_260_000, uploadedAt: new Date(addDays(-12).toISOString()).toISOString(), status: 'Reviewed' }
    ];
  }

  function decks() {
    var list = LF.store.get(ADMIN_DECKS_KEY, null);
    if (!Array.isArray(list) || !list.length) {
      list = sampleDecks();
      LF.store.set(ADMIN_DECKS_KEY, list);
    }
    return list;
  }

  function saveDecks(list) {
    return LF.store.set(ADMIN_DECKS_KEY, list);
  }

  /* ----------------------------- notifications --------------------------- */

  var NOTIF_TONE = {
    application: 'bg-primary/15 text-primary',
    session: 'bg-secondary/15 text-secondary',
    deck: 'bg-success/15 text-success',
    milestone: 'bg-warning/15 text-warning',
    system: 'bg-muted/15 text-muted'
  };

  function notifIcon(type) {
    switch (type) {
      case 'application': return I.fileText;
      case 'session': return I.calendar;
      case 'deck': return I.presentation;
      case 'milestone': return I.flag;
      default: return I.info;
    }
  }

  function sampleNotifications() {
    return [
      { id: 'nt-1', type: 'application', title: 'New application received', body: 'Nadia Ali applied with Looply (Technology, Idea stage).', read: false, date: new Date(addDays(-1).toISOString()).toISOString() },
      { id: 'nt-2', type: 'session', title: 'Session requested', body: 'Ravi Menon requested time with Priya Natarajan.', read: false, date: new Date(addDays(-1).toISOString()).toISOString() },
      { id: 'nt-3', type: 'milestone', title: 'Milestone overdue', body: 'Customer Interviews for GreenGrid is 2 days overdue.', read: false, date: new Date().toISOString() },
      { id: 'nt-4', type: 'deck', title: 'Pitch deck submitted', body: 'Amelia Hart submitted novamind-seed-deck.pdf.', read: true, date: new Date(addDays(-2).toISOString()).toISOString() },
      { id: 'nt-5', type: 'system', title: 'Program update', body: 'Seed Growth applications close in 12 days (sample).', read: true, date: new Date(addDays(-4).toISOString()).toISOString() }
    ];
  }

  function notifications() {
    var list = LF.store.get(ADMIN_NOTIFICATIONS_KEY, null);
    if (!Array.isArray(list) || !list.length) {
      list = sampleNotifications();
      LF.store.set(ADMIN_NOTIFICATIONS_KEY, list);
    }
    return list;
  }

  function saveNotifications(list) {
    return LF.store.set(ADMIN_NOTIFICATIONS_KEY, list);
  }

  function unreadCount() {
    return notifications().filter(function (n) { return !n.read; }).length;
  }

  function pushNotification(type, title, body) {
    var list = notifications();
    list.unshift({ id: LF.uid('nt'), type: type, title: title, body: body, read: false, date: new Date().toISOString() });
    saveNotifications(list);
  }

  /* ------------------------------- settings ------------------------------ */

  function settings() {
    var s = LF.store.get(K.adminSettings, null);
    if (!s || typeof s !== 'object') {
      s = {
        adminName: '', adminEmail: '', siteName: 'LaunchForge Accelerator',
        supportEmail: 'support@launchforge.example', applicationsOpen: true,
        emailDigest: true, notifyApplications: true, notifySessions: true
      };
    }
    return s;
  }

  function saveSettings(s) {
    return LF.store.set(K.adminSettings, s);
  }

  /* ================================ MODAL ================================ */

  var openModalInstance = null;

  function closeModal() {
    if (!openModalInstance) return;
    var inst = openModalInstance;
    openModalInstance = null;
    document.removeEventListener('keydown', inst.onKey, true);
    inst.backdrop.remove();
    if (!document.querySelector('#dash-sidebar.is-open')) {
      document.body.classList.remove('no-scroll');
    }
    if (inst.previous && inst.previous.focus) inst.previous.focus();
  }

  function openModal(opts) {
    closeModal();
    var previous = document.activeElement;
    var backdrop = document.createElement('div');
    backdrop.className = 'lf-modal-backdrop';
    backdrop.innerHTML =
      '<div class="lf-modal" role="dialog" aria-modal="true" aria-labelledby="lf-dash-modal-title"' +
      (opts.wide ? ' style="width:min(36rem,100%)"' : '') + '>' +
      '<div class="flex items-start justify-between gap-4">' +
      '<h2 id="lf-dash-modal-title" class="font-display text-lg font-bold leading-snug text-ink">' + esc(opts.title) + '</h2>' +
      '<button type="button" class="-me-1 -mt-1 rounded-lg p-1.5 text-muted transition hover:bg-softindigo hover:text-ink" data-modal-close aria-label="Close dialog">' +
      svg(I.x, 18) + '</button></div>' +
      '<div class="mt-4">' + opts.body + '</div></div>';

    var inst = { backdrop: backdrop, previous: previous, onKey: null };

    inst.onKey = function (e) {
      if (e.key === 'Escape') {
        e.stopPropagation();
        e.preventDefault();
        closeModal();
        return;
      }
      if (e.key !== 'Tab') return;
      var nodes = backdrop.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])');
      if (!nodes.length) return;
      var first = nodes[0];
      var last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    backdrop.addEventListener('click', function (e) {
      if (e.target === backdrop) closeModal();
    });
    backdrop.querySelectorAll('[data-modal-close]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        closeModal();
      });
    });

    document.addEventListener('keydown', inst.onKey, true);
    document.body.appendChild(backdrop);
    document.body.classList.add('no-scroll');
    openModalInstance = inst;

    if (typeof opts.onMount === 'function') opts.onMount(backdrop);

    var focusTarget = backdrop.querySelector('form input, form select, form textarea') ||
      backdrop.querySelector('button[data-modal-close]');
    if (focusTarget) focusTarget.focus();
    return backdrop;
  }

  /* ============================== SHELL LOGIC ============================ */

  var els = {};
  var drawerOpen = false;
  var SIDEBAR_STATE_KEY = SIDEBAR_KEY;

  /* UI state that survives re-renders within a session */
  var state = {
    appQuery: '', appIndustry: '', appStage: '', appStatus: '',
    founderQuery: '', founderStatus: '', milestoneStartup: ''
  };

  function isDesktop() {
    return window.matchMedia('(min-width: 1100px)').matches;
  }

  function setDrawer(open) {
    if (!els.sidebar || !els.menuBtn) return;
    drawerOpen = !!open && !isDesktop();
    els.sidebar.classList.toggle('is-open', drawerOpen);
    if (els.backdrop) {
      els.backdrop.classList.toggle('opacity-100', drawerOpen);
      els.backdrop.classList.toggle('pointer-events-auto', drawerOpen);
      els.backdrop.classList.toggle('opacity-0', !drawerOpen);
      els.backdrop.classList.toggle('pointer-events-none', !drawerOpen);
    }
    els.menuBtn.setAttribute('aria-expanded', String(drawerOpen));
    els.menuBtn.setAttribute('aria-label', drawerOpen ? 'Close menu' : 'Open menu');
    document.body.classList.toggle('no-scroll', drawerOpen || !!openModalInstance);
    if (drawerOpen) {
      window.setTimeout(function () {
        var first = els.sidebar.querySelector('a[href], button:not([disabled])');
        if (first) first.focus();
      }, 80);
    }
  }

  function applyCollapse(mini, save) {
    document.body.classList.toggle('lf-side-mini', !!mini);
    if (els.collapse) {
      var rtl = document.documentElement.dir === 'rtl';
      var expanded = !mini;
      els.collapse.setAttribute('aria-expanded', String(expanded));
      els.collapse.setAttribute('aria-label', expanded ? 'Collapse sidebar' : 'Expand sidebar');
      els.collapse.setAttribute('title', expanded ? 'Collapse sidebar' : 'Expand sidebar');
      var icon = expanded ? (rtl ? I.chevRight : I.chevLeft) : (rtl ? I.chevLeft : I.chevRight);
      els.collapse.innerHTML = svg(icon, 18);
    }
    if (save) {
      try {
        localStorage.setItem(SIDEBAR_STATE_KEY, mini ? 'mini' : 'full');
      } catch (e) { /* ignore */ }
    }
  }

  function storedCollapse() {
    try {
      return localStorage.getItem(SIDEBAR_STATE_KEY) === 'mini';
    } catch (e) {
      return false;
    }
  }

  function updateBell() {
    var n = unreadCount();
    if (els.bellCount) {
      els.bellCount.textContent = n > 99 ? '99+' : String(n);
      els.bellCount.classList.toggle('hidden', n === 0);
      els.bellCount.classList.toggle('grid', n > 0);
    }
    if (els.bell) {
      els.bell.setAttribute('aria-label', n > 0 ? 'Notifications — ' + n + ' unread' : 'Notifications — nothing unread');
    }
  }

  function syncControlLabels() {
    var theme = LF.theme.get();
    var rtl = LF.rtl.is();
    document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
      btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
      btn.setAttribute('title', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    });
    document.querySelectorAll('[data-rtl-toggle]').forEach(function (btn) {
      btn.setAttribute('aria-label', rtl ? 'Switch to left-to-right layout' : 'Switch to right-to-left layout');
      btn.setAttribute('title', rtl ? 'Switch to left-to-right layout' : 'Switch to right-to-left layout');
    });
    applyCollapse(document.body.classList.contains('lf-side-mini'), false);
  }

  function identityToTopbar() {
    var u = adminUser();
    if (els.avatar) els.avatar.textContent = initials(u.name);
    if (els.userName) els.userName.textContent = u.name;
    if (els.userRole) els.userRole.textContent = u.role === 'founder' ? 'Founder (viewing admin)' : 'Admin';
    if (els.userMenuBtn) {
      els.userMenuBtn.setAttribute('aria-label', 'Account menu — ' + u.name);
    }
  }

  /* ------------------------------- routing ------------------------------ */

  var ROUTES = {
    '#/overview': { title: 'Overview', subtitle: 'Platform performance at a glance', render: renderOverview },
    '#/applications': { title: 'Applications', subtitle: 'Review and triage founder applications', render: renderApplications },
    '#/founders': { title: 'Founders', subtitle: 'Everyone in the LaunchForge pipeline', render: renderFounders },
    '#/startups': { title: 'Startups', subtitle: 'Portfolio management', render: renderStartups },
    '#/programs': { title: 'Programs', subtitle: 'Tracks, durations and availability', render: renderPrograms },
    '#/mentors': { title: 'Mentors', subtitle: 'Directory and availability', render: renderMentors },
    '#/sessions': { title: 'Mentor Sessions', subtitle: 'Requests across the platform', render: renderSessions },
    '#/milestones': { title: 'Milestones', subtitle: 'Founder progress across startups', render: renderMilestones },
    '#/pitch-decks': { title: 'Pitch Decks', subtitle: 'Submission metadata review', render: renderDecks },
    '#/notifications': { title: 'Notifications', subtitle: 'Platform activity alerts', render: renderNotifications },
    '#/settings': { title: 'Settings', subtitle: 'Admin profile and platform preferences', render: renderSettings }
  };

  function resolveRoute() {
    var hash = location.hash;
    return ROUTES[hash] ? hash : '#/overview';
  }

  function render() {
    if (!els.content) return;
    var key = resolveRoute();
    var route = ROUTES[key];

    if (els.title) els.title.textContent = route.title;
    if (els.subtitle) els.subtitle.textContent = route.subtitle;
    document.title = route.title + ' — Admin Dashboard — LaunchForge Accelerator';

    document.querySelectorAll('[data-route]').forEach(function (link) {
      var active = link.getAttribute('data-route') === key;
      link.classList.toggle('side-link-active', active);
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });

    els.content.innerHTML = route.render();
    LF.animateCounters(els.content);
    updateBell();
  }

  /* ================================ OVERVIEW ============================= */

  function statCard(opts) {
    return '<article class="card p-5 sm:p-6">' +
      '<div class="flex items-start justify-between gap-3">' +
      '<span class="grid h-11 w-11 shrink-0 place-items-center rounded-xl ' + opts.tone + '">' + svg(opts.icon, 20) + '</span>' +
      (opts.tag ? '<span class="badge ' + opts.tagTone + '">' + esc(opts.tag) + '</span>' : '') +
      '</div>' +
      '<p class="mt-4 font-display text-3xl font-bold tracking-tight text-ink">' + opts.value + '</p>' +
      '<p class="mt-1 text-sm font-semibold text-muted">' + esc(opts.label) + '</p>' +
      (opts.extra || '') +
      '</article>';
  }

  function chartSvg(values, labels) {
    var small = window.innerWidth < 700;
    var W = small ? 360 : 640;
    var H = small ? 220 : 300;
    var padL = small ? 32 : 40;
    var padR = 8;
    var padT = 14;
    var padB = small ? 28 : 32;
    var plotW = W - padL - padR;
    var plotH = H - padT - padB;
    var n = values.length;
    var step = plotW / n;
    var bw = Math.min(step * 0.5, 44);
    var fs = small ? 12 : 13;
    var out = '';

    [0, 25, 50, 75, 100].forEach(function (v) {
      var y = padT + plotH * (1 - v / 100);
      out += '<line x1="' + padL + '" y1="' + y.toFixed(1) + '" x2="' + (W - padR) + '" y2="' + y.toFixed(1) +
        '" stroke="currentColor" stroke-opacity="0.3" stroke-width="1"' +
        (v === 0 ? '' : ' stroke-dasharray="4 6"') + ' />';
      out += '<text x="' + (padL - 7) + '" y="' + (y + 4).toFixed(1) + '" text-anchor="end" font-size="' + (fs - 1) +
        '" fill="currentColor" fill-opacity="0.75">' + v + '</text>';
    });

    var pts = [];
    values.forEach(function (v, i) {
      var hgt = Math.max(2, plotH * (Math.max(0, Math.min(100, v)) / 100));
      var x = padL + i * step + (step - bw) / 2;
      var y = padT + plotH - hgt;
      var last = i === n - 1;
      out += '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + bw.toFixed(1) +
        '" height="' + hgt.toFixed(1) + '" rx="' + Math.min(6, bw / 3).toFixed(1) +
        '" fill="currentColor" fill-opacity="' + (last ? '1' : '0.5') + '" class="' +
        (last ? 'text-secondary' : 'text-primary') + '"></rect>';
      pts.push((x + bw / 2).toFixed(1) + ',' + (y - 7).toFixed(1));
      out += '<text x="' + (x + bw / 2).toFixed(1) + '" y="' + (H - 10) + '" text-anchor="middle" font-size="' + fs +
        '" fill="currentColor" fill-opacity="0.75">' + esc(labels[i]) + '</text>';
    });

    out += '<polyline points="' + pts.join(' ') + '" fill="none" stroke="currentColor" stroke-opacity="0.6" ' +
      'stroke-width="2" stroke-dasharray="5 5" class="text-secondary"></polyline>';
    pts.forEach(function (p) {
      var xy = p.split(',');
      out += '<circle cx="' + xy[0] + '" cy="' + xy[1] + '" r="3.2" fill="currentColor" class="text-secondary"></circle>';
    });

    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + H + '" class="h-auto w-full" ' +
      'role="img" aria-label="Applications per month for the last six months">' + out + '</svg>';
  }

  function donutSvg(segments) {
    var size = 168;
    var stroke = 26;
    var r = (size - stroke) / 2;
    var cx = size / 2;
    var cy = size / 2;
    var total = segments.reduce(function (sum, s) { return sum + s.value; }, 0) || 1;
    var circumference = 2 * Math.PI * r;
    var offset = circumference * 0.25;
    var out = '';

    segments.forEach(function (s) {
      var len = (s.value / total) * circumference;
      out += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke-width="' + stroke +
        '" stroke-dasharray="' + len.toFixed(2) + ' ' + (circumference - len).toFixed(2) +
        '" stroke-dashoffset="' + offset.toFixed(2) + '" stroke-linecap="butt" class="' + s.color + '"></circle>';
      offset -= len;
    });

    out += '<text x="' + cx + '" y="' + (cy - 2) + '" text-anchor="middle" font-size="26" font-weight="700" fill="currentColor">' + total + '</text>';
    out += '<text x="' + cx + '" y="' + (cy + 20) + '" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.7">total</text>';

    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + size + ' ' + size + '" class="h-40 w-40" role="img" aria-label="Application status distribution">' + out + '</svg>';
  }

  function renderOverview() {
    var apps = applications();
    var foundersList = founders();
    var startupsList = startups();
    var mentorsList = mentors();
    var sessionsList = sessions();

    var approved = apps.filter(function (a) { return a.status === 'Approved'; }).length;
    var activeFounders = foundersList.filter(function (f) { return f.status === 'Active' || f.status === 'Onboarding'; }).length;
    var availableMentors = mentorsList.filter(function (m) { return m.availability === 'Available'; }).length;
    var upcomingSessions = sessionsList.filter(function (s) { return s.status === 'Requested' || s.status === 'Confirmed'; }).length;

    var cards =
      statCard({ tone: 'bg-primary/15 text-primary', icon: I.fileText, value: apps.length, label: 'Total Applications' }) +
      statCard({ tone: 'bg-success/15 text-success', icon: I.checkCircle, value: approved, label: 'Approved Applications' }) +
      statCard({ tone: 'bg-secondary/15 text-secondary', icon: I.users, value: activeFounders, label: 'Active Founders' }) +
      statCard({ tone: 'bg-primary/15 text-primary', icon: I.rocket, value: startupsList.length, label: 'Portfolio Startups' }) +
      statCard({ tone: 'bg-success/15 text-success', icon: I.userCheck, value: availableMentors, label: 'Available Mentors' }) +
      statCard({ tone: 'bg-warning/15 text-warning', icon: I.calendar, value: upcomingSessions, label: 'Upcoming Mentor Sessions' });

    /* Applications per month (last 6 months), normalised to the busiest month */
    var months = [];
    var rawCounts = [];
    for (var i = 5; i >= 0; i--) {
      var d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - i);
      var label = d.toLocaleDateString('en-US', { month: 'short' });
      var count = apps.filter(function (a) {
        var ad = new Date(a.submittedAt || 0);
        return ad.getMonth() === d.getMonth() && ad.getFullYear() === d.getFullYear();
      }).length;
      months.push(label);
      rawCounts.push(count);
    }
    var maxCount = Math.max.apply(null, rawCounts.concat([1]));
    var values = rawCounts.map(function (c) {
      return Math.round((c / maxCount) * 100);
    });

    var statusSegments = APP_STATUSES.map(function (s, idx) {
      var colors = ['text-warning', 'text-primary', 'text-success', 'text-danger'];
      return { value: apps.filter(function (a) { return a.status === s; }).length, color: colors[idx] };
    });
    var hasAnyStatus = statusSegments.some(function (x) { return x.value > 0; });
    if (!hasAnyStatus) statusSegments = [{ value: 1, color: 'text-muted' }];

    var activity = notifications().slice(0, 5).map(function (n) {
      return '<li class="flex items-start gap-3 border-b border-line py-3 last:border-0 last:pb-0">' +
        '<span class="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg ' + (NOTIF_TONE[n.type] || NOTIF_TONE.system) + '">' + svg(notifIcon(n.type), 15) + '</span>' +
        '<div class="min-w-0">' +
        '<p class="text-sm font-semibold text-ink">' + esc(n.title) + '</p>' +
        '<p class="mt-0.5 truncate text-xs text-muted">' + esc(n.body) + '</p>' +
        '</div>' +
        '<span class="ms-auto shrink-0 text-[11px] font-medium text-muted">' + esc(dateLabel(n.date)) + '</span>' +
        '</li>';
    }).join('');

    return pageHead('Overview', 'Demo statistics for the platform — fictional sample data until real metrics are connected.') +
      '<div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">' + cards + '</div>' +
      '<div class="mt-6 grid gap-6 lg:grid-cols-3">' +
      sectionCard('Applications per month', 'Submitted applications over the last six months', '', chartSvg(values, months), 'lg:col-span-2') +
      sectionCard('Status mix', 'Current distribution of application statuses', '',
        '<div class="flex flex-col items-center gap-5">' + donutSvg(statusSegments) +
        '<ul class="w-full space-y-2">' +
        APP_STATUSES.map(function (s, idx) {
          var colors = ['bg-warning', 'bg-primary', 'bg-success', 'bg-danger'];
          var count = apps.filter(function (a) { return a.status === s; }).length;
          return '<li class="flex items-center gap-2.5 text-sm">' +
            '<span class="h-2.5 w-2.5 rounded-full ' + colors[idx] + '"></span>' +
            '<span class="font-medium text-muted">' + esc(s) + '</span>' +
            '<span class="ms-auto font-display font-bold text-ink">' + count + '</span></li>';
        }).join('') +
        '</ul></div>') +
      '</div>' +
      sectionCard('Recent activity', 'Latest platform events', '', '<ul>' + activity + '</ul>') +
      '<div class="mt-6">' + demoNote('All figures on this page are fictional demo data stored locally in your browser.') + '</div>';
  }

  /* ============================= APPLICATIONS ============================ */

  function filteredApplications() {
    var q = state.appQuery.trim().toLowerCase();
    return applications().filter(function (a) {
      if (state.appIndustry && a.industry !== state.appIndustry) return false;
      if (state.appStage && a.stage !== state.appStage) return false;
      if (state.appStatus && a.status !== state.appStatus) return false;
      if (!q) return true;
      return (
        String(a.founderName || '').toLowerCase().indexOf(q) !== -1 ||
        String(a.startupName || '').toLowerCase().indexOf(q) !== -1 ||
        String(a.email || '').toLowerCase().indexOf(q) !== -1
      );
    });
  }

  function renderApplications() {
    var list = filteredApplications();

    var controls =
      '<div class="grid gap-3 md:grid-cols-[1fr_auto_auto_auto] md:items-end">' +
      searchInput('app-search', 'Search founder or startup…', state.appQuery, 'app-search') +
      filterSelect('app-industry', [{ value: '', label: 'All industries' }].concat(INDUSTRIES), state.appIndustry, 'Filter by industry', 'app-industry') +
      filterSelect('app-stage', [{ value: '', label: 'All stages' }].concat(STAGES), state.appStage, 'Filter by stage', 'app-stage') +
      filterSelect('app-status', [{ value: '', label: 'All statuses' }].concat(APP_STATUSES), state.appStatus, 'Filter by status', 'app-status-filter') +
      '</div>';

    var rows = list.map(function (a) {
      var statusOptions = APP_STATUSES.map(function (s) {
        return '<option value="' + esc(s) + '"' + (a.status === s ? ' selected' : '') + '>' + esc(s) + '</option>';
      }).join('');
      return '<tr>' +
        '<td><p class="font-semibold text-ink">' + esc(a.founderName) + '</p><p class="text-xs text-muted">' + esc(a.email) + '</p></td>' +
        '<td><p class="font-semibold text-ink">' + esc(a.startupName) + '</p>' + (a.website ? '<p class="text-xs text-muted">' + esc(a.website) + '</p>' : '') + '</td>' +
        '<td>' + badge(a.industry, 'bg-softindigo text-primary') + '</td>' +
        '<td>' + badge(a.stage, 'bg-softorange text-secondary') + '</td>' +
        '<td>' + esc(dateLabel(a.submittedAt)) + '</td>' +
        '<td><select class="lf-inline-select" data-change="app-status-update" data-id="' + esc(a.id) + '" aria-label="Status for ' + esc(a.startupName) + '">' + statusOptions + '</select></td>' +
        '<td><button type="button" class="btn btn-outline btn-sm" data-action="app-view" data-id="' + esc(a.id) + '">' + svg(I.eye, 14) + 'View</button></td>' +
        '</tr>';
    }).join('');

    var table =
      '<div class="table-wrap"><table class="data-table">' +
      '<thead><tr><th>Founder</th><th>Startup</th><th>Industry</th><th>Stage</th><th>Submitted</th><th>Status</th><th>Actions</th></tr></thead>' +
      '<tbody>' + rows + '</tbody></table></div>';

    var body = list.length
      ? '<p class="mb-4 text-sm text-muted" id="app-count" aria-live="polite">Showing ' + list.length + ' of ' + applications().length + ' applications.</p>' + table
      : emptyState({
          tone: 'bg-softindigo text-primary', icon: I.search,
          title: 'No applications match',
          body: 'Try clearing the search or changing the filters to see more results.',
          action: '<button type="button" class="btn btn-outline btn-sm mt-5" data-action="app-clear-filters">Clear filters</button>'
        });

    return pageHead('Applications', 'Review submissions, inspect details and move each application through the pipeline.') +
      '<div class="mt-6">' + controls + '</div>' +
      '<div class="mt-5">' + body + '</div>' +
      '<div class="mt-6">' + demoNote('Applications submitted through apply.html appear here automatically (same localStorage key). This is a frontend demo — nothing is sent to a server.') + '</div>';
  }

  function applicationDetailRows(a) {
    var rows = [
      ['Founder', a.founderName], ['Email', a.email], ['Phone', a.phone],
      ['Startup', a.startupName], ['Website', a.website || '—'],
      ['Industry', a.industry], ['Stage', a.stage], ['Team size', a.teamSize],
      ['Funding status', a.fundingStatus], ['Submitted', dateLabel(a.submittedAt)]
    ];
    var textareas = [
      ['Startup description', a.description], ['Problem being solved', a.problem],
      ['Proposed solution', a.solution], ['Target audience', a.targetAudience],
      ['Current progress', a.currentProgress], ['Why LaunchForge', a.whyLaunchForge]
    ];
    var html = '<dl class="grid gap-3 sm:grid-cols-2">' +
      rows.map(function (r) {
        return '<div class="rounded-xl bg-softindigo/60 px-4 py-3">' +
          '<dt class="text-[11px] font-bold uppercase tracking-wider text-muted">' + esc(r[0]) + '</dt>' +
          '<dd class="mt-1 text-sm font-semibold text-ink">' + esc(r[1]) + '</dd></div>';
      }).join('') + '</dl>';
    html += '<div class="mt-4 space-y-3">' +
      textareas.map(function (r) {
        return '<div class="rounded-xl border border-line px-4 py-3">' +
          '<p class="text-[11px] font-bold uppercase tracking-wider text-muted">' + esc(r[0]) + '</p>' +
          '<p class="mt-1.5 text-sm leading-relaxed text-ink">' + esc(r[1]) + '</p></div>';
      }).join('') + '</div>';
    return html;
  }

  function applicationModal(id) {
    var app = null;
    applications().forEach(function (a) { if (a.id === id) app = a; });
    if (!app) return;
    var statusOptions = APP_STATUSES.map(function (s) {
      return '<option value="' + esc(s) + '"' + (app.status === s ? ' selected' : '') + '>' + esc(s) + '</option>';
    }).join('');
    openModal({
      title: app.startupName + ' — application',
      wide: true,
      body:
        '<div class="mb-4 flex flex-wrap items-center gap-2">' +
        badge(app.industry, 'bg-softindigo text-primary') + badge(app.stage, 'bg-softorange text-secondary') + badge(app.status, APP_STATUS_TONE[app.status]) +
        '</div>' +
        applicationDetailRows(app) +
        '<div class="mt-5 border-t border-line pt-4">' +
        fieldWrap('app-modal-status', 'Update status',
          '<select class="input" id="app-modal-status" data-change="app-status-update" data-id="' + esc(app.id) + '">' + statusOptions + '</select>',
          'Changes save immediately and notify the founder dashboard demo.', false) +
        '</div>'
    });
  }

  /* =============================== FOUNDERS ============================== */

  function filteredFounders() {
    var q = state.founderQuery.trim().toLowerCase();
    return founders().filter(function (f) {
      if (state.founderStatus && f.status !== state.founderStatus) return false;
      if (!q) return true;
      return (
        String(f.name || '').toLowerCase().indexOf(q) !== -1 ||
        String(f.startup || '').toLowerCase().indexOf(q) !== -1 ||
        String(f.email || '').toLowerCase().indexOf(q) !== -1
      );
    });
  }

  function renderFounders() {
    var list = filteredFounders();

    var controls =
      '<div class="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">' +
      searchInput('founder-search', 'Search name, startup or email…', state.founderQuery, 'founder-search') +
      filterSelect('founder-status', FOUNDER_STATUSES, state.founderStatus, 'Filter by status') +
      '</div>';

    var rows = list.map(function (f) {
      var statusOptions = FOUNDER_STATUSES.map(function (s) {
        return '<option value="' + esc(s) + '"' + (f.status === s ? ' selected' : '') + '>' + esc(s) + '</option>';
      }).join('');
      return '<tr>' +
        '<td><div class="flex items-center gap-3">' +
        '<span class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/15 text-xs font-bold text-primary">' + esc(initials(f.name)) + '</span>' +
        '<span class="font-semibold text-ink">' + esc(f.name) + '</span></div></td>' +
        '<td><p class="text-sm text-ink">' + esc(f.email) + '</p><p class="text-xs text-muted">' + esc(f.phone) + '</p></td>' +
        '<td class="font-semibold text-ink">' + esc(f.startup) + '</td>' +
        '<td class="text-sm text-muted">' + esc(f.program) + '</td>' +
        '<td><select class="lf-inline-select" data-change="founder-status" data-id="' + esc(f.id) + '" aria-label="Status for ' + esc(f.name) + '">' + statusOptions + '</select></td>' +
        '<td><button type="button" class="btn btn-outline btn-sm" data-action="founder-view" data-id="' + esc(f.id) + '">' + svg(I.eye, 14) + 'View</button></td>' +
        '</tr>';
    }).join('');

    var body = list.length
      ? '<p class="mb-4 text-sm text-muted" aria-live="polite">Showing ' + list.length + ' of ' + founders().length + ' founders.</p>' +
        '<div class="table-wrap"><table class="data-table">' +
        '<thead><tr><th>Founder</th><th>Contact</th><th>Startup</th><th>Program</th><th>Status</th><th>Actions</th></tr></thead>' +
        '<tbody>' + rows + '</tbody></table></div>'
      : emptyState({
          tone: 'bg-softindigo text-primary', icon: I.search,
          title: 'No founders match',
          body: 'Adjust the search or clear the status filter.',
          action: '<button type="button" class="btn btn-outline btn-sm mt-5" data-action="founder-clear-filters">Clear filters</button>'
        });

    return pageHead('Founders', 'Everyone in the LaunchForge pipeline, including applicants pulled in from the application form.') +
      '<div class="mt-6">' + controls + '</div>' +
      '<div class="mt-5">' + body + '</div>' +
      '<div class="mt-6">' + demoNote('Applicants from apply.html are merged into this list automatically (deduplicated by email). Fictional demo profiles.') + '</div>';
  }

  function founderModal(id) {
    var f = null;
    founders().forEach(function (x) { if (x.id === id) f = x; });
    if (!f) return;
    var statusOptions = FOUNDER_STATUSES.map(function (s) {
      return '<option value="' + esc(s) + '"' + (f.status === s ? ' selected' : '') + '>' + esc(s) + '</option>';
    }).join('');
    openModal({
      title: f.name,
      body:
        '<div class="mb-4 flex flex-wrap items-center gap-2">' +
        badge(f.status, FOUNDER_TONE[f.status]) + badge(f.program, 'bg-softindigo text-primary') +
        '</div>' +
        '<dl class="grid gap-3 sm:grid-cols-2">' +
        '<div class="rounded-xl bg-softindigo/60 px-4 py-3"><dt class="text-[11px] font-bold uppercase tracking-wider text-muted">Email</dt><dd class="mt-1 text-sm font-semibold text-ink">' + esc(f.email) + '</dd></div>' +
        '<div class="rounded-xl bg-softindigo/60 px-4 py-3"><dt class="text-[11px] font-bold uppercase tracking-wider text-muted">Phone</dt><dd class="mt-1 text-sm font-semibold text-ink">' + esc(f.phone) + '</dd></div>' +
        '<div class="rounded-xl bg-softindigo/60 px-4 py-3"><dt class="text-[11px] font-bold uppercase tracking-wider text-muted">Startup</dt><dd class="mt-1 text-sm font-semibold text-ink">' + esc(f.startup) + '</dd></div>' +
        '<div class="rounded-xl bg-softindigo/60 px-4 py-3"><dt class="text-[11px] font-bold uppercase tracking-wider text-muted">Joined</dt><dd class="mt-1 text-sm font-semibold text-ink">' + esc(dateLabel(f.joined)) + '</dd></div>' +
        '</dl>' +
        '<div class="mt-5 border-t border-line pt-4">' +
        fieldWrap('founder-modal-status', 'Program status',
          '<select class="input" id="founder-modal-status" data-change="founder-status" data-id="' + esc(f.id) + '">' + statusOptions + '</select>',
          'Status changes save immediately.', false) +
        '</div>'
    });
  }

  /* =============================== STARTUPS ============================== */

  function renderStartups() {
    var list = startups();
    var cards = list.map(function (s) {
      var logo = s.image
        ? '<img src="' + esc(s.image) + '" alt="Logo of ' + esc(s.name) + '" width="80" height="80" class="h-14 w-14 rounded-xl border border-line object-cover" loading="lazy" />'
        : '<span class="grid h-14 w-14 place-items-center rounded-xl bg-softindigo font-display text-lg font-bold text-primary">' + esc(initials(s.name)) + '</span>';
      return '<article class="card card-hover flex flex-col p-5">' +
        '<div class="flex items-start justify-between gap-3">' + logo +
        '<div class="flex gap-1.5">' +
        '<button type="button" class="icon-btn h-9 w-9" data-action="startup-edit" data-id="' + esc(s.id) + '" aria-label="Edit ' + esc(s.name) + '" title="Edit">' + svg(I.pencil, 15) + '</button>' +
        '<button type="button" class="icon-btn h-9 w-9 hover:border-danger/50 hover:text-danger" data-action="startup-delete" data-id="' + esc(s.id) + '" aria-label="Delete ' + esc(s.name) + '" title="Delete">' + svg(I.trash, 15) + '</button>' +
        '</div></div>' +
        '<h3 class="mt-4 font-display text-lg font-bold text-ink">' + esc(s.name) + '</h3>' +
        '<div class="mt-2 flex flex-wrap gap-2">' + badge(s.industry, 'bg-softindigo text-primary') + badge(s.stage, 'bg-softorange text-secondary') + '</div>' +
        '<p class="mt-3 flex-1 text-sm leading-relaxed text-muted">' + esc(s.description) + '</p>' +
        '</article>';
    }).join('');

    return pageHead('Startups', 'Portfolio management — add, edit or retire demo startups.',
      '<button type="button" class="btn btn-primary btn-sm shrink-0" data-action="startup-add">' + svg(I.plus, 15) + 'Add startup</button>') +
      '<div class="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">' + cards + '</div>' +
      '<div class="mt-6">' + demoNote('Demo portfolio entries. Logo upload previews locally only — real uploads require secure backend storage.') + '</div>';
  }

  function startupModal(existing) {
    var s = existing || { name: '', industry: INDUSTRIES[0], stage: STAGES[0], description: '', image: '' };
    var preview = s.image
      ? '<img id="startup-logo-preview" src="' + esc(s.image) + '" alt="Startup logo preview" width="96" height="96" class="h-20 w-20 rounded-xl border border-line object-cover" />'
      : '<span id="startup-logo-preview" class="grid h-20 w-20 place-items-center rounded-xl bg-softindigo text-sm font-bold text-primary">Logo</span>';
    openModal({
      title: existing ? 'Edit startup' : 'Add startup',
      wide: true,
      body:
        '<form id="startup-form" novalidate>' +
        '<div class="mb-4 flex items-center gap-4">' + preview +
        '<div class="flex-1">' +
        fieldWrap('startup-logo', 'Logo image (demo)',
          '<input class="input lf-file" id="startup-logo" type="file" accept="image/png,image/jpeg,image/svg+xml">',
          'Preview only — images are not persisted in this frontend demo.', false) +
        '</div></div>' +
        textField('startup-name', 'Startup name', { required: true, value: s.name, placeholder: 'e.g. NovaMind AI' }) +
        '<div class="grid gap-4 sm:grid-cols-2">' +
        selectField('startup-industry', 'Industry', INDUSTRIES, s.industry, true) +
        selectField('startup-stage', 'Stage', STAGES, s.stage, true) +
        '</div>' +
        textareaField('startup-description', 'Description', { required: true, value: s.description, maxlength: 260, placeholder: 'One or two sentences about the product…' }) +
        '<div class="mt-2 flex justify-end gap-3">' +
        '<button type="button" class="btn btn-outline btn-sm" data-modal-close>Cancel</button>' +
        '<button type="submit" class="btn btn-primary btn-sm">' + (existing ? 'Save changes' : 'Add startup') + '</button>' +
        '</div></form>'
    });
    if (existing) {
      var form = document.getElementById('startup-form');
      form.dataset.editId = existing.id;
    }
  }

  function submitStartup(form) {
    var name = form.querySelector('#startup-name').value.trim();
    var description = form.querySelector('#startup-description').value.trim();
    if (!name || !description) {
      LF.form.showError(form.querySelector('#startup-name'), !name ? 'Startup name is required.' : '');
      LF.form.showError(form.querySelector('#startup-description'), !description ? 'A short description is required.' : '');
      LF.toast('Please complete the highlighted fields.', 'error');
      return;
    }
    var list = startups();
    var editId = form.dataset.editId;
    var logoInput = form.querySelector('#startup-logo');
    var logoFile = logoInput && logoInput.files && logoInput.files[0];
    var finish = function (imageData) {
      if (editId) {
        var idx = -1;
        list.forEach(function (s, i) { if (s.id === editId) idx = i; });
        if (idx >= 0) {
          list[idx] = Object.assign({}, list[idx], {
            name: name,
            industry: form.querySelector('#startup-industry').value,
            stage: form.querySelector('#startup-stage').value,
            description: description
          });
          if (imageData) list[idx].image = imageData;
        }
        LF.toast('Startup updated: ' + name, 'success');
      } else {
        list.push({
          id: LF.uid('st'),
          name: name,
          industry: form.querySelector('#startup-industry').value,
          stage: form.querySelector('#startup-stage').value,
          description: description,
          image: imageData || ''
        });
        LF.toast('Startup added to the portfolio: ' + name, 'success');
      }
      saveStartups(list);
      closeModal();
      render();
    };
    if (logoFile) {
      var reader = new FileReader();
      reader.onload = function () {
        var data = String(reader.result || '');
        finish(data.length < 200_000 ? data : '');
      };
      reader.onerror = function () { finish(''); };
      reader.readAsDataURL(logoFile);
    } else {
      finish('');
    }
  }

  /* =============================== PROGRAMS ============================== */

  function renderPrograms() {
    var list = programs();
    var rows = list.map(function (p) {
      var statusTone = { Open: 'bg-success/15 text-success', Upcoming: 'bg-primary/15 text-primary', Closed: 'bg-muted/15 text-muted' }[p.status];
      return '<tr>' +
        '<td><p class="font-semibold text-ink">' + esc(p.name) + '</p><p class="mt-0.5 max-w-md text-xs text-muted">' + esc(p.description) + '</p></td>' +
        '<td class="whitespace-nowrap">' + badge(p.duration, 'bg-softindigo text-primary') + '</td>' +
        '<td class="text-sm text-muted">' + esc(p.eligibility) + '</td>' +
        '<td>' + badge(p.status, statusTone) + '</td>' +
        '<td class="whitespace-nowrap">' +
        '<button type="button" class="btn btn-outline btn-sm" data-action="program-edit" data-id="' + esc(p.id) + '">' + svg(I.pencil, 14) + 'Edit</button>' +
        '<button type="button" class="btn btn-ghost btn-sm text-danger hover:bg-danger/10" data-action="program-delete" data-id="' + esc(p.id) + '">' + svg(I.trash, 14) + 'Delete</button>' +
        '</td></tr>';
    }).join('');

    return pageHead('Programs', 'Tracks, durations, eligibility and availability (sample content until verified).',
      '<button type="button" class="btn btn-primary btn-sm shrink-0" data-action="program-add">' + svg(I.plus, 15) + 'Add program</button>') +
      '<div class="mt-6"><div class="table-wrap"><table class="data-table">' +
      '<thead><tr><th>Program</th><th>Duration</th><th>Eligibility</th><th>Status</th><th>Actions</th></tr></thead>' +
      '<tbody>' + rows + '</tbody></table></div></div>' +
      '<div class="mt-6">' + demoNote('Program details are editable sample content — update them once each track is officially confirmed.') + '</div>';
  }

  function programModal(existing) {
    var p = existing || { name: '', duration: '', eligibility: '', status: 'Open', description: '' };
    openModal({
      title: existing ? 'Edit program' : 'Add program',
      wide: true,
      body:
        '<form id="program-form" novalidate>' +
        textField('program-name', 'Program name', { required: true, value: p.name, placeholder: 'e.g. Pre-Seed Acceleration' }) +
        '<div class="grid gap-4 sm:grid-cols-2">' +
        textField('program-duration', 'Duration', { required: true, value: p.duration, placeholder: 'e.g. 8 weeks' }) +
        selectField('program-status', 'Status', PROGRAM_STATUSES, p.status, true) +
        '</div>' +
        textField('program-eligibility', 'Eligibility', { required: true, value: p.eligibility, maxlength: 160, placeholder: 'Who should apply…' }) +
        textareaField('program-description', 'Description', { required: true, value: p.description, maxlength: 260, placeholder: 'What founders experience in this track…' }) +
        '<div class="mt-2 flex justify-end gap-3">' +
        '<button type="button" class="btn btn-outline btn-sm" data-modal-close>Cancel</button>' +
        '<button type="submit" class="btn btn-primary btn-sm">' + (existing ? 'Save changes' : 'Add program') + '</button>' +
        '</div></form>'
    });
    if (existing) document.getElementById('program-form').dataset.editId = existing.id;
  }

  function submitProgram(form) {
    var name = form.querySelector('#program-name').value.trim();
    var duration = form.querySelector('#program-duration').value.trim();
    var eligibility = form.querySelector('#program-eligibility').value.trim();
    var description = form.querySelector('#program-description').value.trim();
    if (!name || !duration || !eligibility || !description) {
      LF.toast('Please complete all required fields.', 'error');
      return;
    }
    var list = programs();
    var editId = form.dataset.editId;
    var record = {
      name: name, duration: duration, eligibility: eligibility, description: description,
      status: form.querySelector('#program-status').value
    };
    if (editId) {
      var idx = -1;
      list.forEach(function (p, i) { if (p.id === editId) idx = i; });
      if (idx >= 0) list[idx] = Object.assign({}, list[idx], record);
      LF.toast('Program updated: ' + name, 'success');
    } else {
      list.push(Object.assign({ id: LF.uid('pr') }, record));
      LF.toast('Program added: ' + name, 'success');
    }
    savePrograms(list);
    closeModal();
    render();
  }

  /* ================================ MENTORS ============================== */

  function renderMentors() {
    var list = mentors();
    var rows = list.map(function (m) {
      var availabilityOptions = AVAILABILITY.map(function (a) {
        return '<option value="' + esc(a) + '"' + (m.availability === a ? ' selected' : '') + '>' + esc(a) + '</option>';
      }).join('');
      var avatar = m.image
        ? '<img src="' + esc(m.image) + '" alt="Portrait of ' + esc(m.name) + '" width="40" height="40" class="h-10 w-10 rounded-full border border-line object-cover" loading="lazy" />'
        : '<span class="grid h-10 w-10 place-items-center rounded-full bg-primary/15 text-xs font-bold text-primary">' + esc(initials(m.name)) + '</span>';
      return '<tr>' +
        '<td><div class="flex items-center gap-3">' + avatar + '<span class="font-semibold text-ink">' + esc(m.name) + '</span></div></td>' +
        '<td><p class="text-sm text-ink">' + esc((m.expertise || []).join(', ')) + '</p><p class="mt-0.5 max-w-sm text-xs text-muted">' + esc(m.bio) + '</p></td>' +
        '<td><select class="lf-inline-select" data-change="mentor-availability" data-id="' + esc(m.id) + '" aria-label="Availability for ' + esc(m.name) + '">' + availabilityOptions + '</select></td>' +
        '<td class="text-center font-display font-bold text-ink">' + Number(m.sessions || 0) + '</td>' +
        '<td class="whitespace-nowrap">' +
        '<button type="button" class="btn btn-outline btn-sm" data-action="mentor-edit" data-id="' + esc(m.id) + '">' + svg(I.pencil, 14) + 'Edit</button>' +
        '<button type="button" class="btn btn-ghost btn-sm text-danger hover:bg-danger/10" data-action="mentor-delete" data-id="' + esc(m.id) + '">' + svg(I.trash, 14) + 'Remove</button>' +
        '</td></tr>';
    }).join('');

    return pageHead('Mentors', 'Directory and availability for the demo mentor pool.',
      '<button type="button" class="btn btn-primary btn-sm shrink-0" data-action="mentor-add">' + svg(I.plus, 15) + 'Add mentor</button>') +
      '<div class="mt-6"><div class="table-wrap"><table class="data-table">' +
      '<thead><tr><th>Mentor</th><th>Expertise</th><th>Availability</th><th>Sessions</th><th>Actions</th></tr></thead>' +
      '<tbody>' + rows + '</tbody></table></div></div>' +
      '<div class="mt-6">' + demoNote('Fictional demo mentor profiles — replace with real mentors and their real availability.') + '</div>';
  }

  function mentorModal(existing) {
    var m = existing || { name: '', expertise: [], bio: '', availability: 'Available', sessions: 0, image: '' };
    openModal({
      title: existing ? 'Edit mentor' : 'Add mentor',
      wide: true,
      body:
        '<form id="mentor-form" novalidate>' +
        textField('mentor-name', 'Full name', { required: true, value: m.name, placeholder: 'e.g. Amara Okafor' }) +
        textField('mentor-expertise', 'Expertise', { required: true, value: (m.expertise || []).join(', '), placeholder: 'e.g. Product Strategy, Roadmapping', hint: 'Comma-separated expertise tags.' }) +
        textareaField('mentor-bio', 'Short bio', { required: true, value: m.bio, maxlength: 220, placeholder: 'One or two sentences about their experience…' }) +
        '<div class="grid gap-4 sm:grid-cols-2">' +
        selectField('mentor-availability', 'Availability', AVAILABILITY, m.availability, true) +
        textField('mentor-sessions', 'Sessions delivered', { type: 'number', value: String(m.sessions || 0), min: '0', required: true }) +
        '</div>' +
        '<div class="mt-4">' +
        fieldWrap('mentor-image', 'Portrait image (demo)',
          '<input class="input lf-file" id="mentor-image" type="file" accept="image/png,image/jpeg">',
          'Preview only — not persisted in this frontend demo.', false) +
        '</div>' +
        '<div class="mt-2 flex justify-end gap-3">' +
        '<button type="button" class="btn btn-outline btn-sm" data-modal-close>Cancel</button>' +
        '<button type="submit" class="btn btn-primary btn-sm">' + (existing ? 'Save changes' : 'Add mentor') + '</button>' +
        '</div></form>'
    });
    if (existing) document.getElementById('mentor-form').dataset.editId = existing.id;
  }

  function submitMentor(form) {
    var name = form.querySelector('#mentor-name').value.trim();
    var expertise = form.querySelector('#mentor-expertise').value.split(',').map(function (x) { return x.trim(); }).filter(Boolean);
    var bio = form.querySelector('#mentor-bio').value.trim();
    if (!name || !expertise.length || !bio) {
      LF.toast('Please complete all required fields.', 'error');
      return;
    }
    var list = mentors();
    var editId = form.dataset.editId;
    var record = {
      name: name, expertise: expertise, bio: bio,
      availability: form.querySelector('#mentor-availability').value,
      sessions: Number(form.querySelector('#mentor-sessions').value) || 0
    };
    var imgInput = form.querySelector('#mentor-image');
    var finish = function (imageData) {
      if (editId) {
        var idx = -1;
        list.forEach(function (m, i) { if (m.id === editId) idx = i; });
        if (idx >= 0) {
          list[idx] = Object.assign({}, list[idx], record);
          if (imageData) list[idx].image = imageData;
        }
        LF.toast('Mentor updated: ' + name, 'success');
      } else {
        list.push(Object.assign({ id: LF.uid('me'), image: imageData || '' }, record));
        LF.toast('Mentor added: ' + name, 'success');
      }
      saveMentors(list);
      closeModal();
      render();
    };
    if (imgInput && imgInput.files && imgInput.files[0]) {
      var reader = new FileReader();
      reader.onload = function () {
        var data = String(reader.result || '');
        finish(data.length < 200_000 ? data : '');
      };
      reader.onerror = function () { finish(''); };
      reader.readAsDataURL(imgInput.files[0]);
    } else {
      finish('');
    }
  }

  /* =============================== SESSIONS ============================== */

  function renderSessions() {
    var list = sessions();
    var rows = list.map(function (s) {
      var actions = [];
      if (s.status === 'Requested') {
        actions.push('<button type="button" class="btn btn-primary btn-sm" data-action="session-approve" data-id="' + esc(s.id) + '">' + svg(I.check, 14) + 'Approve</button>');
      }
      if (s.status === 'Requested' || s.status === 'Confirmed') {
        actions.push('<button type="button" class="btn btn-outline btn-sm" data-action="session-reschedule" data-id="' + esc(s.id) + '">' + svg(I.calendar, 14) + 'Reschedule</button>');
        actions.push('<button type="button" class="btn btn-ghost btn-sm text-danger hover:bg-danger/10" data-action="session-cancel" data-id="' + esc(s.id) + '">' + svg(I.x, 14) + 'Cancel</button>');
      } else {
        actions.push('<span class="text-xs font-medium text-muted">No actions</span>');
      }
      return '<tr>' +
        '<td><p class="font-semibold text-ink">' + esc(s.founder || '—') + '</p><p class="text-xs text-muted">' + esc(s.startup || '') + '</p></td>' +
        '<td><p class="font-semibold text-ink">' + esc(s.mentor) + '</p><p class="text-xs text-muted">' + esc(s.mentorRole || '') + '</p></td>' +
        '<td class="whitespace-nowrap">' + esc(dateLabel(s.date)) + '<p class="text-xs text-muted">' + esc(s.time) + '</p></td>' +
        '<td class="max-w-xs"><p class="truncate text-sm text-muted" title="' + esc(s.goals) + '">' + esc(s.goals) + '</p></td>' +
        '<td>' + badge(s.status, SESSION_TONE[s.status]) + '</td>' +
        '<td class="whitespace-nowrap">' + actions.join(' ') + '</td>' +
        '</tr>';
    }).join('');

    return pageHead('Mentor Sessions', 'Requests made by founders across the platform (shared with the founder dashboard).') +
      '<div class="mt-6"><div class="table-wrap"><table class="data-table">' +
      '<thead><tr><th>Founder</th><th>Mentor</th><th>Date &amp; time</th><th>Goals</th><th>Status</th><th>Actions</th></tr></thead>' +
      '<tbody>' + rows + '</tbody></table></div></div>' +
      '<div class="mt-6">' + demoNote('Approving, rescheduling or cancelling updates the shared demo session list and toasts confirmation.') + '</div>';
  }

  function sessionRescheduleModal(id) {
    var s = null;
    sessions().forEach(function (x) { if (x.id === id) s = x; });
    if (!s) return;
    var slots = ['09:00 – 10:00', '10:00 – 11:00', '11:00 – 12:00', '12:00 – 13:00', '14:00 – 15:00', '15:00 – 16:00', '16:00 – 17:00'];
    var options = slots.map(function (t) {
      return '<option value="' + esc(t) + '"' + (s.time === t ? ' selected' : '') + '>' + esc(t) + '</option>';
    }).join('');
    openModal({
      title: 'Reschedule session',
      body:
        '<p class="mb-4 text-sm text-muted">Session with <strong class="text-ink">' + esc(s.mentor) + '</strong> for ' + esc(s.founder) + '.</p>' +
        '<form id="reschedule-form" novalidate>' +
        '<input type="hidden" name="id" value="' + esc(s.id) + '">' +
        textField('reschedule-date', 'New date', { type: 'date', required: true, value: s.date, min: toIso(today()) }) +
        selectField('reschedule-time', 'New time', slots, s.time, true) +
        '<div class="mt-2 flex justify-end gap-3">' +
        '<button type="button" class="btn btn-outline btn-sm" data-modal-close>Cancel</button>' +
        '<button type="submit" class="btn btn-primary btn-sm">Save new time</button>' +
        '</div></form>'
    });
  }

  /* ============================== MILESTONES ============================= */

  function renderMilestones() {
    var all = milestones();
    var startupsList = startups();
    var startupNames = ['All startups'].concat(
      startupsList.map(function (s) { return s.name; }).concat(
        all.map(function (m) { return m.startup; }).filter(function (n) { return n && n !== 'Unassigned'; })
      ).filter(function (v, i, arr) { return arr.indexOf(v) === i; })
    );

    var counts = { total: all.length, completed: 0, inProgress: 0, overdue: 0 };
    all.forEach(function (m) {
      var st = milestoneStatus(m);
      if (st === 'Completed') counts.completed++;
      else if (st === 'Overdue') counts.overdue++;
      else if (st === 'In Progress') counts.inProgress++;
    });

    var stats =
      '<div class="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">' +
      statCard({ tone: 'bg-primary/15 text-primary', icon: I.flag, value: counts.total, label: 'Total milestones' }) +
      statCard({ tone: 'bg-success/15 text-success', icon: I.checkCircle, value: counts.completed, label: 'Completed' }) +
      statCard({ tone: 'bg-warning/15 text-warning', icon: I.clock, value: counts.inProgress, label: 'In progress' }) +
      statCard({ tone: 'bg-danger/15 text-danger', icon: I.alert, value: counts.overdue, label: 'Overdue' }) +
      '</div>';

    var filter = '<div class="mb-4 flex flex-wrap items-center gap-3">' +
      '<label class="text-sm font-semibold text-ink" for="milestone-startup">Startup</label>' +
      '<select class="input w-auto" id="milestone-startup" data-change="milestone-startup">' +
      startupNames.map(function (n) {
        return '<option value="' + esc(n) + '"' + (state.milestoneStartup === n ? ' selected' : '') + '>' + esc(n) + '</option>';
      }).join('') +
      '</select></div>';

    var visible = all.filter(function (m) {
      return !state.milestoneStartup || state.milestoneStartup === 'All startups' || m.startup === state.milestoneStartup;
    });

    var rows = visible.map(function (m) {
      var st = milestoneStatus(m);
      var overdue = st === 'Overdue';
      return '<tr' + (overdue ? ' class="bg-danger/5"' : '') + '>' +
        '<td><p class="font-semibold text-ink">' + esc(m.title) + '</p><p class="text-xs text-muted">' + esc(m.founder || '') + '</p></td>' +
        '<td class="text-sm text-ink">' + esc(m.startup || '—') + '</td>' +
        '<td class="whitespace-nowrap">' + esc(dateLabel(m.dueDate)) + (overdue ? '<p class="text-[11px] font-semibold text-danger">overdue</p>' : '') + '</td>' +
        '<td class="min-w-36">' + progressBar(m.progress) + '<p class="mt-1 text-[11px] font-semibold text-muted">' + Number(m.progress || 0) + '%</p></td>' +
        '<td>' + badge(st, MILESTONE_TONE[st]) + '</td>' +
        '<td><button type="button" class="btn btn-outline btn-sm" data-action="milestone-toggle" data-id="' + esc(m.id) + '">' +
        (st === 'Completed' ? svg(I.refresh, 14) + 'Reopen' : svg(I.check, 14) + 'Complete') + '</button></td>' +
        '</tr>';
    }).join('');

    var body = visible.length
      ? '<div class="table-wrap"><table class="data-table">' +
        '<thead><tr><th>Milestone</th><th>Startup</th><th>Due</th><th>Progress</th><th>Status</th><th>Action</th></tr></thead>' +
        '<tbody>' + rows + '</tbody></table></div>'
      : emptyState({
          tone: 'bg-softindigo text-primary', icon: I.flag,
          title: 'No milestones for this startup',
          body: 'Choose a different startup or clear the filter.'
        });

    return pageHead('Milestones', 'Founder progress across the portfolio (shared with the founder dashboard).') +
      stats + filter + body +
      '<div class="mt-6">' + demoNote('Milestones come from the founder console and are editable there. Completion toggles sync both ways through localStorage.') + '</div>';
  }

  /* ============================== PITCH DECKS ============================ */

  function renderDecks() {
    var list = decks();
    var rows = list.map(function (d) {
      var typeTone = d.type === 'PDF' ? 'bg-danger/15 text-danger' : 'bg-primary/15 text-primary';
      return '<tr>' +
        '<td><p class="font-semibold text-ink">' + esc(d.founder) + '</p><p class="text-xs text-muted">' + esc(d.startup) + '</p></td>' +
        '<td><p class="font-semibold text-ink">' + esc(d.startup) + '</p></td>' +
        '<td><p class="flex items-center gap-2 text-sm text-ink">' + svg(I.file, 15) + esc(d.name) + '</p></td>' +
        '<td>' + badge(d.type, typeTone) + '</td>' +
        '<td class="whitespace-nowrap text-sm text-muted">' + esc(fileSize(d.size)) + '</td>' +
        '<td class="whitespace-nowrap">' + esc(dateLabel(d.uploadedAt)) + '</td>' +
        '<td><button type="button" class="btn btn-outline btn-sm" data-action="deck-view" data-id="' + esc(d.id) + '">' + svg(I.eye, 14) + 'View</button></td>' +
        '</tr>';
    }).join('');

    return pageHead('Pitch Decks', 'Submitted deck metadata from founders (demo submissions).') +
      '<div class="mt-6"><div class="table-wrap"><table class="data-table">' +
      '<thead><tr><th>Founder</th><th>Startup</th><th>File</th><th>Type</th><th>Size</th><th>Submitted</th><th>Actions</th></tr></thead>' +
      '<tbody>' + rows + '</tbody></table></div></div>' +
      '<div class="mt-6">' + demoNote('Frontend demonstration: only file metadata is stored — never the file itself. Real pitch decks require secure backend storage and access control.') + '</div>';
  }

  function deckModal(id) {
    var d = null;
    decks().forEach(function (x) { if (x.id === id) d = x; });
    if (!d) return;
    openModal({
      title: 'Pitch deck — metadata',
      body:
        '<dl class="grid gap-3 sm:grid-cols-2">' +
        '<div class="rounded-xl bg-softindigo/60 px-4 py-3"><dt class="text-[11px] font-bold uppercase tracking-wider text-muted">Founder</dt><dd class="mt-1 text-sm font-semibold text-ink">' + esc(d.founder) + '</dd></div>' +
        '<div class="rounded-xl bg-softindigo/60 px-4 py-3"><dt class="text-[11px] font-bold uppercase tracking-wider text-muted">Startup</dt><dd class="mt-1 text-sm font-semibold text-ink">' + esc(d.startup) + '</dd></div>' +
        '<div class="rounded-xl bg-softindigo/60 px-4 py-3"><dt class="text-[11px] font-bold uppercase tracking-wider text-muted">File name</dt><dd class="mt-1 break-all text-sm font-semibold text-ink">' + esc(d.name) + '</dd></div>' +
        '<div class="rounded-xl bg-softindigo/60 px-4 py-3"><dt class="text-[11px] font-bold uppercase tracking-wider text-muted">Type / size</dt><dd class="mt-1 text-sm font-semibold text-ink">' + esc(d.type) + ' · ' + esc(fileSize(d.size)) + '</dd></div>' +
        '<div class="rounded-xl bg-softindigo/60 px-4 py-3 sm:col-span-2"><dt class="text-[11px] font-bold uppercase tracking-wider text-muted">Submitted</dt><dd class="mt-1 text-sm font-semibold text-ink">' + esc(dateLabel(d.uploadedAt)) + '</dd></div>' +
        '</dl>' +
        '<p class="mt-4 flex items-start gap-2.5 rounded-xl border border-line bg-surface px-4 py-3 text-xs leading-relaxed text-muted">' +
        '<span class="mt-0.5 shrink-0 text-secondary">' + svg(I.info, 15) + '</span>' +
        '<span>This is a frontend demo. The deck file itself was never stored or transmitted — only these metadata fields exist.</span></p>'
    });
  }

  /* ============================= NOTIFICATIONS =========================== */

  function renderNotifications() {
    var list = notifications();
    var items = list.map(function (n) {
      return '<li class="flex items-start gap-4 border-b border-line px-1 py-4 last:border-0">' +
        '<span class="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl ' + (NOTIF_TONE[n.type] || NOTIF_TONE.system) + '">' + svg(notifIcon(n.type), 17) + '</span>' +
        '<div class="min-w-0 flex-1">' +
        '<div class="flex flex-wrap items-center gap-2">' +
        '<p class="font-display text-sm font-bold text-ink">' + esc(n.title) + '</p>' +
        (n.read ? '' : '<span class="badge bg-primary/15 text-primary">New</span>') +
        '</div>' +
        '<p class="mt-1 text-sm leading-relaxed text-muted">' + esc(n.body) + '</p>' +
        '<p class="mt-1.5 text-[11px] font-medium text-muted">' + esc(dateLabel(n.date)) + '</p>' +
        '</div>' +
        (!n.read ? '<button type="button" class="btn btn-ghost btn-sm shrink-0" data-action="notif-read" data-id="' + esc(n.id) + '">Mark read</button>' : '') +
        '</li>';
    }).join('');

    return pageHead('Notifications', 'Platform activity alerts — application, session, deck and milestone events.') +
      '<div class="mt-6 flex justify-end">' +
      '<button type="button" class="btn btn-outline btn-sm" data-action="notif-read-all">' + svg(I.check, 15) + 'Mark all as read</button>' +
      '</div>' +
      '<div class="card mt-4 p-5 sm:p-6">' +
      (list.length ? '<ul>' + items + '</ul>' : emptyState({ tone: 'bg-softindigo text-primary', icon: I.bell, title: 'All caught up', body: 'No notifications right now.' })) +
      '</div>';
  }

  /* =============================== SETTINGS ============================== */

  function renderSettings() {
    var s = settings();
    var u = adminUser();

    var profileCard = sectionCard('Admin profile', 'How your identity appears across the console.',
      '',
      '<form id="admin-profile-form" novalidate>' +
      textField('admin-name', 'Full name', { required: true, value: s.adminName || u.name }) +
      textField('admin-email', 'Email', { type: 'email', required: true, value: s.adminEmail || u.email }) +
      '<div class="flex justify-end"><button type="submit" class="btn btn-primary btn-sm">Save profile</button></div>' +
      '</form>');

    var platformCard = sectionCard('Platform settings', 'Demo switches — saved locally, never applied to a real server.',
      '',
      '<form id="admin-platform-form" novalidate>' +
      textField('platform-sitename', 'Platform name', { required: true, value: s.siteName }) +
      textField('platform-support', 'Support email', { type: 'email', required: true, value: s.supportEmail }) +
      '<label class="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-line px-4 py-3">' +
      '<span><span class="block text-sm font-semibold text-ink">Applications open</span>' +
      '<span class="mt-0.5 block text-xs text-muted">Allow new startup applications (demo toggle).</span></span>' +
      '<input type="checkbox" id="platform-applications-open" class="h-5 w-10 accent-primary"' + (s.applicationsOpen ? ' checked' : '') + '>' +
      '</label>' +
      '<div class="flex justify-end"><button type="submit" class="btn btn-primary btn-sm">Save platform settings</button></div>' +
      '</form>');

    var notifCard = sectionCard('Notification preferences', 'Which platform events reach the admin inbox (demo).',
      '',
      '<form id="admin-notif-form">' +
      '<label class="flex cursor-pointer items-center gap-3 py-2.5">' +
      '<input type="checkbox" id="notif-digest" class="h-5 w-5 accent-primary"' + (s.emailDigest ? ' checked' : '') + '>' +
      '<span class="text-sm font-medium text-ink">Weekly email digest</span></label>' +
      '<label class="flex cursor-pointer items-center gap-3 py-2.5">' +
      '<input type="checkbox" id="notif-applications" class="h-5 w-5 accent-primary"' + (s.notifyApplications ? ' checked' : '') + '>' +
      '<span class="text-sm font-medium text-ink">New application alerts</span></label>' +
      '<label class="flex cursor-pointer items-center gap-3 py-2.5">' +
      '<input type="checkbox" id="notif-sessions" class="h-5 w-5 accent-primary"' + (s.notifySessions ? ' checked' : '') + '>' +
      '<span class="text-sm font-medium text-ink">Mentor session requests</span></label>' +
      '<div class="mt-2 flex justify-end"><button type="submit" class="btn btn-primary btn-sm">Save preferences</button></div>' +
      '</form>');

    var dangerCard = sectionCard('Danger zone', 'Reset every locally stored demo item.',
      '',
      '<p class="text-sm leading-relaxed text-muted">Clears applications, founders, startups, programs, mentors, sessions, milestones, decks, notifications and settings stored in this browser. Theme and direction preferences are kept.</p>' +
      '<div class="mt-4"><button type="button" class="btn btn-sm bg-danger text-white hover:bg-danger/90" data-reset-demo>' + svg(I.refresh, 15) + 'Reset demo data</button></div>');

    return pageHead('Settings', 'Admin profile, platform preferences and the demo danger zone.') +
      '<div class="mt-6 grid gap-6 lg:grid-cols-2">' + profileCard + platformCard + '</div>' +
      '<div class="mt-6 grid gap-6 lg:grid-cols-2">' + notifCard + dangerCard + '</div>';
  }

  function submitAdminProfile(form) {
    var s = settings();
    s.adminName = form.querySelector('#admin-name').value.trim();
    s.adminEmail = form.querySelector('#admin-email').value.trim();
    if (!LF.form.isEmail(s.adminEmail)) {
      LF.form.showError(form.querySelector('#admin-email'), 'Please enter a valid email address.');
      LF.toast('Please fix the highlighted fields.', 'error');
      return;
    }
    saveSettings(s);
    identityToTopbar();
    LF.toast('Admin profile saved (demo).', 'success');
    render();
  }

  function submitPlatformSettings(form) {
    var s = settings();
    s.siteName = form.querySelector('#platform-sitename').value.trim() || s.siteName;
    var email = form.querySelector('#platform-support').value.trim();
    if (!LF.form.isEmail(email)) {
      LF.form.showError(form.querySelector('#platform-support'), 'Please enter a valid email address.');
      LF.toast('Please fix the highlighted fields.', 'error');
      return;
    }
    s.supportEmail = email;
    s.applicationsOpen = form.querySelector('#platform-applications-open').checked;
    saveSettings(s);
    LF.toast('Platform settings saved (demo).', 'success');
    render();
  }

  function submitNotifSettings(form) {
    var s = settings();
    s.emailDigest = form.querySelector('#notif-digest').checked;
    s.notifyApplications = form.querySelector('#notif-applications').checked;
    s.notifySessions = form.querySelector('#notif-sessions').checked;
    saveSettings(s);
    LF.toast('Notification preferences saved (demo).', 'success');
    render();
  }

  /* =========================== EVENT DELEGATION ========================== */

  function findById(list, id) {
    var found = null;
    list.forEach(function (item) { if (item.id === id) found = item; });
    return found;
  }

  function doLogout() {
    LF.confirm({
      title: 'Log out of the console?',
      message: 'You will be returned to the demo login page. Locally stored demo data stays in this browser.',
      confirmLabel: 'Log out',
      tone: 'primary'
    }).then(function (ok) {
      if (!ok) return;
      if (window.LFAuth && typeof window.LFAuth.logout === 'function') window.LFAuth.logout();
      else location.href = BASE + 'login.html';
    });
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('[data-action]');
    if (!btn) return;
    var action = btn.getAttribute('data-action');

    switch (action) {
      case 'app-view':
        applicationModal(btn.getAttribute('data-id'));
        break;
      case 'app-clear-filters':
        state.appQuery = ''; state.appIndustry = ''; state.appStage = ''; state.appStatus = '';
        render();
        break;

      case 'founder-view':
        founderModal(btn.getAttribute('data-id'));
        break;
      case 'founder-clear-filters':
        state.founderQuery = ''; state.founderStatus = '';
        render();
        break;

      case 'startup-add':
        startupModal(null);
        break;
      case 'startup-edit': {
        var s = findById(startups(), btn.getAttribute('data-id'));
        if (s) startupModal(s);
        break;
      }
      case 'startup-delete': {
        var victim = findById(startups(), btn.getAttribute('data-id'));
        if (!victim) break;
        LF.confirm({
          title: 'Delete startup?',
          message: '"' + victim.name + '" will be removed from the demo portfolio. This cannot be undone.',
          confirmLabel: 'Delete'
        }).then(function (ok) {
          if (!ok) return;
          saveStartups(startups().filter(function (x) { return x.id !== victim.id; }));
          LF.toast('Startup removed: ' + victim.name, 'success');
          render();
        });
        break;
      }

      case 'program-add':
        programModal(null);
        break;
      case 'program-edit': {
        var p = findById(programs(), btn.getAttribute('data-id'));
        if (p) programModal(p);
        break;
      }
      case 'program-delete': {
        var pv = findById(programs(), btn.getAttribute('data-id'));
        if (!pv) break;
        LF.confirm({
          title: 'Delete program?',
          message: '"' + pv.name + '" will be removed. This cannot be undone.',
          confirmLabel: 'Delete'
        }).then(function (ok) {
          if (!ok) return;
          savePrograms(programs().filter(function (x) { return x.id !== pv.id; }));
          LF.toast('Program removed: ' + pv.name, 'success');
          render();
        });
        break;
      }

      case 'mentor-add':
        mentorModal(null);
        break;
      case 'mentor-edit': {
        var m = findById(mentors(), btn.getAttribute('data-id'));
        if (m) mentorModal(m);
        break;
      }
      case 'mentor-delete': {
        var mv = findById(mentors(), btn.getAttribute('data-id'));
        if (!mv) break;
        LF.confirm({
          title: 'Remove mentor?',
          message: mv.name + ' will be removed from the demo directory. This cannot be undone.',
          confirmLabel: 'Remove'
        }).then(function (ok) {
          if (!ok) return;
          saveMentors(mentors().filter(function (x) { return x.id !== mv.id; }));
          LF.toast('Mentor removed: ' + mv.name, 'success');
          render();
        });
        break;
      }

      case 'session-approve': {
        var list = sessions();
        var target = findById(list, btn.getAttribute('data-id'));
        if (!target) break;
        list.forEach(function (x) { if (x.id === target.id) x.status = 'Confirmed'; });
        saveSessions(list);
        pushNotification('session', 'Session approved', target.founder + ' — ' + target.mentor + ' on ' + dateLabel(target.date) + '.');
        LF.toast('Session approved for ' + target.founder + '.', 'success');
        render();
        break;
      }
      case 'session-reschedule':
        sessionRescheduleModal(btn.getAttribute('data-id'));
        break;
      case 'session-cancel': {
        var list2 = sessions();
        var target2 = findById(list2, btn.getAttribute('data-id'));
        if (!target2) break;
        LF.confirm({
          title: 'Cancel session?',
          message: 'The session between ' + target2.founder + ' and ' + target2.mentor + ' will be cancelled.',
          confirmLabel: 'Cancel session'
        }).then(function (ok) {
          if (!ok) return;
          var l = sessions();
          l.forEach(function (x) { if (x.id === target2.id) x.status = 'Cancelled'; });
          saveSessions(l);
          LF.toast('Session cancelled.', 'success');
          render();
        });
        break;
      }

      case 'milestone-toggle': {
        var msList = milestones();
        var ms = findById(msList, btn.getAttribute('data-id'));
        if (!ms) break;
        msList.forEach(function (x) {
          if (x.id === ms.id) x.progress = Number(ms.progress) >= 100 ? 0 : 100;
        });
        saveMilestones(msList);
        LF.toast(Number(ms.progress) >= 100 ? 'Milestone reopened: ' + ms.title : 'Milestone completed: ' + ms.title, 'success');
        render();
        break;
      }

      case 'deck-view':
        deckModal(btn.getAttribute('data-id'));
        break;

      case 'notif-read': {
        var nList = notifications();
        var n = findById(nList, btn.getAttribute('data-id'));
        if (n) {
          nList.forEach(function (x) { if (x.id === n.id) x.read = true; });
          saveNotifications(nList);
          updateBell();
          render();
        }
        break;
      }
      case 'notif-read-all': {
        var all = notifications().map(function (x) { x.read = true; return x; });
        saveNotifications(all);
        LF.toast('All notifications marked as read.', 'success');
        render();
        break;
      }
    }
  });

  /* change events (status selects, availability, reschedule, filters) */
  document.addEventListener('change', function (e) {
    var el = e.target.closest && e.target.closest('[data-change]');
    if (!el) return;
    var kind = el.getAttribute('data-change');

    switch (kind) {
      case 'app-status-update': {
        var id = el.getAttribute('data-id');
        var list = applications();
        var app = findById(list, id);
        if (!app) return;
        list.forEach(function (x) { if (x.id === id) x.status = el.value; });
        saveApplications(list);
        pushNotification('application', 'Application status updated', app.startupName + ' moved to "' + el.value + '".');
        LF.toast(app.startupName + ' → ' + el.value, 'success');
        updateBell();
        render();
        break;
      }
      case 'founder-status': {
        var fid = el.getAttribute('data-id');
        var flist = LF.store.get(FOUNDERS_KEY, null);
        if (!Array.isArray(flist)) flist = [];
        var changed = findById(flist, fid);
        if (!changed) {
          /* Applicants merged from the application pipeline are persisted
             as founders the first time their status is edited. */
          var merged = null;
          founders().forEach(function (x) { if (x.id === fid) merged = x; });
          if (merged) {
            changed = Object.assign({}, merged, { status: el.value });
            flist.push(changed);
          }
        } else {
          flist.forEach(function (x) { if (x.id === fid) x.status = el.value; });
        }
        if (changed) {
          saveFounders(flist);
          LF.toast(changed.name + ' → ' + el.value, 'success');
          render();
        }
        break;
      }
      case 'mentor-availability': {
        var mid = el.getAttribute('data-id');
        var mlist = mentors();
        var mentor = findById(mlist, mid);
        if (!mentor) return;
        mlist.forEach(function (x) { if (x.id === mid) x.availability = el.value; });
        saveMentors(mlist);
        LF.toast(mentor.name + ' is now ' + el.value.toLowerCase() + '.', 'success');
        render();
        break;
      }
      case 'milestone-startup':
        state.milestoneStartup = el.value;
        render();
        break;
      case 'app-industry':
        state.appIndustry = el.value;
        render();
        break;
      case 'app-stage':
        state.appStage = el.value;
        render();
        break;
      case 'app-status-filter':
        state.appStatus = el.value;
        render();
        break;
      case 'reschedule-date':
      case 'reschedule-time':
        /* handled by the form submit */
        break;
    }
  });

  /* input events (debounced searches) */
  document.addEventListener('input', function (e) {
    var el = e.target.closest && e.target.closest('[data-input]');
    if (!el) return;
    var kind = el.getAttribute('data-input');
    if (kind === 'app-search') {
      LF.debounce(function () {
        state.appQuery = el.value;
        render();
        var box = document.getElementById('app-search');
        if (box) {
          box.focus();
          box.setSelectionRange(box.value.length, box.value.length);
        }
      }, 220)();
    } else if (kind === 'founder-search') {
      LF.debounce(function () {
        state.founderQuery = el.value;
        render();
        var box = document.getElementById('founder-search');
        if (box) {
          box.focus();
          box.setSelectionRange(box.value.length, box.value.length);
        }
      }, 220)();
    }
  });

  /* form submissions (delegated) */
  document.addEventListener('submit', function (e) {
    var form = e.target;
    if (form.id === 'startup-form') {
      e.preventDefault();
      submitStartup(form);
    } else if (form.id === 'program-form') {
      e.preventDefault();
      submitProgram(form);
    } else if (form.id === 'mentor-form') {
      e.preventDefault();
      submitMentor(form);
    } else if (form.id === 'reschedule-form') {
      e.preventDefault();
      var id = form.querySelector('input[name="id"]').value;
      var list = sessions();
      var s = findById(list, id);
      if (s) {
        var date = form.querySelector('#reschedule-date').value;
        var time = form.querySelector('#reschedule-time').value;
        if (!date) {
          LF.form.showError(form.querySelector('#reschedule-date'), 'Pick a new date.');
          return;
        }
        list.forEach(function (x) {
          if (x.id === id) { x.date = date; x.time = time; }
        });
        saveSessions(list);
        LF.toast('Session rescheduled to ' + dateLabel(date) + '.', 'success');
        closeModal();
        render();
      }
    } else if (form.id === 'admin-profile-form') {
      e.preventDefault();
      submitAdminProfile(form);
    } else if (form.id === 'admin-platform-form') {
      e.preventDefault();
      submitPlatformSettings(form);
    } else if (form.id === 'admin-notif-form') {
      e.preventDefault();
      submitNotifSettings(form);
    }
  });

  /* logo preview wiring for the startup modal */
  document.addEventListener('change', function (e) {
    if (e.target && e.target.id === 'startup-logo' && e.target.files && e.target.files[0]) {
      var reader = new FileReader();
      reader.onload = function () {
        var preview = document.getElementById('startup-logo-preview');
        if (preview) {
          preview.outerHTML = '<img id="startup-logo-preview" src="' + reader.result + '" alt="Startup logo preview" width="96" height="96" class="h-20 w-20 rounded-xl border border-line object-cover" />';
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
    if (e.target && e.target.id === 'mentor-image' && e.target.files && e.target.files[0]) {
      LF.toast('Portrait preview only — not persisted in this demo.', 'info');
    }
  });

  /* ============================ SHELL WIRING ============================ */

  function cacheElements() {
    els.sidebar = document.getElementById('dash-sidebar');
    els.backdrop = document.getElementById('dash-backdrop');
    els.menuBtn = document.getElementById('dash-menu');
    els.closeBtn = document.getElementById('dash-side-close');
    els.collapse = document.getElementById('dash-collapse');
    els.content = document.getElementById('dash-content');
    els.title = document.getElementById('dash-title');
    els.subtitle = document.getElementById('dash-subtitle');
    els.bell = document.getElementById('dash-bell');
    els.bellCount = document.getElementById('dash-bell-count');
    els.avatar = document.getElementById('user-avatar');
    els.userName = document.getElementById('user-name');
    els.userRole = document.getElementById('user-role');
    els.userMenuBtn = document.querySelector('[data-dropdown-trigger]');
    els.logout = document.getElementById('dash-logout');
    els.userLogout = document.getElementById('user-logout');
  }

  function setupDropdown() {
    var wrap = document.querySelector('[data-dropdown]');
    if (!wrap) return;
    var trigger = wrap.querySelector('[data-dropdown-trigger]');
    var menu = document.getElementById('user-menu');
    if (!trigger || !menu) return;

    var setOpen = function (open) {
      trigger.setAttribute('aria-expanded', String(open));
      menu.classList.toggle('is-open', open);
    };

    trigger.addEventListener('click', function () {
      setOpen(trigger.getAttribute('aria-expanded') !== 'true');
    });
    trigger.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setOpen(true);
        var first = menu.querySelector('a, button');
        if (first) first.focus();
      }
    });
    menu.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        setOpen(false);
        trigger.focus();
      }
    });
    menu.addEventListener('click', function () {
      setOpen(false);
    });
    document.addEventListener('click', function (e) {
      if (!wrap.contains(e.target)) setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && trigger.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        trigger.focus();
      }
    });
  }

  function boot() {
    cacheElements();
    if (!els.content || !els.sidebar) return;

    applyCollapse(storedCollapse(), false);
    identityToTopbar();
    syncControlLabels();
    render();
    updateBell();

    if (els.menuBtn) {
      els.menuBtn.addEventListener('click', function () {
        setDrawer(!drawerOpen);
      });
    }
    if (els.closeBtn) els.closeBtn.addEventListener('click', function () { setDrawer(false); });
    if (els.backdrop) els.backdrop.addEventListener('click', function () { setDrawer(false); });

    if (els.collapse) {
      els.collapse.addEventListener('click', function () {
        applyCollapse(!document.body.classList.contains('lf-side-mini'), true);
      });
    }

    if (els.logout) els.logout.addEventListener('click', doLogout);
    if (els.userLogout) els.userLogout.addEventListener('click', doLogout);

    els.sidebar.querySelectorAll('a[href]').forEach(function (link) {
      link.addEventListener('click', function () {
        if (!isDesktop()) setDrawer(false);
      });
    });

    setupDropdown();

    document.addEventListener('keydown', function (e) {
      if (!drawerOpen) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        setDrawer(false);
        if (els.menuBtn) els.menuBtn.focus();
        return;
      }
      if (e.key !== 'Tab') return;
      var nodes = els.sidebar.querySelectorAll('a[href], button:not([disabled])');
      if (!nodes.length) return;
      var first = nodes[0];
      var last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });

    window.addEventListener('hashchange', function () {
      setDrawer(false);
      render();
      window.scrollTo(0, 0);
      els.content.focus({ preventScroll: true });
    });

    document.addEventListener('lf:theme-change', function () {
      syncControlLabels();
    });
    document.addEventListener('lf:rtl-change', function () {
      syncControlLabels();
    });
    window.addEventListener('pageshow', function () {
      syncControlLabels();
      updateBell();
    });
  }

  LF.ready(boot);
})();
