# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Easy Time-Blocking is a vanilla JavaScript Progressive Web App (PWA) for scheduling and time management. It runs entirely in the browser with no build step, backend, or dependencies. All data is stored in localStorage.

**Live Demo**: https://technical-1.github.io/Easy-Time-Blocking/

## Development

Open `index.html` directly in a browser to run the app. No build tools, package manager, or server required.

For development with live reload, use any static file server:
```bash
python -m http.server 8000
# or
npx serve
```

## Git hooks

This repo ships a pre-commit hook in `.githooks/pre-commit` that prevents committing changes to service-worker-cached assets (`index.html`, `styles.css`, `script.js`, `icon.svg`, `manifest.json`, `modules/*.js`) without also bumping `CACHE_NAME` in `sw.js`. Without the bump, users keep seeing the old code until they manually clear their cache.

**One-time setup after cloning:**

```bash
git config core.hooksPath .githooks
```

That tells git to look in `.githooks/` instead of `.git/hooks/`, so the tracked hook fires on every commit.

**To bump the cache:** open `sw.js`, increment the version suffix in `CACHE_NAME` (e.g. `'time-blocking-v8'` → `'time-blocking-v9'`), stage `sw.js`, and re-commit.

**Emergency bypass:** `git commit --no-verify`. Only use this for content-only commits (e.g. README edits batched with no app code), and double-check that you really don't need the bump.

See `CODE_AUDIT_TRACKING.md#f11` for the full rationale.

## Architecture

### File Structure
- `index.html` - Single HTML file containing all markup and view structure
- `script.js` - All application logic (~2200 lines, single file)
- `styles.css` - Complete styling with CSS custom properties for theming
- `manifest.json` - PWA manifest for installability
- `sw.js` - Service worker for offline support

### Data Model

All data stored in localStorage as JSON:

```javascript
// timeBlocks - Active schedule blocks
{ blocks: [{ id, title, notes, color, tasks[], recurring, recurrenceDays[], carryOver, startTime, endTime, archived }] }

// archivedBlocks - Historical blocks organized by date
{ days: { "YYYY-MM-DD": [block, ...] } }

// colorPresets - User's color palette (array of hex colors)
// hiddenTimes - Time slots to hide from view (array of "H:MM AM/PM" strings)
// theme - User's theme preference ("auto", "light", or "dark")
```

### Key Functions

**View Management**: `switchToView()`, `displayDailyBlocks()`, `buildArchiveList()`, `buildStatistics()`

**Block Operations**: `handleSaveBlock()`, `handleDeleteBlock()`, `duplicateBlock()`, `reorderBlocks()`

**Time Utilities**:
- `convert24To12()` / `convert12To24()` - Time format conversion
- `timeToMinutes()` - Convert time string to minutes for comparison
- `checkForOverlap()` - Detect overlapping blocks
- `findTimeRange12()` - Get time slot range between two labels

**Carry Over**: `applyCarryOverData()`, `findMostRecentArchivedInstance()` - Handle recurring block task/note inheritance

**Storage**: All localStorage operations wrapped in try/catch for error handling

**Theme**: `initializeTheme()`, `applyTheme()` - Dark mode support

### Views

1. **Daily View** (default) - Time slots table with drag-to-create blocks
2. **Statistics View** - Aggregate metrics
3. **Archive View** - Browse past days' schedules
4. **About View** - Static informational content
5. **Print View** - Printer-friendly schedule layout

### Event Handling

Block creation uses mouse drag (desktop) and touch events (mobile):
- `handleMouseDown/Over/Up` - Desktop drag selection
- `handleTouchStart/Move/End` - Mobile touch with tap vs drag detection

Keyboard shortcuts:
- Arrow keys: Navigate dates
- `T` or `Home`: Jump to today
- `Escape`: Close modals
- `Cmd/Ctrl+P`: Print view
- `Cmd/Ctrl+F`: Open search
- `Cmd/Ctrl+N`: New block (in daily view)

### Recurring Blocks

Blocks can recur on specific weekdays. Features:
- `recurrenceDays` array (["Mon", "Wed", etc.])
- `carryOver` option to inherit tasks/notes from previous occurrences
- Matched to days via `getWeekdayName()` comparison

### PWA Support

- Service worker (`sw.js`) caches static assets for offline use, keyed on `CACHE_NAME` (currently `time-blocking-v8`). Bump the version on every deploy that touches cached assets — the pre-commit hook in `.githooks/pre-commit` enforces this automatically (see "Git hooks" above).
- Web app manifest (`manifest.json`) for installability. Orientation is `any` so the schedule renders in both portrait and landscape on installed PWAs.
- Install prompt handling via `beforeinstallprompt` event
- Service worker is registered via a relative path (`./sw.js`) so it works under both root and subpath deployments (e.g. GitHub Pages at `/Easy-Time-Blocking/`).

### Theming

CSS custom properties in `:root` for light/dark modes:
- `data-theme="dark"` forces dark mode
- `data-theme="light"` forces light mode
- No attribute uses system preference via `prefers-color-scheme`
