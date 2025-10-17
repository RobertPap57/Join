/**
 * Opens the detailed task view modal with the specified task's details.
 * @param {string} taskId - The ID of the task to display.
 */
function showDetailedTask(taskId, edit = false) {
    if (cardDisabled) return;
    dialog = document.getElementById('detailed-task-dialog');
    const task = tasks.find(t => t.id === taskId);
    if (!task || isDragging) return;
    dialog.innerHTML = getDetailedTaskHTML(task);
    renderDetaliedTaskComponents(task)
    openDetaliedTaskDialog(dialog, edit);
    blockDragOnDownloadBtn();
    trapFocusInDialogEvent();
}


/**
 * Renders the subtasks, avatars, and attachments for a given task into the detailed view.
 * @param {object} task - The task object containing the subtasks, avatars, and attachments.
 */
function renderDetaliedTaskComponents(task) {
    renderTaskSubtasks(task);
    renderTaskAvatars(task, 'modal');
    renderTaskAttachments(task);
}


/**
 * Renders the attachments section of a detailed task view.
 * If the task has no attachments, shows a placeholder message instead.
 * @param {Object} task - The task object containing attachments data.
 * @param {Object[]} [task.attachments] - Optional array or object of attachments.
 */
function renderTaskAttachments(task) {
    if (!task.attachments || task.attachments.length === 0) {
        attachmentsEmpty();
    } else {
        attachments = task.attachments ? Object.values(task.attachments) : [];
        renderAttachments();
    }
}


/**
 * Displays a placeholder message in the "Assigned to" section
 * when no user is assigned to the task.
 */
function assignedToEmpty() {
    const assignedToSection = document.querySelector('.detailed-task-assigned');
    assignedToSection.innerHTML = `<h3> Assigned to<span class="detailed-task-dialog-placeholder">Not assigned</span></h3>`
}


/**
 * Displays a placeholder message in the "Subtasks" section
 * when the task has no subtasks.
 */
function subtasksEmpty() {
    const subtasksSection = document.querySelector('.detailed-task-subtasks');
    subtasksSection.innerHTML = '<h3>Subtasks<span class="detailed-task-dialog-placeholder">No subtasks</span></h3>';
}

/**
 * Displays a responsive placeholder message in the "Attachments" section
 * when the task has no attachments.
 * On desktop, shows "Attachments / No attachments".
 * On mobile, shows "Uploaded files / No files".
 */
function attachmentsEmpty() {
    const attachmentsSection = document.querySelector('.detailed-task-attachments');
    if (window.innerWidth > 560) {
        attachmentsSection.innerHTML = '<h3>Attachments<span class="detailed-task-dialog-placeholder">No attachments</span></h3>';
    } else {
        attachmentsSection.innerHTML = '<h3>Uploaded files<span class="detailed-task-dialog-placeholder">No files</span></h3>';
    }
}


/**
 * Formats a date string in the format "DD/MM/YYYY" from a given date string in the format "YYYY-MM-DD".
 * @param {string} dateString - The date string to format.
 * @returns {string} The formatted date string in "DD/MM/YYYY" format.
 */
function formatDate(dateString) {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
}


/**
 * Renders the subtasks for a given task into the detailed view list.
 * @param {object} task - The task object containing the subtasks.
 */
function renderTaskSubtasks(task) {
    const subtaskList = document.querySelector('.detailed-task-subtasks-list');
    subtaskList.innerHTML = '';
    if (!task.subtasks || task.subtasks.length === 0) {
        subtasksEmpty();
    } else {
        task.subtasks.forEach(subtask => {
            subtaskList.innerHTML += getSubtaskItemHTML(subtask, task.id);
        });
        addSubtaskClickHandlers();
    }
}


/**
 * Adds click event handlers to all subtask checkboxes.
 */
function addSubtaskClickHandlers() {
    const subtaskItems = document.querySelectorAll('.detailed-task-subtask-item');
    subtaskItems.forEach(item => {
        const taskId = item.dataset.taskId;
        const subtaskId = item.dataset.subtaskId;
        bindEventListenerOnce(item, 'click', () => {
            toggleSubtaskCompletion(taskId, subtaskId);
        }, `subtask-${taskId}-${subtaskId}-click`);
        bindEventListenerOnce(item, 'keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                toggleSubtaskCompletion(taskId, subtaskId);
            }
        }, `subtask-${taskId}-${subtaskId}-keydown`);
    });
}


/**
 * Toggles the completion status of a subtask.
 * @param {string} taskId - The ID of the task containing the subtask
 * @param {string} subtaskId - The ID of the subtask to toggle
 */
function toggleSubtaskCompletion(taskId, subtaskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !task.subtasks) return;
    const subtask = task.subtasks.find(st => st.id === subtaskId);
    if (!subtask) return;
    subtask.completed = !subtask.completed;
    updateSubtaskUI(taskId, subtaskId, subtask.completed);
    saveSubtaskChanges(task);
}


/**
 * Updates the UI for a single subtask after status change.
 * @param {string} taskId - The ID of the task
 * @param {string} subtaskId - The ID of the subtask
 * @param {boolean} isCompleted - Whether the subtask is completed
 */
function updateSubtaskUI(taskId, subtaskId, isCompleted) {
    const selector = `.detailed-task-subtask-item[data-task-id="${taskId}"][data-subtask-id="${subtaskId}"]`;
    const subtaskItem = document.querySelector(selector);
    if (!subtaskItem) return;
    const checkboxImg = subtaskItem.querySelector('.detailed-task-subtask-checkbox');
    const imgName = isCompleted ? 'checkbox-checked.svg' : 'checkbox.svg';
    checkboxImg.src = `../assets/images/global/${imgName}`;
}


/**
 * Saves subtask changes to the database.
 * @param {object} task - The task with updated subtasks
 */
async function saveSubtaskChanges(task) {
    try {
        await updateData("/tasks", task.id, { subtasks: task.subtasks });
        renderTasks();
    } catch (error) {
        console.error('Error saving subtask changes:', error);
    }
}


/**
 * Deletes a task from the tasks array and from the database.
 * @param {string} taskId - The ID of the task to delete
 * @throws {Error} - If error occurs while deleting task
 */
function deleteTask(taskId) {
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    if (taskIndex === -1) return;
    tasks.splice(taskIndex, 1);
    deleteData("/tasks", taskId)
        .then(() => {
            renderTasks();
            document.getElementById('detailed-task-dialog').close();
        })
        .catch(error => console.error('Error deleting task:', error));
}

window.addEventListener('resize', () => {
    const attachmentTitle = document.querySelector('.detailed-task-attachments h3');
    if (!attachmentTitle) return;
    attachmentTitle.textContent = window.innerWidth > 560 ? 'Attachments' : 'Uploaded files';
});