/**
 * Data Import/Export Module
 * Functions for exporting and importing app data
 */

import { convert24To12 } from './time.js';

/**
 * Export data as JSON
 * @param {Object} data - All app data to export
 * @returns {Object} Formatted export data
 */
export function formatDataAsJSON(data) {
  return {
    version: "1.0",
    exportDate: new Date().toISOString(),
    timeBlocks: data.timeBlocks,
    archivedBlocks: data.archivedBlocks,
    colorPresets: data.colorPresets,
    categories: data.categories,
    blockTemplates: data.blockTemplates,
    hiddenTimes: data.hiddenTimes
  };
}

/**
 * Export data as plain text
 * @param {Object} data - All app data to export
 * @param {Function} getCategoryName - Function to get category name
 * @returns {string} Formatted text export
 */
export function formatDataAsTxt(data, getCategoryName) {
  let txt = "=== TIME-BLOCKING APP DATA EXPORT ===\n";
  txt += `Export Date: ${new Date().toLocaleString()}\n\n`;

  // Current blocks
  txt += "=== CURRENT BLOCKS ===\n";
  if (data.timeBlocks.blocks.length === 0) {
    txt += "No current blocks.\n";
  } else {
    data.timeBlocks.blocks.forEach((block, index) => {
      txt += `\n--- Block ${index + 1} ---\n`;
      txt += `Title: ${block.title}\n`;

      if (block.recurring) {
        txt += `Type: Recurring (${block.recurrenceDays?.join(", ") || "No days set"})\n`;
      } else if (block.startTime && block.endTime) {
        const date = block.startTime.split("T")[0];
        const startTime = convert24To12(block.startTime.split("T")[1].slice(0, 5));
        const endTime = convert24To12(block.endTime.split("T")[1].slice(0, 5));
        txt += `Date: ${date}\n`;
        txt += `Time: ${startTime} - ${endTime}\n`;
      }

      if (block.category) {
        txt += `Category: ${getCategoryName(block.category)}\n`;
      }
      if (block.notes) {
        txt += `Notes: ${block.notes}\n`;
      }
      if (block.tasks && block.tasks.length > 0) {
        txt += "Tasks:\n";
        block.tasks.forEach(task => {
          txt += `  ${task.completed ? "[x]" : "[ ]"} ${task.text}\n`;
        });
      }
    });
  }

  // Categories
  txt += "\n=== CATEGORIES ===\n";
  data.categories.forEach(cat => {
    txt += `- ${cat.name} (${cat.color})\n`;
  });

  // Templates
  txt += "\n=== TEMPLATES ===\n";
  if (data.blockTemplates.length === 0) {
    txt += "No templates saved.\n";
  } else {
    data.blockTemplates.forEach((tmpl, index) => {
      txt += `${index + 1}. ${tmpl.title}`;
      if (tmpl.category) txt += ` [${getCategoryName(tmpl.category)}]`;
      txt += "\n";
    });
  }

  // Summary
  txt += "\n=== SUMMARY ===\n";
  txt += `Total Blocks: ${data.timeBlocks.blocks.length}\n`;
  txt += `Categories: ${data.categories.length}\n`;
  txt += `Templates: ${data.blockTemplates.length}\n`;
  txt += `Hidden Times: ${data.hiddenTimes.length} time slots\n`;

  if (data.archivedBlocks && data.archivedBlocks.days) {
    const archivedDays = Object.keys(data.archivedBlocks.days).length;
    let archivedBlockCount = 0;
    Object.values(data.archivedBlocks.days).forEach(blocks => {
      archivedBlockCount += blocks.length;
    });
    txt += `Archived: ${archivedDays} days, ${archivedBlockCount} blocks\n`;
  }

  return txt;
}

/**
 * Parse text import format
 * @param {string} txtContent - Text content to parse
 * @returns {Object|null} Parsed data or null if invalid
 */
export function parseTxtImport(txtContent) {
  // Basic validation - check if it's our export format
  if (!txtContent.includes("=== TIME-BLOCKING APP DATA EXPORT ===")) {
    return null;
  }
  // For now, TXT import is not fully supported - return null to show error
  // Could be implemented later with more complex parsing
  return null;
}

/**
 * Validate and parse imported JSON data
 * @param {Object} data - Parsed JSON data
 * @returns {Object|null} Validated data or null if invalid
 */
export function validateImportData(data) {
  // Check for required fields
  if (!data.timeBlocks || !Array.isArray(data.timeBlocks.blocks)) {
    return null;
  }

  return {
    timeBlocks: data.timeBlocks,
    archivedBlocks: data.archivedBlocks || { days: {} },
    colorPresets: data.colorPresets || [],
    categories: data.categories || [],
    blockTemplates: data.blockTemplates || [],
    hiddenTimes: data.hiddenTimes || []
  };
}

/**
 * Download data as a file
 * @param {string} content - File content
 * @param {string} filename - Filename
 * @param {string} mimeType - MIME type
 */
export function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Get filename for export
 * @param {string} format - Export format (json or txt)
 * @returns {string} Filename with date
 */
export function getExportFilename(format) {
  const date = new Date().toISOString().split("T")[0];
  return `time-blocking-export-${date}.${format}`;
}
