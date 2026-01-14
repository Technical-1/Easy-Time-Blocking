/**
 * Storage Module - Handles all localStorage operations
 */

// Debounce utility function
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

// Internal save function
function _saveBlocksToStorageImmediate(obj) {
  try {
    localStorage.setItem("timeBlocks", JSON.stringify(obj));
  } catch (e) {
    console.error("Error saving blocks to storage:", e);
    alert("Unable to save data. Your browser storage may be full or disabled.");
  }
}

// Debounced save - waits 300ms after last call before saving
const _debouncedSaveBlocks = debounce(_saveBlocksToStorageImmediate, 300);

// Main save function - uses debounce for performance
export function saveBlocksToStorage(obj, immediate = false) {
  if (immediate) {
    _saveBlocksToStorageImmediate(obj);
  } else {
    _debouncedSaveBlocks(obj);
  }
}

export function loadBlocksFromStorage() {
  try {
    const data = localStorage.getItem("timeBlocks");
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error("Error loading blocks from storage:", e);
    return null;
  }
}

export function saveArchivedToStorage(obj) {
  try {
    localStorage.setItem("archivedBlocks", JSON.stringify(obj));
  } catch (e) {
    console.error("Error saving archived blocks:", e);
    alert("Unable to save archived data.");
  }
}

export function loadArchivedFromStorage() {
  try {
    const data = localStorage.getItem("archivedBlocks");
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error("Error loading archived blocks:", e);
    return null;
  }
}

export function loadColorPresetsFromStorage() {
  try {
    const data = localStorage.getItem("colorPresets");
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error("Error loading color presets:", e);
    return null;
  }
}

export function saveColorPresetsToStorage(arr) {
  try {
    localStorage.setItem("colorPresets", JSON.stringify(arr));
  } catch (e) {
    console.error("Error saving color presets:", e);
    alert("Unable to save color preferences.");
  }
}

export function loadHiddenTimesFromStorage() {
  try {
    const data = localStorage.getItem("hiddenTimes");
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error("Error loading hidden times:", e);
    return null;
  }
}

export function saveHiddenTimesToStorage(arr) {
  try {
    localStorage.setItem("hiddenTimes", JSON.stringify(arr));
  } catch (e) {
    console.error("Error saving hidden times:", e);
  }
}

export function loadCategoriesFromStorage() {
  try {
    const data = localStorage.getItem("etb_categories");
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error("Error loading categories:", e);
    return null;
  }
}

export function saveCategoriesToStorage(arr) {
  try {
    localStorage.setItem("etb_categories", JSON.stringify(arr));
  } catch (e) {
    console.error("Error saving categories:", e);
  }
}

export function loadTemplatesFromStorage() {
  try {
    const data = localStorage.getItem("etb_templates");
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error("Error loading templates:", e);
    return null;
  }
}

export function saveTemplatesToStorage(arr) {
  try {
    localStorage.setItem("etb_templates", JSON.stringify(arr));
  } catch (e) {
    console.error("Error saving templates:", e);
  }
}

export function loadThemePreference() {
  try {
    return localStorage.getItem("etb_theme") || "auto";
  } catch (e) {
    return "auto";
  }
}

export function saveThemePreference(theme) {
  try {
    localStorage.setItem("etb_theme", theme);
  } catch (e) {
    console.error("Error saving theme preference:", e);
  }
}

export function loadNotificationPreference() {
  try {
    return localStorage.getItem("etb_notifications") === "true";
  } catch (e) {
    return false;
  }
}

export function saveNotificationPreference(enabled) {
  try {
    localStorage.setItem("etb_notifications", enabled ? "true" : "false");
  } catch (e) {
    console.error("Failed to save notification preference:", e);
  }
}
