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
let draggedBlock = null;
let draggedBlockCell = null;
let touchStartX = 0;
let touchStartY = 0;

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

const timeListDiv = document.getElementById("time-list");
const colorsContainer = document.getElementById("colors-container");

const archiveListDiv = document.getElementById("archive-list");
const archiveBlocksBody = document.getElementById("archive-blocks-body");
const archivedDateSubheader = document.getElementById("archived-date-subheader");

const congratsMessage = document.getElementById("congrats-message");

let isMouseDown = false;
let startCell = null;
let endCell = null;

// 12-hour half-hour increments
const timeSlots = generateTimeSlots12();

// On load: auto-archive older blocks
autoArchiveOldBlocks();

// Build daily
buildDailyTable();
updateDailySubheader();
displayDailyBlocks();
highlightCurrentTime();

// Setup color select
populateColorCheckboxes();
buildColorsContainer();

// daily active by default
dailyView.classList.add("active");
btnDaily.classList.add("active");

/***************************************************
* Buttons
**************************************************/
btnDaily.addEventListener("click", () => {
dailyView.classList.add("active");
if (statisticsView) statisticsView.classList.remove("active");
archiveView.classList.remove("active");
if (aboutView) aboutView.classList.remove("active");
settingsOverlay.classList.remove("active");
// Update active button state
document.querySelectorAll(".view-buttons button").forEach(btn => btn.classList.remove("active"));
btnDaily.classList.add("active");
updateDailySubheader();
displayDailyBlocks();
highlightCurrentTime();
});
btnDaily.addEventListener("touchend", (e) => {
e.preventDefault();
dailyView.classList.add("active");
if (statisticsView) statisticsView.classList.remove("active");
archiveView.classList.remove("active");
if (aboutView) aboutView.classList.remove("active");
settingsOverlay.classList.remove("active");
// Update active button state
document.querySelectorAll(".view-buttons button").forEach(btn => btn.classList.remove("active"));
btnDaily.classList.add("active");
updateDailySubheader();
displayDailyBlocks();
highlightCurrentTime();
}, { passive: false });

if (btnStatistics) {
  btnStatistics.addEventListener("click", () => {
    dailyView.classList.remove("active");
    archiveView.classList.remove("active");
    if (aboutView) aboutView.classList.remove("active");
    settingsOverlay.classList.remove("active");
    // Update active button state
    document.querySelectorAll(".view-buttons button").forEach(btn => btn.classList.remove("active"));
    btnStatistics.classList.add("active");
    if (statisticsView) {
      statisticsView.classList.add("active");
      buildStatistics();
    }
  });
}

btnArchive.addEventListener("click", () => {
dailyView.classList.remove("active");
statisticsView.classList.remove("active");
if (aboutView) aboutView.classList.remove("active");
settingsOverlay.classList.remove("active");
archiveView.classList.add("active");
// Update active button state
document.querySelectorAll(".view-buttons button").forEach(btn => btn.classList.remove("active"));
btnArchive.classList.add("active");
buildArchiveList();
});
btnArchive.addEventListener("touchend", (e) => {
e.preventDefault();
dailyView.classList.remove("active");
statisticsView.classList.remove("active");
if (aboutView) aboutView.classList.remove("active");
settingsOverlay.classList.remove("active");
archiveView.classList.add("active");
// Update active button state
document.querySelectorAll(".view-buttons button").forEach(btn => btn.classList.remove("active"));
btnArchive.classList.add("active");
buildArchiveList();
}, { passive: false });

if (btnAbout) {
  btnAbout.addEventListener("click", () => {
    dailyView.classList.remove("active");
    if (statisticsView) statisticsView.classList.remove("active");
    archiveView.classList.remove("active");
    settingsOverlay.classList.remove("active");
    if (aboutView) aboutView.classList.add("active");
    // Update active button state
    document.querySelectorAll(".view-buttons button").forEach(btn => btn.classList.remove("active"));
    btnAbout.classList.add("active");
  });
  btnAbout.addEventListener("touchend", (e) => {
    e.preventDefault();
    dailyView.classList.remove("active");
    if (statisticsView) statisticsView.classList.remove("active");
    archiveView.classList.remove("active");
    settingsOverlay.classList.remove("active");
    if (aboutView) aboutView.classList.add("active");
    // Update active button state
    document.querySelectorAll(".view-buttons button").forEach(btn => btn.classList.remove("active"));
    btnAbout.classList.add("active");
  }, { passive: false });
}

