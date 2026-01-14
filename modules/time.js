/**
 * Time Utilities Module
 * Functions for time parsing, conversion, and manipulation
 */

/**
 * Parse block start/end times from a block object
 * @param {Object} block - Block object with startTime and endTime
 * @returns {Array} [startHHMM, endHHMM]
 */
export function parseBlockTimes(block) {
  const startHM = block.startTime.split("T")[1].slice(0, 5);
  const endHM = block.endTime.split("T")[1].slice(0, 5);
  return [startHM, endHM];
}

/**
 * Convert 24-hour time to 12-hour format
 * @param {string} hhmm - Time in HH:MM format
 * @returns {string} Time in 12-hour format (e.g., "9:00 AM")
 */
export function convert24To12(hhmm) {
  const [hStr, mStr] = hhmm.split(":");
  let h = parseInt(hStr, 10);
  const suffix = h >= 12 ? "PM" : "AM";
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return h + ":" + mStr + " " + suffix;
}

/**
 * Convert 12-hour time label to 24-hour format
 * @param {string} label - Time in 12-hour format (e.g., "9:00 AM")
 * @returns {string} Time in HH:MM format
 */
export function convert12To24(label) {
  const match = label.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;
  let h = parseInt(match[1], 10);
  const m = match[2];
  const ampm = match[3].toUpperCase();
  if (ampm === "PM" && h < 12) h += 12;
  if (ampm === "AM" && h === 12) h = 0;
  return String(h).padStart(2, '0') + ":" + m;
}

/**
 * Find the range of 12-hour time labels between start and end
 * @param {string} startLabel - Start time in 12-hour format
 * @param {string} endLabel - End time in 12-hour format
 * @returns {Array} Array of time labels in the range
 */
export function findTimeRange12(startLabel, endLabel) {
  const slots = generateTimeSlots12();
  const si = slots.indexOf(startLabel);
  const ei = slots.indexOf(endLabel);
  if (si < 0 || ei < 0 || si >= ei) return [];
  return slots.slice(si, ei);
}

/**
 * Generate array of 12-hour time slots (30-minute increments)
 * @returns {Array} Array of time labels from 12:00 AM to 11:30 PM
 */
export function generateTimeSlots12() {
  const arr = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      let h12 = h % 12 || 12;
      const suffix = h < 12 ? "AM" : "PM";
      const label = h12 + ":" + String(m).padStart(2, '0') + " " + suffix;
      arr.push(label);
    }
  }
  return arr;
}

/**
 * Compute time range from cell selection
 * @param {HTMLElement} startCell - Starting cell element
 * @param {HTMLElement} endCell - Ending cell element
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 * @returns {Object|null} { startTime, endTime } or null if invalid
 */
export function computeTimeRangeFromSelection(startCell, endCell, dateStr) {
  if (!startCell || !endCell) return null;

  const row1 = startCell.parentElement;
  const row2 = endCell.parentElement;
  const tbody = row1.parentElement;

  let minIndex = Math.min(row1.sectionRowIndex, row2.sectionRowIndex);
  let maxIndex = Math.max(row1.sectionRowIndex, row2.sectionRowIndex);

  const minRow = tbody.rows[minIndex];
  const maxRow = tbody.rows[maxIndex];

  if (!minRow || !maxRow) return null;

  const startLabel = minRow.cells[0]?.textContent.trim();
  const endLabel = maxRow.cells[0]?.textContent.trim();

  if (!startLabel || !endLabel) return null;

  const start24 = convert12To24(startLabel);
  let end24 = convert12To24(endLabel);

  if (!start24 || !end24) return null;

  // Add 30 minutes to end time (since we're selecting the start of each slot)
  const [endH, endM] = end24.split(":").map(Number);
  let newEndM = endM + 30;
  let newEndH = endH;
  if (newEndM >= 60) {
    newEndM -= 60;
    newEndH += 1;
  }
  if (newEndH >= 24) newEndH = 23; // Cap at 23:59
  end24 = String(newEndH).padStart(2, '0') + ":" + String(newEndM).padStart(2, '0');

  return {
    startTime: `${dateStr}T${start24}:00`,
    endTime: `${dateStr}T${end24}:00`
  };
}

/**
 * Find table row index for a time label
 * @param {HTMLElement} tbody - Table body element
 * @param {string} label - Time label to find
 * @returns {number} Row index or -1 if not found
 */
export function findTableRowIndex(tbody, label) {
  for (let i = 0; i < tbody.rows.length; i++) {
    if (tbody.rows[i].cells[0]?.textContent.trim() === label) return i;
  }
  return -1;
}

/**
 * Compute row span for a time range
 * @param {HTMLElement} tbody - Table body element
 * @param {Array} range - Array of time labels
 * @returns {number} Number of rows to span
 */
export function computeRowSpan(tbody, range) {
  if (!range || range.length === 0) return 1;
  let count = 0;
  for (const lbl of range) {
    const idx = findTableRowIndex(tbody, lbl);
    if (idx >= 0) count++;
  }
  return count || 1;
}
