/**
 * Statistics Module
 * Functions for computing and displaying statistics
 */

import { timeToMinutes } from './utils.js';

/**
 * Build statistics data from blocks
 * @param {Object} timeBlocks - Time blocks data
 * @param {Object} archivedBlocks - Archived blocks data
 * @param {Array} categories - Categories array
 * @returns {Object} Statistics data
 */
export function computeStatistics(timeBlocks, archivedBlocks, categories) {
  const stats = {
    totalBlocks: 0,
    totalMinutes: 0,
    totalTasks: 0,
    completedTasks: 0,
    recurringBlocks: 0,
    categoryBreakdown: {},
    archivedDays: 0,
    archivedBlocks: 0
  };

  // Initialize category breakdown
  categories.forEach(cat => {
    stats.categoryBreakdown[cat.id] = {
      name: cat.name,
      color: cat.color,
      count: 0,
      minutes: 0
    };
  });
  stats.categoryBreakdown['uncategorized'] = {
    name: 'Uncategorized',
    color: '#888888',
    count: 0,
    minutes: 0
  };

  // Process current blocks
  timeBlocks.blocks.forEach(block => {
    stats.totalBlocks++;

    if (block.recurring) {
      stats.recurringBlocks++;
    }

    // Calculate duration
    if (block.startTime && block.endTime) {
      const startMin = timeToMinutes(block.startTime.split('T')[1].slice(0, 5));
      const endMin = timeToMinutes(block.endTime.split('T')[1].slice(0, 5));
      const duration = endMin - startMin;
      if (duration > 0) {
        stats.totalMinutes += duration;

        // Add to category breakdown
        const catId = block.category || 'uncategorized';
        if (stats.categoryBreakdown[catId]) {
          stats.categoryBreakdown[catId].count++;
          stats.categoryBreakdown[catId].minutes += duration;
        } else {
          stats.categoryBreakdown['uncategorized'].count++;
          stats.categoryBreakdown['uncategorized'].minutes += duration;
        }
      }
    }

    // Count tasks
    if (block.tasks) {
      stats.totalTasks += block.tasks.length;
      stats.completedTasks += block.tasks.filter(t => t.completed).length;
    }
  });

  // Process archived blocks
  if (archivedBlocks && archivedBlocks.days) {
    stats.archivedDays = Object.keys(archivedBlocks.days).length;
    Object.values(archivedBlocks.days).forEach(blocks => {
      stats.archivedBlocks += blocks.length;
    });
  }

  return stats;
}

/**
 * Generate statistics HTML
 * @param {Object} stats - Statistics data
 * @returns {string} HTML string
 */
export function generateStatisticsHTML(stats) {
  const hours = Math.floor(stats.totalMinutes / 60);
  const minutes = stats.totalMinutes % 60;
  const taskCompletionRate = stats.totalTasks > 0
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
    : 0;

  let html = `
    <div class="stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 20px;">
      <div class="stat-card" style="padding: 15px; background: var(--bg-secondary); border-radius: 8px; text-align: center;">
        <div style="font-size: 2rem; font-weight: bold; color: var(--accent-color);">${stats.totalBlocks}</div>
        <div style="color: var(--text-secondary);">Total Blocks</div>
      </div>
      <div class="stat-card" style="padding: 15px; background: var(--bg-secondary); border-radius: 8px; text-align: center;">
        <div style="font-size: 2rem; font-weight: bold; color: var(--accent-color);">${hours}h ${minutes}m</div>
        <div style="color: var(--text-secondary);">Total Time</div>
      </div>
      <div class="stat-card" style="padding: 15px; background: var(--bg-secondary); border-radius: 8px; text-align: center;">
        <div style="font-size: 2rem; font-weight: bold; color: var(--accent-color);">${stats.recurringBlocks}</div>
        <div style="color: var(--text-secondary);">Recurring</div>
      </div>
      <div class="stat-card" style="padding: 15px; background: var(--bg-secondary); border-radius: 8px; text-align: center;">
        <div style="font-size: 2rem; font-weight: bold; color: ${taskCompletionRate >= 70 ? 'var(--success-color)' : 'var(--accent-color)'};">${taskCompletionRate}%</div>
        <div style="color: var(--text-secondary);">Tasks Done</div>
      </div>
    </div>

    <h3 style="margin-bottom: 10px; color: var(--text-primary);">Time by Category</h3>
    <div class="category-stats" style="margin-bottom: 20px;">
  `;

  // Category breakdown
  const sortedCategories = Object.values(stats.categoryBreakdown)
    .filter(cat => cat.count > 0)
    .sort((a, b) => b.minutes - a.minutes);

  if (sortedCategories.length === 0) {
    html += `<p style="color: var(--text-muted);">No categorized blocks yet.</p>`;
  } else {
    const maxMinutes = Math.max(...sortedCategories.map(c => c.minutes));

    sortedCategories.forEach(cat => {
      const catHours = Math.floor(cat.minutes / 60);
      const catMins = cat.minutes % 60;
      const percentage = maxMinutes > 0 ? (cat.minutes / maxMinutes) * 100 : 0;

      html += `
        <div style="margin-bottom: 12px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span style="color: var(--text-primary);">
              <span style="display: inline-block; width: 12px; height: 12px; background: ${cat.color}; border-radius: 2px; margin-right: 8px;"></span>
              ${escapeHtml(cat.name)} (${cat.count})
            </span>
            <span style="color: var(--text-secondary);">${catHours}h ${catMins}m</span>
          </div>
          <div style="height: 8px; background: var(--bg-tertiary); border-radius: 4px; overflow: hidden;">
            <div style="height: 100%; width: ${percentage}%; background: ${cat.color}; border-radius: 4px;"></div>
          </div>
        </div>
      `;
    });
  }

  html += `</div>`;

  // Archive stats
  html += `
    <h3 style="margin-bottom: 10px; color: var(--text-primary);">Archive</h3>
    <div style="display: flex; gap: 20px;">
      <div style="color: var(--text-secondary);">
        <strong style="color: var(--text-primary);">${stats.archivedDays}</strong> days archived
      </div>
      <div style="color: var(--text-secondary);">
        <strong style="color: var(--text-primary);">${stats.archivedBlocks}</strong> blocks archived
      </div>
    </div>
  `;

  return html;
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
