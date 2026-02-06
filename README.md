# Easy Time-Blocking

A free, privacy-first web app for organizing your day using the time-blocking productivity method.

Built as a Progressive Web App with zero dependencies — runs entirely in the browser with all data stored locally in localStorage. No accounts, no cloud, no tracking.

**Live Demo**: [https://technical-1.github.io/Easy-Time-Blocking/](https://technical-1.github.io/Easy-Time-Blocking/)

## Features

- **Visual Drag-to-Create** - Click and drag across time slots (desktop) or touch-drag (mobile) to create blocks
- **Current Time Indicator** - Red line across the schedule showing the current time
- **Recurring Blocks** - Set blocks to repeat on specific weekdays with optional task/note carry-over
- **Task Management** - Add multiple tasks per block with completion checkboxes
- **Categories & Templates** - Organize blocks by category and save frequently-used configurations as templates
- **Statistics Dashboard** - Track productivity metrics, task completion rates, and time distribution
- **Archive** - Automatic archiving of past days with full browsable history
- **Search** - Search across all blocks by title, notes, or tasks
- **Dark Mode** - Light/dark theme with automatic system preference detection
- **Notifications** - Optional browser notifications 5 minutes before each block starts
- **Export/Import** - Export data as JSON or TXT, import backups, and print schedules
- **PWA** - Installable on mobile and desktop, works offline

## Tech Stack

- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Storage**: localStorage (client-side only)
- **Hosting**: GitHub Pages
- **Offline**: Service Worker with stale-while-revalidate caching

## Getting Started

### Prerequisites

- A modern web browser (Chrome 80+, Firefox 75+, Safari 13+, Edge 80+)

### Installation

No installation required. Open `index.html` directly in a browser, or visit the [live demo](https://technical-1.github.io/Easy-Time-Blocking/).

### Usage

```bash
# Option 1: Open directly
open index.html

# Option 2: Local server (for PWA/service worker testing)
python -m http.server 8000
# or
npx serve
```

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `←` `→` | Navigate dates |
| `T` / `Home` | Jump to today |
| `Escape` | Close modals |
| `Cmd/Ctrl+P` | Print view |
| `Cmd/Ctrl+F` | Open search |
| `Cmd/Ctrl+N` | New block |

## Development

No build tools, package manager, or server required. Edit files and refresh.

```bash
# Run with live reload
python -m http.server 8000

# Deploy (GitHub Pages auto-deploys from main)
git push origin main
```

## Project Structure

```
Easy-Time-Blocking/
├── index.html          # Single HTML file with all markup
├── script.js           # Main application logic (~3700 lines)
├── styles.css          # Complete styling with CSS custom properties
├── modules/            # ES6 modules extracted from script.js
│   ├── index.js        # Re-exports all modules
│   ├── storage.js      # localStorage operations
│   ├── utils.js        # Common utilities (UUID, formatting)
│   ├── time.js         # Time parsing and conversion
│   ├── search.js       # Search functionality
│   ├── statistics.js   # Stats calculations
│   ├── data.js         # Import/export
│   ├── archive.js      # Archiving logic
│   ├── print.js        # Print formatting
│   ├── theme.js        # Dark mode support
│   └── notifications.js # Browser notifications
├── manifest.json       # PWA manifest for installability
├── sw.js               # Service worker for offline support
├── icon.svg            # App icon
└── jk-logo.svg         # Footer logo
```

## Privacy

All data stays in your browser's localStorage. Nothing is sent to any server. No analytics, no tracking, no accounts.

## Author

Jacob Kanfer - [GitHub](https://github.com/Technical-1)
