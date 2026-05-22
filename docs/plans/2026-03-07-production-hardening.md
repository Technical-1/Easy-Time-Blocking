# Production Hardening Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix all 17 verified production readiness issues from PRODUCTION_AUDIT.md and make the app fully offline-capable.

**Architecture:** The app is a zero-dependency vanilla JS PWA (no build step, no framework). All logic lives in `script.js` (~3737 lines) with ES module counterparts in `modules/`. The modules already implement `escapeHtml()` but `script.js` has its own duplicate functions that skip sanitization. The strategy is: fix the inline `script.js` functions, harden the modules, and add missing browser features (CSP, focus traps, offline support). Since there is no test framework, each task includes manual browser verification steps.

**Tech Stack:** Vanilla JavaScript (ES modules), CSS custom properties, Service Worker API, Web App Manifest

**Important codebase note:** `script.js` imports from `modules/` but preserves its own inline function copies (line 79 comment: "existing inline functions are preserved for backward compatibility"). Both the module AND the inline version must be fixed for each issue.

---

## Phase 1: Security (Tasks 1-4)

### Task 1: Fix XSS in buildPrintView

The `buildPrintView()` function in `script.js` builds HTML strings with raw user data and assigns them to the DOM. The module version (`modules/print.js`) already uses `escapeHtml()` correctly. Fix the inline version to match.

**Files:**
- Modify: `script.js:3279` (add escapeHtml function near utility section)
- Modify: `script.js:3697-3731` (escape all user values in buildPrintView)

**Step 1: Add a shared escapeHtml function to script.js**

Add this near the utility functions section (after `generateUUID` around line 3283):

```javascript
function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
```

**Step 2: Escape all user data in buildPrintView**

In `script.js`, find `buildPrintView()` (line 3642). Change these lines:

Line 3705 — change:
```javascript
html += `<span class="print-title">${block.title || "Untitled"}</span>`;
```
to:
```javascript
html += `<span class="print-title">${escapeHtml(block.title || "Untitled")}</span>`;
```

Line 3715 — change:
```javascript
html += `<li>${checked} ${task.text}</li>`;
```
to:
```javascript
html += `<li>${checked} ${escapeHtml(task.text)}</li>`;
```

Line 3721 — change:
```javascript
html += `<p class="print-notes">${block.notes}</p>`;
```
to:
```javascript
html += `<p class="print-notes">${escapeHtml(block.notes)}</p>`;
```

**Step 3: Escape user data in buildStatistics**

In `script.js`, find `buildStatistics()` (line 3606). The current interpolated values are all computed numbers (`.length`, `Math.round()`), which are safe. But add a defensive comment and verify no user strings are interpolated. No code change needed here today — the CSP in Task 3 provides secondary defense.

**Step 4: Verify**

1. Open app in browser
2. Create a block with title: `<img src=x onerror="alert('xss')">`
3. Open Print View (Cmd+P or Settings > Print View)
4. Confirm: the title renders as literal text `<img src=x onerror="alert('xss')">`, not as an image element
5. Confirm: no alert dialog fires

**Step 5: Commit**

```bash
git add script.js
git commit -m "fix: escape user input in buildPrintView to prevent XSS"
```

---

### Task 2: Add Content Security Policy

Add a CSP meta tag to prevent inline script execution even if an XSS vector is missed.

**Files:**
- Modify: `index.html:7` (add meta tag in `<head>` after Primary Meta Tags comment)

**Step 1: Add CSP meta tag**

In `index.html`, add this line after line 6 (after the `<meta name="viewport">` tag):

```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'none'; worker-src 'self'; base-uri 'self'; form-action 'none';">
```

**Why `'unsafe-inline'` for style-src:** The app sets inline styles via JavaScript (e.g., `cell.style.backgroundColor = block.color`). Removing `'unsafe-inline'` would break block color rendering. This is acceptable — style injection cannot execute scripts.

**Step 2: Verify**

1. Open app in browser, open DevTools Console
2. Confirm: no CSP violation errors in console during normal use
3. Confirm: block colors still render correctly
4. Confirm: block creation, editing, deletion all work
5. Create a block, open Print View — confirm it renders
6. Try injecting `<script>alert(1)</script>` in a block title, open Print View — confirm the CSP blocks execution (even though escapeHtml from Task 1 should prevent it too)

**Step 3: Commit**

```bash
git add index.html
git commit -m "security: add Content Security Policy meta tag"
```

---

### Task 3: Validate imported JSON data fields

Add field-level sanitization to `importData()` in `script.js` and `validateImportData()` in `modules/data.js`.

**Files:**
- Modify: `script.js:3452-3478` (add sanitization before storing imported data)
- Modify: `modules/data.js:127-141` (add field validation to validateImportData)

