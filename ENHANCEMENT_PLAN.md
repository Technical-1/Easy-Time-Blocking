# Easy Time-Blocking Enhancement Plan

This document tracks all identified issues and enhancements needed to finalize the project.

---

## Phase 1: Critical Mobile Touch Fixes

### 1.1 Rewrite Touch Event Handlers
- **File:** `script.js` (lines 779-840)
- **Problem:** Touch handlers call `e.preventDefault()` unconditionally, blocking scrolling
- **Problem:** `document.elementFromPoint()` returns child elements, not table cells
- **Problem:** No distinction between tap (to edit) and drag (to create)
- **Solution:**
  - Implement touch detection that differentiates tap vs drag
  - Only prevent default when actually dragging to create a block
  - Use `closest('td')` to ensure we get the table cell
  - Add `touch-action: manipulation` CSS to relevant elements
- **Status:** [ ] Not Started

### 1.2 Fix Touch/Click Double Execution
- **File:** `script.js` (various button handlers)
- **Problem:** Both `click` and `touchend` can fire on mobile, causing double actions
- **Solution:** Use a unified approach - either pointer events or debounce touch/click
- **Status:** [ ] Not Started

### 1.3 Add Missing Touch Handlers
- **File:** `script.js`
- **Problem:** `btnStatistics` (line 146) and `btnSearch` (line 210) lack `touchend` handlers
- **Solution:** Add consistent touch handlers or switch to pointer events
- **Status:** [ ] Not Started

### 1.4 Fix Block Title Touch Conflicts
- **File:** `script.js` (line 1122)
- **Problem:** `titleDiv` touchend conflicts with parent cell touch handlers
- **Solution:** Properly stop propagation and handle touch hierarchy
- **Status:** [ ] Not Started

### 1.5 Add Mobile-Friendly CSS
- **File:** `styles.css`
- **Problem:** No `touch-action` CSS properties defined
- **Solution:** Add `touch-action: manipulation` to buttons, `touch-action: pan-y` to scrollable areas
- **Status:** [ ] Not Started

---

## Phase 2: Data Integrity & Validation

### 2.1 Block Overlap Detection
- **File:** `script.js` (around line 1022)
- **Problem:** Users can create overlapping time blocks with no warning
- **Solution:**
  - Add `checkForOverlap(startTime, endTime, excludeBlockId)` function
  - Warn user when creating/editing blocks that overlap
  - Offer option to proceed anyway or cancel
- **Status:** [ ] Not Started

### 2.2 Fix UUID Format
- **File:** `script.js` (line 1547)
- **Problem:** UUID template has 7 x's instead of 8: `xxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`
- **Solution:** Fix to standard UUID v4 format: `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`
- **Status:** [ ] Not Started

### 2.3 Add localStorage Error Handling
- **File:** `script.js` (lines 1477-1497)
- **Problem:** No try/catch around localStorage operations
- **Solution:** Wrap all localStorage calls in try/catch, show user-friendly error if storage fails
- **Status:** [ ] Not Started

### 2.4 Fix Time String Comparison
- **File:** `script.js` (line 994)
- **Problem:** String comparison for times could have edge cases
- **Solution:** Parse times to minutes-since-midnight for reliable comparison
- **Status:** [ ] Not Started

---

## Phase 3: Implement Unfinished Features

### 3.1 Implement Carry Over Feature
- **File:** `script.js`
- **Problem:** "Carry Over Tasks & Notes" checkbox exists but does nothing
- **Current State:** `carryOver` property is saved but never used
- **Solution:**
  - When displaying a recurring block, check if `carryOver` is true
  - If true, look for the most recent archived instance of this recurring block
  - Copy tasks (preserving completion state) and notes from that instance
  - Store the "carried over" state so it persists correctly
- **Status:** [ ] Not Started

---

## Phase 4: UI/UX Improvements

### 4.1 Add Visual Touch Feedback
- **File:** `styles.css`
- **Problem:** No visual feedback when touching elements on mobile
- **Solution:** Add `:active` states and touch feedback styles
- **Status:** [ ] Not Started

### 4.2 Improve Button Consistency
- **File:** `script.js`
- **Problem:** View-switching logic is duplicated across 5+ button handlers
- **Solution:** Create `switchToView(viewName)` helper function
- **Status:** [ ] Not Started

### 4.3 Add Block Creation Feedback
- **Problem:** When dragging to create a block, feedback could be clearer
- **Solution:** Show time range preview while dragging
- **Status:** [ ] Not Started

---

## Phase 5: Accessibility & Polish

### 5.1 Add ARIA Labels
- **File:** `index.html`
- **Problem:** No ARIA labels for screen readers
- **Solution:** Add `aria-label`, `role`, and other accessibility attributes
- **Status:** [ ] Not Started

### 5.2 Improve Keyboard Navigation
- **File:** `script.js`
- **Problem:** Limited keyboard support beyond arrow keys and escape
- **Solution:**
  - Add tab navigation through blocks
  - Add keyboard shortcut to create new block
  - Add keyboard shortcut for search (Ctrl/Cmd+F)
- **Status:** [ ] Not Started

### 5.3 Add Focus Management
- **Problem:** Focus not managed properly when opening/closing modals
- **Solution:** Trap focus in modals, return focus when closing
- **Status:** [ ] Not Started

---

## Phase 6: Dark Mode & Theming

### 6.1 Implement Dark Mode
- **Files:** `styles.css`, `script.js`, `index.html`
- **Solution:**
  - Add CSS custom properties (variables) for colors
  - Add dark mode styles using `prefers-color-scheme` media query
  - Add manual toggle in settings
  - Persist preference in localStorage
- **Status:** [ ] Not Started

---

## Phase 7: PWA Support

### 7.1 Create Web App Manifest
- **File:** `manifest.json` (new)
- **Solution:** Create manifest with app name, icons, theme colors, display mode
- **Status:** [ ] Not Started

### 7.2 Create Service Worker
- **File:** `sw.js` (new)
- **Solution:** Cache static assets for offline use
- **Status:** [ ] Not Started

### 7.3 Add Install Prompt
- **File:** `script.js`
- **Solution:** Handle `beforeinstallprompt` event, show install button
- **Status:** [ ] Not Started

---

## Progress Tracker

| Phase | Description | Status |
|-------|-------------|--------|
| 1 | Critical Mobile Touch Fixes | [x] Completed |
| 2 | Data Integrity & Validation | [x] Completed |
| 3 | Implement Unfinished Features | [x] Completed |
| 4 | UI/UX Improvements | [x] Completed |
| 5 | Accessibility & Polish | [x] Completed |
| 6 | Dark Mode & Theming | [x] Completed |
| 7 | PWA Support | [x] Completed |

---

## Notes

- All changes should maintain backward compatibility with existing localStorage data
- Test on both iOS Safari and Android Chrome for mobile fixes
- Keep the no-build-step philosophy - no bundlers or transpilers
