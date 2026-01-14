/**
 * Search Module
 * Functions for searching blocks
 */

import { convert24To12 } from './time.js';

/**
 * Perform search across all blocks
 * @param {string} query - Search query
 * @param {Object} timeBlocks - Time blocks data
 * @param {Object} archivedBlocks - Archived blocks data
 * @returns {Array} Array of matching blocks with source info
 */
export function performSearch(query, timeBlocks, archivedBlocks) {
  const results = [];
  const lowerQuery = query.toLowerCase();

  // Search current blocks
  timeBlocks.blocks.forEach(block => {
    if (blockMatchesQuery(block, lowerQuery)) {
      results.push({
        ...block,
        source: 'current',
        dateStr: block.startTime?.split('T')[0] || 'Recurring'
      });
    }
  });

  // Search archived blocks
  if (archivedBlocks && archivedBlocks.days) {
    Object.entries(archivedBlocks.days).forEach(([dateStr, blocks]) => {
      blocks.forEach(block => {
        if (blockMatchesQuery(block, lowerQuery)) {
          results.push({
            ...block,
            source: 'archive',
            dateStr: dateStr
          });
        }
      });
    });
  }

  // Sort by date (most recent first)
  results.sort((a, b) => {
    if (a.dateStr === 'Recurring') return 1;
    if (b.dateStr === 'Recurring') return -1;
    return b.dateStr.localeCompare(a.dateStr);
  });

  return results;
}

/**
 * Check if a block matches a search query
 * @param {Object} block - Block to check
 * @param {string} lowerQuery - Lowercase search query
 * @returns {boolean} True if block matches
 */
function blockMatchesQuery(block, lowerQuery) {
  // Check title
  if (block.title?.toLowerCase().includes(lowerQuery)) return true;

  // Check notes
  if (block.notes?.toLowerCase().includes(lowerQuery)) return true;

  // Check tasks
  if (block.tasks) {
    for (const task of block.tasks) {
      if (task.text?.toLowerCase().includes(lowerQuery)) return true;
    }
  }

  return false;
}

/**
 * Generate HTML for search results
 * @param {Array} results - Search results
 * @param {string} query - Original query
 * @param {Function} getCategoryName - Function to get category name
 * @returns {string} HTML string
 */
export function generateSearchResultsHTML(results, query, getCategoryName) {
  if (results.length === 0) {
    return `<p class="no-results">No results found for "${escapeHtml(query)}"</p>`;
  }

  let html = `<p class="results-count">Found ${results.length} result${results.length !== 1 ? 's' : ''}</p>`;

  results.forEach(result => {
    const timeStr = result.startTime && result.endTime
      ? `${convert24To12(result.startTime.split('T')[1].slice(0, 5))} - ${convert24To12(result.endTime.split('T')[1].slice(0, 5))}`
      : 'Recurring';

    const sourceLabel = result.source === 'archive' ? '📁 Archived' : '📅 Current';
    const categoryName = result.category ? getCategoryName(result.category) : '';

    html += `
      <div class="search-result-item" style="
        padding: 12px;
        margin-bottom: 10px;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        border-left: 4px solid ${result.color || '#4F6D7A'};
        background: var(--bg-secondary);
      ">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
          <strong style="color: var(--text-primary);">${escapeHtml(result.title)}</strong>
          <span style="font-size: 0.8rem; color: var(--text-muted);">${sourceLabel}</span>
        </div>
        <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 4px;">
          📆 ${result.dateStr} &nbsp;|&nbsp; ⏰ ${timeStr}
          ${categoryName ? `&nbsp;|&nbsp; 🏷️ ${escapeHtml(categoryName)}` : ''}
        </div>
        ${result.notes ? `<div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 6px;">📝 ${escapeHtml(result.notes)}</div>` : ''}
        ${result.tasks && result.tasks.length > 0 ? `
          <div style="font-size: 0.85rem; margin-top: 6px;">
            <span style="color: var(--text-muted);">Tasks:</span>
            ${result.tasks.map(t => `<span style="margin-left: 8px; color: ${t.completed ? 'var(--success-color)' : 'var(--text-secondary)'};">${t.completed ? '✓' : '○'} ${escapeHtml(t.text)}</span>`).join('')}
          </div>
        ` : ''}
      </div>
    `;
  });

  return html;
}

/**
 * Escape HTML special characters
 * @param {string} str - String to escape
 * @returns {string} Escaped string
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
