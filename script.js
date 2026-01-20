/***************************************************
* ES Module Imports
**************************************************/
import {
  // Storage
  saveBlocksToStorage as saveBlocksToStorageModule,
  loadBlocksFromStorage as loadBlocksFromStorageModule,
  saveArchivedToStorage as saveArchivedToStorageModule,
  loadArchivedFromStorage as loadArchivedFromStorageModule,
  loadColorPresetsFromStorage as loadColorPresetsFromStorageModule,
  saveColorPresetsToStorage as saveColorPresetsToStorageModule,
  loadHiddenTimesFromStorage as loadHiddenTimesFromStorageModule,
  saveHiddenTimesToStorage as saveHiddenTimesToStorageModule,
  loadCategoriesFromStorage as loadCategoriesFromStorageModule,
  saveCategoriesToStorage as saveCategoriesToStorageModule,
  loadTemplatesFromStorage as loadTemplatesFromStorageModule,
  saveTemplatesToStorage as saveTemplatesToStorageModule,

  // Utils
  generateUUID as generateUUIDModule,
  formatDate as formatDateModule,
  getWeekdayName as getWeekdayNameModule,
  timeToMinutes as timeToMinutesModule,
  convertTo12Hour as convertTo12HourModule,
  randomColor as randomColorModule,
  generateTimeSlots12 as generateTimeSlots12Module,
  validateBlockDuration as validateBlockDurationModule,
  timesOverlap as timesOverlapModule,
  MIN_BLOCK_DURATION,
  MAX_BLOCK_DURATION,

  // Theme
  initializeTheme as initializeThemeModule,

  // Notifications
  initializeNotifications as initializeNotificationsModule,
  requestNotificationPermission as requestNotificationPermissionModule,
  disableNotifications as disableNotificationsModule,
  isNotificationsEnabled as isNotificationsEnabledModule,
  setTimeBlocksRef,

  // Time utilities
  parseBlockTimes as parseBlockTimesModule,
  convert24To12 as convert24To12Module,
  convert12To24 as convert12To24Module,
  findTimeRange12 as findTimeRange12Module,
  computeTimeRangeFromSelection as computeTimeRangeFromSelectionModule,
  findTableRowIndex as findTableRowIndexModule,
  computeRowSpan as computeRowSpanModule,

  // Search
  performSearch as performSearchModule,
  generateSearchResultsHTML as generateSearchResultsHTMLModule,

  // Statistics
  computeStatistics as computeStatisticsModule,
  generateStatisticsHTML as generateStatisticsHTMLModule,

  // Data import/export
  formatDataAsJSON as formatDataAsJSONModule,
  formatDataAsTxt as formatDataAsTxtModule,
  validateImportData as validateImportDataModule,
  downloadFile as downloadFileModule,
  getExportFilename as getExportFilenameModule,

  // Archive
  autoArchiveOldBlocks as autoArchiveOldBlocksModule,
  getSortedArchiveDates as getSortedArchiveDatesModule,
  getArchivedBlocksForDay as getArchivedBlocksForDayModule,
  formatArchiveDate as formatArchiveDateModule,
  findMostRecentArchivedInstance as findMostRecentArchivedInstanceModule,
  applyCarryOverData as applyCarryOverDataModule,

  // Print
  buildPrintContent as buildPrintContentModule,
  getPrintTimestamp as getPrintTimestampModule
} from './modules/index.js';

// Note: Modules are imported but existing inline functions are preserved
// for backward compatibility. Gradual migration can happen over time.

/***************************************************
* Storage Functions (must be defined before use)
**************************************************/
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function _saveBlocksToStorageImmediate(obj){
  try {
    localStorage.setItem("timeBlocks", JSON.stringify(obj));
  } catch (e) {
    console.error("Error saving blocks to storage:", e);
    alert("Unable to save data. Your browser storage may be full or disabled.");
  }
}

const _debouncedSaveBlocks = debounce(_saveBlocksToStorageImmediate, 300);

function saveBlocksToStorage(obj, immediate = false){
  if (immediate) {
    _saveBlocksToStorageImmediate(obj);
  } else {
    _debouncedSaveBlocks(obj);
  }
}

function loadBlocksFromStorage(){
  try {
    const data = localStorage.getItem("timeBlocks");
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error("Error loading blocks from storage:", e);
    return null;
  }
}

function loadArchivedFromStorage(){
  try {
    const data = localStorage.getItem("archivedBlocks");
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error("Error loading archived blocks:", e);
    return null;
  }
}

function saveArchivedToStorage(obj){
  try {
    localStorage.setItem("archivedBlocks", JSON.stringify(obj));
  } catch (e) {
    console.error("Error saving archived blocks:", e);
    alert("Unable to save archived data.");
  }
}

function loadColorPresetsFromStorage(){
  try {
    const data = localStorage.getItem("colorPresets");
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error("Error loading color presets:", e);
    return null;
  }
}

function saveColorPresetsToStorage(arr){
  try {
    localStorage.setItem("colorPresets", JSON.stringify(arr));
  } catch (e) {
    console.error("Error saving color presets:", e);
    alert("Unable to save color preferences.");
  }
}

function loadHiddenTimesFromStorage(){
  try {
    const data = localStorage.getItem("hiddenTimes");
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Error loading hidden times:", e);
    return [];
  }
}

function saveHiddenTimesToStorage(arr){
  try {
    localStorage.setItem("hiddenTimes", JSON.stringify(arr));
  } catch (e) {
    console.error("Error saving hidden times:", e);
    alert("Unable to save time slot preferences.");
  }
}

function loadCategoriesFromStorage(){
  try {
    const data = localStorage.getItem("categories");
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error("Error loading categories:", e);
    return null;
  }
}

function saveCategoriesToStorage(arr){
  try {
    localStorage.setItem("categories", JSON.stringify(arr));
  } catch (e) {
    console.error("Error saving categories:", e);
  }
}

function loadTemplatesFromStorage(){
  try {
    const data = localStorage.getItem("blockTemplates");
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error("Error loading templates:", e);
    return null;
  }
}

function saveTemplatesToStorage(arr){
  try {
    localStorage.setItem("blockTemplates", JSON.stringify(arr));
  } catch (e) {
    console.error("Error saving templates:", e);
  }
}

/***************************************************
* PWA - Service Worker Registration & Install Prompt
**************************************************/
// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('ServiceWorker registered:', registration.scope);
      })
      .catch((error) => {
        console.log('ServiceWorker registration failed:', error);
      });
  });
}

// Handle PWA install prompt
let deferredPrompt = null;

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent the default browser install prompt
  e.preventDefault();
  // Store the event for later use
  deferredPrompt = e;
  // Optionally show a custom install button (could be added to settings)
  console.log('PWA install prompt available');
});

window.addEventListener('appinstalled', () => {
  console.log('PWA was installed');
  deferredPrompt = null;
});

/***************************************************
* Main Application
**************************************************/
function updateDailySubheader(){
  const dayName = getWeekdayName(currentDate);
  const dateStr = formatDate(currentDate);
  // Format date as MM/DD/YYYY
  const dateParts = dateStr.split("-");
  const formattedDate = `${dateParts[1]}/${dateParts[2]}/${dateParts[0]}`;

  dailySubheader.textContent = `Daily Schedule for ${dayName}, ${formattedDate}`;
}

let timeBlocks = loadBlocksFromStorage() || { blocks: [] };
let archivedBlocks = loadArchivedFromStorage() || { days: {} };
let colorPresets = loadColorPresetsFromStorage() || [
"#FF5733","#FFC300","#DAF7A6","#9AECDB","#A569BD",
"#F1948A","#85C1E9","#F8C471","#82E0AA","#F9E79F"
];
let hiddenTimes = loadHiddenTimesFromStorage() || [];

// Categories for organizing blocks
let categories = loadCategoriesFromStorage() || [
  { id: "work", name: "Work", color: "#4F6D7A" },
  { id: "personal", name: "Personal", color: "#5cb85c" },
  { id: "health", name: "Health", color: "#f0ad4e" },
  { id: "learning", name: "Learning", color: "#5bc0de" }
];

// Block templates for quick creation
let blockTemplates = loadTemplatesFromStorage() || [];

let draggedBlock = null;
let draggedBlockCell = null;

// Touch handling state
let touchStartX = 0;
let touchStartY = 0;
let touchStartTime = 0;
let touchStartCell = null;
let isTouchDragging = false;
const TOUCH_TAP_THRESHOLD = 10; // pixels - movement less than this is a tap
const TOUCH_TAP_TIME_LIMIT = 300; // ms - taps must be shorter than this

let currentDate = new Date();
let editBlockId = null;

// UI references
const dailyView = document.getElementById("daily-view");
const dailySubheader = document.getElementById("daily-subheader");
const statisticsView = document.getElementById("statistics-view");
const archiveView = document.getElementById("archive-view");
const aboutView = document.getElementById("about-view");
const overlay = document.getElementById("overlay");
const settingsOverlay = document.getElementById("settings-overlay");
const searchOverlay = document.getElementById("search-overlay");

const taskListContainer = document.getElementById("task-list-container");
const addTaskBtn = document.getElementById("add-task-btn");
const popupTitle = document.getElementById("popup-title");
const blockTitleInput = document.getElementById("block-title");
const blockNotesInput = document.getElementById("block-notes");
const blockDateInput = document.getElementById("block-date");
const blockStartTimeInput = document.getElementById("block-start-time");
const blockEndTimeInput = document.getElementById("block-end-time");
const timeDateSection = document.getElementById("time-date-section");
let colorVal = colorPresets[0];
const recurringCheckbox = document.getElementById("recurring-checkbox");
const recurrenceDaysDiv = document.getElementById("recurrence-days");
const saveBtn = document.getElementById("save-btn");
const deleteBtn = document.getElementById("delete-btn");
const cancelBtn = document.getElementById("cancel-btn");
const duplicateBtn = document.getElementById("duplicate-btn");
const saveTemplateBtn = document.getElementById("save-template-btn");
const templateSelect = document.getElementById("template-select");
const templateSection = document.getElementById("template-section");
const blockCategorySelect = document.getElementById("block-category");
const categoryColorSwatch = document.getElementById("category-color-swatch");
const customColorSection = document.getElementById("custom-color-section");
const blockColorInput = document.getElementById("block-color");
const blockColorHex = document.getElementById("block-color-hex");
const selectedTimeDisplay = document.getElementById("selected-time-display");
const selectedTimeText = document.getElementById("selected-time-text");
const categoriesContainer = document.getElementById("categories-container");
const newCategoryName = document.getElementById("new-category-name");
const newCategoryColor = document.getElementById("new-category-color");
const addCategoryBtn = document.getElementById("add-category-btn");

const btnDaily = document.getElementById("btn-daily");
const btnStatistics = document.getElementById("btn-statistics");
const btnArchive = document.getElementById("btn-archive");
const btnAbout = document.getElementById("btn-about");
const btnSettings = document.getElementById("btn-settings");
const btnSearch = document.getElementById("btn-search");
const closeSettingsBtn = document.getElementById("close-popup-settings-btn");
const closePopupBtn = document.getElementById("close-popup-btn");
const closeSearchBtn = document.getElementById("close-search-btn");
const closeSearchOverlayBtn = document.getElementById("close-search-overlay-btn");
const searchInput = document.getElementById("search-input");
const searchContainer = document.getElementById("search-container");
const searchResults = document.getElementById("search-results");
const exportJsonBtn = document.getElementById("export-json-btn");
const exportTxtBtn = document.getElementById("export-txt-btn");
const importBtn = document.getElementById("import-btn");
const importFileInput = document.getElementById("import-file-input");
const printViewBtn = document.getElementById("print-view-btn");
const statisticsContent = document.getElementById("statistics-content");
const printView = document.getElementById("print-view");
const printContent = document.getElementById("print-content");
const printDateRange = document.getElementById("print-date-range");
const printTimestamp = document.getElementById("print-timestamp");

// Date navigation buttons
const prevDayBtn = document.getElementById("prev-day-btn");
const todayBtn = document.getElementById("today-btn");
const nextDayBtn = document.getElementById("next-day-btn");

// Bulk operation buttons
const copyDayBtn = document.getElementById("copy-day-btn");
const clearDayBtn = document.getElementById("clear-day-btn");

const timeListDiv = document.getElementById("time-list");
const colorsContainer = document.getElementById("colors-container");

const archiveListDiv = document.getElementById("archive-list");
const archiveBlocksBody = document.getElementById("archive-blocks-body");
const archivedDateSubheader = document.getElementById("archived-date-subheader");

const congratsMessage = document.getElementById("congrats-message");
const timeRangePreview = document.getElementById("time-range-preview");

let isMouseDown = false;
let startCell = null;
let endCell = null;

// 12-hour half-hour increments
const timeSlots = generateTimeSlots12();

// On load: auto-archive older blocks
autoArchiveOldBlocks();

// Build daily
buildDailyTable();
setupBlockEventDelegation();
updateDailySubheader();
displayDailyBlocks();
highlightCurrentTime();

// Color picker now used instead of preset checkboxes
// buildColorsContainer(); // No longer needed

// daily active by default
dailyView.classList.add("active");
btnDaily.classList.add("active");

// Initialize theme
initializeTheme();

// Initialize categories and templates
populateCategorySelect();
populateTemplateSelect();
setupTemplateHandlers();

/***************************************************
* Browser Notifications
**************************************************/
function loadNotificationPreference() {
  try {
    return localStorage.getItem("etb_notifications") === "true";
  } catch (e) {
    return false;
  }
}

function saveNotificationPreference(enabled) {
  try {
    localStorage.setItem("etb_notifications", enabled ? "true" : "false");
  } catch (e) {
    console.error("Failed to save notification preference:", e);
  }
}

