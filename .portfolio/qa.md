# Easy Time-Blocking — Project Q&A

## Overview

Easy Time-Blocking is a free, privacy-first web application for planning a day with the time-blocking productivity method. It runs entirely in the browser as a Progressive Web App, with all data stored in `localStorage` — no accounts, no cloud, no tracking. The interesting technical angle is that it delivers a feature set comparable to subscription productivity tools (recurring blocks with carry-over, statistics, archive, search, cross-tab sync, offline install) in a single static HTML/CSS/JS bundle with zero runtime dependencies.

## Problem Solved

Most productivity tools for time-blocking are subscription SaaS products that require accounts, sync data to a vendor's servers, and bring login flows just to write down "Deep work, 9–11 AM." This app exists for people who want the time-blocking workflow without any of that ceremony: open a URL, drag across the grid, get back to work. Because data never leaves the device, it also works for users on locked-down networks or anyone who is uncomfortable storing personal schedules on a third-party server.

## Target Users

- **Professionals** structuring focus blocks and meetings across a workday
- **Students** managing study time and recurring weekly classes
- **Privacy-conscious users** who want a planner without an account or cloud backend
- **Time-blocking newcomers** who want to try the method without committing to a paid tool

## Key Features

### Visual Drag-to-Create Blocks
Click-and-drag across the time grid on desktop, or touch-drag on mobile, to create a block spanning the selected range. A live preview shows the time span while dragging.

### Recurring Blocks with Carry-Over
A block can repeat on a chosen subset of weekdays (e.g., Mon/Wed/Fri standup). Carry-over optionally inherits tasks and notes from the previous occurrence so the same checklist doesn't need to be retyped each week, and an extra flag lets task completion state persist across days for habits.

### Tasks Inside Blocks
Each block holds an ordered task list with checkboxes. The day surfaces a celebratory state when every task is complete. Task completion state is keyed by a stable id, so renaming a task preserves its check mark rather than starting it fresh.

### Categories and Templates
Custom categories carry a color used across the grid and statistics. Frequently-used block configurations (title, notes, tasks, color) can be saved as templates for one-click reuse.

### Automatic Archive and Search
Past days are moved into an archive that stays browsable, and a search box queries titles, notes, and task text across both the active day and the archive.

### Statistics Dashboard
Aggregates total time blocked, task completion rate, time per category, and active vs archived blocks for quick weekly reviews.

### Current Time Indicator
A red line drawn across the row of the current half-hour slot, updated every minute, gives an at-a-glance sense of where the user is in their day.

### Multi-Tab Live Sync
Open the app in two tabs and an edit in one shows up in the other almost immediately, with no manual refresh. The buffer-while-busy logic also makes sure a peer-tab save can't blow away an in-progress note you're still typing.

### Update-Available Toast
When a new version of the app is deployed and the running tab still has the old code, an unobtrusive "New version available — reload" toast appears so the user gets the latest without remembering to hard-refresh.

### Notifications, Print, Export/Import
Optional browser notifications fire 5 minutes before a block starts. A print view formats the day for paper or PDF. JSON export covers blocks, categories, and templates for migration between browsers.

## Technical Highlights

### Touch drag vs tap vs scroll disambiguation
Drag-to-create on mobile collides with native scrolling and with taps that should open an existing block. The grid uses thresholds — under 10 px of movement and under 300 ms of contact counts as a tap and opens the block; anything past either threshold starts a drag selection and suppresses scroll on the grid only.

### Recurring blocks without duplicated state
A recurring block is stored once with a `recurrenceDays` array (`["Mon","Wed","Fri"]`). The daily view computes which blocks belong to the current date at render time by matching the weekday, then applies carry-over (tasks/notes from the previous occurrence) and the optional `preserveTaskState` flag, which controls whether completed checkboxes reset on a new day. There are no duplicated rows in storage, but each day still has independent completion state when desired.

### Cross-tab convergence via the `storage` event
A single `storage` listener at boot dispatches by key into a small switch that reloads the affected in-memory slice and re-renders the view. While a modal is open or any input has focus, events are buffered into a `Map` (latest-wins per key) and drained on `focusout`, so a peer tab's save never clobbers an in-progress note or title the user is still typing. Storage events are browser-emitted only to other tabs, so there's no risk of feedback loops.

### Stable task identity via opaque IDs
Every task and block carries a `crypto.randomUUID()` `id` assigned at creation. The per-day completion state is keyed by `taskId`, not the displayed text — so renaming a task ("Review PR" → "Review PRs") preserves the check mark rather than starting fresh. A small idempotent migration on load translates any legacy text-keyed state to id-keyed and drops orphans.

### Single-pass rowSpan rendering with event delegation
Blocks span multiple half-hour rows via HTML `rowSpan`, which is fragile if cells are added and removed naively. The renderer computes `rowSpan` values up-front, then removes merged cells in order during a single DOM pass to avoid layout thrash. A single delegated listener set on the table body handles clicks, drags, and task-checkbox toggles for every block, so the listener count does not scale with block count and never gets re-attached across rebuilds.

### Background sections marked `inert` while a modal is open
A single `MutationObserver` watches the three overlay containers (block edit, settings, search). When any of them has `.active`, it sets the `inert` attribute on `<header>`, `<main>`, and `<footer>`, clearing it when all are closed. The browser handles the rest: Tab navigation can't escape the modal, pointer events are blocked, and screen readers don't announce background controls.

### Offline-first with stale-while-revalidate plus an update channel
`sw.js` precaches the static assets and serves them with a stale-while-revalidate strategy — the cache responds immediately, and a background fetch refreshes the entry for the next load. To stop users from sitting on yesterday's code, an `updatefound` listener on the registration surfaces a "New version available" toast as soon as the new worker is installed and waiting.

