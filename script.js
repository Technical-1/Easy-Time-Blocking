
    /********************************************************
     * TIME-BLOCKING APP (Refined with archive day table
     *   and "Congrats" cookie message on all tasks done)
     ********************************************************/
    
    function updateDailySubheader(){
        const dayName = getWeekdayName(currentDate);
        dailySubheader.textContent = "Daily Schedule for " + dayName + ", " + formatDate(currentDate);
      }
  
      let timeBlocks = loadBlocksFromStorage() || { blocks: [] };
      let archivedBlocks = loadArchivedFromStorage() || { days: {} };
      let colorPresets = loadColorPresetsFromStorage() || [
        "#FF5733","#FFC300","#DAF7A6","#9AECDB","#A569BD",
        "#F1948A","#85C1E9","#F8C471","#82E0AA","#F9E79F"
      ];
      let hiddenTimes = loadHiddenTimesFromStorage() || [];
  
      let currentDate = new Date();
      let editBlockId = null;
  
      // UI references
      const dailyView = document.getElementById("daily-view");
      const dailySubheader = document.getElementById("daily-subheader");
      const archiveView = document.getElementById("archive-view");
      const overlay = document.getElementById("overlay");
      const settingsOverlay = document.getElementById("settings-overlay");
  
      const taskListContainer = document.getElementById("task-list-container");
      const addTaskBtn = document.getElementById("add-task-btn");
      const popupTitle = document.getElementById("popup-title");
      const blockTitleInput = document.getElementById("block-title");
      const blockNotesInput = document.getElementById("block-notes");
      let colorVal = colorPresets[0]; 
      const recurringCheckbox = document.getElementById("recurring-checkbox");
      const recurrenceDaysDiv = document.getElementById("recurrence-days");
      const saveBtn = document.getElementById("save-btn");
      const deleteBtn = document.getElementById("delete-btn");
      const cancelBtn = document.getElementById("cancel-btn");
  
      const btnDaily = document.getElementById("btn-daily");
      const btnArchive = document.getElementById("btn-archive");
      const btnSettings = document.getElementById("btn-settings");
      const closeSettingsBtn = document.getElementById("close-popup-settings-btn");
      const closePopupBtn = document.getElementById("close-popup-btn");
  
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
  
      /***************************************************
       * Buttons
       **************************************************/
      btnDaily.addEventListener("click", () => {
        dailyView.classList.add("active");
        archiveView.classList.remove("active");
        settingsOverlay.classList.remove("active");
        updateDailySubheader();
        displayDailyBlocks();
        highlightCurrentTime();
      });
  
      btnArchive.addEventListener("click", () => {
        dailyView.classList.remove("active");
        settingsOverlay.classList.remove("active");
        archiveView.classList.add("active");
        buildArchiveList();
      });
  
      btnSettings.addEventListener("click", (e) => { e.preventDefault(); showSettings(); });
      closeSettingsBtn.addEventListener("click", hideSettings);
  
      addTaskBtn.addEventListener("click", () => addTaskRow(""));
      recurringCheckbox.addEventListener("change", () => {
        recurrenceDaysDiv.style.display = recurringCheckbox.checked ? "flex" : "none";
      });
      saveBtn.addEventListener("click", handleSaveBlock);
      deleteBtn.addEventListener("click", handleDeleteBlock);
      closePopupBtn.addEventListener("click", hideOverlay);
  
      /***************************************************
       * Daily
       **************************************************/
      function buildDailyTable(){
        const dailyBody = document.getElementById("daily-body");
        dailyBody.innerHTML = "";
  
        let hasRow=false;
        timeSlots.forEach(label=>{
          if(hiddenTimes.includes(label))return;
          hasRow=true;
  
          const tr=document.createElement("tr");
          const tdTime=document.createElement("td");
          tdTime.textContent=label;
          tr.appendChild(tdTime);
  
          const tdBlock=document.createElement("td");
          tdBlock.dataset.timeSlot=label;
          tdBlock.addEventListener("mousedown",handleMouseDown);
          tdBlock.addEventListener("mouseover",handleMouseOver);
          tdBlock.addEventListener("mouseup",handleMouseUp);
          tr.appendChild(tdBlock);
  
          dailyBody.appendChild(tr);
        });
  
        if(!hasRow){
          const tr=document.createElement("tr");
          const td=document.createElement("td");
          td.colSpan=2;
          td.style.textAlign="center";
          td.style.color="#999";
          td.textContent="No time slots available";
          tr.appendChild(td);
          dailyBody.appendChild(tr);
        }
      }
  
      function displayDailyBlocks(){
        buildDailyTable();
        const todayStr=formatDate(currentDate);
        // daily => if block !archived, date= today or recurring
        const dailyBlocks=timeBlocks.blocks.filter(b=>{
          if(b.archived)return false;
          if(b.recurring && b.recurrenceDays && b.recurrenceDays.length>0){
            return b.recurrenceDays.includes(getWeekdayName(currentDate));
          } else {
            if(!b.startTime)return false;
            return(b.startTime.split("T")[0]===todayStr);
          }
        });
  
        renderBlocksDaily(dailyBlocks);
        checkAllTasksCompletion(dailyBlocks);
      }
      function renderBlocksDaily(blocks){
        const dailyBody=document.getElementById("daily-body");
        blocks.forEach(block=>{
          const [startHM,endHM]=parseBlockTimes(block);
          const startLabel=convert24To12(startHM);
          const endLabel=convert24To12(endHM);
          const range=findTimeRange12(startLabel,endLabel);
          if(!range.length)return;
  
          const startIndex=findTableRowIndex(dailyBody,range[0]);
          if(startIndex<0)return;
          const length=computeRowSpan(dailyBody,range);
          if(length<=0)return;
  
          const rowStart=dailyBody.rows[startIndex];
          const blockCell=rowStart.cells[1];
          blockCell.rowSpan=length;
          renderBlockContent(blockCell,block);
  
          for(let i=1;i<length;i++){
            dailyBody.rows[startIndex+i].deleteCell(1);
          }
        });
      }
  
      /***************************************************
       * Congrats if all tasks done
       **************************************************/
      function checkAllTasksCompletion(blocks){
        // flatten tasks
        let allTasks=[];
        blocks.forEach(b=>{
          if(b.tasks) allTasks=allTasks.concat(b.tasks);
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
        archiveListDiv.innerHTML="";
        archivedDateSubheader.textContent="";
        archiveBlocksBody.innerHTML="";
          
          const days = archivedBlocks.days ? Object.keys(archivedBlocks.days).sort() : []; 
          if(!days.length){
              archiveListDiv.textContent="No archived days"; 
              return; 
          }
        days.forEach(dayKey=>{
          const btn=document.createElement("button");
          btn.textContent=dayKey;
          btn.addEventListener("click",()=>{
            showArchivedBlocksForDay(dayKey);
          });
          archiveListDiv.appendChild(btn);
        });
        // auto show last day
        showArchivedBlocksForDay(days[days.length-1]);
      }
      function showArchivedBlocksForDay(dayKey){
        archivedDateSubheader.textContent="Archive for "+dayKey;
        archiveBlocksBody.innerHTML="";
  
        // We'll build a daily-style table for the archived blocks
        // first gather all archived blocks for that date
        const blocks=archivedBlocks.days[dayKey];
        // build 12h schedule
        let tableRows=[];
        timeSlots.forEach(label=>{
          tableRows.push({ label, block:null, blockData:null });
        });
        // fill in blockData
        blocks.forEach(b=>{
          // parse times
          if(!b.startTime) return;
          const startHM=b.startTime.split("T")[1].slice(0,5);
          const endHM=b.endTime.split("T")[1].slice(0,5);
          const startLabel=convert24To12(startHM);
          const endLabel=convert24To12(endHM);
          const range=findTimeRange12(startLabel,endLabel);
          if(!range.length)return;
  
          const startIndex=timeSlots.indexOf(range[0]);
          const length=range.length;
          // store block in tableRows for rowSpan
          tableRows[startIndex].blockData=b;
          tableRows[startIndex].block=length;
        });
  
        // now build table rows
        for(let i=0;i<tableRows.length;i++){
          const row=tableRows[i];
          if(row.block===-1) continue; // skip
          const tr=document.createElement("tr");
          // time col
          const tdTime=document.createElement("td");
          tdTime.textContent=row.label;
          tr.appendChild(tdTime);
  
          // block col
          const tdBlock=document.createElement("td");
          if(row.block){
            tdBlock.rowSpan=row.block;
            renderArchiveBlockCell(tdBlock,row.blockData);
            // mark the subsequent rows so we skip them
            for(let j=i+1;j<i+row.block;j++){
              if(tableRows[j]) tableRows[j].block=-1;
            }
          } else {
            // no block
          }
          tr.appendChild(tdBlock);
          archiveBlocksBody.appendChild(tr);
        }
      }
      function renderArchiveBlockCell(cell, block){
        cell.textContent="";
        const colorVal=block.color||"#CCC";
        cell.style.backgroundColor=colorVal;
        cell.style.color="#000";
  
        // Title
        const titleDiv=document.createElement("div");
        titleDiv.style.fontWeight="bold";
        titleDiv.style.marginBottom="6px";
        titleDiv.style.color="#000";
        titleDiv.textContent=block.title||"Untitled";
        cell.appendChild(titleDiv);
  
        // tasks
        const tasksBox=document.createElement("div");
        tasksBox.style.background="#fff";
        tasksBox.style.padding="4px";
        tasksBox.style.borderRadius="4px";
        tasksBox.style.color="#000";
        tasksBox.style.marginTop="4px";
        tasksBox.style.marginBottom="4px";
        const tasksDiv=document.createElement("div");
        tasksDiv.style.display="flex";
        tasksDiv.style.flexDirection="column";
        tasksBox.appendChild(tasksDiv);
  
        (block.tasks||[]).forEach(t=>{
          const label=document.createElement("label");
          label.style.display="flex";
          label.style.alignItems="center";
          const cb=document.createElement("input");
          cb.type="checkbox";
          cb.disabled=true;
          cb.checked=!!t.completed;
          const span=document.createElement("span");
          span.textContent=t.text;
          if(t.completed) span.style.textDecoration="line-through";
          label.appendChild(cb);
          label.appendChild(span);
          tasksDiv.appendChild(label);
        });
        cell.appendChild(tasksBox);
  
        // notes
        const notesBox=document.createElement("div");
        notesBox.style.background="#fff";
        notesBox.style.color="#000";
        notesBox.style.padding="4px";
        notesBox.style.borderRadius="4px";
        notesBox.style.marginTop="4px";
        if(block.notes) notesBox.textContent="Notes: "+block.notes;
        cell.appendChild(notesBox);
      }
  
      function autoArchiveOldBlocks(){
        const todayStr=formatDate(new Date());
        const stillActive=[];
        timeBlocks.blocks.forEach(b=>{
          if(b.archived){ stillActive.push(b); return;}
          if(!b.startTime){ stillActive.push(b); return;}
          const blockDate=b.startTime.split("T")[0];
          if(blockDate<todayStr){
            b.archived=true;
            addBlockToArchive(blockDate,b);
          } else {
            stillActive.push(b);
          }
        });
        timeBlocks.blocks=stillActive;
        saveBlocksToStorage(timeBlocks);
        saveArchivedToStorage(archivedBlocks);
      }
      function addBlockToArchive(dayStr, blockData){
        if(!archivedBlocks.days[dayStr]) archivedBlocks.days[dayStr]=[];
        archivedBlocks.days[dayStr].push({
          title:blockData.title,
          notes:blockData.notes,
          color:blockData.color,
          tasks:blockData.tasks||[],
          recurring:blockData.recurring||false,
          startTime:blockData.startTime,
          endTime:blockData.endTime
        });
      }
  
      /***************************************************
       *  Mouse-based block creation
       **************************************************/
      function handleMouseDown(e){
        isMouseDown=true;
        startCell=e.target;
        startCell.classList.add("selected");
      }
      function handleMouseOver(e){
        if(!isMouseDown)return;
        clearSelectedCells();
        endCell=e.target;
        markSelectedRange();
      }
      function handleMouseUp(e){
        if(!isMouseDown)return;
        endCell=e.target;
        markSelectedRange();
        isMouseDown=false;
  
        if(!startCell.closest("td").dataset.blockId && !endCell.closest("td").dataset.blockId){
          showBlockPopup(null);
        }
      }
      function markSelectedRange(){
        if(!startCell||!endCell)return;
        const startRow=startCell.parentElement.rowIndex;
        const endRow=endCell.parentElement.rowIndex;
        const minR=Math.min(startRow,endRow);
        const maxR=Math.max(startRow,endRow);
  
        const dailyBody=document.getElementById("daily-body");
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
          buildTaskList([]);
          editBlockId = null;
        }
}

      function hideOverlay(){
        overlay.classList.remove("active");
        clearSelectedCells();
        startCell=null;endCell=null;
        editBlockId=null;
      }
  
      function handleSaveBlock(){
        const title=blockTitleInput.value.trim();
        if(!title){
          alert("Please enter a block title.");
          return;
        }
        const notesVal=blockNotesInput.value.trim();
        let colorVal = colorPresets[0]; // default
        const colorChecks = document.querySelectorAll("#block-color-options input[type='checkbox']");
        colorChecks.forEach(cb => {
            if(cb.checked) colorVal = cb.value;
        });
        const recurring=recurringCheckbox.checked;
        const carryOver=document.getElementById("carryover-checkbox").checked;
  
        const recDays=[];
        if(recurring){
          recurrenceDaysDiv.querySelectorAll("input[type='checkbox']").forEach(chk=>{
            if(chk.value && chk.checked) recDays.push(chk.value);
          });
        }
  
        const tasksArr=gatherTasksFromUI();
  
        let block=null;
        if(editBlockId){
          block=timeBlocks.blocks.find(b=>b.id===editBlockId);
          if(!block){alert("Error: block not found.");return;}
          block.title=title;
          block.notes=notesVal;
          block.color=colorVal;
          block.recurring=recurring;
          block.recurrenceDays=recDays;
  
          const oldTasks=block.tasks||[];
          block.tasks=tasksArr.map(t=>{
            const old=oldTasks.find(o=>o.text===t.text);
            return old ? { text:t.text, completed:old.completed } : t;
          });
        } else {
          block={
            id:generateUUID(),
            title,
            notes:notesVal,
            color:colorVal,
            recurring,
            carryOver,
            recurrenceDays: recDays,
            tasks: tasksArr
          };
          const {start,end}=computeTimeRangeFromSelection();
          block.startTime=start;
          block.endTime=end;
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
        timeBlocks.blocks=timeBlocks.blocks.filter(b=>b.id!==editBlockId);
        saveBlocksToStorage(timeBlocks);
        hideOverlay();
        updateDailySubheader();
        displayDailyBlocks();
        highlightCurrentTime();
      }
  
      /***************************************************
       * Single Cell Render
       **************************************************/
      function renderBlockContent(cell, block){
        cell.textContent="";
        const colorVal=block.color||randomColor();
        block.color=colorVal;
        cell.style.backgroundColor=colorVal;
        cell.classList.add("block-cell");
  
        const titleDiv=document.createElement("div");
        titleDiv.classList.add("block-title");
        titleDiv.textContent=block.title||"Untitled";
        titleDiv.addEventListener("click",()=>{
          editBlockId=block.id;
          showBlockPopup(block);
        });
        cell.appendChild(titleDiv);
  
        const tasksBox=document.createElement("div");
        tasksBox.classList.add("tasks-box");
        const tasksDiv=document.createElement("div");
        tasksDiv.classList.add("tasks-container");
        tasksBox.appendChild(tasksDiv);
        cell.appendChild(tasksBox);
  
        (block.tasks||[]).forEach(task=>{
          const label=document.createElement("label");
          const cb=document.createElement("input");
          cb.type="checkbox";
          cb.checked=!!task.completed;
  
          const span=document.createElement("span");
          span.textContent=task.text;
          if(task.completed) span.classList.add("strike");
  
          cb.addEventListener("change",()=>{
            task.completed=cb.checked;
            if(cb.checked) span.classList.add("strike"); else span.classList.remove("strike");
            saveBlocksToStorage(timeBlocks);
            // after changing a task => re-check if all tasks done
            const dayBlocks=getCurrentDayBlocks();
            checkAllTasksCompletion(dayBlocks);
          });
  
          label.appendChild(cb);
          label.appendChild(span);
          tasksDiv.appendChild(label);
        });
  
        const notesBox=document.createElement("div");
        notesBox.classList.add("notes-box");
        const notesArea=document.createElement("textarea");
        notesArea.value=block.notes||"";
        notesArea.rows=2;
        notesArea.addEventListener("blur",()=>{
          block.notes=notesArea.value;
          saveBlocksToStorage(timeBlocks);
        });
        notesBox.appendChild(notesArea);
        cell.appendChild(notesBox);
  
        cell.dataset.blockId=block.id;
      }
      function getCurrentDayBlocks(){
        const todayStr=formatDate(currentDate);
        return timeBlocks.blocks.filter(b=>{
          if(b.archived)return false;
          if(b.recurring&&b.recurrenceDays&&b.recurrenceDays.length>0){
            return b.recurrenceDays.includes(getWeekdayName(currentDate));
          } else {
            if(!b.startTime)return false;
            return(b.startTime.split("T")[0]===todayStr);
          }
        });
      }
  
      /***************************************************
       * Tasks
       **************************************************/
      function buildTaskList(tasks){
        taskListContainer.innerHTML="";
        tasks.forEach(t=>addTaskRow(t.text));
        if(!tasks.length) addTaskRow("");
      }
      function addTaskRow(taskText){
        const rowDiv=document.createElement("div");
        rowDiv.style.display="flex";
        rowDiv.style.gap="6px";
        rowDiv.style.marginBottom="4px";
  
        const inputLabel=document.createElement("label");
        inputLabel.style.flex="1";
        inputLabel.style.display="flex";
  
        const input=document.createElement("input");
        input.type="text";
        input.value=taskText||"";
  
        const uniqueId="task-"+Date.now()+"-"+Math.floor(Math.random()*1000);
        input.id=uniqueId;
        input.name="taskInput";
        inputLabel.setAttribute("for",uniqueId);
        inputLabel.appendChild(input);
        rowDiv.appendChild(inputLabel);
  
        const removeBtn=document.createElement("button");
        removeBtn.textContent="🗑️";
        removeBtn.style.color="red";
        removeBtn.style.background="transparent";
        removeBtn.style.border="none";
        removeBtn.style.cursor="pointer";
        removeBtn.addEventListener("click",()=> rowDiv.remove());
        rowDiv.appendChild(removeBtn);
  
        taskListContainer.appendChild(rowDiv);
      }
      function gatherTasksFromUI(){
        const tasks=[];
        const rows=taskListContainer.querySelectorAll("div");
        rows.forEach(div=>{
          const inp=div.querySelector("input[type='text']");
          if(!inp)return;
          const txt=inp.value.trim();
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
        timeListDiv.innerHTML="";
        const usedLabels=findUsedTimeLabels();
        timeSlots.forEach(label=>{
          if(!label)return;
          const row=document.createElement("label");
          row.style.marginRight="10px";
          const cb=document.createElement("input");
          cb.type="checkbox";
          cb.checked=!hiddenTimes.includes(label);
  
          const cbId="timeSlot-"+label.replace(/[^a-z0-9]/gi,'-');
          cb.id=cbId;
          row.setAttribute("for",cbId);
  
          if(usedLabels.has(label)){
            cb.disabled=true;
          }
          const span=document.createElement("span");
          span.textContent=label;
  
          cb.addEventListener("change",()=>{
            if(cb.checked){
              hiddenTimes=hiddenTimes.filter(x=>x!==label);
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
        const set=new Set();
        timeBlocks.blocks.forEach(b=>{
          const [startHM,endHM]=parseBlockTimes(b);
          const start12=convert24To12(startHM);
          const end12=convert24To12(endHM);
          const range=findTimeRange12(start12,end12);
          range.forEach(lbl=>set.add(lbl));
        });
        return set;
      }
      function buildColorsContainer(){
        colorsContainer.innerHTML="";
        colorPresets.forEach((c,index)=>{
          const rowDiv=document.createElement("div");
          rowDiv.classList.add("color-row");
  
          const label=document.createElement("label");
          label.textContent="Color "+(index+1)+":";
  
          const inp=document.createElement("input");
          inp.type="color";
          inp.value=c;
          const colorId="colorInput-"+index;
          inp.id=colorId;
          inp.name="presetColor"+index;
          label.setAttribute("for",colorId);
  
          inp.addEventListener("change",()=>{
            colorPresets[index]=inp.value;
            saveColorPresetsToStorage(colorPresets);
            populateColorCheckboxes();
            displayDailyBlocks();
        });
  
          rowDiv.appendChild(label);
          rowDiv.appendChild(inp);
  
          const removeBtn=document.createElement("button");
          removeBtn.textContent="🗑️";
          removeBtn.style.color="red";
          removeBtn.style.background="transparent";
          removeBtn.style.border="none";
          removeBtn.style.cursor="pointer";
          removeBtn.addEventListener("click",()=> rowDiv.remove());
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
        const data=localStorage.getItem("archivedBlocks");
        return data?JSON.parse(data):null;
      }
      function saveArchivedToStorage(obj){
        localStorage.setItem("archivedBlocks",JSON.stringify(obj));
      }
  
      function autoArchiveOldBlocks(){
        const todayStr=formatDate(new Date());
        const stillActive=[];
        timeBlocks.blocks.forEach(b=>{
          if(b.archived){ stillActive.push(b); return;}
          if(!b.startTime){ stillActive.push(b); return;}
          const blockDate=b.startTime.split("T")[0];
          if(blockDate<todayStr){
            b.archived=true;
            addBlockToArchive(blockDate,b);
          } else {
            stillActive.push(b);
          }
        });
        timeBlocks.blocks=stillActive;
        saveBlocksToStorage(timeBlocks);
        saveArchivedToStorage(archivedBlocks);
      }
      function addBlockToArchive(dayStr, blockData){
        if(!archivedBlocks.days[dayStr]) archivedBlocks.days[dayStr]=[];
        archivedBlocks.days[dayStr].push({
          title:blockData.title,
          notes:blockData.notes,
          color:blockData.color,
          tasks:blockData.tasks||[],
          recurring:blockData.recurring||false,
          startTime:blockData.startTime,
          endTime:blockData.endTime
        });
      }
  
      /***************************************************
       *  Time / Utility
       **************************************************/
      function parseBlockTimes(block){
        const startHM=block.startTime.split("T")[1].slice(0,5);
        const endHM=block.endTime.split("T")[1].slice(0,5);
        return[startHM,endHM];
      }
      function computeTimeRangeFromSelection(){
        const dateStr=formatDate(currentDate);
        const startRow=startCell.parentElement.rowIndex;
        const endRow=endCell.parentElement.rowIndex;
        const minR=Math.min(startRow,endRow);
        const maxR=Math.max(startRow,endRow);
  
        const dailyBody=document.getElementById("daily-body");
        const startLabel=dailyBody.rows[minR].cells[0].textContent;
        const endLabel=dailyBody.rows[maxR].cells[0].textContent;
        const endIndex=timeSlots.indexOf(endLabel)+1;
        const endLabel2=(endIndex<timeSlots.length)?timeSlots[endIndex]:endLabel;
        return {
          start:dateStr+"T"+convert12To24(startLabel)+":00",
          end:dateStr+"T"+convert12To24(endLabel2)+":00"
        };
      }
      function findTableRowIndex(tbody,label){
        for(let i=0;i<tbody.rows.length;i++){
          if(tbody.rows[i].cells[0].textContent===label)return i;
        }
        return -1;
      }
      function computeRowSpan(tbody,range){
        let count=0;let started=false;
        for(let i=0;i<tbody.rows.length;i++){
          const lbl=tbody.rows[i].cells[0].textContent;
          if(lbl===range[0]){
            started=true;count++;
          } else if(started){
            if(lbl===range[range.length-1]){count++;break;}
            count++;
          }
        }
        return count;
      }
      function highlightCurrentTime(){
        document.querySelectorAll(".current-time").forEach(el=>el.classList.remove("current-time"));
        const now=new Date();
        const hh=String(now.getHours()).padStart(2,"0");
        const mm=now.getMinutes()<30?"00":"30";
        const label24=hh+":"+mm;
        const label12=convert24To12(label24);
  
        const dailyBody=document.getElementById("daily-body");
        for(let r=0;r<dailyBody.rows.length;r++){
          if(dailyBody.rows[r].cells[0].textContent===label12){
            dailyBody.rows[r].classList.add("current-time");
            break;
          }
        }
      }
      //setInterval(highlightCurrentTime,60000);
  
      function loadBlocksFromStorage(){
        const data=localStorage.getItem("timeBlocks");
        return data?JSON.parse(data):null;
      }
      function saveBlocksToStorage(obj){
        localStorage.setItem("timeBlocks",JSON.stringify(obj));
      }
      function loadColorPresetsFromStorage(){
        const data=localStorage.getItem("colorPresets");
        return data?JSON.parse(data):null;
      }
      function saveColorPresetsToStorage(arr){
        localStorage.setItem("colorPresets",JSON.stringify(arr));
      }
      function loadHiddenTimesFromStorage(){
        const data=localStorage.getItem("hiddenTimes");
        return data?JSON.parse(data):[];
      }
      function saveHiddenTimesToStorage(arr){
        localStorage.setItem("hiddenTimes",JSON.stringify(arr));
      }
  
      function generateTimeSlots12(){
        const arr=[];
        let hour=0;let minute=0;
        for(let i=0;i<48;i++){
          arr.push(convert24To12(`${String(hour).padStart(2,"0")}:${String(minute).padStart(2,"0")}`));
          minute+=30;
          if(minute===60){minute=0;hour++;}
        }
        return arr;
      }
      function convert24To12(hhmm){
        const [H,M]=hhmm.split(":").map(x=>parseInt(x,10));
        const ampm=(H>=12)?"PM":"AM";
        let hh=H%12;if(hh===0)hh=12;
        return`${hh}:${(M===0?"00":"30")} ${ampm}`;
      }
      function convert12To24(label){
        const parts=label.split(" ");
        if(parts.length<2)return"00:00";
        const hm=parts[0].split(":");
        let hour=parseInt(hm[0],10);
        let minute=parseInt(hm[1],10);
        const ampm=parts[1];
        if(ampm==="PM"&&hour<12)hour+=12;
        if(ampm==="AM"&&hour===12)hour=0;
        return String(hour).padStart(2,"0")+":"+String(minute).padStart(2,"0");
      }
      function findTimeRange12(startLabel,endLabel){
        const startIdx=timeSlots.indexOf(startLabel);
        const endIdx=timeSlots.indexOf(endLabel);
        if(startIdx<0||endIdx<0)return[];
        const range=[];
        for(let i=startIdx;i<endIdx;i++){
          range.push(timeSlots[i]);
        }
        return range;
      }
      function formatDate(dt){
        const y=dt.getFullYear();
        const m=String(dt.getMonth()+1).padStart(2,"0");
        const d=String(dt.getDate()).padStart(2,"0");
        return`${y}-${m}-${d}`;
      }
      function getWeekdayName(dt){
        const map=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
        return map[dt.getDay()];
      }
      function generateUUID(){
        return"xxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,c=>{
          const r=Math.random()*16|0,v=(c==="x"?r:(r&0x3|0x8));
          return v.toString(16);
        });
      }
      function randomColor(){
        const r=100+Math.floor(Math.random()*156);
        const g=100+Math.floor(Math.random()*156);
        const b=100+Math.floor(Math.random()*156);
        return`rgb(${r},${g},${b})`;
      }
      function clearPopupFields(){
        blockTitleInput.value="";
        blockNotesInput.value="";
        recurringCheckbox.checked=false;
        recurrenceDaysDiv.style.display="none";
        recurrenceDaysDiv.querySelectorAll("input[type='checkbox']").forEach(chk=>chk.checked=false);
        taskListContainer.innerHTML="";
      }