let notificationsEnabled = loadNotificationPreference();
let notifiedBlocks = new Set(); // Track which blocks we've already notified about

function initializeNotifications() {
  // Check for notification support
  if (!("Notification" in window)) {
    console.log("Browser does not support notifications");
    return;
  }

  // If notifications are enabled and permission is granted, start checking
  if (notificationsEnabled && Notification.permission === "granted") {
    startNotificationChecker();
  }
}

function requestNotificationPermission() {
  if (!("Notification" in window)) {
    alert("Your browser does not support notifications.");
    return Promise.resolve(false);
  }

  if (Notification.permission === "granted") {
    notificationsEnabled = true;
    saveNotificationPreference(true);
    startNotificationChecker();
    return Promise.resolve(true);
  }

  if (Notification.permission === "denied") {
    alert("Notifications are blocked. Please enable them in your browser settings.");
    return Promise.resolve(false);
  }

  return Notification.requestPermission().then(permission => {
    if (permission === "granted") {
      notificationsEnabled = true;
      saveNotificationPreference(true);
      startNotificationChecker();
      return true;
    }
    return false;
  });
}

function disableNotifications() {
  notificationsEnabled = false;
  saveNotificationPreference(false);
}

function startNotificationChecker() {
  // Check every minute for upcoming blocks
  setInterval(checkUpcomingBlocks, 60000);
  // Also check immediately
  checkUpcomingBlocks();
}

function checkUpcomingBlocks() {
  if (!notificationsEnabled || Notification.permission !== "granted") {
    return;
  }

  const now = new Date();
  const currentDateStr = formatDate(now);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Get blocks for today
  const todayBlocks = timeBlocks.blocks.filter(block => {
    if (block.recurring) {
      const dayName = getWeekdayName(now);
      return block.recurrenceDays && block.recurrenceDays.includes(dayName);
    }
    return block.startTime && block.startTime.startsWith(currentDateStr);
  });

  // Check each block
  todayBlocks.forEach(block => {
    if (!block.startTime) return;

    const startTime = block.startTime.split("T")[1].slice(0, 5);
    const blockStartMinutes = timeToMinutes(startTime);

    // Notify 5 minutes before the block starts
    const notifyMinutes = blockStartMinutes - 5;
    const notificationKey = `${currentDateStr}-${block.id}`;

    // Check if it's time to notify (within the current minute)
    if (currentMinutes >= notifyMinutes && currentMinutes < notifyMinutes + 1) {
      // Check if we haven't already notified for this block today
      if (!notifiedBlocks.has(notificationKey)) {
        notifiedBlocks.add(notificationKey);
        showBlockNotification(block);
      }
    }
  });

  // Clean up old notification records (keep only today's)
  notifiedBlocks.forEach(key => {
    if (!key.startsWith(currentDateStr)) {
      notifiedBlocks.delete(key);
    }
  });
}

function showBlockNotification(block) {
  const startTime = block.startTime.split("T")[1].slice(0, 5);
  const endTime = block.endTime ? block.endTime.split("T")[1].slice(0, 5) : "";

  // Convert to 12-hour format for display
  const start12 = convertTo12Hour(startTime);
  const end12 = endTime ? convertTo12Hour(endTime) : "";

  const notification = new Notification("Time Block Starting Soon", {
    body: `${block.title}\n${start12}${end12 ? " - " + end12 : ""}`,
    icon: "icon.svg",
    tag: block.id, // Prevents duplicate notifications
    requireInteraction: false
  });

  // Close notification after 10 seconds
  setTimeout(() => notification.close(), 10000);

  // Click to focus app
  notification.onclick = function() {
    window.focus();
    notification.close();
  };
}

function convertTo12Hour(time24) {
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
}

// Initialize notifications
initializeNotifications();

/***************************************************
* Categories, Templates & Duplicate
**************************************************/
function populateCategorySelect() {
  if (!blockCategorySelect) return;
  blockCategorySelect.innerHTML = '<option value="">None</option>';
  categories.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat.id;
    opt.textContent = cat.name;
    opt.style.color = cat.color;
    blockCategorySelect.appendChild(opt);
  });
}

function populateTemplateSelect() {
  if (!templateSelect) return;
  templateSelect.innerHTML = '<option value="">-- Select a template --</option>';
  blockTemplates.forEach((tmpl, index) => {
    const opt = document.createElement("option");
    opt.value = index;
    opt.textContent = tmpl.title + (tmpl.category ? ` (${getCategoryName(tmpl.category)})` : '');
    templateSelect.appendChild(opt);
  });
}

function getCategoryName(categoryId) {
  const cat = categories.find(c => c.id === categoryId);
  return cat ? cat.name : '';
}

function getCategoryColor(categoryId) {
  const cat = categories.find(c => c.id === categoryId);
  return cat ? cat.color : null;
}

function setupTemplateHandlers() {
  // Template selection handler
  if (templateSelect) {
    templateSelect.addEventListener("change", (e) => {
      const index = parseInt(e.target.value);
      if (isNaN(index)) return;

      const template = blockTemplates[index];
      if (!template) return;

      // Fill in the form with template data
      blockTitleInput.value = template.title;
      blockNotesInput.value = template.notes || '';
      if (blockCategorySelect) blockCategorySelect.value = template.category || '';

      // Set color if specified
      if (template.color) {
        if (blockColorInput) {
          blockColorInput.value = template.color;
        }
        if (blockColorHex) {
          blockColorHex.textContent = template.color.toUpperCase();
        }
      }

      // Update category color swatch and custom color visibility
      if (categoryColorSwatch && template.category) {
        const catColor = getCategoryColor(template.category);
        categoryColorSwatch.style.backgroundColor = catColor || 'transparent';
        // Hide custom color when template has category
        if (customColorSection) customColorSection.style.display = 'none';
      } else if (categoryColorSwatch) {
        categoryColorSwatch.style.backgroundColor = 'transparent';
        // Show custom color when template has no category
        if (customColorSection) customColorSection.style.display = '';
      }

      // Add tasks if specified
      if (template.tasks && template.tasks.length > 0) {
        taskListContainer.innerHTML = '';
        template.tasks.forEach(task => {
          addTaskToUI(task.text);
        });
      }

      // Reset template select
      templateSelect.value = '';
    });
  }

  // Save as template handler
  if (saveTemplateBtn) {
    saveTemplateBtn.addEventListener("click", handleSaveAsTemplate);
  }

  // Duplicate button handler
  if (duplicateBtn) {
    duplicateBtn.addEventListener("click", handleDuplicateFromPopup);
  }
}

/***************************************************
* Color Picker and Category Handlers
**************************************************/
function setupColorPickerHandlers() {
  // Color picker input handler - updates hex display
  if (blockColorInput && blockColorHex) {
    blockColorInput.addEventListener("input", (e) => {
      blockColorHex.textContent = e.target.value.toUpperCase();
    });
  }

  // Category select handler - updates color swatch and toggles custom color visibility
  if (blockCategorySelect && categoryColorSwatch) {
    blockCategorySelect.addEventListener("change", (e) => {
      const categoryId = e.target.value;
      if (categoryId) {
        const color = getCategoryColor(categoryId);
        categoryColorSwatch.style.backgroundColor = color || 'transparent';
        // Hide custom color picker when category is selected
        if (customColorSection) customColorSection.style.display = 'none';
      } else {
        categoryColorSwatch.style.backgroundColor = 'transparent';
        // Show custom color picker when no category
        if (customColorSection) customColorSection.style.display = '';
      }
    });
  }
}

function setupCategoryManagement() {
  // Build initial categories list
  buildCategoriesContainer();

  // Add category button handler
  if (addCategoryBtn) {
    addCategoryBtn.addEventListener("click", () => {
      const name = newCategoryName.value.trim();
      if (!name) {
        alert("Please enter a category name.");
        return;
      }

      const color = newCategoryColor.value;
      const id = name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();

      categories.push({ id, name, color });
      saveCategoriesToStorage(categories);
      buildCategoriesContainer();
      populateCategorySelect();

      // Clear inputs
      newCategoryName.value = '';
      newCategoryColor.value = '#4F6D7A';
    });
  }
}

function buildCategoriesContainer() {
  if (!categoriesContainer) return;
  categoriesContainer.innerHTML = '';

  categories.forEach((cat, index) => {
    const row = document.createElement("div");
    row.style.display = "flex";
    row.style.alignItems = "center";
    row.style.gap = "8px";
    row.style.padding = "6px";
    row.style.borderRadius = "4px";
    row.style.background = "var(--bg-tertiary)";

    // Color swatch
    const colorSwatch = document.createElement("input");
    colorSwatch.type = "color";
    colorSwatch.value = cat.color;
    colorSwatch.style.width = "30px";
    colorSwatch.style.height = "24px";
    colorSwatch.style.border = "none";
    colorSwatch.style.cursor = "pointer";
    colorSwatch.style.borderRadius = "4px";
    colorSwatch.addEventListener("change", (e) => {
      categories[index].color = e.target.value;
      saveCategoriesToStorage(categories);
      populateCategorySelect();
    });

    // Name input
    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.value = cat.name;
    nameInput.style.flex = "1";
    nameInput.style.padding = "4px 8px";
    nameInput.style.borderRadius = "4px";
    nameInput.style.border = "1px solid var(--border-color)";
    nameInput.style.background = "var(--input-bg)";
    nameInput.style.color = "var(--text-primary)";
    nameInput.addEventListener("change", (e) => {
      categories[index].name = e.target.value.trim();
      saveCategoriesToStorage(categories);
      populateCategorySelect();
    });

    // Delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "✕";
    deleteBtn.className = "nav-btn";
    deleteBtn.style.padding = "4px 8px";
    deleteBtn.style.fontSize = "0.8rem";
    deleteBtn.style.color = "#dc3545";
    deleteBtn.addEventListener("click", () => {
      if (confirm(`Delete category "${cat.name}"?`)) {
        categories.splice(index, 1);
        saveCategoriesToStorage(categories);
        buildCategoriesContainer();
        populateCategorySelect();
      }
    });

    row.appendChild(colorSwatch);
    row.appendChild(nameInput);
    row.appendChild(deleteBtn);
    categoriesContainer.appendChild(row);
  });
}

// Initialize color picker and category handlers
setupColorPickerHandlers();
setupCategoryManagement();

function handleSaveAsTemplate() {
  const title = blockTitleInput.value.trim();
  if (!title) {
    alert("Please enter a block title first.");
    return;
  }

  const templateName = prompt("Enter a name for this template:", title);
  if (!templateName) return;

  const template = {
    title: templateName,
    notes: blockNotesInput.value.trim(),
    category: blockCategorySelect ? blockCategorySelect.value : '',
    color: blockColorInput ? blockColorInput.value : colorPresets[0],
    tasks: gatherTasksFromUI()
  };

  blockTemplates.push(template);
  saveTemplatesToStorage(blockTemplates);
  populateTemplateSelect();
  alert(`Template "${templateName}" saved!`);
}

function handleDuplicateFromPopup() {
  if (!editBlockId) return;

  const blockToDuplicate = timeBlocks.blocks.find(b => b.id === editBlockId);
  if (!blockToDuplicate) return;

  duplicateBlock(blockToDuplicate);
  hideOverlay();
}

function addTaskToUI(taskText) {
  const div = document.createElement("div");
  div.className = "task-item";

  const input = document.createElement("input");
  input.type = "text";
  input.value = taskText || '';
  input.placeholder = "Enter task...";

  const removeBtn = document.createElement("button");
  removeBtn.type = "button";
  removeBtn.className = "task-remove-btn";
  removeBtn.innerHTML = "&times;";
  removeBtn.addEventListener("click", () => div.remove());

  div.appendChild(input);
  div.appendChild(removeBtn);
  taskListContainer.appendChild(div);
}

/***************************************************
* Theme Handling
**************************************************/
function initializeTheme() {
  const savedTheme = loadThemePreference();
  applyTheme(savedTheme);

  // Set the correct radio button
  const themeRadio = document.getElementById(`theme-${savedTheme}`);
  if (themeRadio) themeRadio.checked = true;

  // Add event listeners for theme radio buttons
  document.querySelectorAll('input[name="theme"]').forEach(radio => {
    radio.addEventListener("change", (e) => {
      const theme = e.target.value;
      applyTheme(theme);
      saveThemePreference(theme);
    });
  });
}

function loadThemePreference() {
  try {
    return localStorage.getItem("theme") || "auto";
  } catch (e) {
    return "auto";
  }
}

function saveThemePreference(theme) {
  try {
    localStorage.setItem("theme", theme);
  } catch (e) {
    console.error("Error saving theme preference:", e);
  }
}

function applyTheme(theme) {
  const root = document.documentElement;

  if (theme === "dark") {
    root.setAttribute("data-theme", "dark");
  } else if (theme === "light") {
    root.setAttribute("data-theme", "light");
  } else {
    // Auto - remove attribute to use system preference via CSS media query
    root.removeAttribute("data-theme");
  }
}