## Engineering Decisions

### Vanilla JS over a framework
- **Constraint**: Needed a long-lived hobby app that anyone could clone and run by opening `index.html`, with no build step to maintain.
- **Options**: React + Vite, Vue + Vite, Svelte, vanilla JS.
- **Choice**: Vanilla JS.
- **Why**: A framework would add a transpile step, a `node_modules` to keep current, and ~40 KB of runtime for what is mostly DOM manipulation and `localStorage` reads. The resulting bundle is ~190 KB total served straight from GitHub Pages.

### Single `script.js` over a module split
- **Constraint**: Most of the file's complexity is orchestration (event delegation, drag state, render loop) that's tightly coupled. An earlier attempt to extract helpers into a `modules/` directory ended up with helpers drifting from inline copies that the orchestration kept around for performance.
- **Options**: One big `script.js`, or `modules/{storage,time,utils,…}.js` consumed via native ES module imports.
- **Choice**: One `script.js` (~4k lines, served as a module), with clearly headered sections.
- **Why**: One file means one place to grep, one place to set a breakpoint, and no chance of two implementations of the same helper drifting apart. The file is searchable in any editor and split into well-named sections.

### `localStorage` over IndexedDB
- **Constraint**: Needed simple persistence for a few JSON blobs (blocks, archive, preferences) that easily fit in single-digit MBs.
- **Options**: `localStorage`, IndexedDB, remote DB with auth.
- **Choice**: `localStorage`, accessed through thin save/load wrappers.
- **Why**: The data is a handful of arrays and objects with no query needs — IndexedDB's async API and object stores would be overhead with no payoff at this scale. A remote DB would break the privacy promise and add an account system.

### GitHub Pages over a backend host
- **Constraint**: App is pure static assets and must stay free to run.
- **Options**: GitHub Pages, Netlify/Vercel, a self-hosted box.
- **Choice**: GitHub Pages, auto-deploying from `main`.
- **Why**: The app has no server-side logic, so paying for or maintaining server infrastructure would buy nothing. GitHub Pages gives HTTPS, a custom-domain option, and "git push = deploy" with no additional config.

### CSS custom properties for theming, not JS
- **Constraint**: Dark mode needed to switch instantly, respect the OS preference, and not flicker on load.
- **Options**: JS-driven className swap with hardcoded palettes, CSS custom properties with a `data-theme` attribute, a CSS-in-JS library.
- **Choice**: CSS custom properties scoped under `:root` and `[data-theme="dark"]`, plus a `prefers-color-scheme` media query for the auto setting. JS still owns one thing — the `<meta name="theme-color">` value, so installed PWAs match the body theme on iOS and Android.
- **Why**: Theme switching becomes a single attribute toggle with no re-render, the auto setting falls out of a media query for free, and there's no JS-vs-CSS race that causes a flash of the wrong theme.

## Frequently Asked Questions

### How is my data stored, and what happens if I clear my browser?
Everything — blocks, archive, categories, templates, theme — lives in `localStorage` under this site's origin. Clearing site data wipes the schedule. The Export button writes a JSON file (or a human-readable TXT) that can be re-imported later or on another device.

### How do I move my schedule from my laptop to my phone?
Open the app on the source device, hit Export → JSON, transfer the file (AirDrop, email, cloud drive), then open the app on the target device and use Import. There is no automatic sync because there is no server.

### What happens if I have the app open in two tabs at once?
They stay in sync. Each tab listens for the browser's `storage` event, so a save in one tab triggers a re-render in the other within a few hundred milliseconds. If a modal is open or an input is focused in the receiving tab, the reload is buffered until the user finishes editing so it can't clobber unsaved input.

### If I rename a task in a recurring block, does my completion state follow?
Yes. Every task has a stable id assigned at creation, and the per-day completion state is keyed by that id rather than the visible text. Edit the wording to your heart's content; the check mark stays with the task.

### Why does a recurring block sometimes carry tasks across days and sometimes not?
Each recurring block has two independent flags. **Carry-over** copies tasks and notes from the previous occurrence into a fresh day. **Preserve task state** decides whether checked-off tasks stay checked or reset to unchecked on the new day. Habits typically want carry-over off and preserve off; weekly templates typically want carry-over on.

### Do notifications still fire if I close the tab?
No. Notifications are scheduled by a JS interval inside the page, so the page has to be open for them to trigger. This is a deliberate trade-off — true background notifications would require a push service and an account.

### How will I know when a new version is available?
If you have the app open when a new version is deployed, a small "New version available — reload" toast appears in the bottom-right. Click Reload to get the latest. The toast only appears for updates, not first installs.

### Can I install it as an app on iOS or Android?
Yes. On iOS, use Safari's Share → Add to Home Screen. On Android, Chrome prompts to install. Once installed, the PWA runs standalone, works offline, and the address-bar / status-bar color follows your light/dark theme.

### How big can my schedule grow before `localStorage` becomes a problem?
Browser quotas are typically 5–10 MB per origin. Even with several years of archived blocks containing tasks and notes, real usage stays well under 1 MB. The Statistics view shows the active vs archived counts if you want to monitor it.

### Which browsers does it work on?
Chrome 80+, Firefox 75+, Safari 13+ (Safari 15.5+ for the in-modal focus-trap behavior), and Edge 80+. These versions cover `crypto.randomUUID()`, native ES modules, CSS custom properties, the Notification API, and the `inert` attribute.

### Why don't I see my blocks from this morning anymore?
Days roll into the archive automatically when they pass. The Archive view lists past days; clicking a date reopens that day's schedule read-only.
