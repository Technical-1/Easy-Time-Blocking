# Easy Time-Blocking - Project Q&A

## Project Overview

Easy Time-Blocking is a free, privacy-first web application that helps users organize their day using the time-blocking productivity method. I built it as a Progressive Web App with zero dependencies, running entirely in the browser with all data stored locally in localStorage. The app allows users to visually plan their day by dragging across time slots to create blocks, assign tasks to each block, set up recurring schedules, and track their productivity over time. It solves the problem of complex, subscription-based productivity tools by offering a simple, free alternative that respects user privacy - no accounts, no cloud storage, no data collection.

**Target Users:**
- Professionals who want to structure their workday
- Students managing study schedules
- Anyone learning time-blocking as a productivity technique
- Users who prefer offline-first, privacy-respecting tools

## Key Features

### Visual Drag-to-Create Blocks
Users can click and drag across time slots (desktop) or touch-drag (mobile) to instantly create time blocks. The interface shows a real-time preview of the selected time range, making it intuitive to allocate time for activities.

### Recurring Blocks with Carry-Over
Blocks can be set to repeat on specific weekdays (e.g., "Team standup every Monday, Wednesday, Friday"). The carry-over feature optionally inherits tasks and notes from the previous occurrence, so you don't have to recreate the same tasks each week.

### Task Management Within Blocks
Each time block can contain multiple tasks with checkboxes. When all tasks for a day are completed, users see a celebratory message. Task completion state persists across sessions.

### Categories and Templates
Users can create custom categories (Work, Personal, Health, etc.) with associated colors for visual organization. Frequently-used block configurations can be saved as templates for quick reuse.

### Automatic Archiving
Blocks from past days are automatically moved to an archive, keeping the daily view clean while preserving historical data for review. Users can browse past days and see their completed schedules.

### Statistics Dashboard
The app tracks productivity metrics including total time blocked, task completion rates, active vs archived blocks, and time distribution across categories.

### Dark Mode and Theming
Full light/dark mode support with automatic detection of system preference. The theme toggle offers three options: auto (system), light, and dark.

### Export and Import
Users can export their data as JSON (for backup) or TXT (for readability). Data can be imported back, allowing transfer between devices or browsers.

### Browser Notifications
Optional notifications alert users 5 minutes before each block starts, helping them stay on schedule throughout the day.

### Print View
A printer-friendly view generates clean, formatted schedules suitable for physical copies or PDF export.

## Technical Highlights

### Challenge: Drag-to-Create on Touch Devices

Implementing drag selection on mobile required careful handling of touch events. The main challenge was distinguishing between:
- A tap (to open an existing block)
- A drag (to create a new block)
- A scroll (native page scrolling)

**Solution:** I implemented touch detection with thresholds:
```javascript
const TOUCH_TAP_THRESHOLD = 10; // pixels
const TOUCH_TAP_TIME_LIMIT = 300; // ms

// Movement < 10px AND duration < 300ms = tap
// Otherwise = drag to select
```

### Challenge: Recurring Block Date Independence

Recurring blocks needed to show the same time slot on multiple days without storing duplicate data. But each day's tasks needed independent completion state.

**Solution:** I implemented a virtual rendering system where recurring blocks are matched by weekday name, and carry-over data is applied at render time. The original block stores the template; daily instances are computed dynamically.

### Challenge: Performant Block Rendering

With potentially many blocks spanning multiple time slots (using rowSpan), the table rendering needed careful management to avoid visual glitches.

**Solution:** I used a single-pass algorithm that calculates rowSpan values before DOM manipulation, then removes merged cells in order. Event delegation on the table body keeps listener count minimal regardless of block count.

### Challenge: Offline-First Reliability

The app needed to work completely offline while staying updated when online.

**Solution:** Stale-while-revalidate caching strategy in the service worker provides instant loads from cache while fetching updates in the background. localStorage sync happens synchronously with debouncing to prevent excessive writes.

### Innovative Approach: Zero-Dependency Philosophy

Rather than reaching for libraries, I built everything from first principles:
- Time parsing and formatting without Moment.js
- State management without Redux
- Theming without CSS-in-JS libraries
- UUID generation using native `crypto.randomUUID()`

This resulted in a ~150KB total bundle size with instant load times.

## Frequently Asked Questions

### Q: Why did you build this without React/Vue/Angular?

I wanted to prove that modern, feature-rich web apps don't require heavy frameworks. Vanilla JavaScript with ES6+ features provides everything needed for an app like this. The result is faster load times, simpler deployment, and code that will work for years without dependency updates.

### Q: How does data privacy work?

All data stays in your browser's localStorage. Nothing is ever sent to a server. I don't have analytics, tracking, or any backend whatsoever. If you clear your browser data, your schedule is gone - that's the tradeoff for complete privacy.

### Q: Can I sync between devices?

Not automatically, but you can export your data as JSON from one device and import it on another. I considered adding cloud sync but decided privacy was more important than convenience for this app's target users.

### Q: Why localStorage instead of IndexedDB?

localStorage is simpler and sufficient for this use case. The data is just JSON objects - no need for complex queries or massive storage. localStorage's synchronous API also makes the code simpler to reason about.

### Q: How do recurring blocks work technically?

Recurring blocks are stored once with a `recurrenceDays` array like `["Mon", "Wed", "Fri"]`. When rendering the daily view, I filter blocks by checking if the current day name is in that array. Tasks are inherited from archived instances via the carry-over feature.

### Q: What was the hardest part to implement?

The drag-to-create feature on mobile devices. Touch events have complex interactions with scrolling, and distinguishing taps from drags required careful threshold tuning. I also had to handle edge cases like starting a drag on an existing block.

### Q: Why is there no user authentication?

It's intentionally a local-only app. Adding auth would require a backend, complicate the architecture, and compromise the privacy-first promise. For users who need cloud sync, there are plenty of alternatives.

### Q: How do notifications work?

The app uses the browser's Notification API. When enabled, it checks every minute for blocks starting in the next 5 minutes and shows a notification. Notifications only work when the page is open (it's not a background service).

### Q: Can this work as a mobile app?

Yes! It's a Progressive Web App (PWA). On iOS, use "Add to Home Screen" from Safari. On Android, Chrome will prompt to install. Once installed, it works offline and behaves like a native app.

### Q: What would you do differently if starting over?

I would add unit tests from the beginning. The codebase grew organically and now has some functions that are hard to test in isolation. I'd also consider TypeScript for better maintainability, though I still wouldn't add runtime dependencies.
