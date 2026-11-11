# LaunchForge — Build Conventions (internal contract for contributors)

Read this fully before touching any file. Also read `index.html` (the gold-standard
page), `css/input.css` (design system), `js/main.js` (shared runtime),
`js/navbar.js` and `js/footer.js` (shared components).

## 1. Hard rules

1. **Navbar markup lives ONLY in `js/navbar.js`.** Pages contain exactly `<div id="navbar"></div>`.
2. **Footer markup lives ONLY in `js/footer.js`.** Pages contain exactly `<div id="footer"></div>`.
   Dashboards may include the footer mount too (after their shell, full width).
3. **No frameworks, no CDN links, no external fonts, no external CSS/JS.** HTML5 + compiled
   Tailwind (`css/style.css`) + vanilla JS only.
4. **No emoji as icons.** Use inline SVG icons in the Lucide style (24x24 viewBox,
   `stroke="currentColor"`, `stroke-width="2"`, rounded caps) — copy the style used in
   `index.html` / `js/navbar.js`.
5. **Never invent real companies, people, awards, funding, partnerships or contact data.**
   All startups, mentors, testimonials and statistics are fictional and must be visibly
   labelled as demo/sample content (a small note near the section).
6. **Only reference local images from the manifest (section 5).** Never hotlink remote images.
7. **No placeholder/fake links.** Every `href` must point to a real page/anchor in this
   project, or use `data-demo-note="explanation"` (main.js shows a toast on click).
8. Write full, literal Tailwind class names — never build class strings dynamically
   (`'btn-' + size`), Tailwind cannot detect them at build time.

## 2. Page skeleton (exact)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Page Title — LaunchForge Accelerator</title>
  <meta name="description" content="Unique description for this page." />
  <link rel="icon" href="images/logo/favicon.svg" type="image/svg+xml" />
  <script src="js/main.js"></script>          <!-- MUST be here: theme boot before paint -->
  <link rel="stylesheet" href="css/style.css" />
</head>
<body>
  <div id="navbar"></div>
  <main id="main-content">
    <!-- 5–6 meaningful sections + a dedicated CTA section before the footer -->
  </main>
  <div id="footer"></div>
  <script src="js/navbar.js"></script>
  <script src="js/footer.js"></script>
  <!-- page-specific scripts LAST, e.g. <script src="js/portfolio.js"></script> -->