if (btnSearch) {
  btnSearch.addEventListener("click", () => {
    if (searchContainer) {
      searchContainer.style.display = searchContainer.style.display === "none" ? "flex" : "none";
      if (searchContainer.style.display === "flex" && searchInput) {
        searchInput.focus();
      }
    }
  });
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
  const [startHM, endHM] = parseBlockTimes(block);
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
  renderBlockContent(blockCell, block);

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
  startTime: blockData.startTime,
  endTime: blockData.endTime
});
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
// Check if the user is tapping on a checkbox or a textarea
if(e.touches.length > 0){
  const touch = e.touches[0];
  const target = document.elementFromPoint(touch.clientX, touch.clientY);
  // If it's a checkbox or textarea, let it pass
  if(target && (target.matches('input[type="checkbox"]') || target.matches('textarea'))){
    return;
  }
}
e.preventDefault();
if(e.touches.length > 0){
  const touch = e.touches[0];
  const target = document.elementFromPoint(touch.clientX, touch.clientY);
  if(target){
    // Fake a "mousedown" event
    handleMouseDown({ target });
  }
}
}

function handleTouchMove(e){
// If touching a checkbox or a textarea, let default pass
if(e.touches.length > 0){
  const touch = e.touches[0];
  const target = document.elementFromPoint(touch.clientX, touch.clientY);
  if(target && (target.matches('input[type="checkbox"]') || target.matches('textarea'))){
    return;
  }
}
e.preventDefault();

if(e.touches.length > 0){
  const touch = e.touches[0];
  const target = document.elementFromPoint(touch.clientX, touch.clientY);
  if(target){
    // Fake a "mouseover" event
    handleMouseOver({ target });
  }
}
}

function handleTouchEnd(e){
// If ended on a checkbox or a textarea, let default pass
if(e.changedTouches.length > 0){
  const touch = e.changedTouches[0];
  const target = document.elementFromPoint(touch.clientX, touch.clientY);
  if(target && (target.matches('input[type="checkbox"]') || target.matches('textarea'))){
    return;
  }
}
e.preventDefault();

if(e.changedTouches.length > 0){
  const touch = e.changedTouches[0];
  const target = document.elementFromPoint(touch.clientX, touch.clientY);
  if(target){
    // Fake a "mouseup" event
    handleMouseUp({ target });
  }
}
}

function markSelectedRange(){
if(!startCell||!endCell)return;
const startRow = startCell.parentElement.rowIndex;
const endRow = endCell.parentElement.rowIndex;
const minR = Math.min(startRow, endRow);
const maxR = Math.max(startRow, endRow);

const dailyBody = document.getElementById("daily-body");
for (let r = minR; r <= maxR; r++) {
  if (!dailyBody.rows[r]) break;
  if (!dailyBody.rows[r].cells[1]) continue;
  dailyBody.rows[r].cells[1].classList.add("selected");
}
}
function clearSelectedCells(){
document.querySelectorAll("td.selected").forEach(td=>td.classList.remove("selected"));
}

/***************************************************
* Popup Create/Edit
**************************************************/
function showBlockPopup(blockData){
overlay.classList.add("active");
clearPopupFields();

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

  // Set the correct color checkbox
  const colorOptions = document.querySelectorAll("#block-color-options input[type='checkbox']");
  colorOptions.forEach(cb => {
    cb.checked = (cb.value === (blockData.color || colorPresets[0]));
  });

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
}

