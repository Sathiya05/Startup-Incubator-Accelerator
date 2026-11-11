/* ==========================================================================
 * LaunchForge Accelerator — Startup Portfolio page
 * --------------------------------------------------------------------------
 * Renders the fictional startup dataset into #portfolio-grid and powers the
 * Filter & Explore section (industry chips + debounced search).
 *
 * Everything in STARTUPS is invented demo content — no real companies.
 * ========================================================================== */

(function () {
  'use strict';

  var LF = window.LaunchForge || {};

  /* ------------------------------ dataset ------------------------------- */
  /* 10 fictional startups — at least one per filter industry.             */

  var STARTUPS = [
    {
      name: 'NovaMind AI',
      industry: 'Technology',
      stage: 'Seed',
      description: 'An AI copilot that turns scattered team knowledge into instant, trustworthy answers.',
      image: 'images/portfolio/portfolio-ai.jpg',
      alt: 'Engineers building an artificial intelligence product on multiple screens',
      tags: ['AI', 'Knowledge', 'SaaS'],
    },
    {
      name: 'RouteHive',
      industry: 'Technology',
      stage: 'Growth',
      description: 'Route optimisation software that helps regional carriers cut empty miles and delays.',
      image: 'images/portfolio/portfolio-logistics.jpg',
      alt: 'Logistics team planning delivery routes on a digital map',
      tags: ['Logistics', 'Optimisation', 'B2B'],
    },
    {
      name: 'CareLoop',
      industry: 'Healthcare',
      stage: 'Seed',
      description: 'A remote monitoring platform that keeps chronic-care patients connected to their clinicians.',
      image: 'images/portfolio/portfolio-healthcare.jpg',
      alt: 'Healthcare professional using a digital health technology platform',
      tags: ['Remote Care', 'Chronic Care', 'Data'],
    },
    {
      name: 'VitalNest',
      industry: 'Healthcare',
      stage: 'Idea',
      description: 'A friendly triage assistant that helps clinics prioritise patient requests within minutes.',
      image: 'images/startups/startup-healthtech.jpg',
      alt: 'Clinician reviewing patient information on a tablet',
      tags: ['Triage', 'Clinics', 'AI'],
    },
    {
      name: 'PayPilot',
      industry: 'FinTech',
      stage: 'Pre-Seed',
      description: 'Cross-border payouts for freelance teams, with transparent fees and instant settlement.',
      image: 'images/portfolio/portfolio-fintech.jpg',
      alt: 'Person managing finances through a fintech mobile application',
      tags: ['Payments', 'Cross-border', 'Freelance'],
    },
    {
      name: 'LedgerLens',
      industry: 'FinTech',
      stage: 'Growth',
      description: 'Real-time financial analytics that give small businesses a clear view of cash and burn.',
      image: 'images/portfolio/portfolio-analytics.jpg',
      alt: 'Financial analytics dashboards displayed on a laptop screen',
      tags: ['Analytics', 'Cash Flow', 'SMB'],
    },
    {
      name: 'SkillSpark',
      industry: 'Education',
      stage: 'Idea',
      description: 'Project-based learning paths that help career switchers build portfolio-ready skills.',
      image: 'images/portfolio/portfolio-edtech.jpg',
      alt: 'Students learning with education technology devices in a classroom',
      tags: ['EdTech', 'Careers', 'Projects'],
    },
    {
      name: 'GreenGrid',
      industry: 'Sustainability',
      stage: 'Pre-Seed',
      description: 'Smart energy analytics that help small manufacturers cut waste and lower operating costs.',
      image: 'images/portfolio/portfolio-sustainability.jpg',
      alt: 'Clean energy technology supporting sustainable innovation',
      tags: ['Energy', 'Manufacturing', 'Analytics'],
    },
    {
      name: 'Kindred Goods',
      industry: 'Consumer Products',
      stage: 'Seed',
      description: 'A direct-to-consumer essentials brand built on refillable packaging and honest pricing.',
      image: 'images/portfolio/portfolio-commerce.jpg',
      alt: 'Modern consumer product displayed in a retail environment',
      tags: ['D2C', 'Refillable', 'Essentials'],
    },
    {
      name: 'Haven Home',
      industry: 'Consumer Products',
      stage: 'Idea',
      description: 'Affordable, repairable home goods designed for small spaces and long lifecycles.',
      image: 'images/startups/startup-consumer.jpg',
      alt: 'Consumer home goods styled on a shelf in a bright room',
      tags: ['Home', 'Repairable', 'Design'],
    },
  ];

  var DEMO_NOTE =
    'Demo profile — this is a fictional startup, so there is no live website yet. Real links will be added when companies join LaunchForge.';

  var STAGE_CLASSES = {
    Idea: 'bg-primary text-white',
    'Pre-Seed': 'bg-secondary text-white',
    Seed: 'bg-success text-white',
    Growth: 'bg-softindigo text-primary',
  };

  var state = { filter: 'All', query: '' };

  /* ------------------------------ helpers ------------------------------ */

  function esc(value) {
    return LF.escapeHtml ? LF.escapeHtml(value) : String(value == null ? '' : value);
  }

  function svg(inner, size) {
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" width="' + (size || 15) + '" height="' + (size || 15) +
      '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" ' +
      'stroke-linejoin="round" class="lf-flip" aria-hidden="true">' + inner + '</svg>'
    );
  }

  var ICON_ARROW = '<path d="M5 12h14M12 5l7 7-7 7"/>';
  var ICON_EXTERNAL =
    '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>';

  /* ------------------------------- cards -------------------------------- */

  function cardHtml(startup, index) {
    var stageClass = STAGE_CLASSES[startup.stage] || 'bg-softindigo text-primary';
    var tags = startup.tags
      .map(function (tag) {
        return '<li class="badge bg-softindigo text-primary">' + esc(tag) + '</li>';
      })
      .join('');

    return (
      '<article class="card card-hover group flex flex-col overflow-hidden animate-fade-up" style="animation-delay:' +
      (index * 0.04).toFixed(2) + 's">' +
      '<div class="relative overflow-hidden">' +
      '<img src="' + esc(startup.image) + '" alt="' + esc(startup.alt) + '" width="1200" height="800" loading="lazy" ' +
      'class="h-48 w-full object-cover transition duration-500 group-hover:scale-105" />' +
      '<span class="badge absolute top-3 end-3 ' + stageClass + '">' + esc(startup.stage) + '</span>' +
      '</div>' +
      '<div class="flex flex-1 flex-col p-6">' +
      '<span class="text-xs font-bold uppercase tracking-wider text-secondary">' + esc(startup.industry) + '</span>' +
      '<h3 class="mt-2 font-display text-lg font-bold text-ink">' + esc(startup.name) + '</h3>' +
      '<p class="mt-2 flex-1 text-sm leading-relaxed text-muted">' + esc(startup.description) + '</p>' +
      '<ul class="mt-4 flex flex-wrap gap-2">' + tags + '</ul>' +
      '<button type="button" class="btn btn-outline btn-sm mt-auto w-fit pt-5" data-demo-note="' + esc(DEMO_NOTE) + '">' +
      'Website / Profile ' + svg(ICON_EXTERNAL, 14) +
      '</button>' +
      '</div>' +
      '</article>'
    );
  }

  /* ------------------------------ filtering ----------------------------- */

  function matches(startup) {
    if (state.filter !== 'All' && startup.industry !== state.filter) return false;

    var query = state.query.trim().toLowerCase();
    if (!query) return true;

    var haystack = (
      startup.name + ' ' +
      startup.industry + ' ' +
      startup.stage + ' ' +
      startup.description + ' ' +
      startup.tags.join(' ')
    ).toLowerCase();

    return haystack.indexOf(query) !== -1;
  }

  function render() {
    var mount = document.getElementById('portfolio-grid');
    if (!mount) return;

    var list = STARTUPS.filter(matches);

    mount.innerHTML = list.map(cardHtml).join('');

    var count = document.getElementById('portfolio-count');
    if (count) {
      count.textContent = 'Showing ' + list.length + ' of ' + STARTUPS.length + ' startups';
    }

    var empty = document.getElementById('portfolio-empty');
    if (empty) empty.classList.toggle('hidden', list.length !== 0);

    if (typeof LF.animateCounters === 'function') LF.animateCounters(mount);
  }

  function syncChips() {
    document.querySelectorAll('#portfolio-filters [data-filter]').forEach(function (chip) {
      var active = chip.getAttribute('data-filter') === state.filter;
      chip.classList.toggle('chip-active', active);
      chip.setAttribute('aria-pressed', String(active));
    });
  }

  function revealGrid() {
    var section = document.getElementById('section-portfolio-grid');
    if (!section || !section.scrollIntoView) return;
    var rect = section.getBoundingClientRect();
    var visible = rect.top < window.innerHeight && rect.bottom > 0;
    if (visible) return;
    var reduce = LF.prefersReducedMotion && LF.prefersReducedMotion();
    section.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  }

  function resetFilters() {
    state.filter = 'All';
    state.query = '';
    var input = document.getElementById('portfolio-search');
    if (input) input.value = '';
    syncChips();
    render();
  }

  /* -------------------------------- boot -------------------------------- */

  function init() {
    var mount = document.getElementById('portfolio-grid');
    if (!mount || mount.dataset.portfolioReady === '1') return;
    mount.dataset.portfolioReady = '1';

    render();

    /* Industry chips (static markup in the Filter & Explore section) */
    var filters = document.getElementById('portfolio-filters');
    if (filters) {
      filters.addEventListener('click', function (e) {
        var chip = e.target.closest && e.target.closest('[data-filter]');
        if (!chip) return;
        state.filter = chip.getAttribute('data-filter') || 'All';
        syncChips();
        render();
        revealGrid();
      });
    }

    /* Debounced search */
    var search = document.getElementById('portfolio-search');
    if (search) {
      var onSearch = LF.debounce
        ? LF.debounce(function (value) {
            state.query = value;
            render();
          }, 200)
        : null;
      search.addEventListener('input', function () {
        var value = search.value;
        if (onSearch) onSearch(value);
        else {
          state.query = value;
          render();
        }
      });
    }

    /* Reset buttons — toolbar + empty state */
    ['portfolio-reset', 'portfolio-empty-reset'].forEach(function (id) {
      var btn = document.getElementById(id);
      if (btn) btn.addEventListener('click', resetFilters);
    });
  }

  if (LF.ready) LF.ready(init);
  else if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