/***************************************************
* View Switching Helper
**************************************************/
function switchToView(viewName) {
  // Hide all views
  dailyView.classList.remove("active");
  if (statisticsView) statisticsView.classList.remove("active");
  archiveView.classList.remove("active");
  if (aboutView) aboutView.classList.remove("active");
  settingsOverlay.classList.remove("active");

  // Update button states and aria-pressed
  document.querySelectorAll(".view-buttons button").forEach(btn => {
    btn.classList.remove("active");
    btn.setAttribute("aria-pressed", "false");
  });

  // Show requested view
  switch(viewName) {
    case 'daily':
      dailyView.classList.add("active");
      btnDaily.classList.add("active");
      btnDaily.setAttribute("aria-pressed", "true");
      updateDailySubheader();
      displayDailyBlocks();
      highlightCurrentTime();
      break;
    case 'statistics':
      if (statisticsView) {
        statisticsView.classList.add("active");
        if (btnStatistics) {
          btnStatistics.classList.add("active");
          btnStatistics.setAttribute("aria-pressed", "true");
        }
        buildStatistics();
      }
      break;
    case 'archive':
      archiveView.classList.add("active");
      btnArchive.classList.add("active");
      btnArchive.setAttribute("aria-pressed", "true");
      buildArchiveList();
      break;
    case 'about':
      if (aboutView) {
        aboutView.classList.add("active");
        if (btnAbout) {
          btnAbout.classList.add("active");
          btnAbout.setAttribute("aria-pressed", "true");
        }
      }
      break;
  }
}

// Prevent double-execution on touch devices
let lastButtonClick = 0;
function handleButtonClick(callback) {
  return function(e) {
    const now = Date.now();
    if (now - lastButtonClick < 300) return; // Debounce
    lastButtonClick = now;
    if (e.type === 'touchend') e.preventDefault();
    callback();
  };
}

/***************************************************
* Buttons
**************************************************/
const dailyHandler = handleButtonClick(() => switchToView('daily'));
btnDaily.addEventListener("click", dailyHandler);
btnDaily.addEventListener("touchend", dailyHandler, { passive: false });

if (btnStatistics) {
  const statsHandler = handleButtonClick(() => switchToView('statistics'));
  btnStatistics.addEventListener("click", statsHandler);
  btnStatistics.addEventListener("touchend", statsHandler, { passive: false });
}

const archiveHandler = handleButtonClick(() => switchToView('archive'));
btnArchive.addEventListener("click", archiveHandler);
btnArchive.addEventListener("touchend", archiveHandler, { passive: false });

if (btnAbout) {
  const aboutHandler = handleButtonClick(() => switchToView('about'));
  btnAbout.addEventListener("click", aboutHandler);
  btnAbout.addEventListener("touchend", aboutHandler, { passive: false });
}

if (btnSearch) {
  const searchHandler = handleButtonClick(() => {
    if (searchContainer) {
      searchContainer.style.display = searchContainer.style.display === "none" ? "flex" : "none";
      if (searchContainer.style.display === "flex" && searchInput) {
        searchInput.focus();
      }
    }
  });
  btnSearch.addEventListener("click", searchHandler);
  btnSearch.addEventListener("touchend", searchHandler, { passive: false });
}

if (closeSearchBtn) {
  closeSearchBtn.addEventListener("click", () => {
    if (searchContainer) searchContainer.style.display = "none";
    if (searchInput) searchInput.value = "";
  });
}

if (searchInput) {
  searchInput.addEventListener("input", (e) => {
    const query = e.target.value.trim().toLowerCase();
    if (query.length > 0) {
      performSearch(query);
    } else {
      if (searchResults) searchResults.innerHTML = "";
      if (searchOverlay) searchOverlay.classList.remove("active");
    }
  });

  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const query = e.target.value.trim().toLowerCase();
      if (query.length > 0) {
        performSearch(query);
      }
    }
  });
}

if (closeSearchOverlayBtn) {
  closeSearchOverlayBtn.addEventListener("click", () => {
    if (searchOverlay) searchOverlay.classList.remove("active");
  });
}

// Export/Import handlers
if (exportJsonBtn) {
  exportJsonBtn.addEventListener("click", () => exportData("json"));
}
if (exportTxtBtn) {
  exportTxtBtn.addEventListener("click", () => exportData("txt"));
}
if (importBtn) {
  importBtn.addEventListener("click", () => importFileInput.click());
}
if (importFileInput) {
  importFileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const fileContent = event.target.result;
          const fileExtension = file.name.split('.').pop().toLowerCase();
          
          if (fileExtension === "json") {
            const data = JSON.parse(fileContent);
            importData(data);
          } else if (fileExtension === "txt") {
            const data = parseTxtImport(fileContent);
            importData(data);
          } else {
            alert("Unsupported file format. Please use .json or .txt files.");
          }
        } catch (error) {
          alert("Error importing data: " + error.message);
        }
      };
      reader.readAsText(file);
      e.target.value = ""; // Reset input
    }
  });
}
if (printViewBtn) {
  printViewBtn.addEventListener("click", () => {
    showPrintView();
  });
}

btnSettings.addEventListener("click", (e) => {
e.preventDefault();
showSettings();
});
btnSettings.addEventListener("touchend", (e) => {
e.preventDefault();
showSettings();
}, { passive: false });

closeSettingsBtn.addEventListener("click", hideSettings);
closeSettingsBtn.addEventListener("touchend", (e) => {
e.preventDefault();
hideSettings();
}, { passive: false });

// Notifications toggle
const notificationsToggleBtn = document.getElementById("notifications-toggle-btn");
const notificationsStatus = document.getElementById("notifications-status");

function updateNotificationUI() {
  if (!notificationsToggleBtn || !notificationsStatus) return;

  if (notificationsEnabled && Notification.permission === "granted") {
    notificationsToggleBtn.textContent = "Disable Notifications";
    notificationsStatus.textContent = "Enabled";
    notificationsStatus.style.color = "var(--success-color)";
  } else {
    notificationsToggleBtn.textContent = "Enable Notifications";
    notificationsStatus.textContent = "Disabled";
    notificationsStatus.style.color = "var(--text-muted)";
  }
}

if (notificationsToggleBtn) {
  notificationsToggleBtn.addEventListener("click", () => {
    if (notificationsEnabled && Notification.permission === "granted") {
      disableNotifications();
      updateNotificationUI();
    } else {
      requestNotificationPermission().then(() => {
        updateNotificationUI();
      });
    }
  });
}

addTaskBtn.addEventListener("click", () => addTaskRow(""));
addTaskBtn.addEventListener("touchend", (e) => {
e.preventDefault();
addTaskRow("");
}, { passive: false });

recurringCheckbox.addEventListener("change", () => {
recurrenceDaysDiv.style.display = recurringCheckbox.checked ? "flex" : "none";
const carryoverLabel = document.getElementById("carryover-label");
carryoverLabel.style.display = recurringCheckbox.checked ? "flex" : "none";

// Disable/enable date input for recurring blocks
if (blockDateInput) {
  blockDateInput.disabled = recurringCheckbox.checked;
  if (recurringCheckbox.checked) {
    blockDateInput.value = formatDate(currentDate); // Set to current date
  }
}
});
saveBtn.addEventListener("click", handleSaveBlock);
saveBtn.addEventListener("touchend", (e) => {
e.preventDefault();
handleSaveBlock();
}, { passive: false });

deleteBtn.addEventListener("click", handleDeleteBlock);
deleteBtn.addEventListener("touchend", (e) => {
e.preventDefault();
handleDeleteBlock();
}, { passive: false });

closePopupBtn.addEventListener("click", hideOverlay);
closePopupBtn.addEventListener("touchend", (e) => {
e.preventDefault();
hideOverlay();
}, { passive: false });

// Click outside overlay to close
overlay.addEventListener("click", (e) => {
  if (e.target === overlay) {
    hideOverlay();
  }
});
settingsOverlay.addEventListener("click", (e) => {
  if (e.target === settingsOverlay) {
    hideSettings();
  }
});

// Keyboard: Escape key closes modals, Arrow keys navigate dates, Cmd/Ctrl+P for print
document.addEventListener("keydown", (e) => {
  // Handle print shortcut (Cmd+P on Mac, Ctrl+P on Windows/Linux)
  if ((e.metaKey || e.ctrlKey) && e.key === "p") {
    e.preventDefault();
    showPrintView();
    return;
  }

  // Handle search shortcut (Cmd+F on Mac, Ctrl+F on Windows/Linux)
  if ((e.metaKey || e.ctrlKey) && e.key === "f") {
    e.preventDefault();
    if (searchContainer) {
      searchContainer.style.display = "flex";
      if (searchInput) searchInput.focus();
    }
    return;
  }

  // Handle new block shortcut (Cmd+N or Ctrl+N)
  if ((e.metaKey || e.ctrlKey) && e.key === "n") {
    e.preventDefault();
    if (dailyView.classList.contains("active") && !overlay.classList.contains("active")) {
      showBlockPopup(null);
    }
    return;
  }

  // Only handle keyboard shortcuts when modals are not open and not typing in inputs
  const activeElement = document.activeElement;
  const isInputFocused = activeElement && (
    activeElement.tagName === "INPUT" ||
    activeElement.tagName === "TEXTAREA" ||
    activeElement.isContentEditable
  );

  if (e.key === "Escape" || e.key === "Esc") {
    if (overlay.classList.contains("active")) {
      hideOverlay();
    } else if (settingsOverlay.classList.contains("active")) {
      hideSettings();
    } else if (searchContainer && searchContainer.style.display === "flex") {
      searchContainer.style.display = "none";
    } else if (printView && printView.classList.contains("active")) {
      printView.classList.remove("active");
      dailyView.classList.add("active");
    }
  } else if (!isInputFocused && dailyView.classList.contains("active")) {
    // Arrow key navigation for dates
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      currentDate.setDate(currentDate.getDate() - 1);
      updateDailySubheader();
      displayDailyBlocks();
      highlightCurrentTime();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      currentDate.setDate(currentDate.getDate() + 1);
      updateDailySubheader();
      displayDailyBlocks();
      highlightCurrentTime();
    } else if (e.key === "Home" || (e.key === "t" && !e.ctrlKey && !e.metaKey)) {
      e.preventDefault();
      currentDate = new Date();
      updateDailySubheader();
      displayDailyBlocks();
      highlightCurrentTime();
    }
  }
});

// Handle browser print dialog (beforeprint event)
window.addEventListener("beforeprint", () => {
  // If print view is not already active, show it
  if (!printView || !printView.classList.contains("active")) {
    showPrintView();
  }
});

// Handle after print to return to normal view
window.addEventListener("afterprint", () => {
  // Hide print view after printing and return to daily view
  if (printView && printView.classList.contains("active")) {
    printView.classList.remove("active");
    dailyView.classList.add("active");
    updateDailySubheader();
    displayDailyBlocks();
    highlightCurrentTime();
  }
});

// Date navigation
prevDayBtn.addEventListener("click", () => {
currentDate.setDate(currentDate.getDate() - 1);
updateDailySubheader();
displayDailyBlocks();
highlightCurrentTime();
});
nextDayBtn.addEventListener("click", () => {
currentDate.setDate(currentDate.getDate() + 1);
updateDailySubheader();
displayDailyBlocks();
highlightCurrentTime();
});
todayBtn.addEventListener("click", () => {
currentDate = new Date();
updateDailySubheader();
displayDailyBlocks();
highlightCurrentTime();
});

/***************************************************
* Bulk Operations
**************************************************/
// Get blocks for a specific date
function getBlocksForDate(dateStr) {
  return timeBlocks.blocks.filter(block => {
    if (block.recurring) {
      const dayName = getWeekdayName(new Date(dateStr + "T00:00:00"));
      return block.recurrenceDays && block.recurrenceDays.includes(dayName);
    }
    return block.startTime && block.startTime.startsWith(dateStr);
  });
}

// Clear all blocks for the current day
function handleClearDay() {
  const dateStr = formatDate(currentDate);
  const dayName = getWeekdayName(currentDate);
  const blocksForDay = getBlocksForDate(dateStr);

  if (blocksForDay.length === 0) {
    alert("No blocks to clear for this day.");
    return;
  }

  const blockCount = blocksForDay.length;
  const confirmed = confirm(
    `Are you sure you want to delete all ${blockCount} block(s) for ${dayName}, ${dateStr}?\n\n` +
    `Note: Recurring blocks that include ${dayName} will be removed entirely.\n\n` +
    `This action cannot be undone.`
  );

  if (!confirmed) return;

  // Remove non-recurring blocks for this date
  timeBlocks.blocks = timeBlocks.blocks.filter(block => {
    if (block.recurring) {
      // For recurring blocks, remove the current day from recurrenceDays
      if (block.recurrenceDays && block.recurrenceDays.includes(dayName)) {
        block.recurrenceDays = block.recurrenceDays.filter(d => d !== dayName);
        // If no days left, remove the block entirely
        return block.recurrenceDays.length > 0;
      }
      return true;
    }
    // Remove non-recurring blocks that match this date
    return !block.startTime || !block.startTime.startsWith(dateStr);
  });

  saveBlocksToStorage(timeBlocks);
  displayDailyBlocks();
  highlightCurrentTime();
  alert(`Cleared ${blockCount} block(s) for ${dayName}.`);
}

