/**
 * Archive Module
 * Functions for managing archived blocks
 */

import { formatDate, getWeekdayName } from './utils.js';

/**
 * Auto-archive blocks from previous days
 * @param {Object} timeBlocks - Time blocks data
 * @param {Object} archivedBlocks - Archived blocks data
 * @param {Function} saveBlocksFn - Function to save blocks
 * @param {Function} saveArchivedFn - Function to save archived blocks
 * @returns {Object} Updated data { timeBlocks, archivedBlocks }
 */
export function autoArchiveOldBlocks(timeBlocks, archivedBlocks, saveBlocksFn, saveArchivedFn) {
  const todayStr = formatDate(new Date());
  const toArchive = [];
  const toKeep = [];

  timeBlocks.blocks.forEach(block => {
    // Keep recurring blocks
    if (block.recurring) {
      toKeep.push(block);
      return;
    }

    // Check if block is from a previous day
    if (block.startTime) {
      const blockDate = block.startTime.split("T")[0];
      if (blockDate < todayStr) {
        toArchive.push({ dayStr: blockDate, block: block });
      } else {
        toKeep.push(block);
      }
    } else {
      toKeep.push(block);
    }
  });

  // Archive old blocks
  toArchive.forEach(({ dayStr, block }) => {
    if (!archivedBlocks.days[dayStr]) {
      archivedBlocks.days[dayStr] = [];
    }
    // Check if already archived (by ID)
    const exists = archivedBlocks.days[dayStr].some(b => b.id === block.id);
    if (!exists) {
      archivedBlocks.days[dayStr].push(block);
    }
  });

  // Update current blocks
  timeBlocks.blocks = toKeep;

  // Save both
  if (toArchive.length > 0) {
    saveBlocksFn(timeBlocks, true);
    saveArchivedFn(archivedBlocks);
  }

  return { timeBlocks, archivedBlocks };
}

/**
 * Add a block to the archive
 * @param {Object} archivedBlocks - Archived blocks data
 * @param {string} dayStr - Date string (YYYY-MM-DD)
 * @param {Object} blockData - Block to archive
 * @param {Function} saveArchivedFn - Function to save archived blocks
 * @returns {Object} Updated archived blocks
 */
export function addBlockToArchive(archivedBlocks, dayStr, blockData, saveArchivedFn) {
  if (!archivedBlocks.days[dayStr]) {
    archivedBlocks.days[dayStr] = [];
  }
  archivedBlocks.days[dayStr].push(blockData);
  saveArchivedFn(archivedBlocks);
  return archivedBlocks;
}

/**
 * Get sorted archive dates (most recent first)
 * @param {Object} archivedBlocks - Archived blocks data
 * @returns {Array} Sorted array of date strings
 */
export function getSortedArchiveDates(archivedBlocks) {
  if (!archivedBlocks || !archivedBlocks.days) return [];
  return Object.keys(archivedBlocks.days).sort((a, b) => b.localeCompare(a));
}

/**
 * Get blocks for a specific archived day
 * @param {Object} archivedBlocks - Archived blocks data
 * @param {string} dayKey - Date string (YYYY-MM-DD)
 * @returns {Array} Blocks for that day
 */
export function getArchivedBlocksForDay(archivedBlocks, dayKey) {
  if (!archivedBlocks || !archivedBlocks.days || !archivedBlocks.days[dayKey]) {
    return [];
  }
  return archivedBlocks.days[dayKey];
}

/**
 * Format archive date for display
 * @param {string} dayKey - Date string (YYYY-MM-DD)
 * @returns {string} Formatted date string
 */
export function formatArchiveDate(dayKey) {
  const [year, month, day] = dayKey.split("-");
  const date = new Date(year, month - 1, day);
  const weekday = getWeekdayName(date);
  return `${weekday}, ${month}/${day}/${year}`;
}

/**
 * Find most recent archived instance of a recurring block
 * @param {Object} block - Recurring block to find
 * @param {Object} archivedBlocks - Archived blocks data
 * @returns {Object|null} Most recent archived instance or null
 */
export function findMostRecentArchivedInstance(block, archivedBlocks) {
  if (!block.recurring || !archivedBlocks || !archivedBlocks.days) {
    return null;
  }

  const sortedDays = getSortedArchiveDates(archivedBlocks);

  for (const dayKey of sortedDays) {
    const dayBlocks = archivedBlocks.days[dayKey];
    // Find a block with the same title and similar time
    const match = dayBlocks.find(archived => {
      if (archived.title !== block.title) return false;
      // Additional matching criteria could be added here
      return true;
    });

    if (match) return match;
  }

  return null;
}

/**
 * Apply carry-over data from archived block to current block
 * @param {Object} block - Current recurring block
 * @param {Object} archivedBlock - Archived block with data to carry over
 * @returns {Object} Updated block
 */
export function applyCarryOverData(block, archivedBlock) {
  if (!archivedBlock) return block;

  // Carry over notes if not already set
  if (archivedBlock.notes && !block.notes) {
    block.notes = archivedBlock.notes;
  }

  // Carry over tasks (uncompleted)
  if (archivedBlock.tasks && archivedBlock.tasks.length > 0) {
    block.tasks = archivedBlock.tasks.map(task => ({
      text: task.text,
      completed: false // Reset completion status
    }));
  }

  return block;
}
