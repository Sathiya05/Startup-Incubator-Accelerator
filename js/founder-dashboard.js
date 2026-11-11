/* ==========================================================================
 * LaunchForge Accelerator — Founder Dashboard
 * --------------------------------------------------------------------------
 * Single IIFE. Renders every dashboard route into <main id="dash-content">
 * using hash routing (#/overview, #/startup, …) and persists demo data with
 * the shared LaunchForge localStorage helpers.
 *
 * Rules honoured here:
 *   - every dynamic string is passed through LaunchForge.escapeHtml()
 *   - destructive actions go through LaunchForge.confirm()
 *   - every success / failure surfaces as a LaunchForge.toast()
 *   - no frameworks, no chart libraries (the chart is hand-rolled SVG)
 *   - all content is clearly-labelled fictional demo data
 * ========================================================================== */

(function () {
  'use strict';

  var LF = window.LaunchForge;
  if (!LF) return;

  var K = LF.KEYS;
  var esc = LF.escapeHtml;
  var BASE = LF.base || '';

  /* =============================== ICONS ================================= */
  /* Lucide-style: 24x24 viewBox, currentColor, rounded caps. No emoji.      */

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
    mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
    phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z"/>',
    globe: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
    alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4M12 17h.01"/>',
    trending: '<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="m7 15 4-4 4 3 5-6"/>',
    target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    layers: '<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>',
    megaphone: '<path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>',
    shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
    key: '<path d="m15.5 7.5 3 3L22 7l-3-3"/><path d="m21 2-9.6 9.6"/><circle cx="7.5" cy="15.5" r="5.5"/>',
    lock: '<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    palette: '<circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>',
    refresh: '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    arrowRight: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    send: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
    briefcase: '<rect width="20" height="14" x="2" y="7" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
    chevLeft: '<path d="m15 18-6-6 6-6"/>',
    chevRight: '<path d="m9 18 6-6-6-6"/>'
  };

  /* ============================== IDENTITY =============================== */

  var FALLBACK_USER = { name: 'Demo Founder', email: 'founder@launchforge.demo', role: 'founder' };

  function authUser() {
    try {
      if (window.LFAuth && typeof window.LFAuth.currentUser === 'function') {
        var u = window.LFAuth.currentUser();
        if (u && u.name) return u;
      }
    } catch (e) { /* fall through to demo founder */ }
    return FALLBACK_USER;
  }

  function founder() {
    var u = authUser();
    var p = LF.store.get(K.founderProfile, null);
    if (!p || typeof p !== 'object') p = {};
    return {
      name: p.name || u.name || FALLBACK_USER.name,
      email: p.email || u.email || FALLBACK_USER.email,
      phone: p.phone || '',
      role: u.role || 'founder'
    };
  }

  function firstName() {
    var parts = String(founder().name || 'Founder').trim().split(/\s+/);
    return parts[0] || 'Founder';
  }

  function initials(name) {
    var parts = String(name || '').trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return 'F';
    var last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (parts[0][0] + last).toUpperCase();
  }

  function greetingFor(d) {
    var h = d.getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
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

  function relDate(value) {
    var diff = daysUntil(value);
    if (diff === 0) return 'today';
    if (diff === 1) return 'tomorrow';
    if (diff === -1) return 'yesterday';
    if (diff > 1) return 'in ' + diff + ' days';
    return Math.abs(diff) + ' days ago';
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

  var STATUS_TONE = {
    'Completed': 'bg-success/15 text-success',
    'In Progress': 'bg-primary/15 text-primary',
    'Overdue': 'bg-danger/15 text-danger',
    'Not Started': 'bg-muted/15 text-muted'
  };

  var SESSION_TONE = {
    'Requested': 'bg-warning/15 text-warning',
    'Confirmed': 'bg-primary/15 text-primary',
    'Completed': 'bg-success/15 text-success',
    'Cancelled': 'bg-muted/15 text-muted'
  };

  function badge(label, toneClass) {
    return '<span class="badge ' + toneClass + '">' + esc(label) + '</span>';
  }

  function progressBar(pct) {
    var p = Math.max(0, Math.min(100, Number(pct) || 0));
    return '<div class="lf-progress" role="progressbar" aria-valuenow="' + p + '" aria-valuemin="0" aria-valuemax="100">' +
      '<span style="width:' + p + '%"></span></div>';
  }

  function pageHead(title, lead, actions) {
    return '<header class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">' +
      '<div class="max-w-2xl">' +
      '<span class="eyebrow">Founder Console</span>' +
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

  /* ============================== DATA MODEL ============================= */

  var STATUSES = ['Not Started', 'In Progress', 'Completed', 'Overdue'];

  function statusOf(m) {
    var p = Number(m.progress) || 0;
    if (p >= 100) return 'Completed';
    if (daysUntil(m.dueDate) < 0) return 'Overdue';
    if (p > 0) return 'In Progress';
    return 'Not Started';
  }

  function sampleMilestones() {
    return [
      { id: 'ms-idea', title: 'Idea Validation', dueDate: toIso(addDays(-45)), progress: 100 },
      { id: 'ms-research', title: 'Market Research', dueDate: toIso(addDays(-21)), progress: 100 },
      { id: 'ms-interviews', title: 'Customer Interviews', dueDate: toIso(addDays(-4)), progress: 60 },
      { id: 'ms-mvp', title: 'MVP Development', dueDate: toIso(addDays(12)), progress: 45 },
      { id: 'ms-launch', title: 'Product Launch', dueDate: toIso(addDays(40)), progress: 10 },
      { id: 'ms-fund', title: 'Fundraising Preparation', dueDate: toIso(addDays(75)), progress: 0 }
    ];
  }

  function milestones() {
    var list = LF.store.get(K.milestones, null);
    if (Array.isArray(list)) return list;
    return sampleMilestones();
  }

  function saveMilestones(list) {
    return LF.store.set(K.milestones, list);
  }

  function msStats(list) {
    var total = list.length;
    var completed = 0;
    var pending = 0;
    var overdue = 0;
    var sum = 0;
    list.forEach(function (m) {
      var p = Math.max(0, Math.min(100, Number(m.progress) || 0));
      sum += p;
      if (p >= 100) completed += 1;
      else pending += 1;
      if (statusOf(m) === 'Overdue') overdue += 1;
    });
    return {
      total: total,
      completed: completed,
      pending: pending,
      overdue: overdue,
      progress: total ? Math.round(sum / total) : 0
    };
  }

  var MENTORS = [
    { name: 'Ava Reinhardt', role: 'Go-to-Market Strategy', img: 'mentor-01.jpg', blurb: 'Helps early teams sharpen positioning, pricing and their first repeatable sales channel.' },
    { name: 'Marcus Cole', role: 'Product & Engineering', img: 'mentor-02.jpg', blurb: 'Guides MVP scoping, technical architecture and a shipping cadence a small team can sustain.' },
    { name: 'Priya Raghunathan', role: 'Fundraising & Finance', img: 'mentor-03.jpg', blurb: 'Supports founders with investor narratives, financial models and round preparation.' },
    { name: 'Diego Fernandez', role: 'Growth & Analytics', img: 'mentor-04.jpg', blurb: 'Builds measurable growth loops, retention reporting and a disciplined experiment habit.' },
    { name: 'Naomi Okafor', role: 'Brand & Design', img: 'mentor-05.jpg', blurb: 'Shapes product storytelling, brand systems and customer-facing design critique.' },
    { name: 'Tomas Lindqvist', role: 'Operations & Hiring', img: 'mentor-06.jpg', blurb: 'Advises on early hiring, operating rhythms and scaling a distributed team.' }
  ];

  function mentorByIndex(idx) {
    var i = parseInt(idx, 10);
    if (isNaN(i) || i < 0 || i >= MENTORS.length) return MENTORS[0];
    return MENTORS[i];
  }

  function sampleSessions() {
    return [
      {
        id: 'se-1',
        mentor: MENTORS[0].name,
        mentorRole: MENTORS[0].role,
        date: toIso(addDays(4)),
        time: '15:00 – 16:00',
        goals: 'Pressure-test our pricing before Demo Day.',
        status: 'Confirmed'
      },
      {
        id: 'se-2',
        mentor: MENTORS[1].name,
        mentorRole: MENTORS[1].role,
        date: toIso(addDays(-6)),
        time: '12:00 – 13:00',
        goals: 'Architecture review for the MVP sprint.',
        status: 'Completed'
      }
    ];
  }

  function sessions() {
    var list = LF.store.get(K.sessions, null);
    if (Array.isArray(list)) return list;
    return sampleSessions();
  }

  function saveSessions(list) {
    return LF.store.set(K.sessions, list);
  }

  function upcomingSessions() {
    return sessions()
      .filter(function (s) {
        return s.status === 'Requested' || s.status === 'Confirmed';
      })
      .sort(function (a, b) {
        return String(a.date || '').localeCompare(String(b.date || ''));
      });
  }

  function defaultStartup() {
    var f = founder();
    return {
      name: 'NovaMind AI',
      industry: 'Artificial Intelligence',
      stage: 'Pre-Seed',
      description: 'An AI copilot that turns scattered team knowledge into instant, trustworthy answers for growing companies.',
      website: 'https://novamind.example.com',
      teamSize: 8,
      logo: 'images/dashboard/startup-logo-demo.svg',
      founder: {
        name: f.name,
        email: f.email,
        phone: '+1 (555) 000-0142'
      }
    };
  }

  function startup() {
    var stored = LF.store.get(K.startup, null);
    var base = defaultStartup();
    if (!stored || typeof stored !== 'object') return base;
    var f = stored.founder && typeof stored.founder === 'object' ? stored.founder : {};
    return {
      name: stored.name || base.name,
      industry: stored.industry || base.industry,
      stage: stored.stage || base.stage,
      description: stored.description || base.description,
      website: stored.website || base.website,
      teamSize: stored.teamSize || base.teamSize,
      logo: stored.logo || base.logo,
      founder: {
        name: f.name || base.founder.name,
        email: f.email || base.founder.email,
        phone: f.phone || base.founder.phone
      }
    };
  }

  var NOTIF_TYPES = {
    session: { label: 'Session', icon: I.calendar, tile: 'bg-primary/10 text-primary', tone: 'bg-primary/15 text-primary' },
    milestone: { label: 'Milestone', icon: I.flag, tile: 'bg-warning/10 text-warning', tone: 'bg-warning/15 text-warning' },
    update: { label: 'Program update', icon: I.megaphone, tile: 'bg-secondary/10 text-secondary', tone: 'bg-secondary/15 text-secondary' },
    application: { label: 'Application', icon: I.checkCircle, tile: 'bg-success/10 text-success', tone: 'bg-success/15 text-success' }
  };

  function notifType(type) {
    return NOTIF_TYPES[type] || NOTIF_TYPES.update;
  }

  function sampleNotifications() {
    return [
      {
        id: 'nt-1', type: 'session', read: false,
        date: new Date(addDays(-1).getTime() + 9 * 3600000).toISOString(),
        title: 'Mentor session confirmed',
        body: 'Your session with ' + MENTORS[0].name + ' is confirmed for ' + relDate(toIso(addDays(4))) + ' at 15:00.'
      },
      {
        id: 'nt-2', type: 'milestone', read: false,
        date: new Date(addDays(-3).getTime() + 14 * 3600000).toISOString(),
        title: 'Milestone overdue: Customer Interviews',
        body: 'Customer Interviews passed its due date. Update the progress slider or move the due date.'
      },
      {
        id: 'nt-3', type: 'update', read: false,
        date: new Date(addDays(-4).getTime() + 11 * 3600000).toISOString(),
        title: 'Week 6 program update published',
        body: 'Office hours move to Thursday this week and the growth workshop materials are now available.'
      },
      {
        id: 'nt-4', type: 'application', read: true,
        date: new Date(addDays(-26).getTime() + 10 * 3600000).toISOString(),
        title: 'Application approved',
        body: 'Congratulations — your sample application was accepted into the current LaunchForge cohort.'
      },
      {
        id: 'nt-5', type: 'session', read: true,
        date: new Date(addDays(-7).getTime() + 16 * 3600000).toISOString(),
        title: 'Session reminder',
        body: 'A reminder email would be sent 24 hours before each booked mentor session.'
      },
      {
        id: 'nt-6', type: 'update', read: true,
        date: new Date(addDays(-11).getTime() + 9 * 3600000).toISOString(),
        title: 'Demo Day registrations are open',
        body: 'Register your team for the sample Demo Day before the window closes.'
      }
    ];
  }

  function notifications() {
    var list = LF.store.get(K.notifications, null);
    if (Array.isArray(list)) return list;
    return sampleNotifications();
  }

  function saveNotifications(list) {
    var ok = LF.store.set(K.notifications, list);
    updateBell();
    return ok;
  }

  function unreadCount() {
    return notifications().filter(function (n) {
      return !n.read;
    }).length;
  }

  function pushNotification(type, title, body) {
    var list = notifications();
    list.unshift({
      id: LF.uid('nt'),
      type: type,
      read: false,
      date: new Date().toISOString(),
      title: title,
      body: body
    });
    saveNotifications(list);
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

  /* Builds an accessible dialog: Escape closes, Tab is trapped, backdrop
     click closes, focus is restored to the trigger on close. */
  function openModal(opts) {
    closeModal();
    var previous = document.activeElement;
    var backdrop = document.createElement('div');
    backdrop.className = 'lf-modal-backdrop';
    backdrop.innerHTML =
      '<div class="lf-modal" role="dialog" aria-modal="true" aria-labelledby="lf-dash-modal-title"' +
      (opts.wide ? ' style="width:min(34rem,100%)"' : '') + '>' +
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
  var currentRoute = '#/overview';
  var SIDEBAR_KEY = 'lf-founder-sidebar';

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
        localStorage.setItem(SIDEBAR_KEY, mini ? 'mini' : 'full');
      } catch (e) { /* ignore */ }
    }
  }

  function storedCollapse() {
    try {
      return localStorage.getItem(SIDEBAR_KEY) === 'mini';
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
      els.bell.setAttribute(
        'aria-label',
        n > 0 ? 'Notifications — ' + n + ' unread' : 'Notifications — nothing unread'
      );
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
    var f = founder();
    if (els.avatar) els.avatar.textContent = initials(f.name);
    if (els.userName) els.userName.textContent = f.name;
    if (els.userRole) els.userRole.textContent = f.role === 'admin' ? 'Admin' : 'Founder';
    if (els.userMenuBtn) {
      els.userMenuBtn.setAttribute('aria-label', 'Account menu — ' + f.name);
    }
  }

  /* ------------------------------- routing ------------------------------ */

  var ROUTES = {
    '#/overview': { title: 'Overview', subtitle: 'Your program at a glance', render: renderOverview },
    '#/startup': { title: 'My Startup', subtitle: 'Profile, team and pitch basics', render: renderStartup },
    '#/milestones': { title: 'Milestones', subtitle: 'Track every program deliverable', render: renderMilestones },
    '#/sessions': { title: 'Mentor Sessions', subtitle: 'Book time with LaunchForge mentors', render: renderSessions },
    '#/pitch-deck': { title: 'Pitch Deck', subtitle: 'Submit and manage your deck', render: renderDeck },
    '#/documents': { title: 'Documents', subtitle: 'Your startup document library', render: renderDocuments },
    '#/notifications': { title: 'Notifications', subtitle: 'Program alerts and reminders', render: renderNotifications },
    '#/settings': { title: 'Settings', subtitle: 'Profile, security and preferences', render: renderSettings }
  };

  function resolveRoute() {
    var hash = location.hash;
    return ROUTES[hash] ? hash : '#/overview';
  }

  function render() {
    if (!els.content) return;
    var key = resolveRoute();
    var route = ROUTES[key];
    currentRoute = key;

    if (els.title) els.title.textContent = route.title;
    if (els.subtitle) els.subtitle.textContent = route.subtitle;
    document.title = route.title + ' — Founder Dashboard — LaunchForge Accelerator';

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

  /* Hand-rolled SVG chart — bars + dashed trend line, no libraries. */
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
      'role="img" aria-label="Bar chart of weekly program progress over eight weeks, rising to ' +
      values[values.length - 1] + ' percent">' + out + '</svg>';
  }

  function feedItems(ms, up) {
    var items = [];
    var open = ms
      .filter(function (m) {
        return Number(m.progress) < 100;
      })
      .sort(function (a, b) {
        return String(a.dueDate || '').localeCompare(String(b.dueDate || ''));
      });

    if (open.length) {
      var m = open[0];
      var over = daysUntil(m.dueDate) < 0;
      items.push({
        icon: I.flag,
        tone: over ? 'bg-danger/10 text-danger' : 'bg-warning/10 text-warning',
        title: m.title + (over ? ' is overdue' : ' is due ' + relDate(m.dueDate)),
        body: 'Progress is at ' + (Number(m.progress) || 0) + '% — update it or mark the milestone complete.',
        date: m.dueDate,
        tag: 'Milestone'
      });
    }

    if (up.length) {
      var s = up[0];
      items.push({
        icon: I.calendar,
        tone: 'bg-primary/10 text-primary',
        title: 'Mentor session with ' + s.mentor + ' ' + relDate(s.date),
        body: s.time + ' · ' + (s.status === 'Confirmed' ? 'confirmed' : 'awaiting confirmation') + ' · ' + (s.goals || 'Goals to be discussed.'),
        date: s.date,
        tag: 'Session'
      });
    } else {
      items.push({
        icon: I.calendar,
        tone: 'bg-primary/10 text-primary',
        title: 'No mentor session booked yet',
        body: 'Request a session with one of the demo mentors to get unstuck faster.',
        date: null,
        tag: 'Session'
      });
    }

    var updates = notifications().filter(function (n) {
      return n.type === 'update';
    });
    var u = updates[0];
    items.push({
      icon: I.megaphone,
      tone: 'bg-secondary/10 text-secondary',
      title: u ? u.title : 'Program update feed',
      body: u ? u.body : 'Program updates from the LaunchForge team will appear here.',
      date: u ? u.date : null,
      tag: 'Program update'
    });

    return items;
  }

  function renderOverview() {
    var s = startup();
    var ms = milestones();
    var stats = msStats(ms);
    var up = upcomingSessions();
    var feed = feedItems(ms, up);
    var nextSession = up[0];

    var fractions = [0.2, 0.3, 0.42, 0.55, 0.66, 0.77, 0.89, 1];
    var values = fractions.map(function (f) {
      return Math.max(4, Math.round(stats.progress * f));
    });
    var labels = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'];

    var html = '<div class="mx-auto flex max-w-6xl flex-col gap-6 lg:gap-8">';

    /* Welcome */
    html += '<section class="overflow-hidden rounded-2xl border border-line bg-gradient-to-br from-primary/15 via-softindigo to-surface p-6 sm:p-8">' +
      '<p class="text-xs font-bold uppercase tracking-[0.16em] text-secondary">' + greetingFor(new Date()) + '</p>' +
      '<h2 class="mt-2 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">Welcome back, ' + esc(firstName()) + '.</h2>' +
      '<p class="mt-2 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">' +
      'Here is what is happening with <span class="font-semibold text-ink">' + esc(s.name) + '</span> inside the LaunchForge program this week.</p>' +
      '<div class="mt-4 flex flex-wrap gap-2">' +
      badge(s.stage + ' stage', 'bg-primary text-white') +
      badge(s.industry, 'bg-surface text-muted ring-1 ring-line') +
      badge('Demo data', 'bg-secondary/15 text-secondary') +
      '</div></section>';

    /* Stat cards */
    html += '<section aria-label="Program statistics" class="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">';
    html += statCard({
      icon: I.trending,
      tone: 'bg-softindigo text-primary',
      label: 'Program progress',
      tag: stats.overdue ? stats.overdue + ' overdue' : 'On track',
      tagTone: stats.overdue ? 'bg-danger/15 text-danger' : 'bg-success/15 text-success',
      value: '<span data-count-to="' + stats.progress + '" data-count-suffix="%">0%</span>',
      extra: '<div class="mt-3">' + progressBar(stats.progress) + '</div>' +
        '<p class="mt-2 text-xs font-medium text-muted">Average across ' + stats.total + ' milestones</p>'
    });
    html += statCard({
      icon: I.checkCircle,
      tone: 'bg-success/10 text-success',
      label: 'Completed milestones',
      value: '<span data-count-to="' + stats.completed + '">0</span><span class="text-xl font-semibold text-muted">/' + stats.total + '</span>',
      extra: '<p class="mt-3 text-xs font-medium text-muted">' + stats.pending + ' still open · ' + stats.overdue + ' overdue</p>'
    });
    html += statCard({
      icon: I.calendar,
      tone: 'bg-primary/10 text-primary',
      label: 'Upcoming mentor sessions',
      value: '<span data-count-to="' + up.length + '">0</span>',
      extra: '<p class="mt-3 text-xs font-medium text-muted">' +
        (nextSession ? 'Next ' + relDate(nextSession.date) + ' at ' + esc(String(nextSession.time || '').split('–')[0].trim()) : 'None booked yet') + '</p>'
    });
    html += statCard({
      icon: I.target,
      tone: 'bg-softorange text-secondary',
      label: 'Pending tasks',
      value: '<span data-count-to="' + stats.pending + '">0</span>',
      extra: '<p class="mt-3 text-xs font-medium text-muted">Milestones below 100% progress</p>'
    });
    html += '</section>';

    /* Chart + feed */
    html += '<div class="grid gap-6 lg:grid-cols-5">';
    html += sectionCard(
      'Weekly progress',
      'Sample completion trend for the current cohort — demo chart drawn as inline SVG.',
      '<span class="badge bg-softindigo text-primary">8 weeks</span>',
      '<div class="text-muted">' + chartSvg(values, labels) + '</div>' +
      '<p class="mt-3 text-[11px] leading-relaxed text-muted">Percentages are derived from your milestone progress values in this browser.</p>',
      'lg:col-span-3'
    );

    html += sectionCard(
      'Latest updates',
      'Generated from your milestones, sessions and program feed.',
      '<a href="#/notifications" class="btn btn-ghost btn-sm">View all' + svg(I.arrowRight, 15) + '</a>',
      '<ul class="flex flex-col">' + feed.map(function (item, idx) {
        return '<li class="flex gap-4' + (idx ? ' border-t border-line pt-4 mt-4' : '') + '">' +
          '<span class="grid h-10 w-10 shrink-0 place-items-center rounded-xl ' + item.tone + '">' + svg(item.icon, 18) + '</span>' +
          '<div class="min-w-0">' +
          '<p class="text-sm font-semibold leading-snug text-ink">' + esc(item.title) + '</p>' +
          '<p class="mt-1 text-sm leading-relaxed text-muted">' + esc(item.body) + '</p>' +
          '<p class="mt-1.5 text-[11px] font-bold uppercase tracking-wider text-muted">' +
          esc(item.tag) + (item.date ? ' · ' + esc(dateLabel(item.date)) : '') + '</p>' +
          '</div></li>';
      }).join('') + '</ul>',
      'lg:col-span-2'
    );
    html += '</div>';

    html += demoNote('This console is a frontend demo: all startup, milestone and session records live in your browser localStorage and never leave this device.');
    html += '</div>';
    return html;
  }

  /* ============================== MY STARTUP ============================= */

  var startupEditing = false;
  var logoPreview = null; /* in-memory only, never persisted */

  var STAGES = ['Idea', 'Pre-Seed', 'Seed', 'Series A', 'Growth'];
  var INDUSTRIES = ['Artificial Intelligence', 'FinTech', 'HealthTech', 'EdTech', 'Sustainability', 'Consumer', 'Logistics', 'Other'];

  function selectField(id, label, options, current, required, placeholder) {
    var opts = placeholder
      ? '<option value=""' + (current ? '' : ' selected') + '>' + esc(placeholder) + '</option>'
      : '';
    opts += options.map(function (o) {
      return '<option value="' + esc(o) + '"' + (o === current ? ' selected' : '') + '>' + esc(o) + '</option>';
    }).join('');
    return '<div class="field">' +
      '<label class="label" for="' + id + '">' + esc(label) + '</label>' +
      '<select class="input" id="' + id + '" name="' + id + '"' + (required ? ' required' : '') + '>' + opts + '</select>' +
      '<p class="field-error hidden" data-error-for="' + id + '" role="alert"></p></div>';
  }

  function textField(opts) {
    return '<div class="' + (opts.wrapClass || 'field') + '">' +
      '<label class="label" for="' + opts.id + '">' + esc(opts.label) + '</label>' +
      '<input class="input" type="' + (opts.type || 'text') + '" id="' + opts.id + '" name="' + opts.id + '"' +
      (opts.required ? ' required' : '') +
      (opts.min !== undefined ? ' min="' + esc(opts.min) + '"' : '') +
      (opts.max !== undefined ? ' max="' + esc(opts.max) + '"' : '') +
      (opts.maxlength ? ' maxlength="' + opts.maxlength + '"' : '') +
      (opts.value !== undefined ? ' value="' + esc(opts.value) + '"' : '') +
      (opts.placeholder ? ' placeholder="' + esc(opts.placeholder) + '"' : '') +
      (opts.errorMessage ? ' data-error-message="' + esc(opts.errorMessage) + '"' : '') +
      ' />' +
      (opts.hint ? '<p class="field-hint">' + esc(opts.hint) + '</p>' : '') +
      '<p class="field-error hidden" data-error-for="' + opts.id + '" role="alert"></p></div>';
  }

  function startupDetails(s) {
    function row(label, valueHtml) {
      return '<div><dt class="text-[11px] font-bold uppercase tracking-[0.14em] text-muted">' + esc(label) + '</dt>' +
        '<dd class="mt-1.5 text-sm font-semibold leading-relaxed text-ink">' + valueHtml + '</dd></div>';
    }

    return '<dl class="grid gap-x-6 gap-y-5 sm:grid-cols-2">' +
      row('Startup name', esc(s.name)) +
      row('Industry', esc(s.industry)) +
      row('Stage', badge(s.stage, 'bg-primary/15 text-primary')) +
      row('Team size', esc(String(s.teamSize)) + ' people') +
      row('Website', '<a href="' + esc(s.website) + '" class="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline" data-demo-note="This is a fictional demo startup — no live website exists for it.">' +
        svg(I.globe, 15) + '<span>' + esc(String(s.website).replace(/^https?:\/\//, '')) + '</span></a>') +
      row('Founder', esc(s.founder.name)) +
      row('Email', '<a href="mailto:' + esc(s.founder.email) + '" class="font-semibold text-primary hover:underline">' + esc(s.founder.email) + '</a>') +
      row('Phone', '<a href="tel:' + esc(String(s.founder.phone).replace(/[^+\d]/g, '')) + '" class="font-semibold text-primary hover:underline">' + esc(s.founder.phone || '—') + '</a>') +
      '<div class="sm:col-span-2"><dt class="text-[11px] font-bold uppercase tracking-[0.14em] text-muted">What we build</dt>' +
      '<dd class="mt-1.5 text-sm leading-relaxed text-ink">' + esc(s.description) + '</dd></div>' +
      '</dl>';
  }

  function startupForm(s) {
    return '<form data-form="startup" novalidate>' +
      '<div class="grid gap-x-5 sm:grid-cols-2">' +
      textField({ id: 'st-name', label: 'Startup name', value: s.name, required: true, errorMessage: 'Startup name is required.' }) +
      selectField('st-industry', 'Industry', INDUSTRIES, s.industry, true) +
      selectField('st-stage', 'Stage', STAGES, s.stage, true) +
      textField({ id: 'st-team', label: 'Team size', type: 'number', value: s.teamSize, min: 1, max: 1000, required: true, errorMessage: 'Enter a team size between 1 and 1000.' }) +
      textField({ id: 'st-website', label: 'Website', type: 'url', value: s.website, placeholder: 'https://example.com', hint: 'Fictional demo link — clicking it shows an explanatory toast.' }) +
      textField({ id: 'st-founder-name', label: 'Founder name', value: s.founder.name, required: true, errorMessage: 'Founder name is required.' }) +
      textField({ id: 'st-founder-email', label: 'Founder email', type: 'email', value: s.founder.email, required: true, errorMessage: 'A valid email is required.' }) +
      textField({ id: 'st-founder-phone', label: 'Founder phone', type: 'tel', value: s.founder.phone, hint: 'Optional — 7 to 15 digits.' }) +
      '</div>' +
      '<div class="field mb-0">' +
      '<label class="label" for="st-description">Description</label>' +
      '<textarea class="input" id="st-description" name="st-description" maxlength="400" required data-error-message="Add a short description.">' + esc(s.description) + '</textarea>' +
      '<p class="field-hint">Up to 400 characters. Stored locally in this browser.</p>' +
      '<p class="field-error hidden" data-error-for="st-description" role="alert"></p></div>' +
      '<div class="mt-6 flex flex-wrap justify-end gap-3 border-t border-line pt-5">' +
      '<button type="button" class="btn btn-outline btn-sm" data-action="startup-cancel">Cancel</button>' +
      '<button type="submit" class="btn btn-primary btn-sm" data-submit>Save changes</button>' +
      '</div></form>';
  }

  function renderStartup() {
    var s = startup();
    var logoSrc = logoPreview || (BASE + s.logo);

    var actions = startupEditing ? '' :
      '<button type="button" class="btn btn-primary btn-sm shrink-0" data-action="startup-edit">' +
      svg(I.pencil, 16) + 'Edit profile</button>';

    var html = '<div class="mx-auto flex max-w-6xl flex-col gap-6 lg:gap-8">';
    html += pageHead(
      'My Startup',
      'The editable demo record for your venture. Everything here is stored in your browser only.',
      actions
    );

    html += '<div class="grid gap-6 lg:grid-cols-3">';

    /* Logo card */
    html += '<section class="card p-6" aria-labelledby="st-logo-title">' +
      '<h3 id="st-logo-title" class="font-display text-base font-bold text-ink">Startup logo</h3>' +
      '<div class="mt-4 grid aspect-square w-full place-items-center rounded-2xl border border-line bg-page p-6">' +
      '<img src="' + esc(logoSrc) + '" alt="' + esc(s.name) + ' demo logo" width="180" height="180" class="h-full w-full object-contain" />' +
      '</div>' +
      '<label class="label mt-4" for="startup-logo-input">Upload demo logo</label>' +
      '<input type="file" id="startup-logo-input" accept="image/*" class="input lf-file" data-logo-input />' +
      '<p class="field-hint">Preview only — the file is read in this tab and <strong>not</strong> saved, uploaded or stored securely.</p>' +
      '</section>';

    /* Detail card */
    var detailBody;
    if (startupEditing) {
      detailBody = startupForm(s);
    } else {
      detailBody = startupDetails(s);
    }
    html += '<section class="card p-6 lg:col-span-2" aria-labelledby="st-details-title">' +
      '<div class="flex flex-wrap items-start justify-between gap-3">' +
      '<div class="min-w-0">' +
      '<div class="flex flex-wrap items-center gap-2.5">' +
      '<h3 id="st-details-title" class="font-display text-lg font-bold text-ink">' + esc(s.name) + '</h3>' +
      badge(s.stage, 'bg-primary/15 text-primary') +
      '</div>' +
      '<p class="mt-1.5 text-sm text-muted">' + esc(s.industry) + ' · ' + esc(String(s.teamSize)) + ' team members</p>' +
      '</div>' +
      (startupEditing ? '' : '<a href="#/pitch-deck" class="btn btn-outline btn-sm shrink-0">Submit pitch deck' + svg(I.arrowRight, 15) + '</a>') +
      '</div>' +
      '<div class="mt-6">' + detailBody + '</div></section>';

    html += '</div>';

    html += demoNote('Sample company record — fictional demo startup used to show the console experience. Logos you pick are previewed locally and disappear on reload.');

    html += '</div>';
    return html;
  }

  /* ============================== MILESTONES ============================= */

  var msFilter = 'All';

  function filterCounts(list) {
    var counts = { All: list.length };
    STATUSES.forEach(function (s) {
      counts[s] = list.filter(function (m) {
        return statusOf(m) === s;
      }).length;
    });
    return counts;
  }

  function milestoneCard(m) {
    var st = statusOf(m);
    var p = Math.max(0, Math.min(100, Number(m.progress) || 0));
    var over = st === 'Overdue';
    var done = st === 'Completed';
    var title = esc(m.title);

    return '<article class="card flex flex-col p-5" data-ms-card="' + esc(m.id) + '">' +
      '<div class="flex items-start justify-between gap-3">' +
      '<div class="min-w-0">' + badge(st, STATUS_TONE[st] || STATUS_TONE['Not Started']) +
      '<h3 class="mt-3 font-display text-base font-bold leading-snug text-ink">' + title + '</h3>' +
      '<p class="mt-1.5 flex items-center gap-1.5 text-xs font-semibold ' + (over ? 'text-danger' : 'text-muted') + '">' +
      svg(I.calendar, 14) + '<span>' + esc(dateLabel(m.dueDate)) + ' · ' + esc(relDate(m.dueDate)) + '</span></p>' +
      '</div>' +
      '<div class="flex shrink-0 gap-1">' +
      '<button type="button" class="icon-btn h-9 w-9" data-action="ms-edit" data-id="' + esc(m.id) + '" aria-label="Edit milestone: ' + title + '">' + svg(I.pencil, 16) + '</button>' +
      '<button type="button" class="icon-btn h-9 w-9 hover:border-danger/40 hover:text-danger" data-action="ms-delete" data-id="' + esc(m.id) + '" aria-label="Delete milestone: ' + title + '">' + svg(I.trash, 16) + '</button>' +
      '</div></div>' +

      '<div class="mt-4 grow">' +
      '<div class="flex items-center justify-between gap-3 text-xs font-semibold text-muted">' +
      '<span>Progress</span>' +
      '<span data-ms-value="' + esc(m.id) + '" class="text-ink">' + p + '%</span></div>' +
      '<div class="mt-2">' + progressBar(p) + '</div>' +
      '<input type="range" class="lf-range mt-3 w-full" min="0" max="100" step="5" value="' + p + '" ' +
      'data-ms-range="' + esc(m.id) + '" aria-label="Progress for ' + title + '" />' +
      '</div>' +

      '<div class="mt-4 flex gap-2">' +
      (done
        ? '<button type="button" class="btn btn-outline btn-sm flex-1" disabled>' + svg(I.check, 15) + 'Completed</button>'
        : '<button type="button" class="btn btn-outline btn-sm flex-1" data-action="ms-complete" data-id="' + esc(m.id) + '">' + svg(I.check, 15) + 'Mark completed</button>') +
      '<button type="button" class="btn btn-ghost btn-sm" data-action="ms-edit" data-id="' + esc(m.id) + '">Edit</button>' +
      '</div></article>';
  }

  function renderMilestones() {
    var list = milestones();
    var stats = msStats(list);
    var counts = filterCounts(list);
    var filtered = list.filter(function (m) {
      return msFilter === 'All' || statusOf(m) === msFilter;
    });

    var html = '<div class="mx-auto flex max-w-6xl flex-col gap-6 lg:gap-8">';
    html += pageHead(
      'Milestones',
      'Add, edit, progress, complete and delete program milestones. Status is computed from the due date and progress.',
      '<button type="button" class="btn btn-primary btn-sm shrink-0" data-action="ms-add">' + svg(I.plus, 16) + 'Add milestone</button>'
    );

    /* Overall progress */
    html += '<section class="card p-5 sm:p-6" aria-label="Overall program progress">' +
      '<div class="flex flex-wrap items-center justify-between gap-3">' +
      '<div><h3 class="font-display text-base font-bold text-ink">Overall program progress</h3>' +
      '<p class="mt-1 text-xs font-medium text-muted">' + stats.completed + ' of ' + stats.total + ' completed · ' +
      stats.pending + ' open · ' + stats.overdue + ' overdue</p></div>' +
      '<p class="font-display text-2xl font-bold text-ink">' + stats.progress + '%</p></div>' +
      '<div class="mt-3">' + progressBar(stats.progress) + '</div></section>';

    /* Filters */
    var chips = ['All'].concat(STATUSES).map(function (f) {
      var active = msFilter === f;
      return '<button type="button" class="chip' + (active ? ' chip-active' : '') + '" data-action="ms-filter" data-filter="' + esc(f) + '"' +
        ' aria-pressed="' + active + '">' + esc(f) +
        '<span class="text-xs font-bold opacity-70">' + counts[f] + '</span></button>';
    }).join('');
    html += '<div class="flex flex-wrap gap-2.5" role="group" aria-label="Filter milestones by status">' + chips + '</div>';

    /* List */
    if (!list.length) {
      html += emptyState({
        icon: I.flag,
        tone: 'bg-softindigo text-primary',
        title: 'No milestones yet',
        body: 'Add your first milestone to start tracking the program deliverables for your startup.',
        action: '<button type="button" class="btn btn-primary mt-5" data-action="ms-add">' + svg(I.plus, 16) + 'Add your first milestone</button>'
      });
    } else if (!filtered.length) {
      html += emptyState({
        icon: I.target,
        tone: 'bg-softorange text-secondary',
        title: 'No ' + msFilter.toLowerCase() + ' milestones',
        body: 'Nothing matches this filter right now. Switch back to All to see every milestone.',
        action: '<button type="button" class="btn btn-outline mt-5" data-action="ms-filter" data-filter="All">Show all milestones</button>'
      });
    } else {
      html += '<section aria-label="Milestone list" class="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">' +
        filtered.map(milestoneCard).join('') + '</section>';
    }

    html += demoNote('Six sample milestones are seeded on your first visit with staggered due dates so overdue, in-progress and completed states are all visible.');
    html += '</div>';
    return html;
  }

  function milestoneModal(existing) {
    var m = existing || { title: '', dueDate: toIso(addDays(14)), progress: 0 };
    var p = Math.max(0, Math.min(100, Number(m.progress) || 0));

    var body = '<form data-form="milestone" data-id="' + esc(existing ? existing.id : '') + '" novalidate>' +
      textField({
        id: 'ms-title', label: 'Milestone title', value: m.title, required: true,
        placeholder: 'e.g. Pricing experiments', errorMessage: 'Give this milestone a title.'
      }) +
      textField({
        id: 'ms-due', label: 'Due date', type: 'date', value: m.dueDate, required: true,
        errorMessage: 'Pick a due date.',
        hint: 'Past dates render as Overdue once progress is below 100%.'
      }) +
      '<div class="field mb-0">' +
      '<label class="label" for="ms-progress">Progress — <span data-ms-modal-value>' + p + '%</span></label>' +
      '<input type="range" class="lf-range w-full" id="ms-progress" name="ms-progress" min="0" max="100" step="5" value="' + p + '" />' +
      '<p class="field-hint">Status is derived automatically: 100% becomes Completed, past due dates become Overdue.</p>' +
      '</div>' +
      '<div class="mt-6 flex flex-wrap justify-end gap-3 border-t border-line pt-5">' +
      '<button type="button" class="btn btn-outline btn-sm" data-modal-close>Cancel</button>' +
      '<button type="submit" class="btn btn-primary btn-sm" data-submit>' + (existing ? 'Save changes' : 'Add milestone') + '</button>' +
      '</div></form>';

    openModal({ title: existing ? 'Edit milestone' : 'Add milestone', body: body, wide: false });
  }

  function submitMilestone(form) {
    if (!LF.form.validate(form)) {
      LF.toast('Please fix the highlighted fields.', 'error');
      return;
    }
    var title = form.querySelector('#ms-title').value.trim();
    var due = form.querySelector('#ms-due').value;
    var progress = Math.max(0, Math.min(100, Number(form.querySelector('#ms-progress').value) || 0));
    var id = form.getAttribute('data-id');
    var btn = form.querySelector('[data-submit]');

    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Saving…';
    }

    window.setTimeout(function () {
      var list = milestones();
      if (id) {
        var found = false;
        list = list.map(function (m) {
          if (m.id !== id) return m;
          found = true;
          return { id: id, title: title, dueDate: due, progress: progress };
        });
        if (!found) list.push({ id: id, title: title, dueDate: due, progress: progress });
      } else {
        list.push({ id: LF.uid('ms'), title: title, dueDate: due, progress: progress });
      }

      if (!saveMilestones(list)) {
        LF.toast('Could not write to local storage.', 'error');
        if (btn) { btn.disabled = false; btn.textContent = 'Save changes'; }
        return;
      }
      if (progress >= 100) {
        pushNotification('milestone', 'Milestone completed', title + ' was marked complete.');
      }
      LF.toast(id ? 'Milestone updated.' : 'Milestone added: ' + title, 'success');
      closeModal();
      render();
    }, 350);
  }

  function setMilestoneProgress(id, value) {
    var list = milestones();
    var p = Math.max(0, Math.min(100, Number(value) || 0));
    var target = null;
    list = list.map(function (m) {
      if (m.id !== id) return m;
      target = m;
      return { id: m.id, title: m.title, dueDate: m.dueDate, progress: p };
    });
    if (!target) return;
    if (!saveMilestones(list)) {
      LF.toast('Could not write to local storage.', 'error');
      return;
    }
    if (p >= 100 && Number(target.progress) < 100) {
      pushNotification('milestone', 'Milestone completed', target.title + ' reached 100% progress.');
      LF.toast(target.title + ' marked complete.', 'success');
    } else {
      LF.toast('Progress updated to ' + p + '%.', 'success');
    }
    render();
  }

  /* ============================ MENTOR SESSIONS ========================== */

  function mentorCard(m, idx) {
    return '<article class="card flex flex-col p-5">' +
      '<div class="flex items-center gap-4">' +
      '<img src="' + BASE + 'images/mentors/' + esc(m.img) + '" alt="Demo mentor portrait of ' + esc(m.name) + '" width="64" height="64" class="h-16 w-16 shrink-0 rounded-full object-cover ring-2 ring-line" />' +
      '<div class="min-w-0">' +
      '<h4 class="truncate font-display text-sm font-bold text-ink">' + esc(m.name) + '</h4>' +
      '<p class="mt-0.5 truncate text-sm text-muted">' + esc(m.role) + '</p>' +
      '<span class="mt-1.5 inline-flex badge bg-softindigo text-primary">Demo mentor</span>' +
      '</div></div>' +
      '<p class="mt-4 grow text-sm leading-relaxed text-muted">' + esc(m.blurb) + '</p>' +
      '<button type="button" class="btn btn-outline btn-sm mt-4" data-action="mentor-request" data-mentor="' + idx + '">' +
      svg(I.calendar, 15) + 'Request session</button>' +
      '</article>';
  }

  function sessionRow(s) {
    var tone = SESSION_TONE[s.status] || SESSION_TONE['Requested'];
    var canCancel = s.status === 'Requested' || s.status === 'Confirmed';
    return '<li class="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">' +
      '<div class="flex min-w-0 items-center gap-4">' +
      '<span class="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-softindigo text-primary">' + svg(I.calendar, 19) + '</span>' +
      '<div class="min-w-0">' +
      '<p class="truncate font-display text-sm font-bold text-ink">' + esc(s.mentor) + (s.mentorRole ? ' · ' + esc(s.mentorRole) : '') + '</p>' +
      '<p class="mt-1 text-xs font-medium text-muted">' + esc(dateLabel(s.date)) + ' · ' + esc(s.time || '—') + ' · ' + esc(relDate(s.date)) + '</p>' +
      (s.goals ? '<p class="mt-1 truncate text-xs text-muted">Goals: ' + esc(s.goals) + '</p>' : '') +
      '</div></div>' +
      '<div class="flex shrink-0 items-center gap-3">' + badge(s.status, tone) +
      (canCancel
        ? '<button type="button" class="btn btn-ghost btn-sm text-danger hover:bg-danger/10 hover:text-danger" data-action="session-cancel" data-id="' + esc(s.id) + '">Cancel</button>'
        : '') +
      '</div></li>';
  }

  function renderSessions() {
    var list = sessions().slice().sort(function (a, b) {
      var au = (a.status === 'Requested' || a.status === 'Confirmed') ? 0 : 1;
      var bu = (b.status === 'Requested' || b.status === 'Confirmed') ? 0 : 1;
      if (au !== bu) return au - bu;
      return String(a.date || '').localeCompare(String(b.date || ''));
    });
    var up = upcomingSessions();

    var html = '<div class="mx-auto flex max-w-6xl flex-col gap-6 lg:gap-8">';
    html += pageHead(
      'Mentor Sessions',
      'Request a session with a demo mentor, then track it here until it is completed.',
      up.length
        ? '<span class="badge shrink-0 bg-primary/15 text-primary">' + up.length + ' upcoming</span>'
        : ''
    );

    html += sectionCard(
      'Available mentors',
      'Fictional demo mentors — portraits are local sample images from the project manifest.',
      '<span class="badge bg-secondary/15 text-secondary">Sample list</span>',
      '<div class="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">' + MENTORS.map(mentorCard).join('') + '</div>'
    );

    var sessionsBody;
    if (!list.length) {
      sessionsBody = '';
      html += emptyState({
        icon: I.calendar,
        tone: 'bg-softindigo text-primary',
        title: 'No sessions booked yet',
        body: 'Pick a mentor above and request your first session — it will show up here with its status.',
        action: ''
      });
    } else {
      sessionsBody = '<ul class="flex flex-col gap-4">' + list.map(sessionRow).join('') + '</ul>';
      html += sectionCard(
        'Your sessions',
        'Requested sessions await mentor confirmation. Cancelled sessions stay listed for the demo.',
        '<span class="badge bg-softindigo text-primary">' + list.length + ' total</span>',
        sessionsBody
      );
    }

    html += demoNote('Sessions are stored in this browser only — no calendar invite or email is actually sent.');
    html += '</div>';
    return html;
  }

  var TIME_SLOTS = ['09:00 – 10:00', '12:00 – 13:00', '15:00 – 16:00', '18:00 – 19:00'];

  function sessionModal(idx) {
    var m = mentorByIndex(idx);

    var body = '<form data-form="session" data-mentor="' + esc(String(idx)) + '" novalidate>' +
      '<div class="mb-5 flex items-center gap-3 rounded-xl border border-line bg-page p-3">' +
      '<img src="' + BASE + 'images/mentors/' + esc(m.img) + '" alt="" width="44" height="44" class="h-11 w-11 shrink-0 rounded-full object-cover" />' +
      '<div class="min-w-0"><p class="truncate text-sm font-bold text-ink">' + esc(m.name) + '</p>' +
      '<p class="truncate text-xs text-muted">' + esc(m.role) + '</p></div></div>' +
      textField({
        id: 'se-date', label: 'Preferred date', type: 'date', value: toIso(addDays(3)),
        min: toIso(today()), required: true, errorMessage: 'Choose a preferred date.',
        hint: 'Must be today or later (demo calendar).'
      }) +
      selectField('se-time', 'Time slot', TIME_SLOTS, '', true, 'Select a time slot') +
      '<div class="field mb-0">' +
      '<label class="label" for="se-goals">Session goals</label>' +
      '<textarea class="input" id="se-goals" name="se-goals" maxlength="300" required ' +
      'data-error-message="Tell your mentor what you want to cover." ' +
      'placeholder="e.g. Pressure-test pricing and pick the right segment for our pilot."></textarea>' +
      '<div class="mt-1.5 flex items-center justify-between gap-3">' +
      '<span class="text-xs leading-relaxed text-muted">Up to 300 characters.</span>' +
      '<span class="text-xs font-bold text-muted"><span data-goals-count>0</span>/300</span></div>' +
      '<p class="field-error hidden" data-error-for="se-goals" role="alert"></p></div>' +
      '<div class="mt-6 flex flex-wrap justify-end gap-3 border-t border-line pt-5">' +
      '<button type="button" class="btn btn-outline btn-sm" data-modal-close>Cancel</button>' +
      '<button type="submit" class="btn btn-primary btn-sm" data-submit>' + svg(I.send, 15) + 'Send request</button>' +
      '</div></form>';

    openModal({ title: 'Request a mentor session', body: body });
  }

  function submitSession(form) {
    if (!LF.form.validate(form)) {
      LF.toast('Please complete the highlighted fields.', 'error');
      return;
    }
    var dateInput = form.querySelector('#se-date');
    var timeInput = form.querySelector('#se-time');
    var goalsInput = form.querySelector('#se-goals');
    var date = dateInput.value;
    var goals = goalsInput.value.trim();

    if (daysUntil(date) < 0) {
      LF.form.showError(dateInput, 'Pick today or a later date.');
      LF.toast('Session dates cannot be in the past.', 'error');
      dateInput.focus();
      return;
    }
    if (goals.length > 300) {
      LF.form.showError(goalsInput, 'Keep your goals to 300 characters or fewer.');
      return;
    }

    var m = mentorByIndex(form.getAttribute('data-mentor'));
    var btn = form.querySelector('[data-submit]');
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Sending…';
    }

    window.setTimeout(function () {
      var list = sessions();
      list.push({
        id: LF.uid('se'),
        mentor: m.name,
        mentorRole: m.role,
        date: date,
        time: timeInput.value,
        goals: goals,
        status: 'Requested'
      });
      if (!saveSessions(list)) {
        LF.toast('Could not write to local storage.', 'error');
        if (btn) { btn.disabled = false; btn.textContent = 'Send request'; }
        return;
      }
      pushNotification('session', 'Session requested', 'You asked for a session with ' + m.name + ' on ' + dateLabel(date) + ' at ' + timeInput.value + '.');
      LF.toast('Session requested with ' + m.name + '.', 'success');
      closeModal();
      render();
    }, 500);
  }

  /* ============================ PITCH DECK =============================== */

  var DECK_EXTENSIONS = ['pdf', 'ppt', 'pptx'];
  var DOC_EXTENSIONS = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'csv', 'txt'];
  var MAX_FILE_SIZE = 10 * 1024 * 1024;

  function fileSizeLabel(bytes) {
    return fileSize(bytes);
  }

  function sampleDeck() {
    return {
      name: 'novamind-pitch-deck-sample.pdf',
      size: 2416640,
      type: 'application/pdf',
      uploadedAt: new Date(addDays(-2).getTime() + 10 * 3600000).toISOString(),
      sample: true
    };
  }

  function deck() {
    var d = LF.store.get(K.deck, sampleDeck());
    return d && typeof d === 'object' ? d : null;
  }

  function validateUpload(file, allowed) {
    var name = String((file && file.name) || '');
    var ext = name.indexOf('.') > -1 ? name.split('.').pop().toLowerCase() : '';
    if (!ext || allowed.indexOf(ext) === -1) {
      return {
        ok: false,
        error: 'Unsupported file type (' + (ext ? '.' + ext : 'no extension') + '). Allowed: ' + allowed.join(', ') + '.'
      };
    }
    if (Number(file.size) > MAX_FILE_SIZE) {
      return { ok: false, error: 'File is too large (' + fileSizeLabel(file.size) + '). The maximum size is 10 MB.' };
    }
    return {
      ok: true,
      ext: ext,
      name: name,
      size: Number(file.size) || 0,
      type: file.type || ('application/' + ext)
    };
  }

  function setDeckError(message) {
    var node = document.querySelector('[data-deck-error]');
    if (node) {
      node.textContent = message || '';
      node.classList.toggle('hidden', !message);
    }
    if (message) LF.toast(message, 'error');
  }

  function deckSubmissionCard(d) {
    var ext = (String(d.name).split('.').pop() || 'file').toUpperCase();
    return '<div class="flex flex-col gap-4 rounded-2xl border border-line bg-page p-5 sm:flex-row sm:items-center">' +
      '<span class="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-danger/10 text-danger">' + svg(I.fileText, 22) + '</span>' +
      '<div class="min-w-0 flex-1">' +
      '<p class="truncate text-sm font-semibold text-ink">' + esc(d.name) + '</p>' +
      '<div class="mt-2 flex flex-wrap items-center gap-2">' +
      badge(ext + ' file', 'bg-primary/15 text-primary') +
      (d.sample ? badge('Sample record', 'bg-secondary/15 text-secondary') : '') +
      '<span class="text-xs font-medium text-muted">' + esc(fileSizeLabel(d.size)) + '</span>' +
      '<span class="text-xs font-medium text-muted">Uploaded ' + esc(dateLabel(d.uploadedAt)) + '</span>' +
      '</div></div>' +
      '<div class="flex shrink-0 gap-2">' +
      '<button type="button" class="btn btn-outline btn-sm" data-action="deck-replace">Replace</button>' +
      '<button type="button" class="btn btn-ghost btn-sm text-danger hover:bg-danger/10 hover:text-danger" data-action="deck-remove">Remove</button>' +
      '</div></div>';
  }

  function renderDeck() {
    var d = deck();

    var html = '<div class="mx-auto flex max-w-6xl flex-col gap-6 lg:gap-8">';
    html += pageHead(
      'Pitch Deck Submission',
      'Drag and drop or browse for your deck. Only the file name, size, type and timestamp are saved.',
      d ? badge('Submitted', 'bg-success/15 text-success') : badge('Not submitted', 'bg-warning/15 text-warning')
    );

    html += sectionCard(
      'Current submission',
      d ? 'Metadata record kept in localStorage.' : 'No deck recorded for this startup yet.',
      '',
      d
        ? deckSubmissionCard(d)
        : emptyState({
            icon: I.upload,
            tone: 'bg-softindigo text-primary',
            title: 'No pitch deck submitted',
            body: 'Upload a PDF, PPT or PPTX file below to record your current submission.',
            action: ''
          })
    );

    html += sectionCard(
      'Upload a new deck',
      'Accepted formats: PDF, PPT, PPTX — maximum 10 MB.',
      '',
      '<div data-dropzone class="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-line bg-page px-5 py-10 text-center transition duration-200 hover:border-primary/50">' +
      '<span class="grid h-12 w-12 place-items-center rounded-2xl bg-softindigo text-primary">' + svg(I.upload, 22) + '</span>' +
      '<p class="text-sm font-semibold text-ink">Drag &amp; drop your pitch deck here</p>' +
      '<p class="text-xs text-muted">or use the button — this works on touch devices too</p>' +
      '<button type="button" class="btn btn-outline btn-sm mt-1" data-action="deck-browse">Browse files</button>' +
      '<input type="file" id="deck-input" class="sr-only" tabindex="-1" aria-hidden="true" ' +
      'accept=".pdf,.ppt,.pptx,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation" data-file="deck" />' +
      '<p class="field-error hidden" data-deck-error role="alert"></p>' +
      '</div>' +
      '<div class="mt-4 hidden" data-upload-progress>' +
      '<div class="flex items-center justify-between gap-3 text-xs font-semibold text-muted">' +
      '<span class="truncate" data-upload-name>Uploading…</span><span data-upload-pct>0%</span></div>' +
      '<div class="lf-progress mt-2"><span data-upload-bar style="width:0%"></span></div>' +
      '</div>'
    );

    html += '<p class="flex items-start gap-2.5 rounded-xl border border-warning/40 bg-warning/10 px-4 py-3.5 text-sm font-medium leading-relaxed text-ink">' +
      '<span class="mt-0.5 shrink-0 text-warning">' + svg(I.alert, 16) + '</span>' +
      '<span><strong>Frontend demo only</strong> — files are not stored on a server. Real uploads require secure backend storage.</span></p>';

    html += demoNote('File contents never touch this page: after the simulated progress bar finishes, only the metadata (name, size, type, timestamp) is written to localStorage.');
    html += '</div>';
    return html;
  }

  function handleDeckFile(file) {
    if (!file) return;
    var check = validateUpload(file, DECK_EXTENSIONS);
    if (!check.ok) {
      setDeckError(check.error);
      return;
    }
    setDeckError('');
    runUpload(check, 'deck');
  }

  function runUpload(meta) {
    var wrap = document.querySelector('[data-upload-progress]');
    var bar = document.querySelector('[data-upload-bar]');
    var pct = document.querySelector('[data-upload-pct]');
    var nameEl = document.querySelector('[data-upload-name]');
    var browse = document.querySelector('[data-action="deck-browse"]');

    if (nameEl) nameEl.textContent = meta.name;
    if (wrap) wrap.classList.remove('hidden');
    if (browse) browse.disabled = true;

    var duration = LF.prefersReducedMotion() ? 350 : 1200;
    var start = performance.now();

    function step(now) {
      var p = Math.min(1, (now - start) / duration);
      var v = Math.round(p * 100);
      if (bar) bar.style.width = v + '%';
      if (pct) pct.textContent = v + '%';
      if (p < 1) {
        window.requestAnimationFrame(step);
        return;
      }
      finishDeckUpload(meta);
    }
    window.requestAnimationFrame(step);
  }

  function finishDeckUpload(meta) {
    var record = { name: meta.name, size: meta.size, type: meta.type, uploadedAt: new Date().toISOString() };
    if (!LF.store.set(K.deck, record)) {
      LF.toast('Could not write to local storage.', 'error');
      return;
    }
    pushNotification('update', 'Pitch deck submitted', record.name + ' is now your current deck (metadata only).');
    LF.toast('Pitch deck submitted: ' + record.name, 'success');
    render();
  }

  /* ============================== DOCUMENTS ============================== */

  var DOC_TYPES = ['Business Plan', 'Pitch Deck', 'Financial Projections', 'Market Research', 'Other'];
  var DOC_STATUSES = ['Current', 'Draft', 'Outdated'];

  var DOC_TONE = {
    'Current': 'bg-success/15 text-success',
    'Draft': 'bg-warning/15 text-warning',
    'Outdated': 'bg-muted/15 text-muted'
  };

  var DOC_ICON = {
    'Business Plan': I.briefcase,
    'Pitch Deck': I.presentation,
    'Financial Projections': I.trending,
    'Market Research': I.target,
    'Other': I.fileText
  };

  function sampleDocuments() {
    return [
      { id: 'doc-1', name: 'NovaMind AI — Business Plan', type: 'Business Plan', ext: 'pdf', size: 1887436, updated: toIso(addDays(-60)), status: 'Current' },
      { id: 'doc-2', name: 'NovaMind AI — Pitch Deck', type: 'Pitch Deck', ext: 'pptx', size: 5452595, updated: toIso(addDays(-12)), status: 'Current' },
      { id: 'doc-3', name: 'Financial Projections — 18 months', type: 'Financial Projections', ext: 'pdf', size: 658432, updated: toIso(addDays(-20)), status: 'Draft' },
      { id: 'doc-4', name: 'Market Research Summary', type: 'Market Research', ext: 'pdf', size: 1247232, updated: toIso(addDays(-33)), status: 'Current' },
      { id: 'doc-5', name: 'Team Cap Table (demo)', type: 'Other', ext: 'xlsx', size: 96256, updated: toIso(addDays(-48)), status: 'Outdated' }
    ];
  }

  function documents() {
    var list = LF.store.get(K.documents, null);
    if (Array.isArray(list)) return list;
    return sampleDocuments();
  }

  function saveDocuments(list) {
    return LF.store.set(K.documents, list);
  }

  function documentRow(d) {
    var icon = DOC_ICON[d.type] || I.fileText;
    var tone = DOC_TONE[d.status] || DOC_TONE['Draft'];
    return '<tr>' +
      '<td><div class="flex items-center gap-3">' +
      '<span class="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-softindigo text-primary">' + svg(icon, 17) + '</span>' +
      '<div class="min-w-0"><p class="max-w-[16rem] truncate font-semibold text-ink">' + esc(d.name) + '</p>' +
      '<p class="mt-0.5 text-xs uppercase tracking-wider text-muted">' + esc(String(d.ext || 'file')) + ' · ' + esc(fileSizeLabel(d.size)) + '</p></div>' +
      '</div></td>' +
      '<td>' + badge(d.type, 'bg-softindigo text-primary') + '</td>' +
      '<td class="whitespace-nowrap text-muted">' + esc(dateLabel(d.updated)) + '</td>' +
      '<td>' + badge(d.status, tone) + '</td>' +
      '<td><div class="flex items-center justify-end gap-2">' +
      '<button type="button" class="icon-btn h-9 w-9" data-demo-note="Document downloads are not available in this frontend demo." aria-label="Download ' + esc(d.name) + '">' + svg(I.download, 16) + '</button>' +
      '<button type="button" class="icon-btn h-9 w-9 hover:border-danger/40 hover:text-danger" data-action="doc-delete" data-id="' + esc(d.id) + '" aria-label="Delete ' + esc(d.name) + '">' + svg(I.trash, 16) + '</button>' +
      '</div></td></tr>';
  }

  function documentCard(d) {
    var icon = DOC_ICON[d.type] || I.fileText;
    var tone = DOC_TONE[d.status] || DOC_TONE['Draft'];
    return '<article class="card p-5">' +
      '<div class="flex items-start justify-between gap-3">' +
      '<span class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-softindigo text-primary">' + svg(icon, 18) + '</span>' +
      badge(d.status, tone) + '</div>' +
      '<h4 class="mt-3 break-words font-display text-sm font-bold text-ink">' + esc(d.name) + '</h4>' +
      '<p class="mt-1 text-xs uppercase tracking-wider text-muted">' + esc(String(d.ext || 'file')) + ' · ' + esc(fileSizeLabel(d.size)) + '</p>' +
      '<div class="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">' +
      '<span class="text-xs font-medium text-muted">Updated ' + esc(dateLabel(d.updated)) + '</span>' +
      '<div class="flex gap-2">' +
      '<button type="button" class="btn btn-ghost btn-sm" data-demo-note="Document downloads are not available in this frontend demo.">Download</button>' +
      '<button type="button" class="btn btn-ghost btn-sm text-danger hover:bg-danger/10 hover:text-danger" data-action="doc-delete" data-id="' + esc(d.id) + '">Delete</button>' +
      '</div></div></article>';
  }

  function renderDocuments() {
    var list = documents();

    var html = '<div class="mx-auto flex max-w-6xl flex-col gap-6 lg:gap-8">';
    html += pageHead(
      'Documents',
      'Your startup document library. Adding a document records its metadata only — the file is never stored.',
      '<button type="button" class="btn btn-primary btn-sm shrink-0" data-action="doc-add">' + svg(I.plus, 16) + 'Add document</button>'
    );

    if (!list.length) {
      html += emptyState({
        icon: I.fileText,
        tone: 'bg-softindigo text-primary',
        title: 'Your library is empty',
        body: 'Add a business plan, deck or research file to see it listed here with its status.',
        action: '<button type="button" class="btn btn-primary mt-5" data-action="doc-add">' + svg(I.plus, 16) + 'Add document</button>'
      });
    } else {
      /* Desktop table */
      html += '<section class="card hidden overflow-hidden md:block" aria-label="Document list">' +
        '<div class="table-wrap"><table class="data-table">' +
        '<thead><tr><th>Document</th><th>Type</th><th>Updated</th><th>Status</th><th class="text-end">Actions</th></tr></thead>' +
        '<tbody>' + list.map(documentRow).join('') + '</tbody></table></div></section>';

      /* Mobile cards */
      html += '<section aria-label="Document list" class="flex flex-col gap-4 md:hidden">' +
        list.map(documentCard).join('') + '</section>';
    }

    html += demoNote('Local demo listing — entries live in this browser and are cleared by Reset Demo Data in Settings.');
    html += '</div>';
    return html;
  }

  function documentModal() {
    var body = '<form data-form="document" novalidate>' +
      '<div class="field">' +
      '<label class="label" for="doc-file">Choose file</label>' +
      '<input type="file" id="doc-file" name="doc-file" class="input lf-file" data-file="doc" ' +
      'accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.csv,.txt" required data-error-message="Choose a file to add." />' +
      '<p class="field-hint">Metadata only: PDF, DOC(X), XLS(X), PPT(X), CSV or TXT up to 10 MB. The file itself is never stored.</p>' +
      '<p class="field-error hidden" data-error-for="doc-file" role="alert"></p></div>' +
      textField({
        id: 'doc-name', label: 'Display name', value: '', required: true,
        placeholder: 'e.g. Board update — Q4', errorMessage: 'Give this document a name.',
        hint: 'Prefilled from the chosen file name.'
      }) +
      '<div class="grid gap-x-5 sm:grid-cols-2">' +
      selectField('doc-type', 'Type', DOC_TYPES, DOC_TYPES[0], true) +
      selectField('doc-status', 'Status', DOC_STATUSES, 'Draft', true) +
      '</div>' +
      '<div class="mt-6 flex flex-wrap justify-end gap-3 border-t border-line pt-5">' +
      '<button type="button" class="btn btn-outline btn-sm" data-modal-close>Cancel</button>' +
      '<button type="submit" class="btn btn-primary btn-sm" data-submit>Add document</button>' +
      '</div></form>';

    openModal({ title: 'Add a document', body: body, wide: true });
  }

  function submitDocument(form) {
    if (!LF.form.validate(form)) {
      LF.toast('Please fix the highlighted fields.', 'error');
      return;
    }
    var fileInput = form.querySelector('#doc-file');
    var file = fileInput.files && fileInput.files[0];
    if (!file) {
      LF.form.showError(fileInput, 'Choose a file to add.');
      LF.toast('Choose a file first.', 'error');
      return;
    }
    var check = validateUpload(file, DOC_EXTENSIONS);
    if (!check.ok) {
      LF.form.showError(fileInput, check.error);
      LF.toast(check.error, 'error');
      return;
    }

    var name = form.querySelector('#doc-name').value.trim();
    var type = form.querySelector('#doc-type').value;
    var status = form.querySelector('#doc-status').value;
    var btn = form.querySelector('[data-submit]');
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Adding…';
    }

    window.setTimeout(function () {
      var list = documents();
      list.push({
        id: LF.uid('doc'),
        name: name,
        type: type,
        status: status,
        ext: check.ext,
        size: check.size,
        updated: toIso(today())
      });
      if (!saveDocuments(list)) {
        LF.toast('Could not write to local storage.', 'error');
        if (btn) { btn.disabled = false; btn.textContent = 'Add document'; }
        return;
      }
      pushNotification('update', 'Document added', name + ' was added to your document library.');
      LF.toast('Document added: ' + name, 'success');
      closeModal();
      render();
    }, 350);
  }

  /* ============================ NOTIFICATIONS ============================ */

  function renderNotifications() {
    var list = notifications().slice().sort(function (a, b) {
      return String(b.date || '').localeCompare(String(a.date || ''));
    });
    var unread = unreadCount();

    var actions = list.length
      ? '<button type="button" class="btn btn-outline btn-sm shrink-0" data-action="notif-read-all"' + (unread ? '' : ' disabled') + '>' +
        svg(I.check, 15) + 'Mark all read</button>'
      : '';

    var html = '<div class="mx-auto flex max-w-6xl flex-col gap-6 lg:gap-8">';
    html += pageHead(
      'Notifications',
      'Alerts generated by your own actions plus sample program updates.',
      unread ? badge(unread + ' unread', 'bg-danger/15 text-danger') : badge('All caught up', 'bg-success/15 text-success')
    );

    if (!list.length) {
      html += emptyState({
        icon: I.bell,
        tone: 'bg-softindigo text-primary',
        title: 'No notifications',
        body: 'Complete a milestone or request a mentor session and you will see an alert here.',
        action: '<a href="#/overview" class="btn btn-outline mt-5">Back to overview</a>'
      });
    } else {
      html += '<section class="card overflow-hidden" aria-label="Notification list">' +
        '<div class="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">' +
        '<h3 class="font-display text-base font-bold text-ink">All notifications' +
        (unread ? ' <span class="text-sm font-semibold text-muted">(' + unread + ' unread)</span>' : '') + '</h3>' +
        actions + '</div>' +
        '<ul class="divide-y divide-line">' + list.map(notificationItem).join('') + '</ul></section>';
    }

    html += demoNote('Notifications are generated in the browser: booking a session, completing a milestone or adding a document creates a real entry in this list.');
    html += '</div>';
    return html;
  }

  function notificationItem(n) {
    var t = notifType(n.type);
    return '<li class="flex gap-4 px-5 py-4 transition' + (n.read ? '' : ' bg-softindigo/50') + '">' +
      '<span class="grid h-10 w-10 shrink-0 place-items-center rounded-xl ' + t.tile + '">' + svg(t.icon, 18) + '</span>' +
      '<div class="min-w-0 flex-1">' +
      '<div class="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">' +
      '<p class="text-sm font-semibold leading-snug text-ink">' + esc(n.title) + '</p>' +
      '<span class="whitespace-nowrap text-xs font-medium text-muted">' + esc(dateLabel(n.date)) + '</span></div>' +
      '<p class="mt-1 text-sm leading-relaxed text-muted">' + esc(n.body) + '</p>' +
      '<div class="mt-2.5 flex flex-wrap items-center gap-3">' + badge(t.label, t.tone) +
      '<span class="text-[11px] font-semibold text-muted">' + esc(relDate(n.date)) + '</span>' +
      '<button type="button" class="text-xs font-bold text-primary transition hover:underline" data-action="notif-toggle" data-id="' + esc(n.id) + '">' +
      (n.read ? 'Mark unread' : 'Mark as read') + '</button>' +
      '</div></div>' +
      (n.read ? '' : '<span class="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" aria-hidden="true"></span>') +
      '</li>';
  }

  /* ================================ SETTINGS ============================= */

  function themeSegment() {
    var current = LF.theme.stored() || 'system';
    var opts = [['light', 'Light'], ['dark', 'Dark'], ['system', 'System']];
    var buttons = opts.map(function (o) {
      var active = current === o[0];
      return '<button type="button" class="rounded-lg px-4 py-2 text-xs font-bold transition sm:text-sm ' +
        (active ? 'bg-surface text-primary shadow-card' : 'text-muted hover:text-primary') +
        '" data-action="theme-set" data-theme="' + o[0] + '" aria-pressed="' + active + '">' + o[1] + '</button>';
    }).join('');
    return '<div class="inline-flex rounded-xl border border-line bg-page p-1" role="group" aria-label="Theme preference">' + buttons + '</div>' +
      '<p class="mt-3 text-xs leading-relaxed text-muted">System follows your device preference. The choice is remembered on this device.</p>';
  }

  function pwStrengthMeta(value) {
    var v = String(value || '');
    var score = 0;
    if (v.length >= 8) score += 1;
    if (v.length >= 12) score += 1;
    if (/[A-Z]/.test(v) && /[a-z]/.test(v)) score += 1;
    if (/\d/.test(v)) score += 1;
    if (/[^A-Za-z0-9]/.test(v)) score += 1;
    score = Math.min(score, 4);
    var meta = [
      { label: 'Too short', color: 'rgb(var(--c-danger))' },
      { label: 'Weak', color: 'rgb(var(--c-danger))' },
      { label: 'Fair', color: 'rgb(var(--c-warning))' },
      { label: 'Good', color: 'rgb(var(--c-primary))' },
      { label: 'Strong', color: 'rgb(var(--c-success))' }
    ];
    return { score: score, label: meta[score].label, color: meta[score].color, width: (score / 4) * 100 };
  }

  function renderSettings() {
    var f = founder();

    var html = '<div class="mx-auto flex max-w-6xl flex-col gap-6 lg:gap-8">';
    html += pageHead('Settings', 'Profile, demo security controls and console preferences.', '');

    html += '<div class="grid gap-6 lg:grid-cols-2">';

    /* Founder profile */
    html += sectionCard(
      'Founder profile',
      'Saved to localStorage in this browser — not sent anywhere.',
      '',
      '<form data-form="profile" novalidate>' +
      '<div class="grid gap-x-5 sm:grid-cols-2">' +
      textField({ id: 'pf-name', label: 'Full name', value: f.name, required: true, errorMessage: 'Your name is required.' }) +
      textField({ id: 'pf-email', label: 'Email', type: 'email', value: f.email, required: true, errorMessage: 'A valid email is required.' }) +
      textField({ id: 'pf-phone', label: 'Phone', type: 'tel', value: f.phone, hint: 'Optional — 7 to 15 digits.' }) +
      '</div>' +
      '<div class="mt-2 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">' +
      '<p class="text-xs text-muted">Role: <span class="font-bold uppercase tracking-wider text-ink">' + esc(f.role === 'admin' ? 'Admin' : 'Founder') + '</span></p>' +
      '<button type="submit" class="btn btn-primary btn-sm" data-submit>Save profile</button>' +
      '</div></form>'
    );

    /* Change password */
    html += sectionCard(
      'Change password',
      'UI demonstration only — nothing is validated against a server.',
      '',
      '<form data-form="password" novalidate>' +
      textField({ id: 'pw-current', label: 'Current password', type: 'password', value: '', required: true, errorMessage: 'Enter your current password.' }) +
      '<div class="grid gap-x-5 sm:grid-cols-2">' +
      textField({ id: 'pw-new', label: 'New password', type: 'password', value: '', required: true, errorMessage: 'Choose a new password.' }) +
      textField({ id: 'pw-confirm', label: 'Confirm new password', type: 'password', value: '', required: true, errorMessage: 'Repeat the new password.' }) +
      '</div>' +
      '<div class="rounded-xl border border-line bg-page px-4 py-3">' +
      '<div class="flex items-center justify-between gap-3 text-xs font-bold">' +
      '<span class="uppercase tracking-wider text-muted">Strength</span>' +
      '<span data-pw-label class="text-ink">—</span></div>' +
      '<div class="mt-2 h-2 w-full overflow-hidden rounded-full bg-line">' +
      '<div data-pw-bar class="h-full rounded-full transition-all duration-300" style="width:0%;background-color:rgb(var(--c-muted))"></div></div>' +
      '<p class="mt-2 text-[11px] leading-relaxed text-muted">Tip: 8+ characters mixing upper and lower case, numbers and symbols.</p>' +
      '</div>' +
      '<div class="mt-5 flex justify-end"><button type="submit" class="btn btn-primary btn-sm" data-submit>Update password</button></div>' +
      '</form>'
    );

    /* Startup shortcut */
    html += sectionCard(
      'Startup details shortcut',
      'Jump straight to your company record to edit name, stage, team and contact info.',
      '',
      '<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">' +
      '<div class="flex items-center gap-3">' +
      '<span class="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-softorange text-secondary">' + svg(I.rocket, 19) + '</span>' +
      '<div><p class="text-sm font-semibold text-ink">' + esc(startup().name) + '</p>' +
      '<p class="text-xs text-muted">' + esc(startup().stage) + ' · ' + esc(startup().industry) + '</p></div></div>' +
      '<a href="#/startup" class="btn btn-outline btn-sm shrink-0">Open My Startup' + svg(I.arrowRight, 15) + '</a>' +
      '</div>'
    );

    /* Theme */
    html += sectionCard(
      'Theme preference',
      'Light, dark or follow your system — the same control as the topbar toggle.',
      '',
      themeSegment()
    );

    /* Danger zone */
    html += sectionCard(
      'Danger zone',
      'Irreversible for demo data in this browser.',
      '',
      '<p class="text-sm leading-relaxed text-muted">Reset every locally stored demo item — applications, milestones, sessions, uploads and profile changes. Your theme and direction choices are kept.</p>' +
      '<button type="button" class="btn btn-outline mt-4 border-danger text-danger hover:border-danger hover:bg-danger/10 hover:text-danger" data-reset-demo>' +
      svg(I.refresh, 16) + 'Reset demo data</button>',
      'border-danger/40 lg:col-span-2'
    );

    html += '</div>';
    html += demoNote('Password changes and profile saves are local UI demonstrations — this demo has no backend and stores nothing securely.');
    html += '</div>';
    return html;
  }

  function submitProfile(form) {
    if (!LF.form.validate(form)) {
      LF.toast('Please fix the highlighted fields.', 'error');
      return;
    }
    var name = form.querySelector('#pf-name').value.trim();
    var email = form.querySelector('#pf-email').value.trim();
    var phone = form.querySelector('#pf-phone').value.trim();

    if (!LF.form.isEmail(email)) {
      LF.form.showError(form.querySelector('#pf-email'), 'Please enter a valid email address.');
      LF.toast('That email address does not look valid.', 'error');
      return;
    }
    if (phone && !LF.form.isPhone(phone)) {
      LF.form.showError(form.querySelector('#pf-phone'), 'Enter 7–15 digits, or leave it blank.');
      LF.toast('That phone number does not look valid.', 'error');
      return;
    }

    var btn = form.querySelector('[data-submit]');
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Saving…';
    }

    window.setTimeout(function () {
      if (!LF.store.set(K.founderProfile, { name: name, email: email, phone: phone })) {
        LF.toast('Could not write to local storage.', 'error');
        if (btn) { btn.disabled = false; btn.textContent = 'Save profile'; }
        return;
      }
      identityToTopbar();
      LF.toast('Profile saved locally.', 'success');
      render();
    }, 400);
  }

  function submitPassword(form) {
    if (!LF.form.validate(form)) {
      LF.toast('Please fix the highlighted fields.', 'error');
      return;
    }
    var next = form.querySelector('#pw-new').value;
    var confirmInput = form.querySelector('#pw-confirm');
    if (next.length < 8) {
      LF.form.showError(form.querySelector('#pw-new'), 'Use at least 8 characters.');
      LF.toast('New password is too short.', 'error');
      return;
    }
    if (next !== confirmInput.value) {
      LF.form.showError(confirmInput, 'Passwords do not match.');
      LF.toast('Passwords do not match.', 'error');
      return;
    }

    var btn = form.querySelector('[data-submit]');
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Checking…';
    }

    window.setTimeout(function () {
      form.reset();
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Update password';
      }
      LF.toast('Password change is a UI demonstration only — not stored securely.', 'warning');
    }, 500);
  }

  /* =========================== EVENT DELEGATION ========================== */

  function doLogout() {
    LF.confirm({
      title: 'Log out of the console?',
      message: 'You will be returned to the demo login page. Your locally stored demo data stays in this browser.',
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
      case 'startup-edit':
        startupEditing = true;
        render();
        window.setTimeout(function () {
          var first = document.getElementById('st-name');
          if (first) first.focus();
        }, 30);
        break;

      case 'startup-cancel':
        startupEditing = false;
        render();
        LF.toast('Edit cancelled — no changes were saved.', 'info');
        break;

      case 'ms-add':
        milestoneModal(null);
        break;

      case 'ms-edit': {
        var found = null;
        milestones().forEach(function (m) {
          if (m.id === btn.getAttribute('data-id')) found = m;
        });
        if (found) milestoneModal(found);
        break;
      }

      case 'ms-delete': {
        var id = btn.getAttribute('data-id');
        var victim = null;
        milestones().forEach(function (m) {
          if (m.id === id) victim = m;
        });
        if (!victim) break;
        LF.confirm({
          title: 'Delete milestone?',
          message: '"' + victim.title + '" will be removed from your demo plan. This cannot be undone.',
          confirmLabel: 'Delete'
        }).then(function (ok) {
          if (!ok) return;
          var next = milestones().filter(function (m) {
            return m.id !== id;
          });
          if (!saveMilestones(next)) {
            LF.toast('Could not write to local storage.', 'error');
            return;
          }
          LF.toast('Milestone deleted: ' + victim.title, 'success');
          render();
        });
        break;
      }

      case 'ms-complete': {
        var cid = btn.getAttribute('data-id');
        var target = null;
        var nextList = milestones().map(function (m) {
          if (m.id !== cid) return m;
          target = m;
          return { id: m.id, title: m.title, dueDate: m.dueDate, progress: 100 };
        });
        if (!target) break;
        if (!saveMilestones(nextList)) {
          LF.toast('Could not write to local storage.', 'error');
          break;
        }
        pushNotification('milestone', 'Milestone completed', target.title + ' was marked complete.');
        LF.toast(target.title + ' marked complete.', 'success');
        render();
        break;
      }

      case 'ms-filter':
        msFilter = btn.getAttribute('data-filter') || 'All';
        render();
        break;

      case 'mentor-request':
        sessionModal(btn.getAttribute('data-mentor'));
        break;

      case 'session-cancel': {
        var sid = btn.getAttribute('data-id');
        var targetSession = null;
        sessions().forEach(function (s) {
          if (s.id === sid) targetSession = s;
        });
        if (!targetSession) break;
        LF.confirm({
          title: 'Cancel this session?',
          message: 'Your session with ' + targetSession.mentor + ' on ' + dateLabel(targetSession.date) + ' will be marked as cancelled.',
          confirmLabel: 'Cancel session'
        }).then(function (ok) {
          if (!ok) return;
          var next = sessions().map(function (s) {
            if (s.id !== sid) return s;
            var copy = {};
            Object.keys(s).forEach(function (key) { copy[key] = s[key]; });
            copy.status = 'Cancelled';
            return copy;
          });
          if (!saveSessions(next)) {
            LF.toast('Could not write to local storage.', 'error');
            return;
          }
          LF.toast('Session cancelled.', 'success');
          render();
        });
        break;
      }

      case 'deck-browse': {
        var deckInput = document.getElementById('deck-input');
        if (deckInput) deckInput.click();
        break;
      }

      case 'deck-replace': {
        var replaceInput = document.getElementById('deck-input');
        if (replaceInput) replaceInput.click();
        break;
      }

      case 'deck-remove':
        LF.confirm({
          title: 'Remove pitch deck?',
          message: 'The stored metadata for your current deck will be deleted. The demo never stored the file itself.',
          confirmLabel: 'Remove deck'
        }).then(function (ok) {
          if (!ok) return;
          if (!LF.store.set(K.deck, null)) {
            LF.toast('Could not write to local storage.', 'error');
            return;
          }
          LF.toast('Pitch deck submission removed.', 'success');
          render();
        });
        break;

      case 'doc-add':
        documentModal();
        break;

      case 'doc-delete': {
        var docId = btn.getAttribute('data-id');
        var docVictim = null;
        documents().forEach(function (d) {
          if (d.id === docId) docVictim = d;
        });
        if (!docVictim) break;
        LF.confirm({
          title: 'Delete document?',
          message: '"' + docVictim.name + '" will be removed from your demo library.',
          confirmLabel: 'Delete'
        }).then(function (ok) {
          if (!ok) return;
          var nextDocs = documents().filter(function (d) {
            return d.id !== docId;
          });
          if (!saveDocuments(nextDocs)) {
            LF.toast('Could not write to local storage.', 'error');
            return;
          }
          LF.toast('Document deleted: ' + docVictim.name, 'success');
          render();
        });
        break;
      }

      case 'notif-toggle': {
        var nid = btn.getAttribute('data-id');
        var toggled = notifications().map(function (n) {
          if (n.id !== nid) return n;
          var copy = {};
          Object.keys(n).forEach(function (key) { copy[key] = n[key]; });
          copy.read = !copy.read;
          return copy;
        });
        saveNotifications(toggled);
        render();
        break;
      }

      case 'notif-read-all': {
        var allRead = notifications().map(function (n) {
          var copy = {};
          Object.keys(n).forEach(function (key) { copy[key] = n[key]; });
          copy.read = true;
          return copy;
        });
        saveNotifications(allRead);
        LF.toast('All notifications marked as read.', 'success');
        render();
        break;
      }

      case 'theme-set':
        LF.theme.set(btn.getAttribute('data-theme') || 'system');
        break;

      default:
        break;
    }
  });

  /* --------------------------------- input -------------------------------- */

  document.addEventListener('input', function (e) {
    var t = e.target;
    if (!t || !t.tagName) return;

    if (t.id === 'se-goals') {
      var counter = t.parentNode.querySelector('[data-goals-count]');
      if (counter) counter.textContent = String(t.value.length);
      return;
    }

    if (t.id === 'pw-new') {
      var meta = pwStrengthMeta(t.value);
      var label = document.querySelector('[data-pw-label]');
      var bar = document.querySelector('[data-pw-bar]');
      if (label) label.textContent = t.value ? meta.label : '—';
      if (bar) {
        bar.style.width = t.value ? meta.width + '%' : '0%';
        bar.style.backgroundColor = t.value ? meta.color : 'rgb(var(--c-muted))';
      }
      return;
    }

    if (t.getAttribute && t.getAttribute('data-ms-range')) {
      var card = t.closest('[data-ms-card]');
      if (!card) return;
      var valueLabel = card.querySelector('[data-ms-value]');
      var barEl = card.querySelector('.lf-progress > span');
      var barWrap = card.querySelector('.lf-progress');
      if (valueLabel) valueLabel.textContent = t.value + '%';
      if (barEl) barEl.style.width = t.value + '%';
      if (barWrap) barWrap.setAttribute('aria-valuenow', t.value);
      return;
    }

    if (t.id === 'ms-progress') {
      var modalValue = document.querySelector('[data-ms-modal-value]');
      if (modalValue) modalValue.textContent = t.value + '%';
    }
  });

  /* -------------------------------- change -------------------------------- */

  document.addEventListener('change', function (e) {
    var t = e.target;
    if (!t || !t.tagName) return;

    if (t.getAttribute && t.getAttribute('data-ms-range')) {
      setMilestoneProgress(t.getAttribute('data-ms-range'), t.value);
      return;
    }

    if (t.getAttribute && t.getAttribute('data-logo-input') !== null && t.type === 'file') {
      var imgFile = t.files && t.files[0];
      if (!imgFile) return;
      if (!/^image\//.test(imgFile.type)) {
        LF.toast('Please choose an image file for the logo.', 'error');
        t.value = '';
        return;
      }
      if (imgFile.size > 2 * 1024 * 1024) {
        LF.toast('Please choose an image smaller than 2 MB.', 'error');
        t.value = '';
        return;
      }
      var reader = new FileReader();
      reader.onload = function (ev) {
        logoPreview = ev.target.result;
        render();
        LF.toast('Logo previewed locally — images are not persisted or uploaded in this demo.', 'warning');
      };
      reader.onerror = function () {
        LF.toast('That image could not be read.', 'error');
      };
      reader.readAsDataURL(imgFile);
      return;
    }

    var fileKind = t.getAttribute && t.getAttribute('data-file');
    if (fileKind === 'deck') {
      handleDeckFile(t.files && t.files[0]);
      return;
    }

    if (fileKind === 'doc') {
      var docFile = t.files && t.files[0];
      if (!docFile) return;
      var check = validateUpload(docFile, DOC_EXTENSIONS);
      var nameField = document.getElementById('doc-name');
      if (!check.ok) {
        LF.form.showError(t, check.error);
        LF.toast(check.error, 'error');
        t.value = '';
        return;
      }
      LF.form.clearError(t);
      if (nameField && !nameField.value.trim()) {
        nameField.value = check.name.replace(/\.[^.]+$/, '');
      }
      return;
    }
  });

  /* -------------------------------- submit -------------------------------- */

  document.addEventListener('submit', function (e) {
    var form = e.target;
    if (!form || !form.getAttribute) return;
    var kind = form.getAttribute('data-form');
    if (!kind) return;
    e.preventDefault();

    if (kind === 'milestone') submitMilestone(form);
    else if (kind === 'session') submitSession(form);
    else if (kind === 'startup') submitStartup(form);
    else if (kind === 'profile') submitProfile(form);
    else if (kind === 'password') submitPassword(form);
    else if (kind === 'document') submitDocument(form);
  });

  function submitStartup(form) {
    if (!LF.form.validate(form)) {
      LF.toast('Please fix the highlighted fields.', 'error');
      return;
    }
    var nameInput = form.querySelector('#st-name');
    var teamInput = form.querySelector('#st-team');
    var websiteInput = form.querySelector('#st-website');
    var emailInput = form.querySelector('#st-founder-email');
    var phoneInput = form.querySelector('#st-founder-phone');

    var team = Number(teamInput.value);
    if (isNaN(team) || team < 1 || team > 1000) {
      LF.form.showError(teamInput, 'Enter a team size between 1 and 1000.');
      LF.toast('Team size must be between 1 and 1000.', 'error');
      return;
    }
    var email = emailInput.value.trim();
    if (!LF.form.isEmail(email)) {
      LF.form.showError(emailInput, 'Please enter a valid email address.');
      LF.toast('That email address does not look valid.', 'error');
      return;
    }
    var phone = phoneInput.value.trim();
    if (phone && !LF.form.isPhone(phone)) {
      LF.form.showError(phoneInput, 'Enter 7–15 digits, or leave it blank.');
      LF.toast('That phone number does not look valid.', 'error');
      return;
    }
    var website = websiteInput.value.trim();
    if (website && !/^https?:\/\/.+\..+/.test(website)) {
      LF.form.showError(websiteInput, 'Include https:// and a domain, or leave it blank.');
      LF.toast('Website must start with https://', 'error');
      return;
    }

    var btn = form.querySelector('[data-submit]');
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Saving…';
    }

    window.setTimeout(function () {
      var record = {
        name: nameInput.value.trim(),
        industry: form.querySelector('#st-industry').value,
        stage: form.querySelector('#st-stage').value,
        description: form.querySelector('#st-description').value.trim(),
        website: website,
        teamSize: team,
        logo: startup().logo,
        founder: {
          name: form.querySelector('#st-founder-name').value.trim(),
          email: email,
          phone: phone
        }
      };
      if (!LF.store.set(K.startup, record)) {
        LF.toast('Could not write to local storage.', 'error');
        if (btn) { btn.disabled = false; btn.textContent = 'Save changes'; }
        return;
      }
      startupEditing = false;
      LF.toast('Startup profile saved locally.', 'success');
      render();
    }, 400);
  }

  /* ------------------------- drag & drop uploads ------------------------- */

  function dropTarget(e) {
    return e.target && e.target.closest ? e.target.closest('[data-dropzone]') : null;
  }

  document.addEventListener('dragover', function (e) {
    var zone = dropTarget(e);
    if (!zone) return;
    e.preventDefault();
    zone.classList.add('border-primary', 'bg-softindigo');
  });

  document.addEventListener('dragleave', function (e) {
    var zone = dropTarget(e);
    if (!zone) return;
    zone.classList.remove('border-primary', 'bg-softindigo');
  });

  document.addEventListener('drop', function (e) {
    var zone = dropTarget(e);
    if (!zone) return;
    e.preventDefault();
    zone.classList.remove('border-primary', 'bg-softindigo');
    var files = e.dataTransfer && e.dataTransfer.files;
    if (files && files.length) handleDeckFile(files[0]);
  });

  /* ================================= BOOT ================================= */

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

    /* Any nav link closes the mobile drawer before the route renders */
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
      if (currentRoute === '#/settings') render();
    });
    document.addEventListener('lf:rtl-change', syncControlLabels);

    var lastDesktop = isDesktop();
    var lastSmall = window.innerWidth < 700;
    window.addEventListener('resize', LF.debounce(function () {
      var desktop = isDesktop();
      if (desktop !== lastDesktop) {
        lastDesktop = desktop;
        if (desktop) setDrawer(false);
      }
      var small = window.innerWidth < 700;
      if (small !== lastSmall) {
        lastSmall = small;
        if (currentRoute === '#/overview') render();
      }
    }, 180));
  }

  LF.ready(boot);

})();
