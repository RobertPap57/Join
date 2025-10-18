/**
 * Initializes the task form with proper configuration.
 * @param {string} type - Type of form ('add-task', 'edit-task', etc.)
 * @param {Object} options - Additional options (taskId, status, etc.)
 */
function initTaskForm(type, options = {}) {
    setupTaskFormContext(type, options);
    setupTaskActionBtns(type);
    setupTaskFormTitle(type);
    clearTask();
    setMinDateToToday();
    initContacts();
    filterContactsListener();
    setupAssignedToDropdown();
    setupCategoryDropdown();
    disableCategoryDropdown(type);
    changePrioBtn();
    styleSubtaskInput();
    setupTaskFormListeners();
}


/**
 * Attaches the runtime listeners used to manage the task form UI.
 */
function setupTaskFormListeners() {
    closeContactListOnOutsideClick();
    preventDefaultValidation();
    createCustomResizeHandle();
    initHorizontalScroll('.attachments-list');
    fileInputListener();
    adjustTextareaPaddingListener();
    disableSubmitButtonOnEmptyForm();
}


/**
 * Save the task and push it to the database.
 */
async function addTask(type) {
    let newTask = getTaskData();
    newTask = await addData('/tasks', newTask);
    showTaskAddedMessage(type);
    if (type === 'add-task-dialog') {
        tasks.push(newTask);
        renderTasks();
    }
}


/**
 * Updates an existing task with edited form data.
 * @param {string} taskId - ID of the task being edited
 */
async function updateTaskData() {
    const taskData = getTaskData();
    if (!taskData.id) return;
    const task = tasks.find(t => t.id === taskData.id);
    if (!task) return;
    if (task.status) {
        taskData.status = task.status;
    }
    await saveTaskChanges(taskData.id, taskData);
}


/**
 * Saves the task changes to the database and updates UI.
 * @param {string} taskId - ID of the task to update
 * @param {Object} updatedTask - The updated task data
 */
async function saveTaskChanges(taskId, updatedTask) {
    try {
        await updateData("/tasks", taskId, updatedTask);
        updateLocalTaskData(taskId, updatedTask);
        handleDialogsOnEditTask(taskId);
    } catch (error) {
        console.error('Error updating task:', error);
    }
}


/**
 * Updates the task in the local tasks array.
 * @param {string} taskId - ID of the task to update
 * @param {Object} updatedTask - The updated task data
 */
function updateLocalTaskData(taskId, updatedTask) {
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
        tasks[taskIndex] = updatedTask;
        renderTasks();
    }
}


/**
 * Gathers all task data from the form.
 * @returns {Object} Object containing all task form data
 */
function getTaskData() {
    const form = document.getElementById('task-form');
    return {
        id: form?.dataset.taskId || '',
        title: document.getElementById('title')?.value || '',
        description: document.getElementById('description')?.value || '',
        category: document.getElementById('category-displayed')?.textContent || '',
        status: form?.dataset.status || getTaskStatus(),
        dueDate: document.getElementById('due-date-input')?.value || '',
        priority: getSelectedPriority() || '',
        assignedTo: (selectedContacts || []).map(item => item.id),
        subtasks: subtasks || [],
        attachments: attachmentsToFirebaseObject(attachments || []),
        timestamp: Date.now()
    };
}


/**
 * Resolves the initial status for a newly created task.
 */
function getTaskStatus() {
    const status = sessionStorage.getItem('newTaskStatus');
    if (status) {
        sessionStorage.removeItem('newTaskStatus');
        return status;
    }
    return 'to-do';
}


/**
 * Displays the success feedback for a submitted task.
 */
function showTaskAddedMessage(type) {
    const messageElement = document.querySelector('.task-added-msg');
    switch (type) {
        case 'add-task':
            showToastMsgPage(messageElement);
            break;
        default:
            showToastMsgDialog(messageElement);
            break;
    }
}


/**
 * Animates the task-added toast on the full page view.
 */
function showToastMsgPage(messageElement) {
    messageElement.classList.add('d-flex-visible');
    setTimeout(() => {
        messageElement.classList.add('task-added-msg-slide-in');
    }, 50);
    setTimeout(() => {
        redirectTo('board.html');
    }, 1200);
}


/**
 * Animates the task-added toast inside the dialog flow.
 */
