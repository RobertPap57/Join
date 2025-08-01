/**
 * Board functionality for managing and displaying tasks
 */

let searchQuery = '';

/**
 * Initializes the board page with necessary setup and data loading.
 */
async function initBoard() {
    await includeHTML();
    checkOrientation();
    checkForCurrentUser() ? "" : redirectTo('login.html');
    displayHeaderAvatar();
    highlightLink('board');
    await getTasks();
    await getContacts();
    renderTasks();
    setupSearchFunctionality();
    closeDetailedTaskOnClickOutside();

}



function blockDragOnDownloadBtn() {
    document.querySelectorAll('.download-attachment-btn').forEach(link => {
        link.addEventListener('dragstart', event => {
            event.preventDefault();
        });
    });
}



/**
 * Generates HTML for a task card.
 * @param {Object} task - Task object with properties like title, category, description, priority
 * @returns {string} HTML string for the task card
 */
function getTaskCardHTML(task) {
    return `<article class="task-card" draggable="true" data-task-id="${task.id}"
    onclick="openDetailedTaskView('${task.id}')">
    <header class="task-card-category" style="background-color: ${getCategoryColor(task.category)};">
        <p>${task.category}</p>
    </header>
    <h2>${task.title}</h2>
    <p class="task-card-desc">${task.description}</p>
    ${generateProgressHTML(task)}
    <footer class="task-card-footer">
        <div class="assigned-avatars">
            ${generateAssignedAvatarsHTML(task.assignedTo, task.id, 'card')}
        </div>
        <div class="task-priority d-flex-center" aria-label="Priority: ${task.priority}">
            <img src="../assets/images/global/${task.priority}.svg" alt="Priority: ${task.priority}">
        </div>
    </footer>
</article>`;
}

/**
 * Returns the color code associated with a given category.
 *
 * @param {string} category - The name of the category.
 * @returns {string} The hex color code for the specified category.
 */
function getCategoryColor(category) {
    return category === 'Technical Task' ? '#1FD7C1' : '#0038FF';
}

/**
 * Generates HTML for task progress bar based on subtasks completion.
 * @param {Object} task - Task object with subtasks array
 * @returns {string} HTML string for the progress bar or empty string if no subtasks
 */
function generateProgressHTML(task) {
    if (!task.subTasks || task.subTasks.length === 0) {
        return '';
    }

    const totalSubtasks = task.subTasks.length;
    const completedSubtasks = task.subTasks.filter(subtask => subtask.completet === true).length;
    const progressPercentage = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

    return `<div class="task-progress" role="progressbar" aria-valuenow="${completedSubtasks}" aria-valuemin="0" aria-valuemax="${totalSubtasks}">
        <span class="progress-bar"><span class="progress" style="width: ${progressPercentage}%;"></span></span>
        ${completedSubtasks}/${totalSubtasks} Subtasks
    </div>`;
}

function generateAssignedAvatarsHTML(assignedToIds, taskId, context) {
    if (!assignedToIds || assignedToIds.length === 0) return '';

    return assignedToIds.map((contactId, index) => {
        const uniqueAvatarId = `task-${taskId}-assignedTo-${contactId}-${context}`;
        let classes = 'profile-avatar-small d-flex-center';
        let style = '';

        if (context === 'card') {
            classes += ' task-card-avatar';
            style = `left: ${index * 24}px;`;
        } else if (context === 'modal') {
            classes += ' detailed-task-avatar';
        }

        return `<div id="${uniqueAvatarId}" class="${classes}" style="${style}"></div>`;
    }).join('');
}

/**
 * Finds a contact by ID in the contacts array.
 * @param {string} contactId - The ID of the contact to find
 * @returns {Object|null} The contact object or null if not found
 */
function findContactById(contactId) {
    return contacts.find(contact => contact.id === contactId) || null;
}

/**
 * Renders all tasks in their respective containers based on status.
 */