// Copy all blocks to another date
function handleCopyDay() {
  const dateStr = formatDate(currentDate);
  const dayName = getWeekdayName(currentDate);
  const blocksForDay = getBlocksForDate(dateStr);

  if (blocksForDay.length === 0) {
    alert("No blocks to copy for this day.");
    return;
  }

  // Create a date input for target date
  const targetDateStr = prompt(
    `Copy ${blocksForDay.length} block(s) from ${dayName}, ${dateStr} to another date.\n\n` +
    `Enter target date (YYYY-MM-DD):`
  );

  if (!targetDateStr) return;

  // Validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(targetDateStr)) {
    alert("Invalid date format. Please use YYYY-MM-DD format (e.g., 2024-01-15).");
    return;
  }

  // Check if date is valid
  const targetDate = new Date(targetDateStr + "T00:00:00");
  if (isNaN(targetDate.getTime())) {
    alert("Invalid date. Please enter a valid date.");
    return;
  }

  // Check for existing blocks on target date
  const existingBlocks = getBlocksForDate(targetDateStr);
  if (existingBlocks.length > 0) {
    const proceed = confirm(
      `The target date (${targetDateStr}) already has ${existingBlocks.length} block(s).\n\n` +
      `Do you want to add the copied blocks anyway?`
    );
    if (!proceed) return;
  }

  // Copy blocks to target date
  let copiedCount = 0;
  blocksForDay.forEach(block => {
    if (block.recurring) {
      // Skip recurring blocks - they don't get copied as regular blocks
      return;
    }

    // Extract time parts from original block
    const startTime = block.startTime.split("T")[1];
    const endTime = block.endTime.split("T")[1];

    const newBlock = {
      id: generateUUID(),
      title: block.title,
      notes: block.notes || "",
      color: block.color || colorPresets[0],
      recurring: false,
      recurrenceDays: [],
      carryOver: false,
      tasks: block.tasks ? block.tasks.map(t => ({ text: t.text, completed: false })) : [],
      startTime: `${targetDateStr}T${startTime}`,
      endTime: `${targetDateStr}T${endTime}`,
      category: block.category || ""
    };

    timeBlocks.blocks.push(newBlock);
    copiedCount++;
  });

  if (copiedCount > 0) {
    saveBlocksToStorage(timeBlocks);
    displayDailyBlocks();
    highlightCurrentTime();
    alert(`Copied ${copiedCount} block(s) to ${targetDateStr}.`);
  } else {
    alert("No non-recurring blocks were copied. Recurring blocks cannot be copied as regular blocks.");
  }
}

// Bulk operation event handlers
if (clearDayBtn) {
  clearDayBtn.addEventListener("click", handleClearDay);
}
if (copyDayBtn) {
  copyDayBtn.addEventListener("click", handleCopyDay);
}

/***************************************************
* Event Delegation for Blocks
**************************************************/
let delegationLastClick = 0;

function setupBlockEventDelegation() {
  const dailyBody = document.getElementById("daily-body");
  if (!dailyBody) return;

  // Delegated click handler for block titles
  dailyBody.addEventListener("click", (e) => {
    // Handle block title click
    const titleDiv = e.target.closest(".block-title");
    if (titleDiv) {
      const now = Date.now();
      if (now - delegationLastClick < 300) return; // Debounce
      delegationLastClick = now;

      const cell = titleDiv.closest("td");
      const blockId = cell?.dataset.blockId;
      if (blockId) {
        const block = timeBlocks.blocks.find(b => b.id === blockId);
        if (block) {
          e.preventDefault();
          e.stopPropagation();
          editBlockId = block.id;
          showBlockPopup(block);
        }
      }
      return;
    }

    // Handle task checkbox click
    const checkbox = e.target.closest(".tasks-container input[type='checkbox']");
    if (checkbox) {
      const cell = checkbox.closest("td");
      const blockId = cell?.dataset.blockId;
      const taskText = checkbox.nextElementSibling?.textContent;
      if (blockId && taskText) {
        const block = timeBlocks.blocks.find(b => b.id === blockId);
        if (block && block.tasks) {
          const task = block.tasks.find(t => t.text === taskText);
          if (task) {
            task.completed = checkbox.checked;
            const span = checkbox.nextElementSibling;
            if (span) {
              if (checkbox.checked) span.classList.add("strike");
              else span.classList.remove("strike");
            }
            saveBlocksToStorage(timeBlocks);
            const dayBlocks = getCurrentDayBlocks();
            checkAllTasksCompletion(dayBlocks);
          }
        }
      }
    }
  });

  // Delegated touch handler for block titles
  dailyBody.addEventListener("touchend", (e) => {
    const titleDiv = e.target.closest(".block-title");
    if (titleDiv) {
      const now = Date.now();
      if (now - delegationLastClick < 300) return;
      delegationLastClick = now;

      const cell = titleDiv.closest("td");
      const blockId = cell?.dataset.blockId;
      if (blockId) {
        const block = timeBlocks.blocks.find(b => b.id === blockId);
        if (block) {
          e.preventDefault();
          e.stopPropagation();
          editBlockId = block.id;
          showBlockPopup(block);
        }
      }
    }
  }, { passive: false });

  // Delegated context menu for duplicate
  dailyBody.addEventListener("contextmenu", (e) => {
    const titleDiv = e.target.closest(".block-title");
    if (titleDiv) {
      e.preventDefault();
      const cell = titleDiv.closest("td");
      const blockId = cell?.dataset.blockId;
      if (blockId) {
        const block = timeBlocks.blocks.find(b => b.id === blockId);
        if (block && confirm("Duplicate this block?")) {
          duplicateBlock(block);
        }
      }
    }
  });

  // Delegated blur handler for notes
  dailyBody.addEventListener("focusout", (e) => {
    const notesArea = e.target.closest(".notes-box textarea");
    if (notesArea) {
      const cell = notesArea.closest("td");
      const blockId = cell?.dataset.blockId;
      if (blockId) {
        const block = timeBlocks.blocks.find(b => b.id === blockId);
        if (block) {
          block.notes = notesArea.value;
          saveBlocksToStorage(timeBlocks);
        }
      }
    }
  });

  // Delegated drag start
  dailyBody.addEventListener("dragstart", (e) => {
    const cell = e.target.closest("td.block-cell");
    if (cell) {
      const blockId = cell.dataset.blockId;
      if (blockId) {
        const block = timeBlocks.blocks.find(b => b.id === blockId);
        if (block) {
          draggedBlock = block;
          draggedBlockCell = cell;
          cell.classList.add("dragging");
          e.dataTransfer.effectAllowed = "move";
        }
      }
    }
  });

  // Delegated drag end
  dailyBody.addEventListener("dragend", (e) => {
    const cell = e.target.closest("td.block-cell");
    if (cell) {
      cell.classList.remove("dragging");
      draggedBlock = null;
      draggedBlockCell = null;
    }
  });

  // Delegated drag over
  dailyBody.addEventListener("dragover", (e) => {
    const cell = e.target.closest("td.block-cell");
    if (cell) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    }
  });

  // Delegated drop
  dailyBody.addEventListener("drop", (e) => {
    const cell = e.target.closest("td.block-cell");
    if (cell && draggedBlock) {
      e.preventDefault();
      const blockId = cell.dataset.blockId;
      if (blockId && blockId !== draggedBlock.id) {
        const targetBlock = timeBlocks.blocks.find(b => b.id === blockId);
        if (targetBlock) {
          reorderBlocks(draggedBlock, targetBlock);
        }
      }
    }
  });
}

/***************************************************
* Daily
**************************************************/
function buildDailyTable(){
const dailyBody = document.getElementById("daily-body");
dailyBody.innerHTML = "";

let hasRow = false;
timeSlots.forEach(label => {
  if(hiddenTimes.includes(label))return;
  hasRow = true;

  const tr = document.createElement("tr");
  const tdTime = document.createElement("td");
  tdTime.textContent = label;
  tr.appendChild(tdTime);

  const tdBlock = document.createElement("td");
  tdBlock.dataset.timeSlot = label;
  tdBlock.addEventListener("mousedown", handleMouseDown);
  tdBlock.addEventListener("mouseover", handleMouseOver);
  tdBlock.addEventListener("mouseup", handleMouseUp);

  // Add mobile touch event listeners
  tdBlock.addEventListener("touchstart", handleTouchStart, { passive: false });
  tdBlock.addEventListener("touchmove", handleTouchMove, { passive: false });
  tdBlock.addEventListener("touchend", handleTouchEnd, { passive: false });
  tr.appendChild(tdBlock);

  dailyBody.appendChild(tr);
});

if(!hasRow){
  const tr = document.createElement("tr");
  const td = document.createElement("td");
  td.colSpan = 2;
  td.style.textAlign = "center";
  td.style.color = "#999";
  td.textContent = "No time slots available";
  tr.appendChild(td);
  dailyBody.appendChild(tr);
}
}

function displayDailyBlocks(){
buildDailyTable();
const todayStr = formatDate(currentDate);
// daily => if block !archived, date= today or recurring
const dailyBlocks = timeBlocks.blocks.filter(b => {
  if(b.archived) return false;
  if(b.recurring && b.recurrenceDays && b.recurrenceDays.length>0){
    return b.recurrenceDays.includes(getWeekdayName(currentDate));
  } else {
    if(!b.startTime) return false;
    return (b.startTime.split("T")[0] === todayStr);
  }
});

renderBlocksDaily(dailyBlocks);
checkAllTasksCompletion(dailyBlocks);
checkForEmptyDay();
}

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
}

function renderBlocksDaily(blocks){
  const dailyBody = document.getElementById("daily-body");
  blocks.forEach(block => {
    // Apply carry over data for recurring blocks
    const displayBlock = applyCarryOverData(block);

    const [startHM, endHM] = parseBlockTimes(displayBlock);
    const startLabel = convert24To12(startHM);
    const endLabel = convert24To12(endHM);
    const range = findTimeRange12(startLabel, endLabel);
    if(!range.length)return;

    const startIndex = findTableRowIndex(dailyBody, range[0]);
    if(startIndex < 0)return;
    const length = computeRowSpan(dailyBody, range);
    if(length <= 0)return;

    const rowStart = dailyBody.rows[startIndex];
    const blockCell = rowStart.cells[1];
    blockCell.rowSpan = length;
    renderBlockContent(blockCell, displayBlock);

    for(let i=1; i<length; i++){
      dailyBody.rows[startIndex + i].deleteCell(1);
    }
  });
}

/***************************************************
* Congrats if all tasks done
**************************************************/
function checkAllTasksCompletion(blocks){
// flatten tasks
let allTasks = [];
blocks.forEach(b=>{
  if(b.tasks) allTasks = allTasks.concat(b.tasks);
});
// if dailyBlocks has tasks and all completed => show "congrats"
if(allTasks.length>0 && allTasks.every(t=>t.completed)){
  congratsMessage.style.display="block";
} else {
  congratsMessage.style.display="none";
}
}

/***************************************************
* Archive
**************************************************/
function buildArchiveList(){
archiveListDiv.innerHTML = "";
archivedDateSubheader.textContent = "";
archiveBlocksBody.innerHTML = "";
  
const days = archivedBlocks.days ? Object.keys(archivedBlocks.days).sort() : [];
if(!days.length){
  archiveListDiv.textContent = "No archived days";
  return;
}
days.forEach(dayKey => {
  const btn = document.createElement("button");
  btn.textContent = dayKey;
  btn.addEventListener("click", () => {
    showArchivedBlocksForDay(dayKey);
  });
  archiveListDiv.appendChild(btn);
});
// auto show last day
showArchivedBlocksForDay(days[days.length-1]);
}
function showArchivedBlocksForDay(dayKey){
archivedDateSubheader.textContent = "Archive for " + dayKey;
archiveBlocksBody.innerHTML = "";

// We'll build a daily-style table for the archived blocks
// first gather all archived blocks for that date
const blocks = archivedBlocks.days[dayKey];
// build 12h schedule
let tableRows = [];
timeSlots.forEach(label => {
  tableRows.push({ label, block:null, blockData:null });
});
// fill in blockData
blocks.forEach(b => {
  if(!b.startTime) return;
  const startHM = b.startTime.split("T")[1].slice(0,5);
  const endHM = b.endTime.split("T")[1].slice(0,5);
  const startLabel = convert24To12(startHM);
  const endLabel = convert24To12(endHM);
  const range = findTimeRange12(startLabel, endLabel);
  if(!range.length)return;

  const startIndex = timeSlots.indexOf(range[0]);
  const length = range.length;
  // store block in tableRows for rowSpan
  tableRows[startIndex].blockData = b;
  tableRows[startIndex].block = length;
});

// now build table rows
for(let i=0; i<tableRows.length; i++){
  const row = tableRows[i];
  if(row.block===-1) continue; // skip
  const tr = document.createElement("tr");
  // time col
  const tdTime = document.createElement("td");
  tdTime.textContent = row.label;
  tr.appendChild(tdTime);

  // block col
  const tdBlock = document.createElement("td");
  if(row.block){
    tdBlock.rowSpan = row.block;
    renderArchiveBlockCell(tdBlock, row.blockData);
    // mark the subsequent rows so we skip them
    for(let j=i+1; j<i+row.block; j++){
      if(tableRows[j]) tableRows[j].block=-1;
    }
  }
  tr.appendChild(tdBlock);
  archiveBlocksBody.appendChild(tr);
}
}
function renderArchiveBlockCell(cell, block){
cell.textContent = "";
const colorVal = block.color || "#CCC";
cell.style.backgroundColor = colorVal;
cell.style.color = "#000";

// Title
const titleDiv = document.createElement("div");
titleDiv.style.fontWeight = "bold";
titleDiv.style.marginBottom = "6px";
titleDiv.style.color = "#000";
titleDiv.textContent = block.title || "Untitled";
cell.appendChild(titleDiv);

// tasks
const tasksBox = document.createElement("div");
tasksBox.style.background = "#fff";
tasksBox.style.padding = "4px";
tasksBox.style.borderRadius = "4px";
tasksBox.style.color = "#000";
tasksBox.style.marginTop = "4px";
tasksBox.style.marginBottom = "4px";
const tasksDiv = document.createElement("div");
tasksDiv.style.display = "flex";
tasksDiv.style.flexDirection = "column";
tasksBox.appendChild(tasksDiv);

(block.tasks||[]).forEach(t => {
  const label = document.createElement("label");
  label.style.display = "flex";
  label.style.alignItems = "center";
  const cb = document.createElement("input");
  cb.type = "checkbox";
  cb.disabled = true;
  cb.checked = !!t.completed;
  const span = document.createElement("span");
  span.textContent = t.text;
  if(t.completed) span.style.textDecoration = "line-through";
  label.appendChild(cb);
  label.appendChild(span);
  tasksDiv.appendChild(label);
});
cell.appendChild(tasksBox);

// notes
const notesBox = document.createElement("div");
notesBox.style.background = "#fff";
notesBox.style.color = "#000";
notesBox.style.padding = "4px";
notesBox.style.borderRadius = "4px";
notesBox.style.marginTop = "4px";
if(block.notes) notesBox.textContent = "Notes: " + block.notes;
cell.appendChild(notesBox);
}