**Step 1: Add sanitization helper to script.js**

Add this after the `escapeHtml` function added in Task 1:

```javascript
function sanitizeBlockData(blocks) {
  if (!Array.isArray(blocks)) return [];
  return blocks.map(block => ({
    ...block,
    id: typeof block.id === 'string' ? block.id.slice(0, 100) : generateUUID(),
    title: typeof block.title === 'string' ? block.title.slice(0, 200) : '',
    notes: typeof block.notes === 'string' ? block.notes.slice(0, 5000) : '',
    color: typeof block.color === 'string' && /^(#[0-9a-fA-F]{3,8}|rgb\(\d{1,3},\s*\d{1,3},\s*\d{1,3}\))$/.test(block.color) ? block.color : '#4F6D7A',
    category: typeof block.category === 'string' ? block.category.slice(0, 100) : '',
    tasks: Array.isArray(block.tasks) ? block.tasks.map(t => ({
      text: typeof t.text === 'string' ? t.text.slice(0, 500) : '',
      completed: typeof t.completed === 'boolean' ? t.completed : false
    })) : [],
    recurring: typeof block.recurring === 'boolean' ? block.recurring : false,
    archived: typeof block.archived === 'boolean' ? block.archived : false,
    recurrenceDays: Array.isArray(block.recurrenceDays) ? block.recurrenceDays.filter(d => ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].includes(d)) : [],
    carryOver: typeof block.carryOver === 'boolean' ? block.carryOver : false,
    preserveTaskState: typeof block.preserveTaskState === 'boolean' ? block.preserveTaskState : false
  }));
}
```

**Step 2: Apply sanitization in importData**

In `script.js`, find `importData()` (line 3452). Change the data assignment block:

```javascript
// Before (lines 3456-3461):
if (data.timeBlocks) timeBlocks = data.timeBlocks;

// After:
if (data.timeBlocks && data.timeBlocks.blocks) {
  timeBlocks = {
    blocks: sanitizeBlockData(data.timeBlocks.blocks)
  };
}
```

Also sanitize archived blocks:

```javascript
// Before:
if (data.archivedBlocks) archivedBlocks = data.archivedBlocks;

// After:
if (data.archivedBlocks && data.archivedBlocks.days) {
  const sanitizedDays = {};
  for (const [dateStr, blocks] of Object.entries(data.archivedBlocks.days)) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      sanitizedDays[dateStr] = sanitizeBlockData(blocks);
    }
  }
  archivedBlocks = { days: sanitizedDays };
}
```

**Step 3: Update modules/data.js validateImportData**

In `modules/data.js`, update `validateImportData()` (line 127) to add type checks:

```javascript
export function validateImportData(data) {
  if (!data || typeof data !== 'object') return null;
  if (!data.timeBlocks || !Array.isArray(data.timeBlocks.blocks)) {
    return null;
  }

  return {
    timeBlocks: data.timeBlocks,
    archivedBlocks: data.archivedBlocks && typeof data.archivedBlocks === 'object'
      ? data.archivedBlocks
      : { days: {} },
    colorPresets: Array.isArray(data.colorPresets) ? data.colorPresets : [],
    categories: Array.isArray(data.categories) ? data.categories : [],
    blockTemplates: Array.isArray(data.blockTemplates) ? data.blockTemplates : [],
    hiddenTimes: Array.isArray(data.hiddenTimes) ? data.hiddenTimes : []
  };
}
```

**Step 4: Verify**

1. Export current data as JSON
2. Modify the JSON file: set a block title to `<script>alert('xss')</script>` and a color to `invalidcolor`
3. Import the modified file
4. Confirm: title is stored as plain text (truncated, not executed)
5. Confirm: invalid color falls back to `#4F6D7A`
6. Open Print View — confirm no script execution

**Step 5: Commit**

```bash
git add script.js modules/data.js
git commit -m "security: validate and sanitize imported JSON data fields"
```

---

### Task 4: Fix external links missing rel="noopener noreferrer"

**Files:**
- Modify: `index.html:216-218`

**Step 1: Add rel attribute to all three About source links**

Change lines 216-218 from:

```html
<li><a href="https://www.habitstrong.com/time-blocking-pros-cons" target="_blank">HabitStrong - Pros and Cons of Time Blocking</a></li>
<li><a href="https://www.getclockwise.com/blog/benefits-time-blocking" target="_blank">Clockwise - 7 Benefits of Time Blocking</a></li>
<li><a href="https://www.todoist.com/productivity-methods/time-blocking" target="_blank">Todoist - Time Blocking Method</a></li>
```

to:

