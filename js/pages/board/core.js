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
    initPopup();
    await getTasks();
    await getContacts();
    renderTasks();
    setupSearchFunctionality();
    initHorizontalDrag('.task-container');
    closeDetailedTaskOnClickOutside();


}


function setupDragListener() {
    if (window.innerWidth <= 1400) {

    } else {}
}

function alignCardsMobile() {
    if (window.innerWidth <= 1400) {
        document.querySelectorAll(".task-container").forEach(container => {
            if (container.scrollWidth > container.clientWidth) {
                container.style.paddingInline = '16px';
                container.scrollLeft = 16;
            }
        });
    }
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
    if (!task.subtasks || task.subtasks.length === 0) {
        return '';
    }

    const totalSubtasks = task.subtasks.length;
    const completedSubtasks = task.subtasks.filter(subtask => subtask.completed === true).length;
    const progressPercentage = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

    return `<div class="task-progress" role="progressbar" aria-valuenow="${completedSubtasks}" aria-valuemin="0" aria-valuemax="${totalSubtasks}">
        <span class="progress-bar"><span class="progress" style="width: ${progressPercentage}%;"></span></span>
        ${completedSubtasks}/${totalSubtasks} Subtasks
    </div>`;
}

function generateAssignedAvatarsHTML(assignedToIds, taskId, context) {
    if (!assignedToIds || assignedToIds.length === 0) return '';

    const maxVisible = 6;
    const html = assignedToIds.map((id, index) =>
        createAvatarDiv(id, taskId, context, index, maxVisible)
    ).join('');

    const hasOverflow = context === 'card' && assignedToIds.length > maxVisible;
    return hasOverflow ? html + createOverflowAvatar(assignedToIds.length - maxVisible, maxVisible) : html;
}

function createAvatarDiv(contactId, taskId, context, index, maxVisible) {
    const uniqueId = `task-${taskId}-assignedTo-${contactId}-${context}`;
    let classes = 'profile-avatar-small d-flex-center';
    let style = '';

    if (context === 'card') {
        classes += ' task-card-avatar';
        style = `left: ${index * 24}px;`;
        if (index >= maxVisible) classes += ' d-none';
    }

    return `<div id="${uniqueId}" class="${classes}" style="${style}"></div>`;
}

function createOverflowAvatar(remaining, positionIndex) {
    const style = `left: ${positionIndex * 24}px; background-color: #d1d1d1;`;
    const classes = 'profile-avatar-small d-flex-center task-card-avatar';

    return `<div class="${classes}" style="${style}">+${remaining}</div>`;
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
    alignCardsMobile();
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
    dialog.innerHTML = getDetailedTaskHTML(task);
    renderTaskSubtasks(task);
    renderTaskAvatars(task, 'modal');

    setupDetailedTaskAttachments(task, dialog);
    dialog.showModal();
    blockDragOnDownloadBtn();
}

function setupDetailedTaskAttachments(task, content) {
    attachments = task.attachments ? Object.values(task.attachments) : [];
    renderAttachments();
    currentAttachments = attachments;

    const attachmentItems = content.querySelectorAll('.attachment-item');
    setupAttachmentClickEvents(attachmentItems);
}

function setupAttachmentClickEvents(attachmentItems) {
    attachmentItems.forEach((item, index) => {
        let startPos = { x: 0, y: 0 };

        item.addEventListener('mousedown', (e) => {
            startPos = getPointerPosition(e);
        });

        item.addEventListener('mouseup', (e) => {
            handleAttachmentClick(e, startPos, index);
        });

        item.addEventListener('touchstart', (e) => {
            startPos = getPointerPosition(e);
        }, { passive: false });

        item.addEventListener('touchend', (e) => {
            handleAttachmentClick(e, startPos, index);
        });
    });
}

function getPointerPosition(event) {
    const e = event.touches?.[0] || event.changedTouches?.[0] || event;
    return {
        x: e.clientX,
        y: e.clientY
    };
}