/***************************************************
* Auto-Archive Old Blocks
**************************************************/
function autoArchiveOldBlocks(){
const todayStr = formatDate(new Date());
const stillActive = [];
timeBlocks.blocks.forEach(b => {
  if(b.archived){
    stillActive.push(b);
    return;
  }
  if(!b.startTime){
    stillActive.push(b);
    return;
  }
  const blockDate = b.startTime.split("T")[0];
  if(blockDate < todayStr){
    b.archived = true;
    addBlockToArchive(blockDate, b);
  } else {
    stillActive.push(b);
  }
});
timeBlocks.blocks = stillActive;
saveBlocksToStorage(timeBlocks);
saveArchivedToStorage(archivedBlocks);
}
function addBlockToArchive(dayStr, blockData){
  if(!archivedBlocks.days[dayStr]) archivedBlocks.days[dayStr] = [];
  archivedBlocks.days[dayStr].push({
    title: blockData.title,
    notes: blockData.notes,
    color: blockData.color,
    tasks: blockData.tasks || [],
    recurring: blockData.recurring || false,
    recurringBlockId: blockData.id, // Store the block ID for carry over matching
    startTime: blockData.startTime,
    endTime: blockData.endTime
  });
}

/***************************************************
* Carry Over Feature for Recurring Blocks
**************************************************/
// Find the most recent archived instance of a recurring block
function findMostRecentArchivedInstance(block) {
  if (!block.recurring || !block.carryOver) return null;

  const archivedDays = Object.keys(archivedBlocks.days || {}).sort().reverse();

  for (const dayKey of archivedDays) {
    const dayBlocks = archivedBlocks.days[dayKey];
    // Look for a block with matching ID (most reliable) or title (fallback)
    const match = dayBlocks.find(archived =>
      archived.recurringBlockId === block.id ||
      (archived.recurring && archived.title === block.title)
    );
    if (match) return match;
  }

  return null;
}

// Apply carry over data from archived instance to current block for display
function applyCarryOverData(block) {
  if (!block.recurring || !block.carryOver) return block;

  const archivedInstance = findMostRecentArchivedInstance(block);
  if (!archivedInstance) return block;

  // Create a copy with carried-over data
  const blockWithCarryOver = { ...block };

  // Carry over tasks - preserve text but reset completion status for new day
  // unless the block already has tasks defined
  if (archivedInstance.tasks && archivedInstance.tasks.length > 0) {
    if (!block.tasks || block.tasks.length === 0) {
      blockWithCarryOver.tasks = archivedInstance.tasks.map(t => ({
        text: t.text,
        completed: false // Reset completion for the new day
      }));
    }
  }

  // Carry over notes if block doesn't have notes
  if (archivedInstance.notes && !block.notes) {
    blockWithCarryOver.notes = archivedInstance.notes;
  }

  return blockWithCarryOver;
}

/***************************************************
*  Mouse-based block creation
**************************************************/
function handleMouseDown(e){
isMouseDown = true;
startCell = e.target;
startCell.classList.add("selected");
}
function handleMouseOver(e){
if(!isMouseDown)return;
clearSelectedCells();
endCell = e.target;
markSelectedRange();
}
function handleMouseUp(e){
if(!isMouseDown)return;
endCell = e.target;
markSelectedRange();
isMouseDown = false;

const startTd = startCell.closest("td");
const endTd = endCell.closest("td");

if(!startTd.dataset.blockId && !endTd.dataset.blockId){
  showBlockPopup(null);
}
}

/***************************************************
* Touch handlers for mobile drag
**************************************************/
function handleTouchStart(e){
  if(e.touches.length === 0) return;

  const touch = e.touches[0];
  const target = document.elementFromPoint(touch.clientX, touch.clientY);

  // Allow native behavior for interactive elements inside blocks
  if(target && (target.matches('input[type="checkbox"]') ||
                target.matches('textarea') ||
                target.matches('input[type="text"]') ||
                target.closest('.tasks-box') ||
                target.closest('.notes-box'))){
    return;
  }

  // Get the actual table cell
  const cell = target ? target.closest('td[data-time-slot]') : null;
  if(!cell) return;

  // Check if this is an existing block cell (has blockId)
  if(cell.dataset.blockId){
    // Let the block title handle its own touch events
    return;
  }

  // IMPORTANT: Prevent default immediately to stop pull-to-refresh
  // This must happen before the browser decides to start its native gesture
  e.preventDefault();

  // Store touch start state
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
  touchStartTime = Date.now();
  touchStartCell = cell;
  isTouchDragging = false;

  // Reset any previous selection state
  clearSelectedCells();

  // Start selection immediately for visual feedback
  isMouseDown = true;
  startCell = cell;
  endCell = cell;  // Initialize endCell to startCell for single-cell default
  startCell.classList.add("selected");
}

function handleTouchMove(e){
  if(!touchStartCell || e.touches.length === 0) return;

  const touch = e.touches[0];
  const target = document.elementFromPoint(touch.clientX, touch.clientY);

  // Calculate movement distance
  const deltaX = Math.abs(touch.clientX - touchStartX);
  const deltaY = Math.abs(touch.clientY - touchStartY);

  // Check if we've moved enough to consider this a drag
  if(deltaX > TOUCH_TAP_THRESHOLD || deltaY > TOUCH_TAP_THRESHOLD){
    isTouchDragging = true;
    // Only prevent default (scrolling) when we're actually dragging to create a block
    e.preventDefault();

    // Get the cell under the touch point
    const cell = target ? target.closest('td[data-time-slot]') : null;
    if(cell && !cell.dataset.blockId){
      clearSelectedCells();
      endCell = cell;
      markSelectedRange();
    }
  }
  // If not dragging yet, allow native scroll behavior
}

function handleTouchEnd(e){
  if(!touchStartCell) return;

  const touchDuration = Date.now() - touchStartTime;

  if(e.changedTouches.length > 0){
    const touch = e.changedTouches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    const cell = target ? target.closest('td[data-time-slot]') : null;

    if(isTouchDragging){
      // This was a drag - create a new block
      e.preventDefault();

      if(cell && !cell.dataset.blockId){
        endCell = cell;
        markSelectedRange();
      }

      isMouseDown = false;

      // Open popup to create block if we have a valid selection
      if(startCell && endCell){
        const startTd = startCell.closest("td");
        const endTd = endCell.closest("td");
        if(startTd && endTd && !startTd.dataset.blockId && !endTd.dataset.blockId){
          showBlockPopup(null);
        }
      }
    } else if(touchDuration < TOUCH_TAP_TIME_LIMIT){
      // This was a tap - handle as single cell selection for new block
      e.preventDefault();

      if(cell && !cell.dataset.blockId){
        endCell = cell;
        isMouseDown = false;
        showBlockPopup(null);
      }
    }
  }

  // Reset touch state
  touchStartCell = null;
  isTouchDragging = false;
  if(!overlay.classList.contains("active")){
    clearSelectedCells();
    isMouseDown = false;
    startCell = null;
    endCell = null;
  }
}

function markSelectedRange(){
  if(!startCell||!endCell)return;
  const startRow = startCell.parentElement.sectionRowIndex;
  const endRow = endCell.parentElement.sectionRowIndex;
  const minR = Math.min(startRow, endRow);
  const maxR = Math.max(startRow, endRow);

  const dailyBody = document.getElementById("daily-body");
  for (let r = minR; r <= maxR; r++) {
    if (!dailyBody.rows[r]) break;
    if (!dailyBody.rows[r].cells[1]) continue;
    dailyBody.rows[r].cells[1].classList.add("selected");
  }

  // Update time range preview
  updateTimeRangePreview(dailyBody, minR, maxR);
}

function updateTimeRangePreview(dailyBody, minRow, maxRow) {
  if (!timeRangePreview) return;

  const startLabel = dailyBody.rows[minRow]?.cells[0]?.textContent;
  const endLabel = dailyBody.rows[maxRow]?.cells[0]?.textContent;

  if (startLabel && endLabel) {
    // Calculate end time (next slot after endLabel)
    const endIndex = timeSlots.indexOf(endLabel);
    const endTimeLabel = (endIndex + 1 < timeSlots.length) ? timeSlots[endIndex + 1] : endLabel;

    timeRangePreview.textContent = `${startLabel} - ${endTimeLabel}`;
    timeRangePreview.classList.add("visible");
  }
}

function hideTimeRangePreview() {
  if (timeRangePreview) {
    timeRangePreview.classList.remove("visible");
  }
}

function clearSelectedCells(){
  document.querySelectorAll("td.selected").forEach(td=>td.classList.remove("selected"));
  hideTimeRangePreview();
}

/***************************************************
* Popup Create/Edit
**************************************************/
// Track the element that triggered the popup for focus return
let lastFocusedElement = null;

function showBlockPopup(blockData){
  // Store current focus to restore later
  lastFocusedElement = document.activeElement;

  overlay.classList.add("active");
  clearPopupFields();

  // Populate categories and templates dropdowns
  populateCategorySelect();
  populateTemplateSelect();

  // Focus the title input after a short delay (allows DOM to update)
  setTimeout(() => {
    blockTitleInput.focus();
  }, 100);

if (blockData) {
  // Edit mode
  popupTitle.textContent = "Edit Block";
  blockTitleInput.value = blockData.title || "";
  blockNotesInput.value = blockData.notes || "";
  recurringCheckbox.checked = !!blockData.recurring;
  recurrenceDaysDiv.style.display = blockData.recurring ? "flex" : "none";
  const carryoverLabel = document.getElementById("carryover-label");
  carryoverLabel.style.display = blockData.recurring ? "flex" : "none";
  document.getElementById("carryover-checkbox").checked = !!blockData.carryOver;

  // Set category value
  if (blockCategorySelect) {
    blockCategorySelect.value = blockData.category || "";
  }

  // Hide template section in edit mode (templates are for creating new blocks)
  if (templateSection) {
    templateSection.style.display = "none";
  }

  // Hide selected time display in edit mode (we show editable inputs instead)
  if (selectedTimeDisplay) {
    selectedTimeDisplay.style.display = "none";
  }

  // Show duplicate button in edit mode
  if (duplicateBtn) {
    duplicateBtn.style.display = "inline-block";
  }

  // Show time/date inputs for editing
  if (timeDateSection) {
    timeDateSection.style.display = "block";
    
    // Populate date and time if block has startTime
    if (blockData.startTime && !blockData.recurring) {
      const dateStr = blockData.startTime.split("T")[0];
      const startTime = blockData.startTime.split("T")[1].slice(0, 5);
      const endTime = blockData.endTime ? blockData.endTime.split("T")[1].slice(0, 5) : "";
      
      if (blockDateInput) blockDateInput.value = dateStr;
      if (blockStartTimeInput) blockStartTimeInput.value = startTime;
      if (blockEndTimeInput) blockEndTimeInput.value = endTime;
    } else {
      // For recurring blocks, show current date as default
      if (blockDateInput) blockDateInput.value = formatDate(currentDate);
      if (blockStartTimeInput) blockStartTimeInput.value = "";
      if (blockEndTimeInput) blockEndTimeInput.value = "";
    }
    
    // Disable date input for recurring blocks
    if (blockDateInput) {
      blockDateInput.disabled = !!blockData.recurring;
    }
  }

  deleteBtn.style.display = "inline-block"; // show delete in edit mode

  // Set the color picker value
  const blockColor = blockData.color || colorPresets[0];
  if (blockColorInput) {
    blockColorInput.value = blockColor;
  }
  if (blockColorHex) {
    blockColorHex.textContent = blockColor.toUpperCase();
  }

  // Update category color swatch and custom color visibility
  if (categoryColorSwatch && blockData.category) {
    const catColor = getCategoryColor(blockData.category);
    categoryColorSwatch.style.backgroundColor = catColor || 'transparent';
    // Hide custom color when category is set
    if (customColorSection) customColorSection.style.display = 'none';
  } else if (categoryColorSwatch) {
    categoryColorSwatch.style.backgroundColor = 'transparent';
    // Show custom color when no category
    if (customColorSection) customColorSection.style.display = '';
  }

  // Build tasks
  buildTaskList(blockData.tasks || []);

  // If recurring => check the days
  if (blockData.recurrenceDays) {
    recurrenceDaysDiv.querySelectorAll("input[type='checkbox']").forEach(chk => {
      chk.checked = blockData.recurrenceDays.includes(chk.value);
    });
  }
  editBlockId = blockData.id;
} else {
  // Create mode
  popupTitle.textContent = "Create Block";
  deleteBtn.style.display = "none"; // hide delete in create mode

  // Show selected time range if cells are selected
  if (selectedTimeDisplay && selectedTimeText) {
    try {
      if (startCell && endCell) {
        const timeRange = computeTimeRangeFromSelection();
        if (timeRange && timeRange.start && timeRange.end) {
          const dayName = getWeekdayName(currentDate);
          const dateParts = formatDate(currentDate).split("-");
          const formattedDate = `${dateParts[1]}/${dateParts[2]}`;
          const startTimeStr = timeRange.start.split("T")[1]?.slice(0, 5);
          const endTimeStr = timeRange.end.split("T")[1]?.slice(0, 5);
          if (startTimeStr && endTimeStr) {
            const startTime = convertTo12Hour(startTimeStr);
            const endTime = convertTo12Hour(endTimeStr);
            selectedTimeText.textContent = `${dayName}, ${formattedDate} • ${startTime} - ${endTime}`;
            selectedTimeDisplay.style.display = "flex";
          } else {
            selectedTimeDisplay.style.display = "none";
          }
        } else {
          selectedTimeDisplay.style.display = "none";
        }
      } else {
        selectedTimeDisplay.style.display = "none";
      }
    } catch (e) {
      console.error("Error computing time range:", e);
      selectedTimeDisplay.style.display = "none";
    }
  }

  // Reset category to none
  if (blockCategorySelect) {
    blockCategorySelect.value = "";
  }

  // Reset category color swatch
  if (categoryColorSwatch) {
    categoryColorSwatch.style.backgroundColor = 'transparent';
  }

  // Show custom color picker in create mode (no category selected by default)
  if (customColorSection) {
    customColorSection.style.display = '';
  }

  // Set default color picker value
  if (blockColorInput) {
    blockColorInput.value = colorPresets[0];
  }
  if (blockColorHex) {
    blockColorHex.textContent = colorPresets[0].toUpperCase();
  }

  // Show template section in create mode only if there are templates
  if (templateSection) {
    const hasTemplates = Array.isArray(blockTemplates) && blockTemplates.length > 0;
    templateSection.style.display = hasTemplates ? "block" : "none";
  }

  // Hide duplicate button in create mode
  if (duplicateBtn) {
    duplicateBtn.style.display = "none";
  }

  // Hide time/date inputs when creating (will use selection)
  if (timeDateSection) {
    timeDateSection.style.display = "none";
  }

  buildTaskList([]);
  editBlockId = null;
}
}