function handleSaveBlock(){
const title = blockTitleInput.value.trim();
if(!title){
  alert("Please enter a block title.");
  return;
}
const notesVal = blockNotesInput.value.trim();
let colorVal = colorPresets[0]; // default
const colorChecks = document.querySelectorAll("#block-color-options input[type='checkbox']");
colorChecks.forEach(cb => {
  if(cb.checked) colorVal = cb.value;
});
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
      // Validate time range
      if (startTimeVal >= endTimeVal) {
        alert("End time must be after start time. Please enter a valid time range.");
        return;
      }
      
      // Update block times
      block.startTime = `${dateVal}T${startTimeVal}:00`;
      block.endTime = `${dateVal}T${endTimeVal}:00`;
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
    tasks: tasksArr
  };
  const {start, end} = computeTimeRangeFromSelection();
  // Validate time range
  if (start >= end) {
    alert("End time must be after start time. Please select a valid time range.");
    return;
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
if(!editBlockId)return;
timeBlocks.blocks = timeBlocks.blocks.filter(b => b.id!==editBlockId);
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
    endTime: blockToDuplicate.endTime
  };
  
  timeBlocks.blocks.push(newBlock);
  saveBlocksToStorage(timeBlocks);
  displayDailyBlocks();
  highlightCurrentTime();
}

/***************************************************
* Single Cell Render
**************************************************/
function renderBlockContent(cell, block){
cell.textContent="";
const colorVal = block.color || randomColor();
block.color = colorVal;
cell.style.backgroundColor = colorVal;
cell.classList.add("block-cell");

const titleDiv = document.createElement("div");
titleDiv.classList.add("block-title");
titleDiv.textContent = block.title || "Untitled";
  
  // Right-click or long-press for context menu (duplicate)
  titleDiv.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    if (confirm("Duplicate this block?")) {
      duplicateBlock(block);
    }
  });
  
  // Drag to reorder
  cell.setAttribute("draggable", "true");
  cell.dataset.blockId = block.id;
  cell.addEventListener("dragstart", (e) => {
    draggedBlock = block;
    draggedBlockCell = cell;
    cell.classList.add("dragging");
    e.dataTransfer.effectAllowed = "move";
  });
  cell.addEventListener("dragend", () => {
    cell.classList.remove("dragging");
    draggedBlock = null;
    draggedBlockCell = null;
  });
  cell.addEventListener("dragover", (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  });
  cell.addEventListener("drop", (e) => {
    e.preventDefault();
    if (draggedBlock && draggedBlock.id !== block.id) {
      reorderBlocks(draggedBlock, block);
    }
  });
  
  titleDiv.addEventListener("click", () => {
    editBlockId = block.id;
    showBlockPopup(block);
  });
  // Add a touchend to allow block editing on mobile
  titleDiv.addEventListener("touchend", (e) => {
    e.preventDefault();
    editBlockId = block.id;
    showBlockPopup(block);
  }, { passive: false });
  cell.appendChild(titleDiv);

const tasksBox = document.createElement("div");
tasksBox.classList.add("tasks-box");
const tasksDiv = document.createElement("div");
tasksDiv.classList.add("tasks-container");
tasksBox.appendChild(tasksDiv);
cell.appendChild(tasksBox);

(block.tasks||[]).forEach(task => {
  const label = document.createElement("label");
  const cb = document.createElement("input");
  cb.type = "checkbox";
  cb.checked = !!task.completed;

  const span = document.createElement("span");
  span.textContent = task.text;
  if(task.completed) span.classList.add("strike");

  cb.addEventListener("change", () => {
    task.completed = cb.checked;
    if(cb.checked) span.classList.add("strike");
    else span.classList.remove("strike");
    saveBlocksToStorage(timeBlocks);
    // after changing a task => re-check if all tasks done
    const dayBlocks = getCurrentDayBlocks();
    checkAllTasksCompletion(dayBlocks);
  });

  label.appendChild(cb);
  label.appendChild(span);
  tasksDiv.appendChild(label);
});

const notesBox = document.createElement("div");
notesBox.classList.add("notes-box");
const notesArea = document.createElement("textarea");
notesArea.value = block.notes || "";
notesArea.rows = 2;
notesArea.addEventListener("blur", () => {
  block.notes = notesArea.value;
  saveBlocksToStorage(timeBlocks);
});
notesBox.appendChild(notesArea);
cell.appendChild(notesBox);