function handleAttachmentClick(event, startPos, index) {
    if (event.target.closest('.download-attachment-btn')) return;

    const endPos = getPointerPosition(event);
    if (!hasMoved(startPos, endPos)) {
        event.preventDefault();
        openImageViewer(index);
    }
}

function hasMoved(start, end, threshold = 5) {
    return (
        Math.abs(end.x - start.x) > threshold ||
        Math.abs(end.y - start.y) > threshold
    );
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
    <article class="d-flex-col-24">
        <header class="detailed-task-header d-flex-col-24">
            <div class="detailed-task-category" style="background-color: ${getCategoryColor(task.category)};">
                <span>${task.category}</span>
            </div>
            <button class="close-btn d-flex-center detailed-task-close-btn" aria-label="Close dialog"
                onclick="document.getElementById('detailed-task-dialog').close()">
                <img src="../assets/images/global/close.svg" alt="Close dialog">
            </button>
            <h2>${task.title}</h2>
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
            <div class="detailed-task-assigned-avatars d-flex-center">
                ${generateAssignedAvatarsHTML(task.assignedTo, task.id, 'modal')}
            </div>
        </section>
        <section class="detailed-task-attachments">
            <h3>Attachments</h3>
            <h3 class="uploaded-files-title">Uploaded files</h3>
            <div id="detailed-task-attachments-list-wrapper" class="attachments-list-wrapper">
                <ul class="attachments-list" id="detailed-task-attachments-list"></ul>
            </div>
        </section>
        <section class="detailed-task-subtasks">
            <h3>Subtasks</h3>
            <ul class="detailed-task-subtasks-list"></ul>
        </section>
        </div>
        <footer class="detailed-task-action-btns">
                    <button class="delete-detailed-task-btn" onclick="deleteTask('${task.id}')">
                        <img src="../assets/images/global/delete.svg" alt="">
                        <p>Delete</p>
                    </button>
                    <span></span>
                    <button class="edit-detailed-task-btn" onclick="openTaskFormDialog('edit-task', { taskId: '${task.id}' });">
                        <img src="../assets/images/global/edit.svg" alt="">
                        <p>Edit</p>
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
        // Update the task card to reflect subtask progress changes
        renderTasks();
    } catch (error) {
        console.error('Error saving subtask changes:', error);
    }
}

function closeDetailedTaskOnClickOutside() {
    const dialog = document.getElementById('detailed-task-dialog');
    dialog.addEventListener('mousedown', (event) => handleOutsideClose(event, dialog));
    dialog.addEventListener('touchstart', (event) => handleOutsideClose(event, dialog), { passive: false });
}

function handleOutsideClose(event, dialog) {
    const rect = dialog.getBoundingClientRect();
    const x = event.touches ? event.touches[0].clientX : event.clientX;
    const y = event.touches ? event.touches[0].clientY : event.clientY;
    const isInDialog =
        x >= rect.left &&
        x <= rect.right &&
        y >= rect.top &&
        y <= rect.bottom;
    if (!isInDialog) dialog.close();
}




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


/**
 * Opens task form dialog with appropriate configuration.
 * @param {string} type - Type of form ('add-task', 'edit-task', etc.)
 * @param {Object} options - Additional options like taskId
 */
function openTaskFormDialog(type, options = {}) {
    const dialog = document.getElementById('task-form-dialog');
    const closeButton = dialog.querySelector('.close-task-form-dialog-btn');
    const formBottom = dialog.querySelector('.form-bottom');
    dialog.classList.remove('task-form-dialog-edit');
    closeButton.classList.remove('close-task-form-dialog-btn-edit');
    formBottom.classList.remove('form-bottom-edit');
    switch (type) {
        case 'edit-task':
            dialog.classList.add('task-form-dialog-edit');
            closeButton.classList.add('close-task-form-dialog-btn-edit');
            formBottom.classList.add('form-bottom-edit');
            initTaskForm('edit-task', options);
            if (options.taskId) {
                const task = tasks.find(t => t.id === options.taskId);
                if (task) {
                    setTimeout(() => {
                        populateTaskForm(task, type);
                    }, 100);
                }
            }
            dialog.showModal();
            document.getElementById('detailed-task-dialog').close();
            break;

        case 'add-task-dialog':
            if (window.innerWidth < 1024) {
                redirectTo('add-task.html');
                return;
            } else {
                initTaskForm('add-task-dialog', options);
                clearTask();
                reinitializeFormInteractions();
                dialog.showModal();
            }
            break;
    }
}

