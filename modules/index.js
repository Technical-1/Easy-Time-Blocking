/**
 * Main Module Index - Re-exports all modules for easier imports
 */

// Storage functions
export {
  saveBlocksToStorage,
  loadBlocksFromStorage,
  saveArchivedToStorage,
  loadArchivedFromStorage,
  loadColorPresetsFromStorage,
  saveColorPresetsToStorage,
  loadHiddenTimesFromStorage,
  saveHiddenTimesToStorage,
  loadCategoriesFromStorage,
  saveCategoriesToStorage,
  loadTemplatesFromStorage,
  saveTemplatesToStorage,
  loadThemePreference,
  saveThemePreference,
  loadNotificationPreference,
  saveNotificationPreference
} from './storage.js';

// Utility functions
export {
  generateUUID,
  formatDate,
  getWeekdayName,
  timeToMinutes,
  convertTo12Hour,
  randomColor,
  generateTimeSlots12,
  validateBlockDuration,
  timesOverlap,
  MIN_BLOCK_DURATION,
  MAX_BLOCK_DURATION
} from './utils.js';

// Theme functions
export {
  initializeTheme,
  applyTheme,
  getCurrentTheme
} from './theme.js';

// Notification functions
export {
  initializeNotifications,
  requestNotificationPermission,
  disableNotifications,
  isNotificationsEnabled,
  setTimeBlocksRef
} from './notifications.js';

// Time functions
export {
  parseBlockTimes,
  convert24To12,
  convert12To24,
  findTimeRange12,
  generateTimeSlots12 as generateTimeSlots,
  computeTimeRangeFromSelection,
  findTableRowIndex,
  computeRowSpan
} from './time.js';

// Search functions
export {
  performSearch,
  generateSearchResultsHTML
} from './search.js';

// Statistics functions
export {
  computeStatistics,
  generateStatisticsHTML
} from './statistics.js';

// Data import/export functions
export {
  formatDataAsJSON,
  formatDataAsTxt,
  parseTxtImport,
  validateImportData,
  downloadFile,
  getExportFilename
} from './data.js';

// Archive functions
export {
  autoArchiveOldBlocks,
  addBlockToArchive,
  getSortedArchiveDates,
  getArchivedBlocksForDay,
  formatArchiveDate,
  findMostRecentArchivedInstance,
  applyCarryOverData
} from './archive.js';

// Print functions
export {
  buildPrintContent,
  getPrintTimestamp
} from './print.js';