function hideOverlay(){
  overlay.classList.remove("active");
  clearSelectedCells();
  startCell = null;
  endCell = null;
  editBlockId = null;

  // Restore focus to the element that triggered the popup
  if (lastFocusedElement && lastFocusedElement.focus) {
    lastFocusedElement.focus();
    lastFocusedElement = null;
  }
}

function handleSaveBlock(){
const title = blockTitleInput.value.trim();
if(!title){
  alert("Please enter a block title.");
  return;
}
const notesVal = blockNotesInput.value.trim();
// Get color: use category color if category selected, otherwise use custom color picker
const selectedCategory = blockCategorySelect ? blockCategorySelect.value : "";
let colorVal;
if (selectedCategory) {
  colorVal = getCategoryColor(selectedCategory) || colorPresets[0];
} else {
  colorVal = blockColorInput ? blockColorInput.value : colorPresets[0];
}
const recurring = recurringCheckbox.checked;
const carryOver = document.getElementById("carryover-checkbox").checked;

const recDays = [];
if(recurring){
  recurrenceDaysDiv.querySelectorAll("input[type='checkbox']").forEach(chk=>{
    if(chk.value && chk.checked) recDays.push(chk.value);
  });
}

const tasksArr = gatherTasksFromUI();

let block = null;
if(editBlockId){
  block = timeBlocks.blocks.find(b => b.id===editBlockId);
  if(!block){ alert("Error: block not found."); return; }
  block.title = title;
  block.notes = notesVal;
  block.color = colorVal;
  block.recurring = recurring;
  block.recurrenceDays = recDays;
  block.carryOver = carryOver;
  block.category = blockCategorySelect ? blockCategorySelect.value : "";

  const oldTasks = block.tasks || [];
  block.tasks = tasksArr.map(t => {
    const old = oldTasks.find(o => o.text===t.text);
    return old ? { text:t.text, completed:old.completed } : t;
  });
  
  // Update time/date if provided in edit mode
  if (timeDateSection && timeDateSection.style.display !== "none") {
    const dateVal = blockDateInput ? blockDateInput.value : "";
    const startTimeVal = blockStartTimeInput ? blockStartTimeInput.value : "";
    const endTimeVal = blockEndTimeInput ? blockEndTimeInput.value : "";
    
    if (dateVal && startTimeVal && endTimeVal && !recurring) {
      // Validate time range using minutes for reliable comparison
      if (timeToMinutes(startTimeVal) >= timeToMinutes(endTimeVal)) {
        alert("End time must be after start time. Please enter a valid time range.");
        return;
      }

      // Validate duration limits
      const durationCheck = validateBlockDuration(startTimeVal, endTimeVal);
      if (!durationCheck.valid) {
        alert(durationCheck.message);
        return;
      }

      const newStartTime = `${dateVal}T${startTimeVal}:00`;
      const newEndTime = `${dateVal}T${endTimeVal}:00`;

      // Check for overlapping blocks
      const overlaps = checkForOverlap(newStartTime, newEndTime, editBlockId);
      if (overlaps.length > 0) {
        const proceed = confirm(`This block overlaps with: ${overlaps.join(", ")}\n\nDo you want to save anyway?`);
        if (!proceed) return;
      }

      // Update block times
      block.startTime = newStartTime;
      block.endTime = newEndTime;
    } else if (!recurring && (dateVal || startTimeVal || endTimeVal)) {
      // If any time field is filled but not all, show error
      if (dateVal || startTimeVal || endTimeVal) {
        alert("Please fill in Date, Start Time, and End Time, or leave all blank to keep current times.");
        return;
      }
    }
    // If all blank and not recurring, keep existing times
  }
} else {
  block = {
    id: generateUUID(),
    title,
    notes: notesVal,
    color: colorVal,
    recurring,
    carryOver,
    recurrenceDays: recDays,
    tasks: tasksArr,
    category: blockCategorySelect ? blockCategorySelect.value : ""
  };
  const {start, end} = computeTimeRangeFromSelection();
  // Validate time range using minutes for reliable comparison
  const startTime = start.split("T")[1].slice(0, 5);
  const endTime = end.split("T")[1].slice(0, 5);
  if (timeToMinutes(startTime) >= timeToMinutes(endTime)) {
    alert("End time must be after start time. Please select a valid time range.");
    return;
  }

  // Validate duration limits
  const durationCheck = validateBlockDuration(startTime, endTime);
  if (!durationCheck.valid) {
    alert(durationCheck.message);
    return;
  }

  // Check for overlapping blocks
  const overlaps = checkForOverlap(start, end);
  if (overlaps.length > 0) {
    const proceed = confirm(`This block overlaps with: ${overlaps.join(", ")}\n\nDo you want to create it anyway?`);
    if (!proceed) return;
  }

  block.startTime = start;
  block.endTime = end;
  timeBlocks.blocks.push(block);
}

saveBlocksToStorage(timeBlocks);
hideOverlay();

updateDailySubheader();
displayDailyBlocks();
highlightCurrentTime();
}
function handleDeleteBlock(){
  if(!editBlockId) return;

  // Find the block to get its title for the confirmation
  const blockToDelete = timeBlocks.blocks.find(b => b.id === editBlockId);
  const blockTitle = blockToDelete ? blockToDelete.title : "this block";

  // Show confirmation dialog
  if (!confirm(`Are you sure you want to delete "${blockTitle}"?\n\nThis action cannot be undone.`)) {
    return;
  }

  timeBlocks.blocks = timeBlocks.blocks.filter(b => b.id !== editBlockId);
  saveBlocksToStorage(timeBlocks);
  hideOverlay();
  updateDailySubheader();
  displayDailyBlocks();
  highlightCurrentTime();
}

function duplicateBlock(blockToDuplicate) {
  const newBlock = {
    id: generateUUID(),
    title: blockToDuplicate.title + " (Copy)",
    notes: blockToDuplicate.notes || "",
    color: blockToDuplicate.color || colorPresets[0],
    recurring: blockToDuplicate.recurring || false,
    recurrenceDays: blockToDuplicate.recurrenceDays ? [...blockToDuplicate.recurrenceDays] : [],
    carryOver: blockToDuplicate.carryOver || false,
    tasks: blockToDuplicate.tasks ? blockToDuplicate.tasks.map(t => ({ text: t.text, completed: false })) : [],
    startTime: blockToDuplicate.startTime,
    endTime: blockToDuplicate.endTime,
    category: blockToDuplicate.category || ""
  };
  
  timeBlocks.blocks.push(newBlock);
  saveBlocksToStorage(timeBlocks);
  displayDailyBlocks();
  highlightCurrentTime();
}

/***************************************************
* Single Cell Render (uses event delegation - no individual listeners)
**************************************************/
function renderBlockContent(cell, block){
  cell.textContent = "";
  const colorVal = block.color || randomColor();
  block.color = colorVal;
  cell.style.backgroundColor = colorVal;
  cell.classList.add("block-cell");

  // Set block ID for event delegation
  cell.dataset.blockId = block.id;
  cell.setAttribute("draggable", "true");

  // Title
  const titleDiv = document.createElement("div");
  titleDiv.classList.add("block-title");
  titleDiv.textContent = block.title || "Untitled";
  cell.appendChild(titleDiv);

  // Tasks - only show if there are tasks
  const tasks = block.tasks || [];
  if (tasks.length > 0) {
    const tasksBox = document.createElement("div");
    tasksBox.classList.add("tasks-box");
    const tasksDiv = document.createElement("div");
    tasksDiv.classList.add("tasks-container");
    tasksBox.appendChild(tasksDiv);
    cell.appendChild(tasksBox);

    tasks.forEach(task => {
      const label = document.createElement("label");
      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.checked = !!task.completed;

      const span = document.createElement("span");
      span.textContent = task.text;
      if (task.completed) span.classList.add("strike");

      label.appendChild(cb);
      label.appendChild(span);
      tasksDiv.appendChild(label);
    });
  }

  // Notes - only show if there are notes, otherwise show add button
  const hasNotes = block.notes && block.notes.trim().length > 0;

  if (hasNotes) {
    const notesBox = document.createElement("div");
    notesBox.classList.add("notes-box");
    const notesArea = document.createElement("textarea");
    notesArea.value = block.notes || "";
    notesArea.rows = 2;
    notesBox.appendChild(notesArea);
    cell.appendChild(notesBox);
  } else {
    // Add notes button
    const addNotesBtn = document.createElement("button");
    addNotesBtn.classList.add("add-notes-btn");
    addNotesBtn.textContent = "+ Notes";
    addNotesBtn.type = "button";
    addNotesBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      // Replace button with notes textarea
      const notesBox = document.createElement("div");
      notesBox.classList.add("notes-box");
      const notesArea = document.createElement("textarea");
      notesArea.value = "";
      notesArea.rows = 2;
      notesArea.placeholder = "Add notes...";
      notesBox.appendChild(notesArea);
      addNotesBtn.replaceWith(notesBox);
      notesArea.focus();
      // Save on blur
      notesArea.addEventListener("blur", () => {
        if (notesArea.value.trim()) {
          block.notes = notesArea.value;
          saveBlocksToStorage(timeBlocks);
        } else {
          // If empty, remove and show button again
          displayDailyBlocks();
        }
      });
    });
    cell.appendChild(addNotesBtn);
  }
}

function reorderBlocks(sourceBlock, targetBlock) {
  const sourceIndex = timeBlocks.blocks.findIndex(b => b.id === sourceBlock.id);
  const targetIndex = timeBlocks.blocks.findIndex(b => b.id === targetBlock.id);
  
  if (sourceIndex === -1 || targetIndex === -1) return;
  
  // Swap the blocks
  [timeBlocks.blocks[sourceIndex], timeBlocks.blocks[targetIndex]] = 
    [timeBlocks.blocks[targetIndex], timeBlocks.blocks[sourceIndex]];
  
  saveBlocksToStorage(timeBlocks);
  displayDailyBlocks();
}
function getCurrentDayBlocks(){
const todayStr = formatDate(currentDate);
return timeBlocks.blocks.filter(b => {
  if(b.archived)return false;
  if(b.recurring && b.recurrenceDays && b.recurrenceDays.length>0){
    return b.recurrenceDays.includes(getWeekdayName(currentDate));
  } else {
    if(!b.startTime)return false;
    return (b.startTime.split("T")[0] === todayStr);
  }
});
}

/***************************************************
* Tasks
**************************************************/
function buildTaskList(tasks){
taskListContainer.innerHTML = "";
tasks.forEach(t => addTaskRow(t.text));
if(!tasks.length) addTaskRow("");
}
function addTaskRow(taskText){
const rowDiv = document.createElement("div");
rowDiv.className = "task-row";

const input = document.createElement("input");
input.type = "text";
input.value = taskText || "";
input.name = "taskInput";
rowDiv.appendChild(input);

const removeBtn = document.createElement("button");
removeBtn.type = "button";
removeBtn.className = "task-remove-btn";
removeBtn.textContent = "🗑️";
removeBtn.addEventListener("click", () => rowDiv.remove());
rowDiv.appendChild(removeBtn);

taskListContainer.appendChild(rowDiv);

// Scroll to the newly added task input
setTimeout(() => {
  input.focus();
  input.scrollIntoView({ behavior: "smooth", block: "end" });
  // Also scroll the container to bottom to ensure the new task is fully visible
  taskListContainer.scrollTop = taskListContainer.scrollHeight;
}, 0);
}
function gatherTasksFromUI(){
const tasks = [];
const rows = taskListContainer.querySelectorAll("div");
rows.forEach(div => {
  const inp = div.querySelector("input[type='text']");
  if(!inp)return;
  const txt = inp.value.trim();
  if(txt) tasks.push({text:txt, completed:false});
});
return tasks;
}