</body>
</html>
```

Dashboard pages (`dashboard/*.html`) use `../`-prefixed paths (`../css/style.css`,
`../js/main.js`, `../js/navbar.js` is NOT used — dashboards have their own shell, but they
DO include `<div id="footer"></div>` after the shell). Page-specific script:
`../js/founder-dashboard.js` / `../js/admin-dashboard.js`.

## 3. Design tokens & component classes (from `css/input.css`)

Colors (auto-switch dark mode — always use these, never raw hex):
`primary` `secondary` `success` `danger` `warning` `page` (page bg, NOT `text-base`!) `surface` (card bg)
`card` (dark-aware card bg) `ink` (main text) `muted` (secondary text) `line` (border)
`softorange` `softindigo` `accent`.
Use opacity variants freely (`bg-primary/10`, `text-primary`).

Fonts: `font-display` (Space Grotesk) for headings, `font-body` (Inter, default on body).

Layout: `container-x` (page width), `section` (py-16 md:py-24), `section-sm`.
Typography: `eyebrow`, `section-title`, `section-lead`, `text-gradient`.
Buttons: `btn` + (`btn-primary` `btn-secondary` `btn-outline` `btn-ghost` `btn-white` `btn-dark`)
+ optional (`btn-lg` `btn-sm` `btn-block`).
Cards: `card` + optional `card-hover`.
Forms: `field`, `label`, `input` (+ `textarea.input`), `field-hint`, `field-error`,
`field-invalid`. Error nodes must be `<p class="field-error hidden" data-error-for="NAME" role="alert"></p>`
where NAME matches the control's `name`/`id`.
Badges/chips: `badge` (add bg/text color), `chip`, `chip-active`.
Dashboards: `table-wrap`, `data-table`, `side-link`, `side-link-active`, `lf-progress > span`.
Misc: `social-btn`, `link-muted`, `lf-blob` (decorative blur), `lf-flip` (RTL icon flip).

Logical (direction-safe) utilities: prefer `start-*`/`end-*` for insets,
`ms-*`/`me-*`/`ps-*`/`pe-*` for spacing, `text-start`/`text-end`. Avoid `left-*`/`right-*`
and `ml-*`/`mr-*` in direction-sensitive layouts so RTL works.

## 4. Shared JS API (`window.LaunchForge`, loaded by `js/main.js`)

```js
LF.base                      // '' at root, '../' inside /dashboard/
LF.KEYS                      // canonical localStorage keys
LF.store.get(key, fallback)  // JSON-safe localStorage access (try/catch)
LF.store.set(key, value)
LF.store.remove(key)
LF.theme.get() / .set('dark'|'light'|'system') / .toggle()
LF.rtl.is() / .toggle()
LF.toast(message, 'success'|'error'|'info'|'warning')
LF.confirm({ title, message, confirmLabel, tone }) -> Promise<boolean>   // destructive actions
LF.escapeHtml(str)           // MANDATORY before inserting user input into HTML
LF.formatDate(isoOrDate)
LF.uid(prefix)
LF.form.validate(container)  // validates [required] controls, shows .field-error, returns bool
LF.form.isEmail(v) / .isPhone(v) / .showError(input, msg) / .clearError(input)
LF.animateCounters(root)     // animates [data-count-to] elements
LF.initAccordions(root)      // [data-accordion] groups with [data-accordion-trigger]
LF.ready(fn)
```

Custom events: `lf:theme-change` / `lf:rtl-change` (document) — listen to sync UI labels.

FAQ accordion markup pattern:

```html
<div data-accordion>
  <button type="button" data-accordion-trigger aria-expanded="false" aria-controls="faq-1">Question</button>
  <div id="faq-1" data-accordion-panel><div><p>Answer…</p></div></div>
</div>
```
(Put chevron SVG inside the trigger; add `.lf-chevron` class to it for rotation.)

Animated counter: `<span data-count-to="1200" data-count-suffix="+">0</span>`.

## 5. Image manifest (only these local paths exist — verify before use)

```
images/hero/hero-home.jpg images/hero/hero-home2.jpg   images/hero/hero-about.jpg
images/hero/hero-program.jpg  images/hero/hero-portfolio.jpg images/hero/hero-mentors.jpg
images/hero/hero-apply.jpg    images/hero/login-side.jpg
images/startups/startup-technology.jpg  startup-fintech.jpg  startup-healthtech.jpg
             startup-edtech.jpg  startup-sustainability.jpg  startup-consumer.jpg
images/portfolio/portfolio-ai.jpg  portfolio-fintech.jpg  portfolio-healthcare.jpg
             portfolio-edtech.jpg  portfolio-sustainability.jpg  portfolio-commerce.jpg
             portfolio-logistics.jpg  portfolio-analytics.jpg
images/founders/founder-story-1.jpg founder-story-2.jpg founder-story-3.jpg
images/mentors/mentor-01.jpg … mentor-08.jpg            (portraits)
images/programs/program-idea.jpg program-preseed.jpg program-seed.jpg
             program-launch.jpg program-demo-day.jpg
images/about/about-story.jpg about-ecosystem.jpg about-approach.jpg
images/events/event-networking.jpg event-workshop.jpg
images/testimonials/testimonial-01.jpg testimonial-02.jpg testimonial-03.jpg (portraits)
images/logo/launchforge-mark.svg  images/logo/favicon.svg  images/placeholder.svg
images/dashboard/*                (SVGs you may create locally — avatars, startup logos)
```

Rules: landscape heroes → `class="… object-cover"` with `loading="lazy"` below the fold;
portraits → `aspect-[4/5] object-cover`; always descriptive `alt`; always `width`/`height`
attributes; never `onerror` (main.js already provides a global fallback).

## 6. Theme, RTL, responsiveness, a11y

- Everything must look polished in **both themes** (test mentally: is the text `ink` on
  `surface`? are borders `line`?). Avoid hardcoded light-only colors.
- Everything must survive **RTL**: no `left/right` positioning, use logical utilities.
- Breakpoints: mobile-first; full desktop nav at `lg:` (1024px+). Never show partial nav.
- Touch targets ≥ 44px on mobile; headings scale with `sm:`/`lg:` prefixes.
- Semantic HTML (`section`, `nav` inside mounts is fine, `article`, `h1` once per page,
  ordered heading levels), `aria-*` on interactive widgets, visible `:focus-visible`.
- Destructive actions (delete/remove/reset) → `LF.confirm(...)`.
- Empty states: friendly message + call to action; loading states: disabled button +
  text change on submit.
- Demo/localhost forms: never claim data was sent to a server — show a local confirmation.

## 7. Content voice

Energetic, ambitious, founder-focused, professional. Headlines bold and short.
Every page: 5–6 meaningful sections (CTA counts as one) + dedicated final CTA.
