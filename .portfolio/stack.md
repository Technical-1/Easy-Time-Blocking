# Technology Stack

## Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| HTML5 | - | Semantic markup, accessibility (ARIA) |
| CSS3 | - | Styling, animations, theming |
| Vanilla JavaScript | ES6+ | Application logic |
| ES Modules | Native | Code organization |

### Why Vanilla JavaScript?

I deliberately chose not to use React, Vue, or any other framework. Here's why:

1. **No Build Complexity**: The app runs directly in the browser without webpack, babel, or any transpilation step.

2. **Performance**: No virtual DOM, no framework runtime overhead. The app loads instantly and runs smoothly on older devices.

3. **Simplicity**: Anyone can clone the repo and open `index.html` to run it. No npm install, no environment setup.

4. **Longevity**: Framework trends change rapidly. Vanilla JS will work forever.

5. **Learning**: I wanted to deeply understand how things work at the DOM level rather than relying on framework abstractions.

## Infrastructure

| Component | Technology | Purpose |
|-----------|------------|---------|
| Hosting | GitHub Pages | Free static hosting |
| Storage | localStorage | Client-side persistence |
| Caching | Service Worker | Offline support |
| Distribution | PWA Manifest | Installable app |

### Hosting on GitHub Pages

I chose GitHub Pages because:
- **Free**: No hosting costs
- **Reliable**: Built on GitHub's infrastructure
- **Simple**: Push to main branch = deploy
- **HTTPS**: Automatic SSL certificates
- **Custom Domain**: Easy to configure

## PWA (Progressive Web App)

### Service Worker (`sw.js`)

I implemented a **stale-while-revalidate** caching strategy:

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

**Why this strategy?**
- Users get instant responses from cache
- Fresh content is fetched in background
- Works offline seamlessly
- No stale content on next visit

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

Enables:
- "Add to Home Screen" on mobile
- Standalone app experience (no browser chrome)
- Custom splash screen on iOS/Android

## Key Dependencies

**There are no external dependencies.** This was an intentional choice.

### What I Built Instead of Using Libraries

| Common Library | My Implementation |
|----------------|-------------------|
| Moment.js / date-fns | Custom `time.js` module (~100 lines) |
| UUID library | `crypto.randomUUID()` or fallback generator |
| Lodash debounce | Custom 10-line debounce function |
| CSS-in-JS | CSS custom properties + native stylesheets |
| State management | Plain objects + localStorage |
| Testing framework | Manual testing (area for improvement) |

## Data Persistence

### localStorage Schema

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
    startTime: "YYYY-MM-DDTHH:mm",
    endTime: "YYYY-MM-DDTHH:mm"
  }]
}

// Archived blocks by date
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

### Why localStorage Over IndexedDB?

| localStorage | IndexedDB |
|-------------|-----------|
| Synchronous API | Async API |
| 5-10MB limit | Much larger |
| Simple key-value | Complex queries |
| JSON.parse/stringify | Structured data |

For a time-blocking app, localStorage is sufficient. I don't need complex queries or massive storage - just simple CRUD operations on JSON objects.

## Development Workflow

### Running Locally

```bash
# Option 1: Direct file open
open index.html

# Option 2: Local server (for PWA testing)
python -m http.server 8000
# or
npx serve
```

### Deployment

```bash
git push origin main
# GitHub Pages auto-deploys
```

## Browser Support

- Chrome 80+ (ES modules, CSS custom properties)
- Firefox 75+ (ES modules, CSS custom properties)
- Safari 13+ (ES modules, CSS custom properties)
- Edge 80+ (Chromium-based)

### Notable Browser Features Used

- `crypto.randomUUID()` for block IDs
- CSS `prefers-color-scheme` for auto dark mode
- Native `<input type="color">` for color picking
- `Notification` API for reminders
- Service Worker for offline support
- ES6 modules with `type="module"`