/***************************************************
* Settings
**************************************************/
function showSettings(){
settingsOverlay.classList.add("active");
buildTimeList();
buildColorsContainer();
updateNotificationUI();
}
function hideSettings(){
settingsOverlay.classList.remove("active");
highlightCurrentTime();
}
function buildTimeList(){
timeListDiv.innerHTML = "";
const usedLabels = findUsedTimeLabels();
timeSlots.forEach(label => {
  if(!label)return;
  const row = document.createElement("label");
  row.style.marginRight = "10px";
  const cb = document.createElement("input");
  cb.type = "checkbox";
  cb.checked = !hiddenTimes.includes(label);

  const cbId = "timeSlot-" + label.replace(/[^a-z0-9]/gi,'-');
  cb.id = cbId;
  row.setAttribute("for", cbId);

  if(usedLabels.has(label)){
    cb.disabled = true;
  }
  const span = document.createElement("span");
  span.textContent = label;

  cb.addEventListener("change", () => {
    if(cb.checked){
      hiddenTimes = hiddenTimes.filter(x => x!==label);
    } else {
      hiddenTimes.push(label);
    }
    saveHiddenTimesToStorage(hiddenTimes);
    // Immediately update the daily view
    buildDailyTable();
    setupBlockEventDelegation();
    displayDailyBlocks();
  });
  row.appendChild(cb);
  row.appendChild(span);
  timeListDiv.appendChild(row);
});
}
function findUsedTimeLabels(){
const set = new Set();
timeBlocks.blocks.forEach(b => {
  const [startHM, endHM] = parseBlockTimes(b);
  const start12 = convert24To12(startHM);
  const end12 = convert24To12(endHM);
  const range = findTimeRange12(start12, end12);
  range.forEach(lbl => set.add(lbl));
});
return set;
}
function buildColorsContainer(){
if (!colorsContainer) return;
colorsContainer.innerHTML = "";
colorPresets.forEach((c, index) => {
  const rowDiv = document.createElement("div");
  rowDiv.classList.add("color-row");

  const label = document.createElement("label");
  label.textContent = "Color " + (index+1) + ":";

  const inp = document.createElement("input");
  inp.type = "color";
  inp.value = c;
  const colorId = "colorInput-" + index;
  inp.id = colorId;
  inp.name = "presetColor" + index;
  label.setAttribute("for", colorId);

  inp.addEventListener("change", () => {
    colorPresets[index] = inp.value;
    saveColorPresetsToStorage(colorPresets);
    populateColorCheckboxes();
    displayDailyBlocks();
  });

  rowDiv.appendChild(label);
  rowDiv.appendChild(inp);

  const removeBtn = document.createElement("button");
  removeBtn.textContent = "🗑️";
  removeBtn.style.color = "red";
  removeBtn.style.background = "transparent";
  removeBtn.style.border = "none";
  removeBtn.style.cursor = "pointer";
  removeBtn.addEventListener("click", () => rowDiv.remove());
  removeBtn.addEventListener("touchend", () => rowDiv.remove());
  rowDiv.appendChild(removeBtn);

  colorsContainer.appendChild(rowDiv);
});
}
function populateColorCheckboxes(){
// Legacy function - color checkboxes replaced with color picker
const container = document.getElementById("block-color-options");
if (!container) return;
// We'll let user pick only one color at a time, so we do checkboxes but enforce unchecking
colorPresets.forEach((c, index) => {
  const label = document.createElement("label");
  label.style.display = "flex";
  label.style.alignItems = "center";
  label.style.cursor = "pointer";
  label.style.gap = "6px";

  const cb = document.createElement("input");
  cb.type = "checkbox";
  cb.value = c;
  cb.style.accentColor = c;

  // when one is checked => uncheck others
  cb.addEventListener("change", () => {
    if(cb.checked){
      // uncheck all other color checkboxes
      container.querySelectorAll('input[type="checkbox"]').forEach(other => {
        if(other !== cb) other.checked = false;
      });
    }
  });

  // show color square or text
  const span = document.createElement("span");
  span.textContent = c;
  span.style.backgroundColor = c;
  span.style.padding = "2px 6px";
  span.style.borderRadius = "4px";
  span.style.color = "#000";

  label.appendChild(cb);
  label.appendChild(span);
  container.appendChild(label);
});
}

/***************************************************
*  Time / Utility
**************************************************/
function parseBlockTimes(block){
  const startHM = block.startTime.split("T")[1].slice(0,5);
  const endHM = block.endTime.split("T")[1].slice(0,5);
  return [startHM, endHM];
}

/// Convert time string (HH:MM) to minutes since midnight for reliable comparison
function timeToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

// Block duration limits are imported from modules/utils.js

// Validate block duration
function validateBlockDuration(startTime, endTime) {
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);
  const duration = endMinutes - startMinutes;

  if (duration < MIN_BLOCK_DURATION) {
    return {
      valid: false,
      message: `Block duration must be at least ${MIN_BLOCK_DURATION} minutes (30 min). Current duration: ${duration} minutes.`
    };
  }

  if (duration > MAX_BLOCK_DURATION) {
    const maxHours = MAX_BLOCK_DURATION / 60;
    const durationHours = Math.floor(duration / 60);
    const durationMins = duration % 60;
    return {
      valid: false,
      message: `Block duration cannot exceed ${maxHours} hours. Current duration: ${durationHours}h ${durationMins}m.`
    };
  }

  return { valid: true };
}

// Check if two time ranges overlap
function timesOverlap(start1, end1, start2, end2) {
  const s1 = timeToMinutes(start1);
  const e1 = timeToMinutes(end1);
  const s2 = timeToMinutes(start2);
  const e2 = timeToMinutes(end2);
  return s1 < e2 && s2 < e1;
}

// Check if a block overlaps with any existing blocks on the same day
// Returns array of overlapping block titles, or empty array if no overlaps
function checkForOverlap(startTime, endTime, excludeBlockId = null) {
  const dateStr = startTime.split("T")[0];
  const newStart = startTime.split("T")[1].slice(0, 5);
  const newEnd = endTime.split("T")[1].slice(0, 5);
  const dayName = getWeekdayName(new Date(dateStr + "T00:00:00"));

  const overlappingBlocks = [];

  timeBlocks.blocks.forEach(block => {
    // Skip the block being edited
    if (block.id === excludeBlockId) return;
    // Skip archived blocks
    if (block.archived) return;

    let blockApplies = false;

    // Check if this is a recurring block that applies to this day
    if (block.recurring && block.recurrenceDays && block.recurrenceDays.length > 0) {
      blockApplies = block.recurrenceDays.includes(dayName);
    } else if (block.startTime) {
      // Non-recurring block - check if it's on the same date
      blockApplies = block.startTime.split("T")[0] === dateStr;
    }

    if (blockApplies && block.startTime && block.endTime) {
      const blockStart = block.startTime.split("T")[1].slice(0, 5);
      const blockEnd = block.endTime.split("T")[1].slice(0, 5);

      if (timesOverlap(newStart, newEnd, blockStart, blockEnd)) {
        overlappingBlocks.push(block.title || "Untitled");
      }
    }
  });

  return overlappingBlocks;
}

function computeTimeRangeFromSelection(){
if (!startCell || !endCell) return null;

const dateStr = formatDate(currentDate);

// Get the actual td elements (in case startCell/endCell are child elements)
const startTd = startCell.closest ? startCell.closest("td") : startCell;
const endTd = endCell.closest ? endCell.closest("td") : endCell;

if (!startTd || !endTd || !startTd.parentElement || !endTd.parentElement) return null;

const startRow = startTd.parentElement.sectionRowIndex;
const endRow = endTd.parentElement.sectionRowIndex;

// Validate row indices are valid numbers
if (startRow === undefined || endRow === undefined ||
    typeof startRow !== 'number' || typeof endRow !== 'number' ||
    isNaN(startRow) || isNaN(endRow) ||
    startRow < 0 || endRow < 0) return null;

const minR = Math.min(startRow, endRow);
const maxR = Math.max(startRow, endRow);

// Sanity check: block shouldn't span more than 48 slots (full day)
if (maxR - minR > 48) {
  console.warn('computeTimeRangeFromSelection: Invalid range detected, resetting to start cell only');
  return null;
}

const dailyBody = document.getElementById("daily-body");
if (!dailyBody || !dailyBody.rows[minR] || !dailyBody.rows[maxR]) return null;

const startLabel = dailyBody.rows[minR].cells[0]?.textContent;
const endLabel = dailyBody.rows[maxR].cells[0]?.textContent;

if (!startLabel || !endLabel) return null;

const endIndex = timeSlots.indexOf(endLabel) + 1;
const endLabel2 = (endIndex < timeSlots.length) ? timeSlots[endIndex] : endLabel;

const startTime24 = convert12To24(startLabel);
const endTime24 = convert12To24(endLabel2);

if (!startTime24 || !endTime24) return null;

return {
  start: dateStr + "T" + startTime24 + ":00",
  end: dateStr + "T" + endTime24 + ":00"
};
}
function findTableRowIndex(tbody, label){
for(let i=0; i<tbody.rows.length; i++){
  if(tbody.rows[i].cells[0].textContent===label) return i;
}
return -1;
}
function computeRowSpan(tbody, range){
let count=0;
let started=false;
for(let i=0; i<tbody.rows.length; i++){
  const lbl = tbody.rows[i].cells[0].textContent;
  if(lbl===range[0]){
    started=true; count++;
  } else if(started){
    if(lbl===range[range.length-1]){
      count++;
      break;
    }
    count++;
  }
}
return count;
}
function highlightCurrentTime(){
document.querySelectorAll(".current-time").forEach(el=>el.classList.remove("current-time"));
const now = new Date();
const hh = String(now.getHours()).padStart(2,"0");
const mm = now.getMinutes()<30?"00":"30";
const label24= hh + ":" + mm;
const label12= convert24To12(label24);

const dailyBody=document.getElementById("daily-body");
for(let r=0; r<dailyBody.rows.length; r++){
  if(dailyBody.rows[r].cells[0].textContent===label12){
    dailyBody.rows[r].classList.add("current-time");
    break;
  }
}
}
// Update current time highlight every 5 minutes
setInterval(highlightCurrentTime, 300000);

function generateTimeSlots12(){
const arr=[];
let hour=0; let minute=0;
for(let i=0; i<48; i++){
  arr.push(convert24To12(`${String(hour).padStart(2,"0")}:${String(minute).padStart(2,"0")}`));
  minute+=30;
  if(minute===60){minute=0;hour++;}
}
return arr;
}
function convert24To12(hhmm){
const [H,M] = hhmm.split(":").map(x=>parseInt(x,10));
const ampm = (H>=12)?"PM":"AM";
let hh = H%12; if(hh===0)hh=12;
return `${hh}:${(M===0?"00":"30")} ${ampm}`;
}
function convert12To24(label){
const parts=label.split(" ");
if(parts.length<2) return "00:00";
const hm=parts[0].split(":");
let hour = parseInt(hm[0],10);
let minute = parseInt(hm[1],10);
const ampm = parts[1];
if(ampm==="PM" && hour<12) hour+=12;
if(ampm==="AM" && hour===12) hour=0;
return String(hour).padStart(2,"0") + ":" + String(minute).padStart(2,"0");
}
function findTimeRange12(startLabel, endLabel){
const startIdx=timeSlots.indexOf(startLabel);
const endIdx=timeSlots.indexOf(endLabel);
if(startIdx<0||endIdx<0) return [];
const range=[];
for(let i=startIdx; i<endIdx; i++){
  range.push(timeSlots[i]);
}
return range;
}
function formatDate(dt){
const y=dt.getFullYear();
const m=String(dt.getMonth()+1).padStart(2,"0");
const d=String(dt.getDate()).padStart(2,"0");
return `${y}-${m}-${d}`;
}
function getWeekdayName(dt){
const map=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
return map[dt.getDay()];
}
function generateUUID(){
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    const r = Math.random()*16|0, v = (c==="x"?r:(r&0x3|0x8));
    return v.toString(16);
  });
}
function randomColor(){
const r=100+Math.floor(Math.random()*156);
const g=100+Math.floor(Math.random()*156);
const b=100+Math.floor(Math.random()*156);
return `rgb(${r},${g},${b})`;
}
function clearPopupFields(){
blockTitleInput.value="";
blockNotesInput.value="";
recurringCheckbox.checked=false;
recurrenceDaysDiv.style.display="none";
recurrenceDaysDiv.querySelectorAll("input[type='checkbox']").forEach(chk=>chk.checked=false);
const carryoverLabel = document.getElementById("carryover-label");
carryoverLabel.style.display="none";
document.getElementById("carryover-checkbox").checked=false;
if (blockDateInput) {
  blockDateInput.value = formatDate(currentDate);
  blockDateInput.disabled = false;
}
if (blockStartTimeInput) blockStartTimeInput.value = "";
if (blockEndTimeInput) blockEndTimeInput.value = "";
taskListContainer.innerHTML="";
}