```html
<li><a href="https://www.habitstrong.com/time-blocking-pros-cons" target="_blank" rel="noopener noreferrer">HabitStrong - Pros and Cons of Time Blocking</a></li>
<li><a href="https://www.getclockwise.com/blog/benefits-time-blocking" target="_blank" rel="noopener noreferrer">Clockwise - 7 Benefits of Time Blocking</a></li>
<li><a href="https://www.todoist.com/productivity-methods/time-blocking" target="_blank" rel="noopener noreferrer">Todoist - Time Blocking Method</a></li>
```

**Step 2: Verify**

1. Open app, go to About view
2. Right-click each source link, Inspect Element
3. Confirm each has `rel="noopener noreferrer"`

**Step 3: Commit**

```bash
git add index.html
git commit -m "security: add rel=noopener noreferrer to external links"
```

---

## Phase 2: Bug Fixes (Tasks 5-7)

### Task 5: Fix notification interval leak

The `startNotificationChecker()` function creates intervals without storing the ID, and `disableNotifications()` never clears them. Fix both the inline version in `script.js` and the module version in `modules/notifications.js`.

**Files:**
- Modify: `script.js:536-546` (store interval ID, clear on disable, guard multiple calls)
- Modify: `modules/notifications.js:57-69` (same fixes)

**Step 1: Fix script.js notification functions**

Replace the notification functions (lines 536-546):

```javascript
let notificationIntervalId = null;

function disableNotifications() {
  notificationsEnabled = false;
  saveNotificationPreference(false);
  if (notificationIntervalId) {
    clearInterval(notificationIntervalId);
    notificationIntervalId = null;
  }
}

function startNotificationChecker() {
  // Guard against multiple intervals
  if (notificationIntervalId) {
    clearInterval(notificationIntervalId);
  }
  notificationIntervalId = setInterval(checkUpcomingBlocks, 60000);
  // Also check immediately
  checkUpcomingBlocks();
}
```

**Step 2: Fix modules/notifications.js**

Replace the functions (lines 57-69):

```javascript
let notificationIntervalId = null;

export function disableNotifications() {
  notificationsEnabled = false;
  saveNotificationPreference(false);
  if (notificationIntervalId) {
    clearInterval(notificationIntervalId);
    notificationIntervalId = null;
  }
}

function startNotificationChecker() {
  if (notificationIntervalId) {
    clearInterval(notificationIntervalId);
  }
  notificationIntervalId = setInterval(checkUpcomingBlocks, 60000);
  checkUpcomingBlocks();
}
```

**Step 3: Verify**

1. Open app, go to Settings
2. Enable notifications (grant permission if prompted)
3. Disable notifications
4. Re-enable notifications
5. Open DevTools Console, run: `setInterval.toString()` — confirm no errors
6. Confirm: only one interval running at a time (check by adding `console.log('checking...')` temporarily to `checkUpcomingBlocks`)

**Step 4: Commit**

```bash
git add script.js modules/notifications.js
git commit -m "fix: store and clear notification interval to prevent memory leak"
```

---

### Task 6: Fix carry-over dateStr inconsistency

Pass `todayStr` explicitly to all `applyCarryOverData()` calls.

**Files:**
- Modify: `script.js:1766` (pass todayStr to applyCarryOverData in renderBlocksDaily)
- Modify: `script.js:1567` (pass todayStr to applyCarryOverData in task checkbox handler)

**Step 1: Fix renderBlocksDaily**

In `script.js`, find `renderBlocksDaily()` (line 1762). Change the function signature and the applyCarryOverData call:

```javascript
function renderBlocksDaily(blocks, todayStr){
  const dailyBody = document.getElementById("daily-body");
  blocks.forEach(block => {
    // Apply carry over data for recurring blocks
    const displayBlock = applyCarryOverData(block, todayStr);
```

**Step 2: Update the caller in displayDailyBlocks**

In `displayDailyBlocks()` (line 1724), update the call at line 1738:

```javascript
renderBlocksDaily(dailyBlocks, todayStr);
```

**Step 3: Fix task checkbox handler**

In `script.js`, find the task checkbox delegation handler (around line 1567). Change:

```javascript
const dayBlocks = getCurrentDayBlocks().map(b => applyCarryOverData(b));
```

to:

```javascript
const todayStrForCheck = formatDate(currentDate);
const dayBlocks = getCurrentDayBlocks().map(b => applyCarryOverData(b, todayStrForCheck));
```

**Step 4: Verify**

1. Create a recurring block for today's weekday with 2 tasks
2. Check one task as complete
3. Navigate to tomorrow (→ arrow), then back to today (← arrow)
4. Confirm: the checked task is still checked
5. Navigate to a day where the recurring block appears
6. Confirm: tasks show the correct state for that day (not leaking from another day)

**Step 5: Commit**

```bash
git add script.js
git commit -m "fix: pass dateStr consistently to applyCarryOverData calls"
```