function closeTaskFormDialog() {
    const dialog = document.getElementById('task-form-dialog');
    dialog.close();

}


/**
 * Populates the task form with data from an existing task.
 * @param {Object} task - The task object containing all task data
 */
function populateTaskForm(task, type) {
    if (!task) return;

    populateBasicFields(task);
    populatePriority(task.priority);
    populateCategory(task.category);
    populateSubtasks(task.subtasks);
    populateAttachments(task.attachments);
    populateAssignedContacts(task.assignedTo);

    // Update UI elements that depend on populated data
    renderSubtasks();
    renderAttachments();
    renderSelectedContactsBelow();

    // Reinitialize interactive elements
    reinitializeFormInteractions(type);

}

/**
 * Re-initializes interactive form elements after population.
 */
function reinitializeFormInteractions(type) {
    reattachPriorityEvents();
    reattachCategoryEvents();
    reattachContactsEvents();
    preventFormSubmitOnEnter();
    styleSubtaskInput();
    pushSubtask();
    initHorizontalDrag('.attachments-list');
    fileInputListener();
    disableCategoryDropdown(type);
    addValidationEventListeners();
}

/**
 * Populates the basic form fields (title, description, due date).
 * @param {Object} task - The task object
 */
function populateBasicFields(task) {
    const titleInput = document.getElementById('title');
    const descriptionInput = document.getElementById('description');
    const dueDateInput = document.getElementById('due-date-input');

    if (titleInput) titleInput.value = task.title || '';
    if (descriptionInput) descriptionInput.value = task.description || '';

    if (dueDateInput) {
        dueDateInput.value = task.dueDate || '';
        dueDateInput.classList.remove('color-grey');
    }
}

/**
 * Populates the priority buttons and ensures events still work.
 * @param {string} priority - The priority value ('urgent', 'medium', 'low')
 */
function populatePriority(priority) {
    if (!priority) return;

    // First reset all buttons to non-active state
    resetPriorityButtons();

    // Then activate just the matching one
    setPriorityButtonActive(priority);

    // Re-initialize event listeners for priority buttons
    reattachPriorityEvents();
}

/**
 * Resets all priority buttons to non-active state.
 */
function resetPriorityButtons() {
    const priorityButtons = document.querySelectorAll('.prio-btn');
    priorityButtons.forEach(button => {
        const buttonId = button.id;
        const img = button.querySelector('img');
        button.classList.remove('active');
        img.src = `../assets/images/global/${buttonId}.svg`;
    });
}

/**
 * Sets the specified priority button as active.
 * @param {string} priority - The priority to activate
 */
function setPriorityButtonActive(priority) {
    const button = document.getElementById(priority);
    if (!button) return;

    button.classList.add('active');
    const img = button.querySelector('img');
    if (img) {
        img.src = `../assets/images/global/${priority}-white.svg`;
    }
}

/**
 * Re-attaches event listeners to priority buttons.
 */
function reattachPriorityEvents() {
    const buttons = document.querySelectorAll('.prio-btn');
    buttons.forEach(button => {
        // First remove any existing listeners (clone and replace)
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);

        // Then add fresh listener
        newButton.addEventListener('click', () => {
            handlePriorityButtonClick(newButton, document.querySelectorAll('.prio-btn'));
        });
    });
}

/**
 * Populates the category dropdown and ensures it still works.
 * @param {string} category - The category value
 */
