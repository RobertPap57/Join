/**
 * Generates HTML for a task card.
 * @param {Object} task - Task object with properties like title, category, description, priority
 * @returns {string} HTML string for the task card
 */
function getTaskCardHTML(task) {
    return `<li class="task-card" draggable="true" data-task-id="${task.id}" tabindex="0">
    <header class="task-card-category" style="background-color: ${getCategoryColor(task.category)};">
        <p>${task.category}</p>
    </header>
    <h2>${task.title}</h2>
    <p class="task-card-desc">${task.description}</p>
    ${generateProgressHTML(task)}
    <footer class="task-card-footer">
        <ul class="assigned-avatars">
            ${generateAssignedAvatarsHTML(task.assignedTo, task.id, 'card')}
        </ul>
        <div class="task-priority d-flex-center">
            <img src="../assets/images/global/${task.priority}.svg" alt="Priority: ${task.priority}">
        </div>
    </footer>
</li>`;
}


/**
 * Generates the HTML for the detailed task view.
 * @param {Object} task - The task object.
 * @returns {string} The HTML string for the detailed task view.
 */
function getDetailedTaskHTML(task) {
    return `
    <article class="d-flex-col-24">
        <header class="detailed-task-header d-flex-col-24">
            <div class="detailed-task-category" style="background-color: ${getCategoryColor(task.category)};">
                <span>${task.category}</span>
            </div>
            <button class="close-btn d-flex-center detailed-task-close-btn" aria-label="Close dialog"
                onclick="closeDetaliedTaskDialog()">
                <img src="../assets/images/global/close.svg" alt="">
            </button>
            <h2 id="detailed-task-title">${task.title}</h2>
        </header>
        <div class="scroll-container d-flex-col-24 detailed-task-scroll-content">
        <p class="detailed-task-desc">${task.description}</p>
        <section class="detailed-task-due-date">
            <h3>Due date:</h3>
            <span>${formatDate(task.dueDate)}</span>
        </section>
        <section class="detailed-task-priority">
            <h3>Priority:</h3>
            <div class="d-flex-center">
                <span>${capitalizeFirstLetter(task.priority)}</span>
                <img src="../assets/images/global/${task.priority}.svg" alt="">
            </div>
        </section>
        <section class="detailed-task-assigned">
            <h3>Assigned To:</h3>
            <ul class="detailed-task-assigned-avatars d-flex-center" aria-label="Assigned contacts">
                ${generateAssignedAvatarsHTML(task.assignedTo, task.id, 'modal')}
            </ul>
        </section>
        <section class="detailed-task-attachments">
            <h3>Attachments</h3>
            <h3 class="uploaded-files-title">Uploaded files</h3>
            <div id="detailed-task-attachments-list-wrapper" class="attachments-list-wrapper">
                <ul class="attachments-list" id="detailed-task-attachments-list" aria-label="Uploaded files"></ul>
            </div>
        </section>
        <section class="detailed-task-subtasks">
            <h3>Subtasks</h3>
            <ul class="detailed-task-subtasks-list" aria-label="Subtasks"></ul>
        </section>
        </div>
        <footer class="detailed-task-action-btns">
                    <button class="delete-detailed-task-btn" onclick="deleteTask('${task.id}')">
                        <img src="../assets/images/global/delete.svg" alt="">
                        Delete
                    </button>
                    <span></span>
                    <button class="edit-detailed-task-btn" onclick="openTaskFormDialog('edit-task', { taskId: '${task.id}' });">
                        <img src="../assets/images/global/edit.svg" alt="">
                        Edit
                    </button>
        </footer>
    </article>`;
}


/**
 * Generates the HTML for a single subtask item in the detailed view.
 * @param {object} subtask - The subtask object.
 * @returns {string} The HTML string for the subtask item.
 */
function getSubtaskItemHTML(subtask, taskId) {
    const checkboxImg = subtask.completed ? 'checkbox-checked.svg' : 'checkbox.svg';
    return `
        <li class="detailed-task-subtask-item" data-task-id="${taskId}" data-subtask-id="${subtask.id}">
            <div class="d-flex-center subtask-checkbox-container"
            role="checkbox" aria-checked="${subtask.completed ? 'true' : 'false'}"
            tabindex="0" aria-labelledby="subtask-${subtask.id}-label">
                <img class="detailed-task-subtask-checkbox" src="../assets/images/global/${checkboxImg}" alt="">
            </div>
            <p id="subtask-${subtask.id}-label">${subtask.content}</p>
        </li>
    `;
}


/**
 * Generates HTML for a progress bar displaying completed and total subtasks.
 *
 * @param {number} totalSubtasks - The total number of subtasks.
 * @param {number} completedSubtasks - The number of completed subtasks.
 * @param {number} progressPercentage - The completion percentage for the progress bar.
 * @returns {string} HTML string representing the progress bar.
 */
function getProgressbarHTML(totalSubtasks, completedSubtasks, progressPercentage) {
    return `<div class="task-progress" role="progressbar" aria-label="Subtasks progress" aria-valuenow="${completedSubtasks}" aria-valuemin="0" aria-valuemax="${totalSubtasks}">
        <span class="progress-bar"><span class="progress" style="width: ${progressPercentage}%;"></span></span>
        ${completedSubtasks}/${totalSubtasks} Subtasks
    </div>`;
} 