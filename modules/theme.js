/**
 * Theme Module - Dark/Light mode handling
 */

import { loadThemePreference, saveThemePreference } from './storage.js';

export function initializeTheme() {
  const savedTheme = loadThemePreference();
  applyTheme(savedTheme);
  setupThemeListeners();
}

export function applyTheme(theme) {
  const root = document.documentElement;

  if (theme === "auto") {
    root.removeAttribute("data-theme");
  } else {
    root.setAttribute("data-theme", theme);
  }

  // Update radio buttons
  const themeRadios = document.querySelectorAll('input[name="theme"]');
  themeRadios.forEach(radio => {
    radio.checked = radio.value === theme;
  });

  saveThemePreference(theme);
}

function setupThemeListeners() {
  const themeRadios = document.querySelectorAll('input[name="theme"]');
  themeRadios.forEach(radio => {
    radio.addEventListener("change", (e) => {
      if (e.target.checked) {
        applyTheme(e.target.value);
      }
    });
  });
}

export function getCurrentTheme() {
  return loadThemePreference();
}