/***************************************************
* Export/Import Data
**************************************************/
function exportData(format = "json") {
  const data = {
    timeBlocks: timeBlocks,
    archivedBlocks: archivedBlocks,
    colorPresets: colorPresets,
    hiddenTimes: hiddenTimes,
    categories: categories,
    blockTemplates: blockTemplates,
    exportDate: new Date().toISOString()
  };
  
  let blob, filename, mimeType;
  
  if (format === "txt") {
    const txtContent = formatDataAsTxt(data);
    blob = new Blob([txtContent], { type: "text/plain" });
    filename = `time-blocking-backup-${formatDate(new Date())}.txt`;
    mimeType = "text/plain";
  } else {
    blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    filename = `time-blocking-backup-${formatDate(new Date())}.json`;
    mimeType = "application/json";
  }
  
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function formatDataAsTxt(data) {
  let txt = "TIME-BLOCKING DATA EXPORT\n";
  txt += "=".repeat(50) + "\n\n";
  txt += `Export Date: ${new Date(data.exportDate).toLocaleString()}\n\n`;
  
  txt += "ACTIVE BLOCKS\n";
  txt += "-".repeat(50) + "\n";
  if (data.timeBlocks.blocks && data.timeBlocks.blocks.length > 0) {
    data.timeBlocks.blocks.forEach((block, index) => {
      txt += `\nBlock ${index + 1}:\n`;
      txt += `  Title: ${block.title || "Untitled"}\n`;
      if (block.startTime) {
        const date = block.startTime.split("T")[0];
        const startTime = block.startTime.split("T")[1].slice(0, 5);
        const endTime = block.endTime ? block.endTime.split("T")[1].slice(0, 5) : "N/A";
        txt += `  Date: ${date}\n`;
        txt += `  Time: ${startTime} - ${endTime}\n`;
      }
      if (block.recurring) {
        txt += `  Recurring: Yes (${(block.recurrenceDays || []).join(", ")})\n`;
      }
      if (block.tasks && block.tasks.length > 0) {
        txt += `  Tasks:\n`;
        block.tasks.forEach((task, i) => {
          const status = task.completed ? "[✓]" : "[ ]";
          txt += `    ${status} ${task.text}\n`;
        });
      }
      if (block.notes) {
        txt += `  Notes: ${block.notes}\n`;
      }
      txt += "\n";
    });
  } else {
    txt += "No active blocks.\n\n";
  }
  
  txt += "ARCHIVED BLOCKS\n";
  txt += "-".repeat(50) + "\n";
  const archivedDays = Object.keys(data.archivedBlocks.days || {});
  if (archivedDays.length > 0) {
    archivedDays.forEach(day => {
      txt += `\n${day}:\n`;
      data.archivedBlocks.days[day].forEach((block, index) => {
        txt += `  Block ${index + 1}: ${block.title || "Untitled"}\n`;
        if (block.startTime) {
          const time = block.startTime.split("T")[1].slice(0, 5);
          txt += `    Time: ${time}\n`;
        }
      });
    });
  } else {
    txt += "No archived blocks.\n\n";
  }
  
  txt += "\nCATEGORIES\n";
  txt += "-".repeat(50) + "\n";
  if (data.categories && data.categories.length > 0) {
    data.categories.forEach(cat => {
      txt += `  ${cat.name} (${cat.color})\n`;
    });
  } else {
    txt += "No categories.\n";
  }

  txt += "\nTEMPLATES\n";
  txt += "-".repeat(50) + "\n";
  if (data.blockTemplates && data.blockTemplates.length > 0) {
    data.blockTemplates.forEach((tmpl, index) => {
      txt += `\nTemplate ${index + 1}: ${tmpl.title}\n`;
      if (tmpl.category) txt += `  Category: ${tmpl.category}\n`;
      if (tmpl.tasks && tmpl.tasks.length > 0) {
        txt += `  Tasks: ${tmpl.tasks.map(t => t.text).join(", ")}\n`;
      }
      if (tmpl.notes) txt += `  Notes: ${tmpl.notes}\n`;
    });
  } else {
    txt += "No templates.\n";
  }

  txt += "\nSETTINGS\n";
  txt += "-".repeat(50) + "\n";
  txt += `Color Presets: ${data.colorPresets.length} colors\n`;
  txt += `Hidden Times: ${data.hiddenTimes.length} time slots\n`;
  if (data.hiddenTimes && data.hiddenTimes.length > 0) {
    txt += `  Hidden: ${data.hiddenTimes.join(", ")}\n`;
  }

  return txt;
}

function parseTxtImport(txtContent) {
  // Try to parse as JSON first (in case it's JSON saved as .txt)
  try {
    return JSON.parse(txtContent);
  } catch (e) {
    // If not JSON, return a basic structure
    // Note: Full TXT parsing would be complex, so we'll prompt user to use JSON for import
    alert("TXT import is read-only. For full import functionality, please use JSON format.\n\nTo export as JSON, use the 'Export as JSON' button.");
    return null;
  }
}

function importData(data) {
  if (!data) return;

  if (confirm("This will replace all your current data. Are you sure?")) {
    if (data.timeBlocks) timeBlocks = data.timeBlocks;
    if (data.archivedBlocks) archivedBlocks = data.archivedBlocks;
    if (data.colorPresets) colorPresets = data.colorPresets;
    if (data.hiddenTimes) hiddenTimes = data.hiddenTimes;
    if (data.categories) categories = data.categories;
    if (data.blockTemplates) blockTemplates = data.blockTemplates;

    saveBlocksToStorage(timeBlocks);
    saveArchivedToStorage(archivedBlocks);
    saveColorPresetsToStorage(colorPresets);
    saveHiddenTimesToStorage(hiddenTimes);
    saveCategoriesToStorage(categories);
    saveTemplatesToStorage(blockTemplates);

    populateColorCheckboxes();
    buildColorsContainer();
    buildCategoriesContainer();
    populateCategorySelect();
    populateTemplateSelect();
    displayDailyBlocks();
    alert("Data imported successfully!");
  }
}

/***************************************************
* Search Functionality
**************************************************/
function performSearch(query) {
  const results = [];
  const allBlocks = [...timeBlocks.blocks, ...Object.values(archivedBlocks.days || {}).flat()];
  
  allBlocks.forEach(block => {
    if (block.title && block.title.toLowerCase().includes(query)) {
      results.push({ block, type: "title" });
    }
    if (block.notes && block.notes.toLowerCase().includes(query)) {
      results.push({ block, type: "notes" });
    }
    if (block.tasks) {
      block.tasks.forEach(task => {
        if (task.text && task.text.toLowerCase().includes(query)) {
          results.push({ block, type: "task", taskText: task.text });
        }
      });
    }
  });
  
  displaySearchResults(results, query);
}

function displaySearchResults(results, query) {
  if (!searchResults) return;
  searchResults.innerHTML = "";
  
  if (results.length === 0) {
    searchResults.innerHTML = "<p>No results found.</p>";
    if (searchOverlay) searchOverlay.classList.add("active");
    return;
  }
  
  // Remove duplicates (same block)
  const uniqueResults = [];
  const seenIds = new Set();
  results.forEach(r => {
    if (!seenIds.has(r.block.id || r.block.startTime)) {
      seenIds.add(r.block.id || r.block.startTime);
      uniqueResults.push(r);
    }
  });
  
  uniqueResults.forEach(result => {
    const item = document.createElement("div");
    item.classList.add("search-result-item");
    
    const title = document.createElement("div");
    title.style.fontWeight = "bold";
    title.textContent = result.block.title || "Untitled";
    item.appendChild(title);
    
    const info = document.createElement("div");
    info.style.fontSize = "0.9rem";
    info.style.color = "#666";
    if (result.block.startTime) {
      const date = result.block.startTime.split("T")[0];
      const time = result.block.startTime.split("T")[1].slice(0, 5);
      info.textContent = `${date} at ${time}`;
    }
    item.appendChild(info);
    
    if (result.type === "notes" && result.block.notes) {
      const notesPreview = document.createElement("div");
      notesPreview.style.fontSize = "0.85rem";
      notesPreview.style.color = "#888";
      notesPreview.style.marginTop = "0.25rem";
      notesPreview.textContent = result.block.notes.substring(0, 100) + (result.block.notes.length > 100 ? "..." : "");
      item.appendChild(notesPreview);
    }
    
    item.addEventListener("click", () => {
      if (result.block.startTime) {
        const blockDate = new Date(result.block.startTime);
        currentDate = blockDate;
        dailyView.classList.add("active");
        statisticsView.classList.remove("active");
        archiveView.classList.remove("active");
        updateDailySubheader();
        displayDailyBlocks();
        highlightCurrentTime();
      }
      if (searchOverlay) searchOverlay.classList.remove("active");
      if (searchContainer) searchContainer.style.display = "none";
      if (searchInput) searchInput.value = "";
    });
    
    searchResults.appendChild(item);
  });
  
  if (searchOverlay) searchOverlay.classList.add("active");
}

/***************************************************
* Statistics
**************************************************/
function buildStatistics() {
  if (!statisticsContent) return;
  const allBlocks = timeBlocks.blocks.filter(b => !b.archived);
  const allArchived = Object.values(archivedBlocks.days || {}).flat();
  const totalBlocks = allBlocks.length + allArchived.length;
  
  let totalTasks = 0;
  let completedTasks = 0;
  let totalTimeMinutes = 0;
  
  [...allBlocks, ...allArchived].forEach(block => {
    if (block.tasks) {
      totalTasks += block.tasks.length;
      completedTasks += block.tasks.filter(t => t.completed).length;
    }
    if (block.startTime && block.endTime) {
      const start = new Date(block.startTime);
      const end = new Date(block.endTime);
      const minutes = (end - start) / (1000 * 60);
      totalTimeMinutes += minutes;
    }
  });
  
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const totalHours = Math.floor(totalTimeMinutes / 60);
  const remainingMinutes = Math.round(totalTimeMinutes % 60);
  
  statisticsContent.innerHTML = `
    <div class="stat-card">
      <h3>Total Blocks</h3>
      <div class="stat-value">${totalBlocks}</div>
      <div class="stat-label">${allBlocks.length} active, ${allArchived.length} archived</div>
    </div>
    <div class="stat-card">
      <h3>Task Completion</h3>
      <div class="stat-value">${completionRate}%</div>
      <div class="stat-label">${completedTasks} of ${totalTasks} tasks completed</div>
    </div>
    <div class="stat-card">
      <h3>Total Time Scheduled</h3>
      <div class="stat-value">${totalHours}h ${remainingMinutes}m</div>
      <div class="stat-label">Across all time blocks</div>
    </div>
  `;
}

/***************************************************
* Print View
**************************************************/
function showPrintView() {
  // Hide all other views
  dailyView.classList.remove("active");
  if (statisticsView) statisticsView.classList.remove("active");
  archiveView.classList.remove("active");
  settingsOverlay.classList.remove("active");
  
  // Show print view
  if (printView) {
    printView.classList.add("active");
    buildPrintView();
  }
}

function buildPrintView() {
  if (!printContent || !printDateRange || !printTimestamp) return;
  
  const allBlocks = timeBlocks.blocks.filter(b => !b.archived);
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 7); // Show last 7 days + next 7 days
  
  printDateRange.textContent = `Schedule Overview - ${formatDate(startDate)} to ${formatDate(today)}`;
  printTimestamp.textContent = new Date().toLocaleString();
  
  let html = "";
  
  // Group blocks by date
  const blocksByDate = {};
  allBlocks.forEach(block => {
    if (block.recurring && block.recurrenceDays) {
      // For recurring blocks, show them for each day they occur
      for (let i = -7; i <= 7; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() + i);
        const dayName = getWeekdayName(checkDate);
        if (block.recurrenceDays.includes(dayName)) {
          const dateStr = formatDate(checkDate);
          if (!blocksByDate[dateStr]) blocksByDate[dateStr] = [];
          blocksByDate[dateStr].push({ ...block, displayDate: dateStr });
        }
      }
    } else if (block.startTime) {
      const dateStr = block.startTime.split("T")[0];
      if (!blocksByDate[dateStr]) blocksByDate[dateStr] = [];
      blocksByDate[dateStr].push(block);
    }
  });
  
  // Sort dates
  const sortedDates = Object.keys(blocksByDate).sort();
  
  if (sortedDates.length === 0) {
    html = "<p style='text-align: center; color: #999;'>No blocks scheduled.</p>";
  } else {
    sortedDates.forEach(dateStr => {
      const dateParts = dateStr.split("-");
      const formattedDate = `${dateParts[1]}/${dateParts[2]}/${dateParts[0]}`;
      const dayName = getWeekdayName(new Date(dateStr + "T00:00:00"));
      
      html += `<div class="print-day-section">`;
      html += `<h2>${dayName}, ${formattedDate}</h2>`;
      
      const dayBlocks = blocksByDate[dateStr].sort((a, b) => {
        if (!a.startTime) return 1;
        if (!b.startTime) return -1;
        return a.startTime.localeCompare(b.startTime);
      });
      
      dayBlocks.forEach(block => {
        html += `<div class="print-block">`;
        html += `<div class="print-block-header">`;
        if (block.startTime) {
          const time = block.startTime.split("T")[1].slice(0, 5);
          const endTime = block.endTime ? block.endTime.split("T")[1].slice(0, 5) : "";
          html += `<span class="print-time">${time}${endTime ? ` - ${endTime}` : ""}</span>`;
        }
        html += `<span class="print-title">${block.title || "Untitled"}</span>`;
        if (block.recurring) {
          html += `<span class="print-recurring">(Recurring)</span>`;
        }
        html += `</div>`;
        
        if (block.tasks && block.tasks.length > 0) {
          html += `<ul class="print-tasks">`;
          block.tasks.forEach(task => {
            const checked = task.completed ? "✓" : "○";
            html += `<li>${checked} ${task.text}</li>`;
          });
          html += `</ul>`;
        }
        
        if (block.notes) {
          html += `<p class="print-notes">${block.notes}</p>`;
        }
        
        html += `</div>`;
      });
      
      html += `</div>`;
    });
  }
  
  printContent.innerHTML = html;
  
  // Small delay to ensure DOM is updated, then trigger print dialog
  setTimeout(() => {
    window.print();
  }, 200);
}
