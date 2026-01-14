/**
 * Notifications Module - Browser notification handling
 */

import { loadNotificationPreference, saveNotificationPreference } from './storage.js';
import { formatDate, getWeekdayName, timeToMinutes, convertTo12Hour } from './utils.js';

let notificationsEnabled = loadNotificationPreference();
let notifiedBlocks = new Set();
let timeBlocksRef = null;

// Set reference to timeBlocks (called from main)
export function setTimeBlocksRef(ref) {
  timeBlocksRef = ref;
}

export function initializeNotifications() {
  if (!("Notification" in window)) {
    console.log("Browser does not support notifications");
    return;
  }

  if (notificationsEnabled && Notification.permission === "granted") {
    startNotificationChecker();
  }
}

export function requestNotificationPermission() {
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

export function disableNotifications() {
  notificationsEnabled = false;
  saveNotificationPreference(false);
}

export function isNotificationsEnabled() {
  return notificationsEnabled && Notification.permission === "granted";
}

function startNotificationChecker() {
  setInterval(checkUpcomingBlocks, 60000);
  checkUpcomingBlocks();
}

function checkUpcomingBlocks() {
  if (!notificationsEnabled || Notification.permission !== "granted" || !timeBlocksRef) {
    return;
  }

  const now = new Date();
  const currentDateStr = formatDate(now);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const todayBlocks = timeBlocksRef.blocks.filter(block => {
    if (block.recurring) {
      const dayName = getWeekdayName(now);
      return block.recurrenceDays && block.recurrenceDays.includes(dayName);
    }
    return block.startTime && block.startTime.startsWith(currentDateStr);
  });

  todayBlocks.forEach(block => {
    if (!block.startTime) return;

    const startTime = block.startTime.split("T")[1].slice(0, 5);
    const blockStartMinutes = timeToMinutes(startTime);
    const notifyMinutes = blockStartMinutes - 5;
    const notificationKey = `${currentDateStr}-${block.id}`;

    if (currentMinutes >= notifyMinutes && currentMinutes < notifyMinutes + 1) {
      if (!notifiedBlocks.has(notificationKey)) {
        notifiedBlocks.add(notificationKey);
        showBlockNotification(block);
      }
    }
  });

  notifiedBlocks.forEach(key => {
    if (!key.startsWith(currentDateStr)) {
      notifiedBlocks.delete(key);
    }
  });
}

function showBlockNotification(block) {
  const startTime = block.startTime.split("T")[1].slice(0, 5);
  const endTime = block.endTime ? block.endTime.split("T")[1].slice(0, 5) : "";

  const start12 = convertTo12Hour(startTime);
  const end12 = endTime ? convertTo12Hour(endTime) : "";

  const notification = new Notification("Time Block Starting Soon", {
    body: `${block.title}\n${start12}${end12 ? " - " + end12 : ""}`,
    icon: "icon.svg",
    tag: block.id,
    requireInteraction: false
  });

  setTimeout(() => notification.close(), 10000);

  notification.onclick = function() {
    window.focus();
    notification.close();
  };
}