function showToastMsgDialog(messageElement) {
    messageElement.classList.add('task-added-msg-slide-in');
    messageElement.classList.add('d-flex-visible');
    setTimeout(() => {
        messageElement.classList.remove('d-flex-visible');
        document.getElementById('task-form-dialog').close();
    }, 1000);
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
 * Configures mouse and keyboard handlers for textarea resizing.
 */
function setupResizeEvents(textarea, resizeHandle) {
    let isResizing = false, startY = 0, startHeight = 0;
    bindEventListenerOnce(resizeHandle, 'mousedown', (e) => {
        isResizing = true;
        startY = e.clientY;
        startHeight = parseInt(getComputedStyle(textarea).height) || 120;
        e.preventDefault();
        document.body.classList.add('resizing');
    }, 'resizeHandleMouseDown');
    bindEventListenerOnce(resizeHandle, 'keydown', (e) => handleKeyboardResize(e, textarea), 'resizeHandleKeydown');
    bindEventListenerOnce(document, 'mousemove', (e) => handleResize(e, textarea, isResizing, startY, startHeight), 'documentMouseMoveResize');
    bindEventListenerOnce(document, 'mouseup', () => stopResizing(() => isResizing = false), 'documentMouseUpResize');
}


/**
 * Handles the resizing of a textarea element based on keyboard input.
 * @param {KeyboardEvent} e - The keyboard event triggered during resizing.
 * @param {HTMLTextAreaElement} textarea - The textarea element being resized.
 */
function handleKeyboardResize(e, textarea) {
    const step = 20; // px per arrow press
    const currentHeight = parseInt(getComputedStyle(textarea).height);
    if (e.key === 'ArrowUp') {
        textarea.style.height = Math.max(120, currentHeight - step) + 'px';
        e.preventDefault();
    }
    if (e.key === 'ArrowDown') {
        textarea.style.height = Math.min(450, currentHeight + step) + 'px';
        e.preventDefault();
    }
}


/**
 * Handles the resizing of a textarea element based on mouse movement.
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
 * Ends an active resize cycle and clears state styles.
 */
function stopResizing(callback) {
    callback();
    document.body.classList.remove('resizing');
}


/**
 * Toggles textarea padding to account for scrollbar presence.
 */
function adjustTextareaPadding() {
    const textarea = document.getElementById('description');
    if (!textarea) return;
    const hasVerticalScroll = textarea.scrollHeight > textarea.clientHeight;
    textarea.style.paddingRight = hasVerticalScroll ? '0px' : '16px';
}


/**
 * Registers the textarea listener that updates padding on input.
 */
function adjustTextareaPaddingListener() {
    const textarea = document.getElementById('description');
    if (!textarea) return;
    bindEventListenerOnce(textarea, 'input', adjustTextareaPadding, 'descriptionInput');
}


/**
 * Updates the task form heading to match the current mode.
 */
function setupTaskFormTitle(type) {
    const taskFormHeading = document.getElementById('task-form-heading');
    taskFormHeading.classList.remove('d-none');
    switch (type) {
        case 'edit-task':
            taskFormHeading.classList.add('d-none');
            break;
        default:
            taskFormHeading.textContent = 'Add Task';
            break;
    }
}


/**
 * Sets up the task form context with data attributes.
 * @param {string} type - Type of form
 * @param {Object} options - Additional options
 */
function setupTaskFormContext(type, options = {}) {
    const form = document.getElementById('task-form');
    if (!form) return;
    form.dataset.formType = type;
    if (options.taskId) {
        form.dataset.taskId = options.taskId;
    }
    if (options.status) {
        form.dataset.status = options.status;
    }
}


/**
 * Sets up the task form action buttons based on the type of form.
 * @param {string} type - Type of form ('add-task', 'edit-task', etc.)
 */
function setupTaskActionBtns(type) {
    setupFormPrimaryBtn(type);
    setupFormSecondaryBtn(type);
    setupFormSecondaryBtnActions(type);
}


/**
 * Binds the secondary button behavior based on the form type.
 */
function setupFormSecondaryBtnActions(type) {
    const secondaryBtn = document.getElementById('task-form-secondary-btn');
    bindEventListenerOnce(secondaryBtn, 'click', () => {
        switch (type) {
            case 'add-task-dialog':
                closeTaskFormDialog();
                break;
            default:
                clearTask();
                break;
        }
    }, 'formSecondaryBtnClick_' + type);

}


/**
 * Configures the secondary button label and visibility.
 */
function setupFormSecondaryBtn(type) {
    const secondaryBtn = document.getElementById('task-form-secondary-btn');
    const btnText = secondaryBtn.querySelector('.btn-text');
    secondaryBtn.classList.remove('d-none');
    switch (type) {
        case 'edit-task':
            secondaryBtn.classList.add('d-none');
            break;
        case 'add-task-dialog':
            btnText.innerText = "Cancel";
            break;
        default:
            btnText.innerText = "Clear";
            break;
    }
}


/**
 * Configures the primary button label for the form mode.
 */
function setupFormPrimaryBtn(type) {
    const primaryBtn = document.getElementById('task-form-primary-btn');
    const btnText = primaryBtn.querySelector('.btn-text');
    switch (type) {
        case 'edit-task':
            btnText.innerText = "Ok";
            break;
        default:
            btnText.innerText = "Create Task";
            break;
    }
}
