# Easy Time-Blocking App

A simple, powerful web-based time-blocking application that helps you organize your day by scheduling tasks into dedicated time blocks. Perfect for improving focus, productivity, and time management.

🌐 **Live Demo**: [https://technical-1.github.io/Easy-Time-Blocking/](https://technical-1.github.io/Easy-Time-Blocking/)

## Usage Tips

- **Start Small**: Begin by blocking just 2-4 hours a day, then gradually expand
- **Leave Buffer Time**: Don't plan every minute - leave some flexible time for unexpected tasks
- **Use Colors Wisely**: Color-code by activity type (work, personal, exercise, etc.)
- **Review Regularly**: Check your Statistics to see patterns in your time allocation
- **Be Flexible**: Adjust blocks as needed - time blocking should help, not stress you out

## Features

### 📅 Daily View
- **Visual Schedule**: See your entire day laid out in a clear, visual format with 30-minute time slots (12-hour format)
- **Easy Block Creation**: Drag across time slots on desktop or touch-drag on mobile to create new blocks
- **Quick Editing**: Click or tap on any block to edit its details
- **Date Navigation**: Navigate between days with Previous Day, Today, and Next Day buttons
- **Keyboard Shortcuts**: 
  - Arrow keys (← →) to navigate dates
  - `T` or `Home` to jump to today
  - `Esc` to close modals

### ✅ Tasks & Notes
- **Task Management**: Add multiple tasks to each block with completion checkboxes
- **Notes Section**: Add contextual notes to each block
- **Task Completion**: Track your progress - complete all tasks in a day to see a celebratory message! 🍪
- **Inline Editing**: Edit notes directly in the schedule view

### 🔄 Recurring Blocks
- **Weekly Recurrence**: Set blocks to repeat on specific weekdays (e.g., every Monday & Wednesday)
- **Automatic Scheduling**: Recurring blocks automatically appear on their designated days
- **Carry Over**: Option to carry over tasks and notes from previous occurrences

### 🎨 Customization
- **Color Coding**: Organize different types of activities with customizable colors
- **Color Presets**: Define and manage your own color presets (up to 10 colors)
- **Hide Time Slots**: Customize your schedule by hiding unused time slots
- **Flexible Display**: Show only the times you actually use

### 📊 Statistics
- **Productivity Insights**: View statistics on your time blocking habits
- **Task Completion Rate**: Track how many tasks you've completed
- **Time Allocation**: See total time scheduled across all blocks
- **Block Counts**: View active and archived block counts

### 📚 Archive
- **Automatic Archiving**: Blocks from past dates are automatically archived
- **Historical View**: Browse archived days to review past schedules
- **Complete History**: Access your full time-blocking history

### 🔍 Search
- **Quick Search**: Search across all blocks by title, notes, or tasks
- **Search Results**: View and navigate to matching blocks
- **Comprehensive Search**: Searches both active and archived blocks

### ⚙️ Settings
- **Time Slot Management**: Show or hide specific time slots
- **Color Customization**: Add, remove, and customize block colors
- **Data Management**: 
  - Export your data as JSON or TXT
  - Import previously exported data
  - Print view for physical copies
- **Local Storage**: All data is stored locally in your browser

### 📖 About Page
- **Learn About Time Blocking**: Comprehensive guide on the benefits and challenges of time blocking
- **Best Practices**: Tips for finding the right balance between structure and flexibility
- **How It Helps**: Information on how time blocking improves productivity and focus

## Technical Details

### Data Storage
All data is stored locally in your browser's localStorage as JSON:
- `timeBlocks`: Active schedule blocks
- `archivedBlocks`: Historical blocks from past days
- `colorPresets`: Your custom color palette
- `hiddenTimes`: Time slots you've chosen to hide

### Privacy

This app runs entirely in your browser. All data is stored locally on your device. No data is sent to any server or third party. Your schedule is completely private.

### File Structure

```
Easy-Time-Blocking/
├── index.html          # Main HTML file
├── styles.css          # All styling
├── script.js           # Application logic
└── README.md           # This file
```



## Contributing

This is a simple, single-file application. Feel free to customize it for your own needs!

---

**Enjoy better time management with Time-Blocking!** 🎯
