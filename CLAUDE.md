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

- Service worker (`sw.js`) caches static assets for offline use
- Web app manifest (`manifest.json`) for installability
- Install prompt handling via `beforeinstallprompt` event

### Theming

CSS custom properties in `:root` for light/dark modes:
- `data-theme="dark"` forces dark mode
- `data-theme="light"` forces light mode
- No attribute uses system preference via `prefers-color-scheme`