---

### Task 7: Replace Math.random UUID with crypto.randomUUID

**Files:**
- Modify: `script.js:3279-3283`
- Modify: `modules/utils.js:6-12`

**Step 1: Fix script.js**

Replace `generateUUID()` (line 3279):

```javascript
function generateUUID(){
  return crypto.randomUUID();
}
```

**Step 2: Fix modules/utils.js**

Replace `generateUUID()` (line 6):

```javascript
export function generateUUID() {
  return crypto.randomUUID();
}
```

**Step 3: Verify**

1. Open app, create a new block
2. Open DevTools Console, check the block's ID in localStorage: `JSON.parse(localStorage.getItem('timeBlocks')).blocks[0].id`
3. Confirm: it's a valid UUID v4 format (xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx)

**Step 4: Commit**

```bash
git add script.js modules/utils.js
git commit -m "fix: use crypto.randomUUID() instead of Math.random"
```

---

## Phase 3: Offline Capability (Tasks 8-9)

### Task 8: Fix service worker registration path

**Files:**
- Modify: `script.js:279` (change absolute path to relative)

**Step 1: Fix the registration call**

Change line 279 from:

```javascript
navigator.serviceWorker.register('/sw.js')
```

to:

```javascript
navigator.serviceWorker.register('./sw.js', { scope: './' })
```

**Step 2: Verify**

1. Serve the app from a subdirectory (e.g., `python -m http.server 8000` from the project root, then access at `http://localhost:8000/`)
2. Open DevTools > Application > Service Workers
3. Confirm: service worker is registered with the correct scope
4. Confirm: no registration errors in Console

**Step 3: Commit**

```bash
git add script.js
git commit -m "fix: use relative path for service worker registration"
```

---

### Task 9: Ensure complete offline capability

The service worker already caches the main files. This task ensures all assets are cached, the cache version is bumped after our changes, and the app handles offline gracefully.

**Files:**
- Modify: `sw.js:1-20` (verify all files in cache list, bump version)
- Modify: `script.js` (add offline detection UI)
- Modify: `styles.css` (add offline indicator style)
- Modify: `index.html` (add offline indicator element)

**Step 1: Update sw.js cache list and bump version**

Update `sw.js` lines 1-20. Ensure all files are included and bump the cache version:

```javascript
const CACHE_NAME = 'time-blocking-v8';
const urlsToCache = [
  './',
  './index.html',
  './styles.css',
  './script.js',
  './icon.svg',
  './jk-logo.svg',
  './manifest.json',
  './modules/index.js',
  './modules/storage.js',
  './modules/utils.js',
  './modules/theme.js',
  './modules/notifications.js',
  './modules/time.js',
  './modules/search.js',
  './modules/statistics.js',
  './modules/data.js',
  './modules/archive.js',
  './modules/print.js'
];
```

Note: `jk-logo.svg` was missing from the original cache list.

**Step 2: Add offline/online indicator to index.html**

Add this inside `<main>`, right before the daily-view div (after line 74):

```html
<div id="offline-indicator" class="offline-indicator" role="status" aria-live="polite" style="display: none;">
  You are offline. Changes are saved locally and will sync when you reconnect.
</div>
```

**Step 3: Add offline indicator styles to styles.css**

Add before the responsive media query section (before `@media (max-width: 37.5rem)`):

```css
/* Offline indicator */
.offline-indicator {
  background-color: var(--warning-color);
  color: #333;
  text-align: center;
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
  font-weight: 500;
}
```

**Step 4: Add online/offline event listeners to script.js**

Add this near the service worker registration section (after line 304):

```javascript
// Offline/Online detection
function updateOnlineStatus() {
  const indicator = document.getElementById('offline-indicator');
  if (indicator) {
    indicator.style.display = navigator.onLine ? 'none' : 'block';
  }
}

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);
updateOnlineStatus();
```

**Step 5: Verify**

1. Open app in browser, go to DevTools > Application > Service Workers
2. Confirm SW registered and all files cached under `time-blocking-v8`
3. Check "Offline" checkbox in DevTools > Network
4. Confirm: yellow "You are offline" banner appears
5. Refresh the page while offline — confirm app loads fully from cache
6. Create a block, edit a block, navigate dates — confirm all works offline
7. Uncheck "Offline" — confirm banner disappears
8. Confirm: `jk-logo.svg` (footer logo) renders while offline

**Step 6: Commit**

```bash
git add sw.js script.js styles.css index.html
git commit -m "feat: ensure complete offline capability with cache updates and offline indicator"
```

---

## Phase 4: Accessibility (Tasks 10-14)

### Task 10: Implement focus trap in modal dialogs