cell.dataset.blockId = block.id;
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
rowDiv.style.display = "flex";
rowDiv.style.gap = "6px";
rowDiv.style.marginBottom = "2px";

const inputLabel = document.createElement("label");
inputLabel.style.flex = "1";
inputLabel.style.display = "flex";

const input = document.createElement("input");
input.type = "text";
input.value = taskText || "";

const uniqueId = "task-" + Date.now() + "-" + Math.floor(Math.random()*1000);
input.id = uniqueId;
input.name = "taskInput";
inputLabel.setAttribute("for", uniqueId);
inputLabel.appendChild(input);
rowDiv.appendChild(inputLabel);

const removeBtn = document.createElement("button");
removeBtn.textContent = "🗑️";
removeBtn.style.color = "red";
removeBtn.style.background = "transparent";
removeBtn.style.border = "none";
removeBtn.style.cursor = "pointer";
removeBtn.addEventListener("click", () => rowDiv.remove());
removeBtn.addEventListener("touchend", () => rowDiv.remove());
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
const container = document.getElementById("block-color-options");
container.innerHTML = "";
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
* Archive / Old Days
**************************************************/
function loadArchivedFromStorage(){
const data = localStorage.getItem("archivedBlocks");
return data ? JSON.parse(data) : null;
}
function saveArchivedToStorage(obj){
localStorage.setItem("archivedBlocks", JSON.stringify(obj));
}

/***************************************************
*  Time / Utility
**************************************************/
function parseBlockTimes(block){
const startHM = block.startTime.split("T")[1].slice(0,5);
const endHM = block.endTime.split("T")[1].slice(0,5);
return [startHM, endHM];
}
function computeTimeRangeFromSelection(){
const dateStr = formatDate(currentDate);
const startRow = startCell.parentElement.rowIndex;
const endRow = endCell.parentElement.rowIndex;
const minR = Math.min(startRow, endRow);
const maxR = Math.max(startRow, endRow);

const dailyBody = document.getElementById("daily-body");
const startLabel = dailyBody.rows[minR].cells[0].textContent;
const endLabel = dailyBody.rows[maxR].cells[0].textContent;
const endIndex = timeSlots.indexOf(endLabel) + 1;
const endLabel2 = (endIndex < timeSlots.length) ? timeSlots[endIndex] : endLabel;
return {
  start: dateStr + "T" + convert12To24(startLabel) + ":00",
  end: dateStr + "T" + convert12To24(endLabel2) + ":00"
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
//setInterval(highlightCurrentTime,60000);

function loadBlocksFromStorage(){
const data = localStorage.getItem("timeBlocks");
return data ? JSON.parse(data) : null;
}
function saveBlocksToStorage(obj){
localStorage.setItem("timeBlocks", JSON.stringify(obj));
}
function loadColorPresetsFromStorage(){
const data = localStorage.getItem("colorPresets");
return data ? JSON.parse(data) : null;
}
function saveColorPresetsToStorage(arr){
localStorage.setItem("colorPresets", JSON.stringify(arr));
}
function loadHiddenTimesFromStorage(){
const data = localStorage.getItem("hiddenTimes");
return data ? JSON.parse(data) : [];
}
function saveHiddenTimesToStorage(arr){
localStorage.setItem("hiddenTimes", JSON.stringify(arr));
}

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
return "xxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
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
  
  txt += "\nSETTINGS\n";
  txt += "-".repeat(50) + "\n";
  txt += `Color Presets: ${data.colorPresets.length} colors\n`;
  txt += `Hidden Times: ${data.hiddenTimes.length} time slots\n`;
  
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
    
    saveBlocksToStorage(timeBlocks);
    saveArchivedToStorage(archivedBlocks);
    saveColorPresetsToStorage(colorPresets);
    saveHiddenTimesToStorage(hiddenTimes);
    
    populateColorCheckboxes();
    buildColorsContainer();
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
