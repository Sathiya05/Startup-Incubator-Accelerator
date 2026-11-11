# LaunchForge Accelerator

**From Bold Ideas to Breakthrough Businesses.**

A complete, premium-quality, fully responsive **Startup Incubator & Accelerator** website —
two homepages, program & portfolio showcases, mentor directory, startup application flow,
demo authentication, and two SaaS-style dashboards (Founder + Admin).

Built with **HTML5 + Tailwind CSS + Vanilla JavaScript** only. No frameworks, no CDN
dependencies — every asset (fonts, images, icons) is stored locally so the site works
fully offline after installation.

---

## Table of contents

1. [Project overview](#1-project-overview)
2. [Features](#2-features)
3. [Technology stack](#3-technology-stack)
4. [Folder structure](#4-folder-structure)
5. [Installation & build](#5-installation--build)
6. [Local development](#6-local-development)
7. [Demo login credentials](#7-demo-login-credentials)
8. [Dashboard usage](#8-dashboard-usage)
9. [Replacing images](#9-replacing-images)
10. [Changing colors & theme](#10-changing-colors--theme)
11. [Editing content](#11-editing-content)
12. [Frontend-only limitations](#12-frontend-only-limitations)
13. [Backend integration recommendations](#13-backend-integration-recommendations)

---

## 1. Project overview

LaunchForge Accelerator is a multi-page marketing site plus product experience for a
fictional startup accelerator:

| Page | File | Purpose |
|------|------|---------|
| Home 1 | `index.html` | Classic landing: hero, impact stats, portfolio, programs, mentors, CTA |
| Home 2 | `home2.html` | Alternate landing: full-bleed hero, journey timeline, testimonials |
| About | `about.html` | Story, mission/vision/values, ecosystem, founder approach |
| Program | `program.html` | Tracks, timeline, benefits of the accelerator experience |
| Portfolio | `portfolio.html` | Filterable grid of 10 demo startups + founder stories |
| Mentors | `mentors.html` | Filterable mentor directory + working session-booking demo |
| Apply | `apply.html` | Eligibility, process, validated application form, FAQ |
| Login | `login.html` | Split-screen demo authentication (founder / admin roles) |
| Contact | `contact.html` | Sample campus, OpenStreetMap embed, validated demo contact form |
| Founder Dashboard | `dashboard/founder-dashboard.html` | Startup profile, milestones, sessions, pitch deck, documents, settings |
| Admin Dashboard | `dashboard/admin-dashboard.html` | Applications, founders, startups, programs, mentors, sessions, decks |

> **All companies, mentors, testimonials, statistics and programs shown are fictional
> demo content** created to demonstrate the interface.

## 2. Features

- **Shared navbar** (markup lives only in `js/navbar.js`) with Home & Dashboard dropdowns,
  theme toggle, RTL toggle, Contact and Apply Now.
- **Mobile/tablet navigation**: below 1024 px only the logo + hamburger are visible; the
  hamburger opens a full-height accessible drawer with expandable submenus, login,
  theme/RTL controls (with labels) and the Apply Now CTA. Escape / outside-click /
  link-click close it, background scrolling is locked, ARIA attributes and focus
  management included.
- **Shared footer** (markup lives only in `js/footer.js`): 4 columns, dynamic year,
  social placeholders, responsive, theme- and RTL-aware.
- **Dark mode** (light/dark/system, persisted, no flash of wrong theme) and **RTL mode**
  (persisted, direction-aware layouts) across every page.
- **Working interactions**: FAQ accordions, animated counters, toasts, confirmation
  modals, form validation with inline errors & character counters, portfolio filtering +
  search, mentor profile & booking modals with localStorage persistence.
- **Founder dashboard**: hash routing, collapsible sidebar + mobile drawer, overview
  stats with hand-built SVG chart, editable startup profile, full milestone CRUD,
  mentor session requests, pitch-deck upload demo (type/size validation + progress UI),
  document list, notifications with unread badge, settings, reset-demo-data.
- **Admin dashboard**: application management (search/filter/status workflow), founder
  & startup CRUD, program & mentor management, session approve/reschedule/cancel,
  milestone tracking, pitch-deck metadata review, notifications, platform settings.
- **Responsive** from 320 px to 1920 px, no horizontal overflow, keyboard accessible,
  `prefers-reduced-motion` respected, meaningful alt text, visible focus states.

## 3. Technology stack

- HTML5 (semantic, accessible)
- Tailwind CSS 3.4 (compiled — `css/input.css` → `css/style.css`)
- Vanilla JavaScript (modular, no build step for JS)
- Local `woff2` fonts: **Space Grotesk** (headings) + **Inter** (body)
- Lucide-style inline SVG icons (no icon font, no emoji)
- Photography from free-to-use stock sources (Pexels / Unsplash), stored locally

Dev-only tooling: `tailwindcss` (build), `playwright` + `sharp` (visual QA and image
optimisation used during development — not required to view the site).

## 4. Folder structure

```text
launchforge-accelerator/
├── index.html  home2.html  about.html  program.html
├── portfolio.html  mentors.html  apply.html  login.html  contact.html
├── dashboard/
│   ├── founder-dashboard.html
│   └── admin-dashboard.html
├── css/
│   ├── input.css          # source: theme tokens, components, behaviours
│   └── style.css          # compiled output (generated — do not edit by hand)
├── js/
│   ├── main.js            # theme, RTL, toasts, modals, validation, counters
│   ├── navbar.js          # complete navbar markup + behaviour (only copy)
│   ├── footer.js          # complete footer markup + behaviour (only copy)
│   ├── auth.js            # demo authentication (LFAuth API)
│   ├── apply.js           # application form validation + storage
    contact.js          # contact form validation + local demo storage
│   ├── portfolio.js       # portfolio rendering + filtering/search
│   ├── mentors.js         # mentor directory, profile & booking modals
│   ├── founder-dashboard.js
│   └── admin-dashboard.js
├── images/
│   ├── hero/ startups/ portfolio/ founders/ mentors/
│   ├── programs/ about/ events/ dashboard/ testimonials/ logo/
│   └── placeholder.svg    # automatic fallback for missing images
├── assets/fonts/          # local Inter + Space Grotesk woff2
├── tools/                 # dev helpers (screenshots, image fetch scripts, conventions)
├── tailwind.config.js
├── package.json
└── README.md
```

## 5. Installation & build

Requirements: **Node.js 18+** (tested on Node 22 / Windows).

```bash
# 1. install dependencies (Tailwind CLI)
npm install

# 2. compile the CSS
npm run build          # alias for npm run build:css

# 3. open index.html in a browser (double-click works — no server required)
```

Build commands:

| Command | What it does |
|---------|--------------|
| `npm run build` / `npm run build:css` | Compiles `css/input.css` → `css/style.css` (minified) |
| `npm run dev:css` | Watch mode — recompiles on any HTML/JS/CSS change |

> Re-run the build after adding or renaming Tailwind classes in HTML/JS files —
> Tailwind only emits classes it can find by scanning `*.html` and `js/*.js`.

## 6. Local development

- **No server needed.** Every page works when opened directly via `file://`.
- Optional local server (nicer for hash routes & debugging):
  ```bash
  npx serve .          # or: python -m http.server 8080
  ```
- Recommended workflow: keep `npm run dev:css` running in a terminal while editing.
- Visual QA helper (development): `node tools/shot.mjs <url> <out.png> [width] [height] [full] [dark] [rtl]`.

## 7. Demo login credentials

Frontend demonstration only — **not real authentication**.

| Role | Email | Password | Redirects to |
|------|-------|----------|--------------|
| Founder | `founder@launchforge.demo` | `Founder123!` | `dashboard/founder-dashboard.html` |
| Admin | `admin@launchforge.demo` | `Admin123!` | `dashboard/admin-dashboard.html` |

- "Remember Me" persists the demo session in `localStorage` (`lf-auth`).
- Wrong credentials show an inline error + toast.
- Dashboards also work without logging in (they fall back to a demo user) so every
  feature can be explored directly.
- Logout lives in each dashboard sidebar/topbar and in the founder settings.

## 8. Dashboard usage

**Founder dashboard** (`dashboard/founder-dashboard.html`)

- Sidebar routes (hash): Overview · My Startup · Milestones · Mentor Sessions ·
  Pitch Deck · Documents · Notifications · Settings · Logout.
- Milestones: add / edit / delete / mark complete / due dates / progress bar / filters.
- Mentor sessions: request a session (date, time, goals) — requests are stored locally
  and can be cancelled.
- Pitch deck: drag-and-drop or file picker, accepts `.pdf .ppt .pptx` ≤ 10 MB, animated
  progress, replace/remove. **Only file metadata is kept — never file contents.**
- Settings: profile editing, password UI demo, theme preference, **Reset Demo Data**.

**Admin dashboard** (`dashboard/admin-dashboard.html`)

- Sidebar routes: Overview · Applications · Founders · Startups · Programs · Mentors ·
  Mentor Sessions · Milestones · Pitch Decks · Notifications · Settings · Logout.
- Applications: search by founder/startup, filter by industry & stage, open details,
  move status between Pending → Under Review → Approved / Rejected.
- Portfolio/programs/mentors: full add / edit / delete with confirmation dialogs.
- Sessions: approve, reschedule or cancel requests.
- Applications submitted through `apply.html` appear here automatically (same
  localStorage key), and demo data is seeded only when none exists.

## 9. Replacing images

1. Drop your photo into the matching folder (`images/hero/`, `images/mentors/`, …).
2. Keep the same filename, or update the `src` in the relevant HTML/JS file.
3. Recommendations:
   - Heroes: landscape, ≥ 1600 px wide, `object-cover`, `loading="lazy"` below the fold.
   - Mentor/testimonial portraits: portrait orientation, ≥ 700 px wide.
   - Compress to roughly ≤ 300 KB (e.g. `sharp`, Squoosh, or `npx @squoosh/cli`).
4. Every `<img>` needs a descriptive `alt`. If an image is missing, the site shows a
   generated placeholder automatically (`images/placeholder.svg`) — nothing breaks.
5. Logos/icons: `images/logo/launchforge-mark.svg` (navbar/footer) and `favicon.svg`.

## 10. Changing colors & theme

All colors are CSS variables defined in **`css/input.css`** (`:root` for light,
`.dark` for dark) and mapped in **`tailwind.config.js`**:

```css
:root {
  --c-primary: 67 56 202;      /* #4338CA deep indigo   */
  --c-secondary: 249 115 22;   /* #F97316 orange        */
  --c-bg: 248 250 252;         /* page background       */
  ...
}
```

1. Edit the RGB triplet values in `css/input.css` (both `:root` and `.dark`).
2. Run `npm run build:css`.
3. To add a new token, add the variable **and** a matching entry under
   `theme.extend.colors` in `tailwind.config.js` (use `rgb(var(--c-name) / <alpha-value>)`).

⚠️ Do not name a color `base` — it collides with Tailwind's built-in `text-base`
font-size utility (that's why the page-background token is called `page`).

## 11. Editing content

| What | Where |
|------|-------|
| Navbar & its links | `js/navbar.js` (`NAV_ITEMS` array + `navbarMarkup()`) |
| Footer columns & contact placeholders | `js/footer.js` (`ENTRIES`, contact block) |
| Page sections / copy | The respective `.html` file |
| Portfolio startups | `js/portfolio.js` (dataset) |
| Mentors & expertise | `js/mentors.js` (dataset) |
| Founder dashboard sample data | top of `js/founder-dashboard.js` (default fallbacks) |
| Admin sample data | top of `js/admin-dashboard.js` (seed functions) |
| Demo accounts | `js/auth.js` (`LFAuth.DEMO`) |
| Design tokens / component classes | `css/input.css` + `tailwind.config.js` |

After editing classes in HTML/JS, run `npm run build:css`.

## 12. Frontend-only limitations

This project is a **frontend demonstration**. Please note:

- **No real authentication.** Credentials are hardcoded for demo purposes; sessions live
  in `localStorage`. This is *not* secure and must never be used in production.
- **No backend.** Applications, bookings, profile edits and status changes are saved
  only in the current browser's `localStorage` and are cleared by "Reset Demo Data" or
  by clearing site data. Nothing is sent to a server.
- **No real file storage.** Pitch-deck/document uploads validate type & size and store
  *metadata only* (name, size, date). File contents are never persisted.
- **Sample content.** Startups, mentors, testimonials, statistics and program details
  are fictional/editable and labelled as demo content throughout the UI.
- **Placeholder contact/social links.** No real address, phone number or social accounts
  are claimed; social icons show an explanatory toast until real links are configured.
- `localStorage` is neither private nor tamper-proof — do not store confidential data.

## 13. Backend integration recommendations

When turning this into a production product:

1. **API layer** — replace `LaunchForge.store` calls with `fetch()` to a REST/GraphQL
   API (the store calls are already centralised, so swapping is a one-place change per
   feature). Keep the same JSON shapes documented in each JS module.
2. **Authentication** — replace `js/auth.js` with a real provider (Auth0, Clerk, Supabase
   Auth, Firebase Auth or your own JWT/session API): httpOnly secure cookies, password
   hashing (bcrypt/argon2), rate limiting, email verification, password reset flow.
3. **Authorization** — enforce founder/admin roles **server-side** (middleware/guards);
   the dashboard UI hides nothing sensitive today.
4. **File storage** — upload pitch decks via presigned URLs to S3/GCS/Backblaze with
   virus scanning, MIME sniffing, size limits and access control; never trust client
   metadata.
5. **Application pipeline** — persist submissions in a database (Postgres/MySQL) with
   server-side validation matching the client rules, plus email notifications and an
   admin review workflow with audit logs.
6. **Validation & escaping** — repeat every validation server-side; the client-side rules
   in `js/apply.js` are a UX layer, not a security layer.
7. **CSRF/XSS/CSP** — add CSRF protection for cookie auth, a strict Content-Security-Policy,
   and output encoding on every rendered field.
8. **Deployment** — serve `css/style.css` as a build artifact in CI (`npm run build`),
   enable gzip/brotli caching, and put the site behind a CDN.

---

### License / attribution

- Photography: free-to-use stock images (Pexels/Unsplash licence) stored in `images/`.
- Fonts: Inter & Space Grotesk (SIL Open Font License) self-hosted in `assets/fonts/`.
- Icons: Lucide-style inline SVG (ISC licence).
- Brand, startups, mentors and all other content are fictional demo material.
