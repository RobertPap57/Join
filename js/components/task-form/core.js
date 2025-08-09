

/**
 * Initializes the task form with proper configuration.
 * @param {string} type - Type of form ('add-task', 'edit-task', etc.)
 * @param {Object} options - Additional options (taskId, status, etc.)
 */
function initTaskForm(type, options = {}) {
    setupTaskFormContext(type, options);
    setupTaskActionBtns(type);
    setupTaskFormTitle(type);
    handleFilter();
    filterContacts();
    setMinDateToToday();
    showAssignedToDropdown();
    showCategoryDropdown();
    changePrioBtn();
    styleSubtaskInput();
    pushSubtask();
    closeContactListOnOutsideClick();
    preventDefaultValidation();
    createCustomResizeHandle();
    initAttachmentsDrag();
    fileInputListener();
    preventFormSubmitOnEnter();
}


/**
 * Save the task and push it to the database.
 */
async function addTask(type) {
    const taskData = getTaskData();
    const newTask = createTaskObject(taskData);
    await addData('/tasks', newTask);
    tasks.push(newTask);
    renderTasks();
    showTaskAddedMessage(type);
}

/**
 * Updates an existing task with edited form data.
 * @param {string} taskId - ID of the task being edited
 */
async function updateTaskData() {
    const taskData = getTaskData();
    console.log('taskData', taskData);

    if (!taskData.id) return;

    const task = tasks.find(t => t.id === taskData.id);
    console.log('task', task);

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
        closeTaskFormDialog();
        openDetailedTaskView(taskId);
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
    const defaultStatus = 'to-do';

    return {
        id: form.dataset.taskId || '',
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        category: document.getElementById('category-displayed').textContent,
        status: form.dataset.status || defaultStatus,
        dueDate: document.getElementById('due-date-input').value,
        priority: getSelectedPriority(),
        assignedTo: selectedContacts.map(item => item.id),
        subtasks: subtasks,
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
        subtasks: task.subtasks,
        attachments: task.attachments,
    };
}



/**
 * Shows a task added message by adding a CSS class to the element with the class 'task-added-msg'.
 * After 3 seconds, it adds another CSS class to slide in the message. After another 2 seconds, it redirects to the board.
 *
 * @return {void} 
 */
function showTaskAddedMessage(type) {
    const messageElement = document.querySelector('.task-added-msg');
    switch (type) {
        case 'add-task':
            messageElement.classList.add('d-flex-visible');
            setTimeout(() => {
                messageElement.classList.add('task-added-msg-slide-in');
            }, 50);
            setTimeout(() => {
                redirectTo('board.html');
            }, 1200);
            break;
        default:
            messageElement.classList.add('task-added-msg-slide-in');
            messageElement.classList.add('d-flex-visible');
            setTimeout(() => {
                messageElement.classList.remove('d-flex-visible');
                document.getElementById('task-form-dialog').close();
            }, 1000);
            
            break;
    }
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
        textarea.style.paddingRight = hasVerticalScroll ? '0px' : '16px';
    }

    document.getElementById('description')?.addEventListener('input', adjustTextareaPadding);


    function setupTaskFormTitle(type) {
        const taskTitle = document.getElementById('task-form-title');
        taskTitle.classList.remove('d-none');
        switch (type) {
            case 'edit-task':
                taskTitle.classList.add('d-none');
                break;
            default:
                taskTitle.textContent = 'Add Task';
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

    function setupTaskActionBtns(type) {
        setupFormPrimaryBtn(type);
        setupFormSecondaryBtn(type);
        setupFormSecondaryBtnActions(type);
    }


    function setupFormSecondaryBtnActions(type) {
        const secondaryBtn = document.getElementById('task-form-secondary-btn');
        secondaryBtn.addEventListener('click', () => {
            switch (type) {
                case 'add-task-dialog':
                    closeTaskFormDialog();
                    break;
                default:
                    clearTask();
                    break;
            }
        });

    }

    function setupFormSecondaryBtn(type) {
        const secondaryBtn = document.getElementById('task-form-secondary-btn');
        secondaryBtn.innerHTML = '';
        secondaryBtn.classList.remove('d-none');
        switch (type) {
            case 'edit-task':
                secondaryBtn.classList.add('d-none');
                break;
            case 'add-task-dialog':
                secondaryBtn.innerHTML = getSecondaryBtnHtml('add-task-dialog');
                break;
            default:
                secondaryBtn.innerHTML = getSecondaryBtnHtml();
                break;
        }
    }

    function setupFormPrimaryBtn(type) {
        const primaryBtn = document.getElementById('task-form-primary-btn');
        primaryBtn.innerHTML = '';
        switch (type) {
            case 'edit-task':
                primaryBtn.innerHTML = getPrimaryBtnHtml('edit-task');
                break;
            default:
                primaryBtn.innerHTML = getPrimaryBtnHtml();
                break;
        }
    }




    function getSecondaryBtnHtml(type) {
        switch (type) {
            case 'add-task-dialog': return `Cancel
                <div class="popup-icon-container d-flex-center">
                    <img src="../assets/images/global/close.svg" alt="">
                </div>`;
            default: return `Clear
        <div class="popup-icon-container d-flex-center">
                    <img src="../assets/images/global/close.svg" alt="">
                </div>`;
        }
    }


    function getPrimaryBtnHtml(type) {
        switch (type) {
            case 'edit-task': return `Ok
                <div class="popup-icon-container d-flex-center">
                    <img src="../assets/images/global/check-white.svg" alt="">
                </div>`;
            default: return `Create Task
                <div class="popup-icon-container d-flex-center">
                    <img src="../assets/images/global/check-white.svg" alt="">
                </div>`;
        }
    }