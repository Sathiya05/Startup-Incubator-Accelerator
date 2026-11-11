/* ==========================================================================
 * LaunchForge Accelerator — shared footer
 * --------------------------------------------------------------------------
 * The COMPLETE footer markup lives only in this file. Every page renders it
 * with a single empty mount:  <div id="footer"></div>
 *
 * NOTE: contact details and social links are clearly-marked placeholders.
 * Replace them in the CONTACT block below once real details exist.
 * ========================================================================== */

(function () {
  'use strict';

  var BASE = (window.LaunchForge && window.LaunchForge.base) || '';

  /* ------------------------------- icons --------------------------------- */

  function svg(inner, size, filled) {
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" width="' + (size || 18) + '" height="' + (size || 18) +
      '" viewBox="0 0 24 24" ' + (filled ? 'fill="currentColor"' : 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"') +
      ' aria-hidden="true" focusable="false">' + inner + '</svg>'
    );
  }

  var SOCIALS = [
    {
      name: 'X (Twitter)',
      icon: svg('<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.451-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644Z"/>', 18, true),
    },
    {
      name: 'LinkedIn',
      icon: svg('<path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm6 0h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.5c0-1.31-.02-3-1.83-3-1.84 0-2.12 1.43-2.12 2.9V21H9V9Z"/>', 18, true),
    },
    {
      name: 'GitHub',
      icon: svg('<path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z"/>', 18, true),
    },
    {
      name: 'YouTube',
      icon: svg('<path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814ZM9.545 15.568V8.432L15.818 12l-6.273 3.568Z"/>', 18, true),
    },
  ];

  var ENTRIES = [
    {
      title: 'Explore',
      links: [
        { label: 'Home', href: 'index.html' },
        { label: 'About', href: 'about.html' },
        { label: 'Program', href: 'program.html' },
        { label: 'Portfolio', href: 'portfolio.html' },
        { label: 'Mentors', href: 'mentors.html' },
        { label: 'Contact', href: 'contact.html' },
      ],
    },
    {
      title: 'Founder Resources',
      links: [
        { label: 'Apply', href: 'apply.html' },
        { label: 'Founder Dashboard', href: 'dashboard/founder-dashboard.html' },
        { label: 'Startup Programs', href: 'program.html' },
        { label: 'Mentor Sessions', href: 'mentors.html#mentor-directory' },
      ],
    },
  ];

  function socialList(extraClass) {
    return SOCIALS.map(function (s) {
      return (
        '<a href="#" class="' + (extraClass || 'social-btn') + '" aria-label="LaunchForge on ' + s.name + '" ' +
        'title="' + s.name + ' (demo placeholder)" data-demo-note="' + s.name + ' will be linked once LaunchForge publishes an official account.">' +
        s.icon + '</a>'
      );
    }).join('');
  }

  function columnLinks(links) {
    return links
      .map(function (l) {
        return '<li><a href="' + BASE + l.href + '" class="text-sm text-muted transition duration-200 hover:text-primary hover:underline">' + l.label + '</a></li>';
      })
      .join('');
  }

  function footerMarkup() {
    var columns = ENTRIES.map(function (col) {
      return (
        '<div>' +
        '<h3 class="font-display text-sm font-bold uppercase tracking-[0.16em] text-ink">' + col.title + '</h3>' +
        '<ul class="mt-5 flex flex-col gap-3">' + columnLinks(col.links) + '</ul>' +
        '</div>'
      );
    }).join('');

    return (
      '<footer class="border-t border-line bg-surface">' +
      '<div class="container-x py-14 md:py-16">' +
      '<div class="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">' +

      /* Column 1 — brand */
      '<div class="sm:col-span-2 lg:col-span-1">' +
      '<a href="' + BASE + 'index.html" class="flex items-center gap-3" aria-label="LaunchForge Accelerator — home">' +
      '<img src="' + BASE + 'images/logo/launchforge-mark.svg" alt="" width="40" height="40" class="h-10 w-10" />' +
      '<span class="leading-tight">' +
      '<span class="block font-display text-lg font-bold text-ink">LaunchForge</span>' +
      '<span class="block text-[10px] font-bold uppercase tracking-[0.18em] text-muted">Startup Accelerator</span>' +
      '</span></a>' +
      '<p class="mt-4 max-w-sm text-sm leading-relaxed text-muted">' +
      'LaunchForge helps ambitious founders turn early-stage ideas into scalable businesses through mentorship, structured programs and a powerful startup ecosystem.</p>' +
      '<div class="mt-5 flex flex-wrap gap-2.5">' + socialList() + '</div>' +
      '</div>' +

      columns +

      /* Column 4 — contact (placeholders, editable in this file) */
      '<div>' +
      '<h3 class="font-display text-sm font-bold uppercase tracking-[0.16em] text-ink">Contact</h3>' +
      '<ul class="mt-5 flex flex-col gap-3.5 text-sm text-muted">' +
      '<li class="flex items-start gap-2.5">' +
      '<span class="mt-0.5 shrink-0 text-primary">' + svg('<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>', 16) + '</span>' +
      '<span>Innovation District,<br />Your City, Your Country</span></li>' +
      '<li><a href="' + BASE + 'contact.html" class="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition hover:underline">View full contact page<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg></a></li>' +
      '<li class="flex items-center gap-2.5">' +
      '<span class="shrink-0 text-primary">' + svg('<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>', 16) + '</span>' +
      '<a href="mailto:hello@launchforge.example" class="transition hover:text-primary">hello@launchforge.example</a></li>' +
      '<li class="flex items-center gap-2.5">' +
      '<span class="shrink-0 text-primary">' + svg('<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z"/>', 16) + '</span>' +
      '<a href="tel:+15550000000" class="transition hover:text-primary">+1 (555) 000-0000</a></li>' +
      '<li class="flex items-start gap-2.5">' +
      '<span class="mt-0.5 shrink-0 text-primary">' + svg('<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>', 16) + '</span>' +
      '<span>Monday – Friday<br />9:00 AM – 6:00 PM</span></li>' +
      '</ul></div>' +

      '</div></div>' +

      /* Footer bottom */
      '<div class="border-t border-line">' +
      '<div class="container-x flex flex-col items-center justify-between gap-4 py-6 text-center text-sm text-muted md:flex-row md:text-start">' +
      '<p>© <span data-current-year></span> LaunchForge Accelerator. All rights reserved. <span class="text-muted/70">Demo website — sample content.</span></p>' +
      '<div class="flex items-center gap-5">' +
      '<a href="#" class="transition hover:text-primary" data-demo-note="Privacy Policy page is not part of this frontend demo.">Privacy Policy</a>' +
      '<a href="#" class="transition hover:text-primary" data-demo-note="Terms &amp; Conditions page is not part of this frontend demo.">Terms &amp; Conditions</a>' +
      '</div>' +
      '<div class="flex gap-2.5">' + socialList('social-btn social-btn-sm') + '</div>' +
      '</div></div>' +
      '</footer>'
    );
  }

  /* ------------------------------- inject -------------------------------- */

  function init() {
    var mount = document.getElementById('footer');
    if (!mount || mount.dataset.rendered === '1') return;
    mount.dataset.rendered = '1';
    mount.innerHTML = footerMarkup();

    var year = mount.querySelectorAll('[data-current-year]');
    year.forEach(function (el) {
      el.textContent = String(new Date().getFullYear());
    });
  }

  if (window.LaunchForge) window.LaunchForge.ready(init);
  else document.addEventListener('DOMContentLoaded', init);
})();
