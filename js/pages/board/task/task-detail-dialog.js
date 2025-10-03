/**
 * Opens the detailed task view modal with the specified task's details.
 * @param {string} taskId - The ID of the task to display.
 */
function showDetailedTask(taskId) {
    if (cardDisabled) return;
    dialog = document.getElementById('detailed-task-dialog');
    const task = tasks.find(t => t.id === taskId);
    if (!task || isDragging) return;
    dialog.innerHTML = getDetailedTaskHTML(task);
    renderDetaliedTaskComponents(task)
    openDetaliedTaskDialog(dialog);
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
    attachments = task.attachments ? Object.values(task.attachments) : [];
    renderAttachments();
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
    if (!task.subtasks || task.subtasks.length === 0) return;
    task.subtasks.forEach(subtask => {
        subtaskList.innerHTML += getSubtaskItemHTML(subtask, task.id);
    });
    addSubtaskClickHandlers();
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