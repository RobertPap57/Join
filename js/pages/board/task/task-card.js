/**
 * Renders all tasks in the task containers.
 * Clears the task containers, renders tasks based on current search query and filters,
 * shows empty message for containers that have no task cards, sets up event listeners
 * for task cards, and aligns task cards for mobile devices.
 */
function renderTasks() {
    clearTaskContainers();
    renderFilteredTasks();
    showEmptyContainer();
    setupCardEventsListeners();
    alignCardsMobile();
}


/**
 * Generates HTML for task progress bar based on subtasks completion.
 * @param {Object} task - Task object with subtasks array
 * @returns {string} HTML string for the progress bar or empty string if no subtasks
 */
function generateProgressHTML(task) {
    if (!task.subtasks || task.subtasks.length === 0) {
        return '';
    }
    const totalSubtasks = task.subtasks.length;
    const completedSubtasks = task.subtasks.filter(subtask => subtask.completed === true).length;
    const progressPercentage = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;
    return getProgressbarHTML(totalSubtasks, completedSubtasks, progressPercentage);
}


/**
 * Generates HTML for displaying assigned user avatars for a task.
 *
 * @param {Array<string|number>} assignedToIds - Array of user IDs assigned to the task.
 * @param {string|number} taskId - The unique identifier of the task.
 * @param {string} context - The context in which the avatars are displayed (e.g., 'card').
 * @returns {string} HTML string representing the assigned avatars, including overflow indicator if necessary.
 */
function generateAssignedAvatarsHTML(assignedToIds, taskId, context) {
    if (!assignedToIds || assignedToIds.length === 0) return '';
    const maxVisible = 6;
    const validIds = assignedToIds.filter(id => contacts.some(c => c.id === id) || id === currentUser.id);
    const html = validIds.map((id, index) => createAvatarDiv(id, taskId, context, index, maxVisible)).join('');
    const hasOverflow = context === 'card' && validIds.length > maxVisible;
    return hasOverflow ? html + createOverflowAvatar(validIds.length - maxVisible, maxVisible) : html;
}

/**
 * Creates an HTML string for an avatar div representing a contact assigned to a task.
 *
 * @param {string|number} contactId - The unique identifier of the contact.
 * @param {string|number} taskId - The unique identifier of the task.
 * @param {string} context - The context in which the avatar is displayed (e.g., 'card').
 * @param {number} index - The index of the avatar in the list of assigned contacts.
 * @param {number} maxVisible - The maximum number of visible avatars before hiding the rest.
 * @returns {string} The HTML string for the avatar div.
 */
function createAvatarDiv(contactId, taskId, context, index, maxVisible) {
    const uniqueId = `task-${taskId}-assignedTo-${contactId}-${context}`;
    let classes = 'profile-avatar-small d-flex-center';
    let style = '';
    if (context === 'card') {
        classes += ' task-card-avatar';
        style = `left: ${index * 24}px;`;
        if (index >= maxVisible) classes += ' d-none';
    }
    return `<li id="${uniqueId}" class="${classes}" style="${style}"></li>`;
}


/**
 * Creates an HTML string for an overflow avatar indicating the number of remaining avatars.
 *
 * @param {number} remaining - The number of remaining avatars not displayed.
 * @param {number} positionIndex - The index position to determine the avatar's horizontal offset.
 * @returns {string} HTML string representing the overflow avatar element.
 */
function createOverflowAvatar(remaining, positionIndex) {
    const style = `left: ${positionIndex * 24}px; background-color: #d1d1d1;`;
    const classes = 'profile-avatar-small d-flex-center task-card-avatar';
    return `<div class="${classes}" style="${style}">+${remaining}</div>`;
}


/**
 * Adjusts the horizontal alignment and padding of task containers on mobile screens.
 * Applies extra padding and scrolls containers if their content overflows on small screens.
 */
function alignCardsMobile() {
    document.querySelectorAll(".task-container").forEach(container => {
        if (window.innerWidth <= 1400 && container.scrollWidth > container.clientWidth) {
            container.style.paddingInline = '16px';
            container.scrollLeft = 16;
        } else {
            container.style.paddingInline = '';
            container.scrollLeft = 0;
        }
    });
}


/**
 * Clears all task containers.
 */
function clearTaskContainers() {
    const containers = [
        'to-do',
        'in-progress',
        'await-feedback',
        'done'
    ];
    containers.forEach(containerId => {
        const container = document.getElementById(containerId);
        if (container) container.innerHTML = '';
    });
}


/**
 * Renders a single task in the appropriate container.
 * @param {Object} task - Task object to render
 */
function renderTaskInContainer(task) {
    const containerId = task.status;
    const container = document.getElementById(containerId);
    if (container) {
        const taskHTML = getTaskCardHTML(task);
        container.innerHTML += taskHTML;
        setTimeout(() => renderTaskAvatars(task, 'card'), 0);
    }
}


/**
 * Renders profile avatars for each contact assigned to a task.
 *
 * @param {Object} task - The task object containing assignment information.
 * @param {string} context - A string representing the rendering context (e.g., board, detail view).
 */
function renderTaskAvatars(task, context) {
    if (!task.assignedTo || task.assignedTo.length === 0) {
        if (context === 'modal') {
            assignedToEmpty();
        }
        return;
    }
    task.assignedTo.forEach(contactId => {
        const contact = findContactById(contactId);
        if (contact) {
            const uniqueAvatarId = `task-${task.id}-assignedTo-${contactId}-${context}`;
            displayProfileAvatar(contact, uniqueAvatarId);
        }
    });
}


/**
 * Sets up event listeners for task cards and containers.
 * Sets up drag and drop event listeners for task containers and task cards.
 * Sets up click event listeners for task cards to open the detail view.
 * Sets up keyboard drag and drop event listeners for task cards.
 * Sets up touch drag and drop event listeners for task cards.
 */
function setupCardEventsListeners() {
    containerIds.forEach(containerId => {
        const container = document.getElementById(containerId);
        setupDragAndDrop(container, null);
    });
    const taskCards = document.querySelectorAll('.task-card');
    taskCards.forEach(card => {
        setupDragAndDrop(null, card);
        setupOpenTaskCardListeners(card);
        setupKeyboardDragAndDrop(card);
        setupTouchDragAndDrop(card);
    });
}


/**
 * Sets up event listeners to open the detailed task view when a task card is clicked or Enter is pressed.
 * @param {HTMLElement} card - The task card element to set up event listeners for.
 */
function setupOpenTaskCardListeners(card) {
    bindEventListenerOnce(card, 'mouseup', () => showDetailedTask(card.dataset.taskId), 'openTaskCard');
    bindEventListenerOnce(card, 'touchend', () => showDetailedTask(card.dataset.taskId), 'openTaskCard');
    bindEventListenerOnce(card, 'keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            showDetailedTask(card.dataset.taskId);
        }
    }, 'openTaskCard');
}


/**
 * Updates the status and timestamp of a task, persists the changes, and re-renders the task list.
 * @param {number|string} taskId - The unique identifier of the task to update.
 * @param {HTMLElement} container - The DOM element representing the new status container for the task.
 */
async function updateTaskStatus(taskId, container) {
    const task = tasks.find(task => task.id === taskId);
    if (task) {
        task.status = container.id;
        task.timestamp = Date.now();
        await updateData("/tasks", taskId, { status: task.status, timestamp: task.timestamp });
        renderTasks();
        scrollToContainerMax(container, false);
    }
}