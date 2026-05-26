# Tech Stack

## Core Technologies

| Category | Technology | Version | Why this choice |
|----------|------------|---------|-----------------|
| Language | JavaScript | ES6+ (native modules) | No build step required; browser runs the source directly |
| Markup | HTML5 | — | Single `index.html` hosts every view |
| Styling | CSS3 | — | Custom properties drive theming without JS |
| Storage | `localStorage` | Web Storage API | Synchronous JSON-friendly persistence, no setup |
| Hosting | GitHub Pages | — | Free, HTTPS, push-to-deploy from `main` |

## Frontend

- **Framework**: None — vanilla JS with native ES modules
- **State management**: Plain JS objects mirrored to `localStorage`
- **Styling**: Hand-written CSS with custom properties for theming
- **Build tool**: None — files are served as-authored

## Backend

There is no backend. The app is fully client-side; all reads and writes go to `localStorage` on the device.

## Infrastructure

- **Hosting**: GitHub Pages (auto-deploy from `main`)
- **CI/CD**: GitHub Pages built-in publisher
- **Monitoring**: None — no telemetry or analytics

## Development Tools

- **Package manager**: None
- **Linting**: None
- **Formatting**: None
- **Testing**: Manual verification in the browser

## PWA Components

### Service Worker (`sw.js`)

Stale-while-revalidate caching strategy:

```javascript
// Serve from cache immediately, fetch update in background
cache.match(request).then((cachedResponse) => {
  const fetchPromise = fetch(request).then((networkResponse) => {
    cache.put(request, networkResponse.clone());
    return networkResponse;
  });
  return cachedResponse || fetchPromise;
});
```

The cache responds instantly on every load, and a background fetch refreshes the entry so the next load picks up new deploys without a manual cache bust.

### Web Manifest (`manifest.json`)

```json
{
  "name": "Easy Time-Blocking",
  "short_name": "Time-Block",
  "display": "standalone",
  "background_color": "#1a1a1a",
  "theme_color": "#4F6D7A"
}
```

Enables "Add to Home Screen" on iOS and Android, a standalone display mode without browser chrome, and a themed splash screen.

## Data Persistence

### `localStorage` Schema

```javascript
// Active time blocks
timeBlocks: {
  blocks: [{
    id: "uuid",
    title: "string",
    notes: "string",
    color: "#hex",
    category: "categoryId",
    tasks: [{ text: "string", completed: boolean }],
    recurring: boolean,
    recurrenceDays: ["Mon", "Wed", ...],
    carryOver: boolean,
    preserveTaskState: boolean,
    startTime: "YYYY-MM-DDTHH:mm",
    endTime: "YYYY-MM-DDTHH:mm",
    archived: boolean
  }]
}

// Archived blocks grouped by date
archivedBlocks: {
  days: {
    "YYYY-MM-DD": [block, block, ...]
  }
}

// User preferences
colorPresets: ["#hex", "#hex", ...]
categories: [{ id, name, color }]
blockTemplates: [{ title, notes, tasks, color }]
hiddenTimes: ["12:00 AM", "12:30 AM", ...]
theme: "auto" | "light" | "dark"
```

### `localStorage` vs IndexedDB

| `localStorage` | IndexedDB |
|---------------|-----------|
| Synchronous API | Async API |
| 5–10 MB per origin | Effectively unbounded |
| Simple key-value | Object stores and queries |
| `JSON.parse`/`stringify` | Structured cloning |

Time-blocking data is a handful of JSON arrays well under 1 MB in real use, so `localStorage` wins on simplicity.

## Key Dependencies

There are no runtime dependencies. The app's "dependencies" are the platform APIs it relies on:

| Common library | What this project uses instead |
|----------------|--------------------------------|
| Moment.js / date-fns | `modules/time.js` (~100 lines) |
| UUID library | `crypto.randomUUID()` with a small fallback |
| Lodash `debounce` | A 10-line debounce in `modules/utils.js` |
| CSS-in-JS | CSS custom properties in `styles.css` |
| Redux / Zustand | Plain objects synced to `localStorage` |

## Running Locally

```bash
# Direct file open works for the core UI
open index.html

# Local server is needed for service-worker / PWA testing
python -m http.server 8000
# or
npx serve
```

## Deployment

```bash
git push origin main
# GitHub Pages serves the new commit automatically
```

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+ (Chromium)

Required platform features used throughout the codebase:

- `crypto.randomUUID()` for block IDs (with a fallback)
- CSS `prefers-color-scheme` for auto dark mode
- Native `<input type="color">` for color picking
- `Notification` API for pre-block reminders
- Service Worker for offline support
- ES6 modules via `<script type="module">`