When a modal is open, Tab/Shift+Tab should cycle within the modal. This affects the block editor overlay, settings overlay, and search results overlay.

**Files:**
- Modify: `script.js` (add focus trap utility and apply to all 3 modals)

**Step 1: Add focus trap utility function**

Add this near the top of `script.js`, after the storage functions section (around line 270):

```javascript
/***************************************************
* Focus Trap Utility
**************************************************/
function trapFocus(element) {
  const focusableSelectors = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function handleKeyDown(e) {
    if (e.key !== 'Tab') return;

    const focusableElements = Array.from(element.querySelectorAll(focusableSelectors)).filter(el => el.offsetParent !== null);
    if (focusableElements.length === 0) return;

    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        lastFocusable.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        firstFocusable.focus();
        e.preventDefault();
      }
    }
  }

  element.addEventListener('keydown', handleKeyDown);
  return () => element.removeEventListener('keydown', handleKeyDown);
}
```

**Step 2: Apply focus trap to block editor overlay**

Find `showBlockPopup()` in `script.js`. After the line that adds the "active" class to the overlay, add:

```javascript
// Trap focus inside modal
if (window._overlayFocusTrap) window._overlayFocusTrap();
window._overlayFocusTrap = trapFocus(overlay);
```

In `closeBlockPopup()`, before removing the "active" class, add:

```javascript
if (window._overlayFocusTrap) {
  window._overlayFocusTrap();
  window._overlayFocusTrap = null;
}
```

**Step 3: Apply focus trap to settings overlay**

Find the settings overlay open handler. After adding "active" class to `settingsOverlay`, add:

```javascript
if (window._settingsFocusTrap) window._settingsFocusTrap();
window._settingsFocusTrap = trapFocus(settingsOverlay);
```

Find the settings close handler. Before removing "active" class, add:

```javascript
if (window._settingsFocusTrap) {
  window._settingsFocusTrap();
  window._settingsFocusTrap = null;
}
```

**Step 4: Apply focus trap to search overlay**

Find where `searchOverlay` gets "active" class added. After it, add:

```javascript
if (window._searchFocusTrap) window._searchFocusTrap();
window._searchFocusTrap = trapFocus(searchOverlay);
```

Find the search overlay close handler. Before removing "active", add:

```javascript
if (window._searchFocusTrap) {
  window._searchFocusTrap();
  window._searchFocusTrap = null;
}
```

**Step 5: Verify**

1. Open block editor modal
2. Press Tab repeatedly — confirm focus cycles within the modal (title input → color → tasks → buttons → back to title)
3. Press Shift+Tab — confirm reverse cycling
4. Confirm: focus never escapes to the background page
5. Repeat for Settings overlay and Search overlay
6. Confirm: Escape still closes each modal

**Step 6: Commit**

```bash
git add script.js
git commit -m "a11y: implement focus trap in all modal dialogs"
```

---

### Task 11: Fix color contrast failures

**Files:**
- Modify: `styles.css:9` (text-muted)
- Modify: `styles.css:16-17` (success-color, success-hover)
- Modify: `styles.css:37` (dark mode text-muted — already 4.5:1, verify)
- Modify: `styles.css:44-45` (dark mode success colors)
- Modify: `styles.css:73-74` (auto dark mode success colors)

**Step 1: Fix light mode colors**

In `styles.css`, change line 9:
```css
--text-muted: #767676;
```

Change line 16-17:
```css
--success-color: #3d8b3d;
--success-hover: #347a34;
```

**Step 2: Fix dark mode colors (data-theme="dark" block)**

In `styles.css`, change line 44-45:
```css
--success-color: #5cb85c;
--success-hover: #4cae4c;
```

**Step 3: Fix auto dark mode colors (prefers-color-scheme block)**

In `styles.css`, change lines 73-74 to match:
```css
--success-color: #5cb85c;
--success-hover: #4cae4c;
```

**Step 4: Verify**

1. Open app in light mode (Settings > Theme > Light)
2. Confirm: muted text (e.g., "Disabled" notification status) is readable
3. Confirm: Save Block button and Today button are readable (white text on green)
4. Switch to dark mode — confirm success buttons are readable
5. Use a contrast checker tool (e.g., WebAIM) to verify:
   - `#767676` on `#ffffff` = 4.5:1 (passes AA)
   - `#3d8b3d` with white text — check ratio (should be ≥ 4.5:1)
   - `#5cb85c` on `#2d2d2d` — check ratio

**Step 5: Commit**

```bash
git add styles.css
git commit -m "a11y: fix color contrast to meet WCAG AA requirements"
```

---

### Task 12: Add prefers-reduced-motion support

**Files:**
- Modify: `styles.css` (add at the end, before print styles)

**Step 1: Add reduced motion media query**