function renderTasks() {
    clearTaskContainers();
    setupDragAndDrop();

    if (!tasks || tasks.length === 0) {
        showEmptyContainers();
        return;
    }

    const filteredTasks = getFilteredTasks();

    if (filteredTasks.length === 0 && searchQuery.trim() !== '') {
        showSearchError();
        showEmptyContainers();
        return;
    } else {
        hideSearchError();
    }

    filteredTasks.forEach(task => {
        renderTaskInContainer(task);
    });

    showEmptyContainersIfNeeded();
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
 * Shows empty message for all task containers when no tasks exist.
 */
function showEmptyContainers() {
    const containerIds = ['to-do', 'in-progress', 'await-feedback', 'done'];

    containerIds.forEach((id) => {
        const container = document.getElementById(id);
        if (container) {
            const formattedName = id
                .replace(/-/g, ' ')
                .replace(/^\w/, c => c.toUpperCase());
            container.innerHTML = `<span class="empty-task-container d-flex-center">No tasks ${formattedName}</span>`;
        }
    });
}

/**
 * Shows empty message for containers that have no task cards.
 */
function showEmptyContainersIfNeeded() {
    const containerIds = ['to-do', 'in-progress', 'await-feedback', 'done'];

    containerIds.forEach((id) => {
        const container = document.getElementById(id);
        if (container && !container.querySelector('.task-card')) {
            const formattedName = id
                .replace(/-/g, ' ')
                .replace(/^\w/, c => c.toUpperCase());
            container.innerHTML = `<span class="empty-task-container d-flex-center">No tasks ${formattedName}</span>`;
        }
    });
}

/**
 * Renders a single task in the appropriate container.
 * @param {Object} task - Task object to render
 */
function renderTaskInContainer(task) {
    // Only map the one case where task status differs from container ID
    const containerId = task.status === 'awaiting-feedback' ? 'await-feedback' : task.status;
    const container = document.getElementById(containerId);

    if (container) {
        const taskHTML = getTaskCardHTML(task);
        container.innerHTML += taskHTML;

        // Use setTimeout to ensure DOM is updated before rendering avatars
        setTimeout(() => renderTaskAvatars(task, 'card'), 0);
    }
}

/**
 * Renders avatars for assigned contacts after task HTML is in DOM.
 * @param {Object} task - Task object with assignedTo array
 */
function renderTaskAvatars(task, context) {
    if (!task.assignedTo || task.assignedTo.length === 0) {
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

let draggedTaskId = null;
let draggedTaskStatus = null;

/**
 * Sets up basic drag and drop for task containers.
 */
function setupDragAndDrop() {
    const containers = ['to-do', 'in-progress', 'await-feedback', 'done'];

    containers.forEach(containerId => {
        const container = document.getElementById(containerId);
        if (container) {
            container.addEventListener('dragover', handleDragOver);
            container.addEventListener('drop', handleDrop);
            container.addEventListener('dragenter', handleDragEnter);
            container.addEventListener('dragleave', handleDragLeave);
        }
    });

    // Add drag start listeners to all task cards
    document.addEventListener('dragstart', handleDragStart);
    document.addEventListener('dragend', handleDragEnd);
}

/**
 * Handles drag start event for task cards.
 * Stores the dragged task ID and status, applies visual rotation effect.
 * @param {DragEvent} event - The drag start event
 */
function handleDragStart(event) {
    if (event.target.closest('.task-card')) {
        const taskCard = event.target.closest('.task-card');
        draggedTaskId = taskCard.dataset.taskId;

        const task = tasks.find(t => t.id === draggedTaskId);
        draggedTaskStatus = task ? task.status : null;

        taskCard.style.transform = 'rotate(5deg)';

        event.dataTransfer.effectAllowed = 'move';
    }
}

/**
 * Handles drag end event for task cards.
 * Resets visual effects and cleans up shadow elements.
 * @param {DragEvent} event - The drag end event
 */
function handleDragEnd(event) {
    if (event.target.closest('.task-card')) {
        const taskCard = event.target.closest('.task-card');

        taskCard.style.transform = '';

        removeShadowElements();

        draggedTaskStatus = null;
    }
}

/**
 * Handles drag enter event for task containers.
 * Shows shadow element only when dragging to a different container than the origin.
 * @param {DragEvent} event - The drag enter event
 */
function handleDragEnter(event) {
    event.preventDefault();
    if (draggedTaskId && draggedTaskStatus) {
        const containerId = event.currentTarget.id;
        const containerStatus = containerId === 'await-feedback' ? 'awaiting-feedback' : containerId;

        if (containerStatus !== draggedTaskStatus) {
            showShadowElement(event.currentTarget);
        }
    }
}

/**
 * Handles drag leave event for task containers.
 * Hides shadow element when cursor leaves container boundaries.
 * @param {DragEvent} event - The drag leave event
 */
function handleDragLeave(event) {
    const container = event.currentTarget;
    const rect = container.getBoundingClientRect();
    const x = event.clientX;
    const y = event.clientY;

    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
        hideShadowElement(container);
    }
}

/**
 * Handles drag over event for task containers.
 * Enables dropping by preventing default behavior.
 * @param {DragEvent} event - The drag over event
 */
function handleDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
}

/**
 * Handles drop event for task containers.
 * Updates task status when dropped in a different container.
 * @param {DragEvent} event - The drop event
 */
async function handleDrop(event) {
    event.preventDefault();

    if (draggedTaskId) {
        const containerId = event.currentTarget.id;
        const newStatus = containerId === 'await-feedback' ? 'awaiting-feedback' : containerId;

        await updateTaskStatus(draggedTaskId, newStatus);

        draggedTaskId = null;
        removeShadowElements();
    }
}

/**
 * Updates task status in both local array and database, then re-renders tasks.
 * @param {string} taskId - The ID of the task to update
 * @param {string} newStatus - The new status to assign to the task
 */
async function updateTaskStatus(taskId, newStatus) {
    const task = tasks.find(task => task.id === taskId);
    if (task) {
        task.status = newStatus;

        await updateData("/tasks", taskId, { status: newStatus });

        renderTasks();
    }
}

/**
 * Shows shadow element in the specified container at the appropriate position.
 * @param {HTMLElement} container - The container to show shadow element in
 */
function showShadowElement(container) {
    hideShadowElement(container);
    const shadowElement = createShadowElement();
    container.appendChild(shadowElement);
}

/**
 * Hides shadow element from the specified container by removing it from DOM.
 * @param {HTMLElement} container - The container to remove shadow element from
 */
function hideShadowElement(container) {
    const existingShadow = container.querySelector('.task-card-shadow');
    if (existingShadow) {
        existingShadow.remove();
    }
}

/**
 * Removes all shadow elements from all task containers.
 */
function removeShadowElements() {
    const shadows = document.querySelectorAll('.task-card-shadow');
    shadows.forEach(shadow => shadow.remove());
}

/**
 * Creates a shadow element for drop indication during drag operations.
 * @returns {HTMLElement} The created shadow element with disabled pointer events
 */
function createShadowElement() {
    const shadowElement = document.createElement('div');
    shadowElement.className = 'task-card-shadow';
    shadowElement.style.pointerEvents = 'none';
    return shadowElement;
}

/**
 * Sets up search functionality for task filtering.
 */
function setupSearchFunctionality() {
    const searchInput = document.querySelector('input[name="q"]');
    const searchForm = document.querySelector('.search-form');

    if (searchInput) {
        searchInput.addEventListener('input', handleSearchInput);
    }

    if (searchForm) {
        searchForm.addEventListener('submit', handleSearchSubmit);
    }
}

/**
 * Handles search input events and filters tasks in real-time.
 * @param {Event} event - The input event
 */
function handleSearchInput(event) {
    searchQuery = event.target.value;
    renderTasks();
}

/**
 * Handles search form submission and prevents page reload.
 * @param {Event} event - The form submit event
 */
function handleSearchSubmit(event) {
    event.preventDefault();
    const searchInput = document.querySelector('input[name="q"]');
    if (searchInput) {
        searchQuery = searchInput.value;
        renderTasks();
    }
}

/**
 * Filters tasks based on current search query.
 * @returns {Array} Array of tasks matching the search criteria
 */
function getFilteredTasks() {
    if (!searchQuery.trim()) {
        return tasks;
    }

    const query = searchQuery.toLowerCase().trim();
    return tasks.filter(task => {
        const titleMatch = task.title.toLowerCase().includes(query);
        const descMatch = task.description.toLowerCase().includes(query);
        return titleMatch || descMatch;
    });
}

/**
 * Shows search error styling when no results found.
 */
function showSearchError() {
    const searchInput = document.querySelector('input[name="q"]');
    const errorMessage = document.querySelector('.search-error-message');

    if (searchInput) {
        searchInput.style.borderColor = '#FF8190';
    }
    if (errorMessage) {
        errorMessage.style.display = 'block';
    }
}

/**
 * Hides search error styling when results found or input empty.
 */
function hideSearchError() {
    const searchInput = document.querySelector('input[name="q"]');
    const errorMessage = document.querySelector('.search-error-message');

    if (searchInput) {
        searchInput.style.borderColor = '';
    }
    if (errorMessage) {
        errorMessage.style.display = 'none';
    }
}

/**
 * Opens the detailed task view modal with the specified task's details.
 * @param {string} taskId - The ID of the task to display.
 */
function openDetailedTaskView(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const dialog = document.getElementById('detailed-task-dialog');
    const content = dialog.querySelector('.detailed-task-content');
    content.innerHTML = getDetailedTaskHTML(task);
    renderSubtasks(task);
    renderTaskAvatars(task, 'modal');

    attachments = task.attachments ? Object.values(task.attachments) : [];
    renderAttachments();
    currentAttachments = attachments;
    const attachmentItems = content.querySelectorAll('.attachment-item');

    attachmentItems.forEach((item, index) => {
        item.addEventListener('click', (event) => {
            // Do not open viewer if the download button or its child image is clicked
            if (event.target.closest('.download-attachment-btn')) {
                return;
            }
            openImageViewer(index);
        });
    });
    dialog.showModal();
    blockDragOnDownloadBtn();
}

function formatDate(dateString) {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
}

/**
 * Generates the HTML for the detailed task view.
 * @param {Object} task - The task object.
 * @returns {string} The HTML string for the detailed task view.
 */
function getDetailedTaskHTML(task) {
    return `
        <header>
            <div class="detailed-task-category" style="background-color: ${getCategoryColor(task.category)};">
                <span>${task.category}</span>
            </div>
            <button class="close-btn d-flex-center p-relative" aria-label="Close dialog"
                onclick="document.getElementById('detailed-task-dialog').close()">
                <img src="../assets/images/global/close.svg" alt="Close dialog">
            </button>
        </header>
        <h2>${task.title}</h2>
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
            <div class="detailed-task-assigned-avatars d-flex-center">
                ${generateAssignedAvatarsHTML(task.assignedTo, task.id, 'modal')}
            </div>
        </section>
        <section class="detailed-task-attachments">
            <h3>Attachments</h3>
            <div id="detailed-task-attachments-list-wrapper" class="attachments-list-wrapper">
                <ul class="attachments-list" id="detailed-task-attachments-list">
                </ul>
            </div>
        </section>
        <section class="detailed-task-subtasks">
            <h3>Subtasks</h3>
             <ul class="detailed-task-subtasks-list">
                   
                </ul>
        </section>
        <footer class="detailed-task-action-btns">

                    <button class="delete-detailed-task-btn">
                        <img src="../assets/images/global/delete.svg" alt="">
                        <p>Delete</p>
                    </button>
                    <span></span>
                    <button class="edit-detailed-task-btn">
                        <img src="../assets/images/global/edit.svg" alt="">
                        <p>Edit</p>
                    </button>
                </footer>
    `;
}

/**
 * Generates the HTML for a single subtask item in the detailed view.
 * @param {object} subtask - The subtask object.
 * @returns {string} The HTML string for the subtask item.
 */
function getSubtaskItemHTML(subtask, taskId) {
    const checkboxImg = subtask.completet ? 'checkbox-checked.svg' : 'checkbox.svg';
    return `
        <li class="detailed-task-subtask-item" data-task-id="${taskId}" data-subtask-id="${subtask.id}">
            <div class="d-flex-center subtask-checkbox-container">
                <img class="detailed-task-subtask-checkbox" src="../assets/images/global/${checkboxImg}" alt="Checkbox">
            </div>
            <p>${subtask.content}</p>
        </li>
    `;
}

/**
 * Renders the subtasks for a given task into the detailed view list.
 * @param {object} task - The task object containing the subtasks.
 */
function renderSubtasks(task) {
    const subtaskList = document.querySelector('.detailed-task-subtasks-list');
    subtaskList.innerHTML = '';
    if (!task.subTasks || task.subTasks.length === 0) return;

    task.subTasks.forEach(subtask => {
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
        item.addEventListener('click', () => {
            const taskId = item.dataset.taskId;
            const subtaskId = item.dataset.subtaskId;
            toggleSubtaskCompletion(taskId, subtaskId);
        });
    });
}


/**
 * Toggles the completion status of a subtask.
 * @param {string} taskId - The ID of the task containing the subtask
 * @param {string} subtaskId - The ID of the subtask to toggle
 */
function toggleSubtaskCompletion(taskId, subtaskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !task.subTasks) return;

    const subtask = task.subTasks.find(st => st.id === subtaskId);
    if (!subtask) return;

    subtask.completet = !subtask.completet;
    updateSubtaskUI(taskId, subtaskId, subtask.completet);
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
        await updateData("/tasks", task.id, { subTasks: task.subTasks });
        // Update the task card to reflect subtask progress changes
        renderTasks();
    } catch (error) {
        console.error('Error saving subtask changes:', error);
    }
}

function closeDetailedTaskOnClickOutside() {
    const dialog = document.getElementById('detailed-task-dialog');
    dialog.addEventListener('click', (event) => {
        const rect = dialog.getBoundingClientRect();
        const isInDialog =
            event.clientX >= rect.left &&
            event.clientX <= rect.right &&
            event.clientY >= rect.top &&
            event.clientY <= rect.bottom;

        if (!isInDialog) {
            dialog.close();
        }
    });
}


