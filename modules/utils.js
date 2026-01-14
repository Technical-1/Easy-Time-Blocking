/**
 * Utils Module - Common utility functions
 */

// Generate UUID v4
export function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Format date as YYYY-MM-DD
export function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Get weekday name
export function getWeekdayName(date) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
}

// Convert time string (HH:MM) to minutes since midnight
export function timeToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

// Convert 24-hour time to 12-hour format
export function convertTo12Hour(time24) {
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
}

// Generate random hex color
export function randomColor() {
  return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
}

// Generate 12-hour time slots (half-hour increments)
export function generateTimeSlots12() {
  const slots = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let half = 0; half < 2; half++) {
      const mins = half === 0 ? '00' : '30';
      let displayHour = hour % 12;
      if (displayHour === 0) displayHour = 12;
      const ampm = hour < 12 ? 'AM' : 'PM';
      slots.push(`${displayHour}:${mins} ${ampm}`);
    }
  }
  return slots;
}

// Block duration limits (in minutes)
export const MIN_BLOCK_DURATION = 30; // 30 minutes minimum
export const MAX_BLOCK_DURATION = 480; // 8 hours maximum

// Validate block duration
export function validateBlockDuration(startTime, endTime) {
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
export function timesOverlap(start1, end1, start2, end2) {
  const s1 = timeToMinutes(start1);
  const e1 = timeToMinutes(end1);
  const s2 = timeToMinutes(start2);
  const e2 = timeToMinutes(end2);
  return s1 < e2 && s2 < e1;
}
