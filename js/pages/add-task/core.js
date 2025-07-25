/**
 * Core initialization and main functionality for Add Task page
 * Contains the main init function and core task operations
 */

/**
 * Initializes the addition of tasks by loading contacts data, including HTML, highlighting the add task section,
 * updating the header profile initials, filtering contacts, showing the menu, changing SVG on hover, changing priority buttons,
 * categorizing menu, styling subtask input, pushing subtasks, closing the contact list on outside click, preventing form submission on enter,
 * and preventing default validation.
 *
 * @return {Promise<void>} A promise that resolves when the initialization is complete.
 */
async function initAddTask() {
    await includeHTML();
    checkOrientation();
    checkForCurrentUser() ? "" : redirectTo('login.html');
    displayProfileIconInitials();
    highlightLink('add-task');
    await getContacts();
    handleFilter();
    filterContacts();
    setMinDateToToday();
    showAssignedToDropdown();
    showCategoryDropdown();
    changePrioBtn();
    styleSubtaskInput();
    pushSubtask();
    closeContactListOnOutsideClick();
    preventFormSubmitOnEnter();
    preventDefaultValidation();
    createCustomResizeHandle();
}

/**
 * Save the task and push it to the database.
 */
async function saveTask() {
    const taskData = gatherTaskData();
    const newTask = createTaskObject(taskData);
    await addData('tasks', newTask);
    showTaskAddedMessage();
}

/**
 * Gathers all task data from the form.
 * @returns {Object} Object containing all task form data
 */
function gatherTaskData() {
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const dueDate = document.getElementById('due-date-input').value;
    const category = document.getElementById('category-displayed').textContent;
    const priority = getSelectedPriority();
    const assignedTo = selectedContacts.map(item => item.id);
    const newSubtasks = subtasks.map((item) => ({
        content: item,
        completed: false,
    }));

    return { title, description, dueDate, category, priority, assignedTo, newSubtasks };
}

/**
 * Creates a new task object from task data.
 * @param {Object} taskData - Task form data
 * @returns {Object} New task object
 */
function createTaskObject(taskData) {
    return {
        title: taskData.title,
        description: taskData.description,
        category: taskData.category,
        status: 'todo',
        dueDate: taskData.dueDate,
        priority: taskData.priority,
        subTasks: taskData.newSubtasks,
        assignedTo: taskData.assignedTo,
        attachments: attachments
    };
}

/**
 * Shows a task added message by adding a CSS class to the element with the class 'task-added-msg'.
 * After 3 seconds, it adds another CSS class to slide in the message. After another 2 seconds, it redirects to the board.
 *
 * @return {void} 
 */
function showTaskAddedMessage() {
    const messageElement = document.querySelector('.task-added-msg');
    messageElement.classList.add('d-flex-visible');
    setTimeout(() => {
        messageElement.classList.add('task-added-msg-slide-in');
    }, 50);
    setTimeout(() => {
        redirectTo('board.html');
    }, 1200); 
}

/**
 * Creates a custom resize handle for the textarea
 */
function createCustomResizeHandle() {
    const textarea = document.getElementById('description');
    const resizeHandle = document.querySelector('.custom-resize-handle');
    if (!textarea || !resizeHandle) return;
    setupResizeEvents(textarea, resizeHandle);
}

/**
 * Sets up custom resize events for a textarea using a resize handle element.
 * Allows the user to click and drag the handle to resize the textarea vertically.
 *
 * @param {HTMLTextAreaElement} textarea - The textarea element to be resized.
 * @param {HTMLElement} resizeHandle - The element used as the resize handle.
 */
function setupResizeEvents(textarea, resizeHandle) {
    let isResizing = false, startY = 0, startHeight = 0;

    resizeHandle.addEventListener('mousedown', (e) => {
        isResizing = true;
        startY = e.clientY;
        startHeight = parseInt(getComputedStyle(textarea).height) || 120;
        e.preventDefault();
        document.body.classList.add('resizing');
    });

    document.addEventListener('mousemove', (e) => handleResize(e, textarea, isResizing, startY, startHeight));
    document.addEventListener('mouseup', () => stopResizing(() => isResizing = false));
}

/**
 * Handles the resizing of a textarea element based on mouse movement.
 *
 * @param {MouseEvent} e - The mouse event triggered during resizing.
 * @param {HTMLTextAreaElement} textarea - The textarea element being resized.
 * @param {boolean} isResizing - Indicates if the resizing operation is active.
 * @param {number} startY - The initial Y position of the mouse when resizing started.
 * @param {number} startHeight - The initial height of the textarea before resizing.
 */
function handleResize(e, textarea, isResizing, startY, startHeight) {
    if (!isResizing) return;
    const deltaY = e.clientY - startY;
    const newHeight = Math.max(120, Math.min(450, startHeight + deltaY));
    textarea.style.height = newHeight + 'px';
}

/**
 * Stops the resizing operation by calling the provided reset function
 * and removing the 'resizing' class from the document body.
 *
 * @param {Function} resetResizing - A callback function to reset resizing state.
 */
function stopResizing(resetResizing) {
    resetResizing();
    document.body.classList.remove('resizing');
}