Add this before the `@media print` section (before line 1696):

```css
/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

**Step 2: Verify**

1. Open System Preferences > Accessibility > Display > Reduce motion (macOS) or equivalent
2. Refresh app
3. Confirm: no animations play (popup doesn't slide up, buttons don't transition on hover)
4. Turn off reduced motion — confirm animations return

**Step 3: Commit**

```bash
git add styles.css
git commit -m "a11y: add prefers-reduced-motion support"
```

---

### Task 13: Add skip-to-main-content link

**Files:**
- Modify: `index.html` (add skip link after `<body>`)
- Modify: `styles.css` (add skip link styles)

**Step 1: Add skip link to index.html**

After the `<body>` tag (line 52), add:

```html
<a href="#daily-view" class="skip-link">Skip to main content</a>
```

**Step 2: Add skip link styles to styles.css**

Add after the `body` styles (around line 118):

```css
/* Skip link for keyboard navigation */
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: var(--accent-color);
  color: #fff;
  padding: 8px 16px;
  z-index: 200;
  font-size: 0.9rem;
  transition: top 0.2s;
}
.skip-link:focus {
  top: 0;
}
```

**Step 3: Verify**

1. Refresh app
2. Press Tab — confirm: "Skip to main content" link appears at top of page
3. Press Enter — confirm: focus jumps to daily view area
4. Press Tab again without activating skip link — confirm: link disappears and focus moves to first header button

**Step 4: Commit**

```bash
git add index.html styles.css
git commit -m "a11y: add skip-to-main-content link for keyboard navigation"
```

---

### Task 14: Add screen reader announcements for key actions

**Files:**
- Modify: `script.js` (add announcement utility and use it for date navigation, block save, block delete)

**Step 1: Add announcement utility**

Add near the focus trap utility:

```javascript
/***************************************************
* Screen Reader Announcements
**************************************************/
function announceToScreenReader(message) {
  const subheader = document.getElementById('daily-subheader');
  if (subheader) {
    // The subheader already has aria-live="polite"
    // Setting textContent triggers the announcement
    subheader.textContent = message;
  }
}
```

**Step 2: Announce date navigation**

Find `updateDailySubheader()` (line 309). It already updates the subheader text which has `aria-live="polite"`. Verify this announces properly — no additional code needed here since `aria-live="polite"` on `#daily-subheader` (index.html line 77) already triggers screen reader announcements when `textContent` changes.

**Step 3: Announce block save success**

In `handleSaveBlock()`, after `displayDailyBlocks()` is called at the end of the function, add:

```javascript
announceToScreenReader(`Block "${title}" saved successfully`);
```

**Step 4: Announce block deletion**

In the delete handler (find `handleDeleteBlock`), after `displayDailyBlocks()` is called, add:

```javascript
announceToScreenReader('Block deleted');
```

**Step 5: Verify**

1. Enable VoiceOver (Cmd+F5 on macOS) or use a screen reader
2. Navigate dates with arrow keys — confirm: screen reader announces the new date
3. Create a block — confirm: "Block [title] saved successfully" is announced
4. Delete a block — confirm: "Block deleted" is announced

**Step 6: Commit**

```bash
git add script.js
git commit -m "a11y: add screen reader announcements for key actions"
```

---

## Phase 5: UX & Polish (Tasks 15-18)

### Task 15: Replace alert() calls with toast notifications

Create a reusable toast notification system that replaces all `alert()` calls for non-destructive messages. Keep `confirm()` for destructive actions (delete, import).

**Files:**
- Modify: `index.html` (add toast container)
- Modify: `styles.css` (add toast styles)
- Modify: `script.js` (add showToast function, replace alert calls)

**Step 1: Add toast container to index.html**

Add before the closing `</body>` tag (before `<script>` on line 433):

```html
<div id="toast-container" class="toast-container" aria-live="assertive" aria-atomic="true"></div>
```

**Step 2: Add toast styles to styles.css**

Add before the reduced motion section:

```css
/* Toast notifications */
.toast-container {
  position: fixed;
  bottom: 2rem;
  right: 1rem;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  pointer-events: none;
}
.toast {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  box-shadow: 0 4px 12px var(--shadow-dark);
  font-size: 0.9rem;
  max-width: 350px;
  pointer-events: auto;
  animation: slideUp 0.2s ease-out;
}
.toast.toast-success {
  border-left: 4px solid var(--success-color);
}
.toast.toast-error {
  border-left: 4px solid var(--danger-color);
}
.toast.toast-warning {
  border-left: 4px solid var(--warning-color);
}
```

**Step 3: Add showToast function to script.js**

Add near the screen reader announcement utility:

```javascript
/***************************************************
* Toast Notifications
**************************************************/
function showToast(message, type = 'success', duration = 3000) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}
```