function populateCategory(category) {
    if (!category) return;

    const categoryDisplay = document.getElementById('category-displayed');
    const categoryContainer = document.getElementById('category-container');
    if (categoryDisplay) {
        categoryDisplay.textContent = category;
        categoryDisplay.dataset.selected = category;
        categoryContainer.classList.remove('show-menu');
        clearValidationMessage('category');

        // Re-initialize dropdown functionality
        reattachCategoryEvents();
    }
}

/**
 * Re-attaches event listeners to category dropdown.
 */
function reattachCategoryEvents() {
    const selectBtnCategory = document.querySelector('.select-btn.category');
    if (!selectBtnCategory) return;

    // Clone and replace to remove old listeners
    const newSelectBtn = selectBtnCategory.cloneNode(true);
    selectBtnCategory.parentNode.replaceChild(newSelectBtn, selectBtnCategory);

    // Add fresh event listeners
    setupCategoryDropdownToggles(newSelectBtn);

    // Re-attach list item events
    const listItems = document.querySelectorAll('.list-item.category');
    const categoryDisplayed = document.getElementById('category-displayed');
    setupCategorySelection(listItems, newSelectBtn, categoryDisplayed);

    // Make sure dropdown closes when clicking outside
    preventCategoryDropdownClose(document.querySelector('.list-items.category'));
    addCategoryDropdownOutsideListener(newSelectBtn, document.querySelector('.list-items.category'));
}

function populateSubtasks(taskSubtasks) {
    subtasks = [];

    if (!taskSubtasks) return;

    // Handle both array and object formats
    const subtasksArray = Array.isArray(taskSubtasks)
        ? taskSubtasks
        : Object.values(taskSubtasks);

    subtasksArray.forEach(subtask => {
        if (subtask && subtask.content) {
            // Keep the complete subtask object structure
            subtasks.push({
                id: subtask.id || createUniqueId(),
                content: subtask.content,
                completed: subtask.completed || false
            });
        }
    });
}

/**
 * Populates the attachments array from task data.
 * @param {Object} taskAttachments - The attachments object from the task
 */
function populateAttachments(taskAttachments) {
    attachments = [];

    if (!taskAttachments) return;

    // Convert object to array if needed
    const attachmentsArray = Array.isArray(taskAttachments)
        ? taskAttachments
        : Object.values(taskAttachments);

    attachmentsArray.forEach(attachment => {
        if (attachment && attachment.base64) {
            attachments.push(attachment);
        }
    });
}

/**
 * Populates the selected contacts array from assigned contacts IDs.
 * @param {Array} assignedContactIds - Array of contact IDs
 */
function populateAssignedContacts(assignedContactIds) {
    selectedContacts.length = 0;

    if (!assignedContactIds || !assignedContactIds.length) return;

    assignedContactIds.forEach(contactId => {
        const contact = findContactById(contactId);
        if (contact) {
            selectedContacts.push(contact);
        }
    });

    updateContactsListUI();
}

/**
 * Updates the UI to show selected contacts in the contacts list.
 */
function updateContactsListUI() {
    const listItems = document.querySelectorAll('.list-item.assigned-to');

    listItems.forEach(item => {
        const contactId = item.getAttribute('data-id');
        const isSelected = selectedContacts.some(contact => contact.id === contactId);

        if (isSelected) {
            const checkbox = item.querySelector('.checkbox');
            item.classList.add('checked');
            checkbox.classList.add('checked');
            checkbox.src = '../assets/images/pages/add-task/checkbox-checked.svg';
        }
    });
}

/**
 * Re-attaches event listeners to contacts dropdown.
 */
function reattachContactsEvents() {
    const contactsList = document.getElementById('contacts-list');
    if (!contactsList) return;

    // Clone and replace to remove old listeners
    const newContactsList = contactsList.cloneNode(true);
    contactsList.parentNode.replaceChild(newContactsList, contactsList);

    // Re-setup the dropdown
    showAssignedToDropdown();
    filterContacts();
}