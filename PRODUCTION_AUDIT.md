# Production Readiness Audit

**Date:** 2026-03-07
**Status:** Not Yet Production Ready (17 verified issues, 8 dismissed)

---

## How to Use This Document

Each issue has been **manually verified** against the source code. Issues from the initial automated audit that turned out to be false positives are listed in the [Dismissed Findings](#dismissed-findings) section at the bottom with explanations.

Issues are grouped by priority tier. Work through Tier 1 first — these are launch blockers.

---

## Tier 1 — Launch Blockers

### 1. [CRITICAL] XSS in buildPrintView — unescaped user data in DOM
- **File:** `script.js:3697-3731`
- **Verified:** YES — `block.title` (line 3705), `task.text` (line 3715), and `block.notes` (line 3721) are interpolated into template literals and the resulting string is assigned to `printContent` DOM element (line 3731) without any escaping.
- **Impact:** A user who imports a crafted JSON file with `<img src=x onerror=alert(1)>` in a block title gets persistent XSS. The payload fires every time Print View opens.
- **Fix:** Apply `escapeHtml()` to all interpolated user values, or rebuild using `createElement`/`textContent` like the daily view does.

### 2. [CRITICAL] XSS in buildStatistics — unescaped template in DOM
- **File:** `script.js:3606-3622`
- **Verified:** YES — `statisticsContent` DOM element is assigned a template literal. Currently, only computed numbers (`.length`, `Math.round()`) are interpolated, so it's **not exploitable today**. However, the pattern is dangerous and has zero defense-in-depth. If a developer adds a block title or category name here, it becomes critical instantly.
- **Impact:** Low today, but high maintenance risk. Adding a CSP (issue #3) provides secondary defense.
- **Fix:** Convert to DOM methods, or at minimum add CSP as secondary defense.

### 3. [HIGH] Missing Content Security Policy
- **File:** `index.html` — no `<meta http-equiv="Content-Security-Policy">` exists
- **Verified:** YES — searched entire file, no CSP present.
- **Impact:** No browser-enforced XSS defense. The app loads zero third-party scripts, so a strict CSP is trivially implementable and highly effective.
- **Fix:** Add to `<head>`:
  ```html
  <meta http-equiv="Content-Security-Policy"
    content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'none'; worker-src 'self'; base-uri 'self'; form-action 'none';">
  ```

### 4. [HIGH] No validation of imported JSON data fields
- **File:** `script.js:3452-3478`
- **Verified:** YES — `importData()` checks only that `data.timeBlocks` is truthy. No field-level validation on `title`, `notes`, `tasks[].text`, `color`, `id`, or any other field. Combined with issue #1, this is the primary XSS attack vector.
- **Impact:** Crafted JSON file with malicious payloads stored to localStorage, executed on print view.
- **Fix:** Add schema validation: check string types, max lengths, strip HTML tags. This is defense-in-depth alongside fixing issue #1.

### 5. [HIGH] Service worker registered at absolute path
- **File:** `script.js:279`
- **Verified:** YES — `navigator.serviceWorker.register('/sw.js')` uses absolute path. On GitHub Pages (`technical-1.github.io/Easy-Time-Blocking/`), this resolves to `technical-1.github.io/sw.js` — the origin root, not the app subdirectory. The SW will fail to register, breaking offline support entirely.
- **Note:** The `sw.js` file itself correctly uses relative paths (`'./'`, `'./index.html'`, etc.) — only the registration call is wrong.
- **Fix:** Change to `navigator.serviceWorker.register('./sw.js', { scope: './' })`.

### 6. [HIGH] Notification interval never cleared (memory leak)
- **File:** `script.js:541-546`
- **Verified:** YES — `startNotificationChecker()` calls `setInterval(checkUpcomingBlocks, 60000)` without storing the interval ID. `disableNotifications()` (line 536-538) sets `notificationsEnabled = false` but never calls `clearInterval()`. Additionally, `startNotificationChecker()` can be called multiple times (lines 503, 516, 529), creating multiple concurrent intervals.
- **Impact:** Multiple intervals running simultaneously, each firing every 60 seconds indefinitely.
- **Fix:** Store the interval ID. Clear it in `disableNotifications()`. Guard against multiple calls.

### 7. [HIGH] Carry-over data — inconsistent dateStr parameter
- **File:** `script.js:1766` vs `1740` and `1567`
- **Verified:** PARTIAL — Three calls to `applyCarryOverData()`:
  - Line 1740: `applyCarryOverData(b, todayStr)` — correct, passes date
  - Line 1766: `applyCarryOverData(block)` — missing dateStr
  - Line 1567: `applyCarryOverData(b)` — missing dateStr
- The function (line 2086-2149) falls back to `dateStr || formatDate(currentDate)` at line 2137. Since `currentDate` is a global representing the currently viewed date, this actually works correctly in most cases. **However**, the inconsistency is fragile — a refactor could easily break it, and the reliance on a mutable global is a code smell.
- **Revised Assessment:** Code smell, not a bug today, but should be fixed for maintainability.
- **Fix:** Pass `todayStr` consistently to all `applyCarryOverData()` calls.

---

## Tier 2 — Accessibility Compliance

### 8. [HIGH] No focus trap in modal dialogs
- **File:** `index.html:227` (block editor), `index.html:340` (settings), `index.html:406` (search)
- **Verified:** YES — Modals use `role="dialog"` and `aria-modal="true"`, and focus is stored/restored on open/close (lines 2557-2559). But Tab key is not trapped — users can navigate to background elements while modal is active.
- **Impact:** WCAG 2.1 Level A violation. Keyboard-only and screen reader users experience broken interaction.
- **Fix:** Implement focus trapping: intercept Tab/Shift+Tab at modal boundaries, cycle focus within the dialog.

### 9. [HIGH] Color contrast failures
- **File:** `styles.css:9, 16, 44`
- **Verified:** YES — calculated contrast ratios:
  - `--text-muted: #999999` on `--bg-primary: #ffffff` = **3.0:1** (fails AA 4.5:1)
  - `--success-color: #5cb85c` with white text = **3.2:1** (fails AA 4.5:1) — affects Save Block button, Today button
  - Dark mode `--success-color: #4cae4c` on `--bg-secondary: #2d2d2d` = **3.0:1** (fails)
- **Impact:** WCAG AA violation. Low-vision users can't read muted text or success button labels.
- **Fix:** Change `--text-muted` to `#767676` (4.5:1). Change `--success-color` to `#3d8b3d` or similar. Adjust dark mode separately.

### 10. [MEDIUM] No prefers-reduced-motion support
- **File:** `styles.css` — no `prefers-reduced-motion` media query exists anywhere
- **Verified:** YES — The file has 20+ transitions/animations including `slideUp` keyframes, button hover transitions, background-color transitions, and the current-time highlight interval.
- **Impact:** Users with vestibular disorders may experience discomfort. WCAG 2.3.3 (AAA).
- **Fix:** Add:
  ```css
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
  ```

### 11. [MEDIUM] No skip-to-main-content link
- **File:** `index.html` — no skip link exists
- **Verified:** YES — keyboard users must Tab through logo, search, 6 nav buttons before reaching schedule content.
- **Fix:** Add after `<body>`:
  ```html
  <a href="#daily-view" class="skip-link">Skip to main content</a>
  ```
  With CSS to visually hide until focused.

### 12. [MEDIUM] Missing rel="noopener noreferrer" on external links
- **File:** `index.html:216-218`
- **Verified:** YES — three `<a>` tags in About > Sources section use `target="_blank"` without `rel="noopener noreferrer"`. The footer link (line 427) correctly has it.
- **Impact:** Reverse tabnapping — opened page can access `window.opener` and redirect parent. Low severity for these specific URLs but should be fixed as general practice.
- **Fix:** Add `rel="noopener noreferrer"` to all three links.

---

## Tier 3 — Code Quality & Polish

### 13. [MEDIUM] Replace all alert() calls with styled notifications
- **Locations verified:** Lines 102, 141, 160, 179, 509, 521, 566, 876, 1127, 1447, 1491, 2566, 2594, 2619, 2626, 2636, 2646, 2671, 2684, 3476 (20 total `alert()`/`confirm()` calls)
- **Verified:** YES — every error, warning, and success confirmation uses browser `alert()` or `confirm()`.
- **Impact:** Poor UX (blocks thread, unstyled, can't be customized). Not ideal for screen readers.
- **Fix:** Create a toast/snackbar notification system with ARIA live region support. Keep `confirm()` for destructive actions (delete block, import data) as those are acceptable.

### 14. [MEDIUM] Math.random UUID — not cryptographically secure
- **File:** `script.js:3279-3283`
- **Verified:** YES — uses `Math.random()` for UUID generation. `crypto.randomUUID()` is available in all modern browsers.
- **Impact:** Low in practice (UUIDs are local identifiers, not security tokens), but collision probability is higher and it's a one-line fix.
- **Fix:** Replace body with `return crypto.randomUUID();`

### 15. [LOW] highlightCurrentTime interval never cleared
- **File:** `script.js:3230`
- **Verified:** YES — `setInterval(highlightCurrentTime, 300000)` runs at module scope. Runs forever even if app tab is backgrounded. Minor resource waste.
- **Fix:** Use `document.visibilitychange` to pause when tab is hidden.

### 16. [LOW] Manifest icon purpose non-conformant
- **File:** `manifest.json:17, 23`
- **Verified:** YES — `"purpose": "any maskable"` as a combined string. W3C spec says these should be separate icon entries. Chrome accepts it but some browsers may not.
- **Fix:** Split into separate icon entries with individual purpose values.

### 17. [LOW] No first-time user onboarding
- **Verified:** YES — first-time user sees empty schedule with no guidance on how to create blocks (drag-to-select or Cmd+N). About section exists but is buried in navigation.
- **Fix:** Add a subtle help hint on first visit (localStorage flag). Could be as simple as placeholder text in the empty schedule area.

---

## Dismissed Findings

These issues were reported by automated analysis but are **NOT actual issues** after manual verification:

### D1. "XSS in search results display" — FALSE POSITIVE
- **Claimed:** `script.js:3532` uses unsafe DOM insertion for search results with unescaped titles.
- **Actual:** Line 3532 uses `title.textContent = result.block.title || "Untitled"` — this is safe. All search result rendering uses `createElement` + `textContent`. No user data is rendered via unsafe methods in search.

### D2. "Notes button event listener memory leak" — FALSE POSITIVE
- **Claimed:** Event listeners accumulate on "add notes" buttons during re-renders.
- **Actual:** The `addNotesBtn` listener (line 2805) is attached to a freshly created button each render. When `displayDailyBlocks()` re-renders, it sets `dailyBody` content to empty (line 1685) which destroys the old DOM nodes and their listeners. The `replaceWith()` call (line 2815) also properly removes the old element. There is no leak.

### D3. "Service worker falls back to index.html without checking offline status" — FALSE POSITIVE
- **Claimed:** `sw.js` serves index.html for failed API requests unintentionally.
- **Actual:** The fallback at `sw.js:93-94` only triggers for `event.request.mode === 'navigate'` AND only after both cache miss and network failure. Non-navigation requests get a proper 503 response (line 96). This is correct offline-first behavior.

### D4. "Global debounce shared across all buttons causes cross-interference" — NOT A BUG
- **Claimed:** Clicking Settings then Daily within 300ms blocks the second click.
- **Actual:** The 300ms debounce (line 1015-1024) is specifically designed to prevent double-execution on touch devices where both `touchend` and `click` fire. A user cannot physically intend two different button clicks within 300ms — this prevents ghost double-taps.

### D5. "delegationLastClick debounce blocks different interaction types" — NOT A BUG
- **Claimed:** Clicking block title and task checkbox within 300ms blocks second click.
- **Actual:** The debounce at line 1506/1518 only applies to the block title click handler branch. The task checkbox branch (line 1536) is a separate `if` block that doesn't use this debounce. Different interaction types are independently handled.

### D6. "Concurrent tab race condition in task state" — NEGLIGIBLE
- **Claimed:** Two tabs toggling the same task causes data loss via read-modify-write race.
- **Actual:** While technically true that `getDailyTaskState`/`setDailyTaskState` (lines 240-252) are not atomic, this is a personal productivity tool for a single user. The probability of one person toggling the same task in two tabs within milliseconds is effectively zero.

### D7. "!important in styles.css:624 is unnecessary" — JUSTIFIED USE
- **Claimed:** The `!important` on `.current-time td:first-child { background-color: ... !important; }` is unnecessary.
- **Actual:** This rule needs to override inline `background-color` styles set dynamically on block cells via JavaScript (block colors). Without `!important`, the current-time highlight would be hidden behind block colors. The second `!important` at line 1717 is in a `@media print` rule — standard practice for print overrides.

### D8. "Debounce function doesn't preserve this context" — NOT A BUG
- **Claimed:** Arrow function in debounce rebinds `this`.
- **Actual:** The debounce wrapper (line 87) uses `function executedFunction(...args)` which preserves `this`. The `later` arrow function inherits `this` from `executedFunction`. All callers pass standalone functions (not methods), so `this` binding is irrelevant.

---

## Summary

| Priority | Count | Categories |
|----------|-------|-----------|
| Tier 1 (Launch Blockers) | 7 | 3 security, 1 PWA, 1 memory leak, 1 code smell, 1 data validation |
| Tier 2 (Accessibility) | 5 | 2 WCAG A/AA violations, 1 WCAG AAA, 1 a11y best practice, 1 link security |
| Tier 3 (Quality & Polish) | 5 | 1 UX, 1 crypto, 1 performance, 1 PWA config, 1 onboarding |
| **Total Verified Issues** | **17** | |
| Dismissed (False Positives) | 8 | |