**Step 4: Replace alert() calls in script.js**

Replace these `alert()` calls with `showToast()`:

| Line | Current | Replacement |
|------|---------|-------------|
| 102 | `alert("Unable to save data...")` | `showToast("Unable to save data. Your browser storage may be full or disabled.", "error", 5000)` |
| 141 | `alert("Unable to save archived data.")` | `showToast("Unable to save archived data.", "error", 5000)` |
| 160 | `alert("Unable to save color preferences.")` | `showToast("Unable to save color preferences.", "error", 5000)` |
| 179 | `alert("Unable to save time slot preferences.")` | `showToast("Unable to save time slot preferences.", "error", 5000)` |
| 509 | `alert("Your browser does not support notifications.")` | `showToast("Your browser does not support notifications.", "warning")` |
| 521 | `alert("Notifications are blocked...")` | `showToast("Notifications are blocked. Please enable them in your browser settings.", "warning", 5000)` |
| 566 | `alert("Please enter a block title.")` | `showToast("Please enter a block title.", "error")` |
| 876 | `alert("Template '...' saved!")` | `showToast("Template '" + templateName + "' saved!")` |
| 1127 | `alert("Error importing data: ...")` | `showToast("Error importing data. Please ensure the file is a valid export.", "error", 5000)` |
| 1447 | `alert("TXT import is read-only...")` | `showToast("TXT import is read-only. Please use JSON format for imports.", "warning", 5000)` |
| 1491 | `alert("No non-recurring blocks...")` | `showToast("No non-recurring blocks were copied.", "warning")` |
| 2566 | `alert("Please enter a block title.")` | `showToast("Please enter a block title.", "error")` |
| 2594 | `alert("Error: block not found.")` | `showToast("Error: block not found.", "error")` |
| 2619 | `alert("End time must be after...")` | `showToast("End time must be after start time.", "error")` |
| 2626 | `alert(durationCheck.message)` | `showToast(durationCheck.message, "error")` |
| 2646 | `alert("Please fill in Date...")` | `showToast("Please fill in Date, Start Time, and End Time, or leave all blank.", "error", 5000)` |
| 2671 | `alert("Invalid time range.")` | `showToast("Invalid time range.", "error")` |
| 3476 | `alert("Data imported successfully!")` | `showToast("Data imported successfully!")` |

**Important:** Do NOT replace `confirm()` calls — keep those as-is for destructive actions (lines 2636, 2684, 2708, 3455, 836, 1605).

Also replace the `alert()` calls in `modules/notifications.js` (lines 30, 42) and `modules/storage.js` (lines 24, 55, 84). Since these modules don't have access to the DOM `showToast` function, change them to throw or return error states that the caller handles. Or simpler: in the module files, change `alert()` to `console.warn()` since the inline script.js versions are what actually run.

**Step 5: Verify**

1. Open app, try saving a block without a title — confirm: toast appears in bottom-right, not a browser alert
2. Confirm: toast auto-dismisses after 3 seconds
3. Confirm: error toasts have red left border, success have green
4. Confirm: `confirm()` dialogs still work for delete block, import data
5. Test multiple toasts stacking (trigger errors rapidly) — confirm they stack properly

**Step 6: Commit**

```bash
git add script.js index.html styles.css modules/notifications.js modules/storage.js
git commit -m "ux: replace alert() calls with styled toast notifications"
```

---

### Task 16: Pause highlightCurrentTime when tab is hidden

**Files:**
- Modify: `script.js:3229-3230`

**Step 1: Replace bare setInterval with visibility-aware version**

Replace the interval at line 3229-3230:

```javascript
// Update current time highlight every 5 minutes, pause when tab hidden
let highlightIntervalId = setInterval(highlightCurrentTime, 300000);

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    clearInterval(highlightIntervalId);
    highlightIntervalId = null;
  } else {
    highlightCurrentTime(); // Update immediately when tab becomes visible
    highlightIntervalId = setInterval(highlightCurrentTime, 300000);
  }
});
```

**Step 2: Verify**

1. Open app, note current time highlight on schedule
2. Switch to another tab, wait 5+ minutes
3. Switch back — confirm: time highlight updates immediately
4. Open DevTools Console — confirm: no interval running while tab is hidden

**Step 3: Commit**

```bash
git add script.js
git commit -m "perf: pause highlightCurrentTime interval when tab is hidden"
```

---

### Task 17: Fix manifest icon purpose

**Files:**
- Modify: `manifest.json:14-29`

**Step 1: Split combined "any maskable" purpose into separate entries**

Replace the icons array (lines 12-30):

