# Easy Time-Blocking App

A simple web-based time-blocking (scheduling) application that allows you to:
- Select time slots on a daily calendar by dragging/clicking (mobile or desktop).
- Create blocks containing tasks, notes, color labels, and recurring options.
- Easily archive past days automatically for future reference.
- Optionally hide or show certain time slots.
- Customize color presets for your blocks.

---

## Features

1. **Daily View**:  
   - Displays a list of time slots (default every half hour, 12-hour format).  
   - You can hide certain times via [Settings](#settings).
   - Simply drag on a range of cells to create a new block, or click/tap on an existing block to edit.

2. **Tasks & Notes**:  
   - Each block can have multiple tasks (with completion checkboxes) and a notes area.  
   - Once all tasks in a day are completed, you get a celebratory "cookie" message.

3. **Recurring Blocks**:  
   - Blocks can be set to recur on specific weekdays (e.g. every Monday & Wednesday).  
   - Recurring blocks automatically appear on those weekdays.  

4. **Archive**:  
   - Blocks from past dates are automatically archived.  
   - An archive view allows you to select a past day and see its schedule.

5. **Customization**:  
   - Choose from preset colors (or define new ones) in [Settings](#settings).  
   - Hide times that you don't use from the daily schedule.

6. **Mobile Friendly**:  
   - Touch-drag is supported for creating new blocks.  
   - Tapping on checkboxes or notes areas is recognized to allow edits.

---

## Technical Details
### Local Storage:
#### Data is saved as JSON in localStorage:
- timeBlocks for the main schedule.
- archivedBlocks for older days.
- colorPresets for user-defined block colors.
- hiddenTimes for time slots you prefer to hide.
