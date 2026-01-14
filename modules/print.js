/**
 * Print Module
 * Functions for generating print views
 */

import { convert24To12 } from './time.js';
import { formatDate, getWeekdayName } from './utils.js';

/**
 * Build print view HTML content
 * @param {Object} timeBlocks - Time blocks data
 * @param {Array} categories - Categories array
 * @param {Function} getCategoryName - Function to get category name
 * @returns {Object} { html, dateRange }
 */
export function buildPrintContent(timeBlocks, categories, getCategoryName) {
  // Group blocks by date
  const blocksByDate = {};

  timeBlocks.blocks.forEach(block => {
    if (block.recurring) {
      // Add recurring blocks to a special section
      if (!blocksByDate['recurring']) {
        blocksByDate['recurring'] = [];
      }
      blocksByDate['recurring'].push(block);
    } else if (block.startTime) {
      const dateStr = block.startTime.split('T')[0];
      if (!blocksByDate[dateStr]) {
        blocksByDate[dateStr] = [];
      }
      blocksByDate[dateStr].push(block);
    }
  });

  // Sort dates
  const sortedDates = Object.keys(blocksByDate)
    .filter(d => d !== 'recurring')
    .sort();

  // Calculate date range
  let dateRange = '';
  if (sortedDates.length > 0) {
    const firstDate = sortedDates[0];
    const lastDate = sortedDates[sortedDates.length - 1];
    if (firstDate === lastDate) {
      dateRange = formatDateForPrint(firstDate);
    } else {
      dateRange = `${formatDateForPrint(firstDate)} - ${formatDateForPrint(lastDate)}`;
    }
  }

  // Build HTML
  let html = '';

  // Regular blocks by date
  sortedDates.forEach(dateStr => {
    const blocks = blocksByDate[dateStr].sort((a, b) => {
      return a.startTime.localeCompare(b.startTime);
    });

    html += `<div class="print-day">`;
    html += `<h3>${formatDateForPrint(dateStr)}</h3>`;
    html += `<table class="print-table">`;
    html += `<thead><tr><th>Time</th><th>Block</th><th>Tasks</th></tr></thead>`;
    html += `<tbody>`;

    blocks.forEach(block => {
      const startTime = convert24To12(block.startTime.split('T')[1].slice(0, 5));
      const endTime = convert24To12(block.endTime.split('T')[1].slice(0, 5));
      const categoryName = block.category ? getCategoryName(block.category) : '';

      html += `<tr>`;
      html += `<td style="white-space: nowrap;">${startTime} - ${endTime}</td>`;
      html += `<td>`;
      html += `<strong>${escapeHtml(block.title)}</strong>`;
      if (categoryName) {
        html += ` <span style="color: #666; font-size: 0.9em;">[${escapeHtml(categoryName)}]</span>`;
      }
      if (block.notes) {
        html += `<br><span style="color: #666; font-size: 0.9em;">${escapeHtml(block.notes)}</span>`;
      }
      html += `</td>`;
      html += `<td>`;
      if (block.tasks && block.tasks.length > 0) {
        html += `<ul style="margin: 0; padding-left: 20px;">`;
        block.tasks.forEach(task => {
          html += `<li style="${task.completed ? 'text-decoration: line-through; color: #888;' : ''}">`;
          html += escapeHtml(task.text);
          html += `</li>`;
        });
        html += `</ul>`;
      }
      html += `</td>`;
      html += `</tr>`;
    });

    html += `</tbody></table></div>`;
  });

  // Recurring blocks section
  if (blocksByDate['recurring'] && blocksByDate['recurring'].length > 0) {
    html += `<div class="print-day">`;
    html += `<h3>Recurring Blocks</h3>`;
    html += `<table class="print-table">`;
    html += `<thead><tr><th>Days</th><th>Block</th><th>Tasks</th></tr></thead>`;
    html += `<tbody>`;

    blocksByDate['recurring'].forEach(block => {
      const days = block.recurrenceDays?.join(', ') || 'Every day';
      const categoryName = block.category ? getCategoryName(block.category) : '';

      html += `<tr>`;
      html += `<td>${days}</td>`;
      html += `<td>`;
      html += `<strong>${escapeHtml(block.title)}</strong>`;
      if (categoryName) {
        html += ` <span style="color: #666; font-size: 0.9em;">[${escapeHtml(categoryName)}]</span>`;
      }
      if (block.notes) {
        html += `<br><span style="color: #666; font-size: 0.9em;">${escapeHtml(block.notes)}</span>`;
      }
      html += `</td>`;
      html += `<td>`;
      if (block.tasks && block.tasks.length > 0) {
        html += `<ul style="margin: 0; padding-left: 20px;">`;
        block.tasks.forEach(task => {
          html += `<li>${escapeHtml(task.text)}</li>`;
        });
        html += `</ul>`;
      }
      html += `</td>`;
      html += `</tr>`;
    });

    html += `</tbody></table></div>`;
  }

  if (html === '') {
    html = '<p style="text-align: center; color: #666;">No blocks to print.</p>';
  }

  return { html, dateRange };
}

/**
 * Format date for print display
 * @param {string} dateStr - Date string (YYYY-MM-DD)
 * @returns {string} Formatted date
 */
function formatDateForPrint(dateStr) {
  const [year, month, day] = dateStr.split('-');
  const date = new Date(year, month - 1, day);
  const weekday = getWeekdayName(date);
  return `${weekday}, ${month}/${day}/${year}`;
}

/**
 * Get current timestamp for print footer
 * @returns {string} Formatted timestamp
 */
export function getPrintTimestamp() {
  return new Date().toLocaleString();
}

/**
 * Escape HTML special characters
 */
function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