```json
"icons": [
  {
    "src": "icon.svg",
    "sizes": "any",
    "type": "image/svg+xml",
    "purpose": "any"
  },
  {
    "src": "icon.svg",
    "sizes": "any",
    "type": "image/svg+xml",
    "purpose": "maskable"
  },
  {
    "src": "assets/favicon-512.png",
    "sizes": "512x512",
    "type": "image/png",
    "purpose": "any"
  },
  {
    "src": "assets/favicon-180.png",
    "sizes": "180x180",
    "type": "image/png"
  }
],
```

**Step 2: Verify**

1. Open DevTools > Application > Manifest
2. Confirm: no manifest warnings
3. Confirm: icons show correctly

**Step 3: Commit**

```bash
git add manifest.json
git commit -m "fix: split manifest icon purpose into separate entries per W3C spec"
```

---

### Task 18: Add first-time user onboarding hint

Show a subtle hint in the daily view when a user has no blocks, guiding them to create their first one.

**Files:**
- Modify: `script.js` (update `checkForEmptyDay` to show onboarding hint)
- Modify: `styles.css` (add onboarding hint styles)

**Step 1: Update checkForEmptyDay in script.js**

Replace the `checkForEmptyDay()` function (line 1745):

```javascript
function checkForEmptyDay() {
  const todayStr = formatDate(currentDate);
  const dailyBlocks = timeBlocks.blocks.filter(b => {
    if(b.archived) return false;
    if(b.recurring && b.recurrenceDays && b.recurrenceDays.length>0){
      return b.recurrenceDays.includes(getWeekdayName(currentDate));
    } else {
      if(!b.startTime) return false;
      return (b.startTime.split("T")[0] === todayStr);
    }
  });

  // Remove existing empty message if any
  const existing = document.getElementById("empty-day-message");
  if (existing) existing.remove();

  if (dailyBlocks.length === 0) {
    const dailyBody = document.getElementById("daily-body");
    if (!dailyBody) return;
    const msg = document.createElement("tr");
    msg.id = "empty-day-message";
    const td = document.createElement("td");
    td.colSpan = 2;
    td.className = "empty-day-hint";
    td.textContent = "Drag across time slots to create your first block, or press ";
    const kbd = document.createElement("kbd");
    kbd.textContent = navigator.platform.includes("Mac") ? "Cmd+N" : "Ctrl+N";
    td.appendChild(kbd);
    msg.appendChild(td);
    dailyBody.appendChild(msg);
  }
}
```

**Step 2: Add hint styles to styles.css**

Add before the responsive media query:

```css
/* Empty day hint */
.empty-day-hint {
  text-align: center;
  color: var(--text-muted);
  padding: 2rem 1rem;
  font-size: 0.95rem;
}
.empty-day-hint kbd {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 3px;
  padding: 2px 6px;
  font-family: inherit;
  font-size: 0.85rem;
}
```

**Step 3: Verify**

1. Navigate to a day with no blocks
2. Confirm: "Drag across time slots to create your first block, or press Cmd+N" message appears
3. Create a block — confirm: message disappears
4. Delete all blocks for that day — confirm: message reappears

**Step 4: Commit**

```bash
git add script.js styles.css
git commit -m "ux: add empty state hint for days with no blocks"
```

---

## Final Step: Update PRODUCTION_AUDIT.md

After all tasks are complete, update `PRODUCTION_AUDIT.md` to mark each issue as resolved with the commit hash. Also update the service worker cache version reference.

```bash
git add PRODUCTION_AUDIT.md
git commit -m "docs: mark all production audit issues as resolved"
```

---

## Task Dependency Graph

```
Phase 1 (Security):     Task 1 → Task 2 → Task 3 → Task 4
Phase 2 (Bugs):         Task 5, Task 6, Task 7  (independent, can be parallel)
Phase 3 (Offline):      Task 8 → Task 9
Phase 4 (Accessibility): Task 10, Task 11, Task 12, Task 13, Task 14  (independent, can be parallel)
Phase 5 (UX):           Task 15, Task 16, Task 17, Task 18  (independent, can be parallel)
```

Tasks within each phase can generally be done in any order unless noted. Tasks 1-3 must be sequential (XSS fix → CSP → import validation builds on each other).

---

## Summary

| Phase | Tasks | Files Modified |
|-------|-------|---------------|
| 1. Security | 1-4 | script.js, index.html, modules/data.js |
| 2. Bug Fixes | 5-7 | script.js, modules/notifications.js, modules/utils.js |
| 3. Offline | 8-9 | script.js, sw.js, styles.css, index.html |
| 4. Accessibility | 10-14 | script.js, styles.css, index.html |
| 5. UX & Polish | 15-18 | script.js, styles.css, index.html, manifest.json, modules/storage.js, modules/notifications.js |
| **Total** | **18 tasks** | **8 files** |
