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
    displayHeaderAvatar();
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
    initPopup();
}

/**
 * Save the task and push it to the database.
 */
async function saveTask() {
    const taskData = getTaskData();
    const newTask = createTaskObject(taskData);
    await addData('/tasks', newTask);
    showTaskAddedMessage();
}

/**
 * Gathers all task data from the form.
 * @returns {Object} Object containing all task form data
 */
function getTaskData() {
    return {
        id: '',
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        category: document.getElementById('category-displayed').textContent,
        status: 'to-do',
        dueDate: document.getElementById('due-date-input').value,
        priority: getSelectedPriority(),
        assignedTo: selectedContacts.map(item => item.id),
        subtasks: subtasksToFirebaseObject(subtasks),
        attachments: attachmentsToFirebaseObject(attachments)
    };
}

/**
 * Creates a new task object from task data.
 * @param {Object} taskData - Task form data
 * @returns {Object} New task object
 */
function createTaskObject(task) {
    return {
        id: task.id,
        title: task.title,
        description: task.description,
        category: task.category,
        status: task.status,
        dueDate: task.dueDate,
        priority: task.priority,
        assignedTo: task.assignedTo,
        subTasks: task.subtasks,
        attachments: task.attachments,
    };
}

function subtasksToFirebaseObject(subtasks) {
    return subtasks.map((item) => ({
        id: createUniqueId(),
        content: item,
        completed: false,
    }));
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
    adjustTextareaPadding();
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

/**
 * Adjusts the right padding of the textarea with the ID 'description'
 * based on the presence of a vertical scrollbar. If a vertical scrollbar
 * is visible, the right padding is set to 0px; otherwise, it is set to 16px.
 */
function adjustTextareaPadding() {
    const textarea = document.getElementById('description');
    if (!textarea) return;

    const hasVerticalScroll = textarea.scrollHeight > textarea.clientHeight;

    // Add padding if vertical scrollbar is visible
    textarea.style.paddingRight = hasVerticalScroll ? '0px' : '16px';
}

document.getElementById('description')?.addEventListener('input', adjustTextareaPadding);