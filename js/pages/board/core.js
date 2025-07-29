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
}



/**
 * Generates HTML for a task card.
 * @param {Object} task - Task object with properties like title, category, description, priority
 * @returns {string} HTML string for the task card
 */
function getTaskCardHTML(task) {
    return `<article class="task-card" draggable="true" data-task-id="${task.id}">
    <header class="task-card-category" style="background-color: ${getCategoryColor(task.category)};">
        <p>${task.category}</p>
    </header>
    <h2>${task.title}</h2>
    <p class="task-card-desc">${task.description}</p>
    ${generateProgressHTML(task)}
    <footer class="task-card-footer">
        <div class="assigned-avatars">
            ${generateAssignedAvatarsHTML(task.assignedTo, task.id)}
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
    return category === 'Technical Tasks' ? '#1FD7C1' : '#0038FF';
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

/**
 * Generates HTML for assigned user avatars with proper positioning.
 * @param {Array} assignedToIds - Array of contact IDs assigned to the task
 * @param {string} taskId - Task ID to make avatar IDs unique
 * @returns {string} HTML string for the assigned avatars
 */
function generateAssignedAvatarsHTML(assignedToIds, taskId) {
    if (!assignedToIds || assignedToIds.length === 0) {
        return '';
    }

    return assignedToIds.map((contactId, index) => {
        const uniqueAvatarId = `task-${taskId}-assignedTo-${contactId}`;
        return `<div id="${uniqueAvatarId}" class="profile-avatar-small task-card-avatar d-flex-center" style="left: ${index * 24}px;"></div>`;
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
        setTimeout(() => renderTaskAvatars(task), 0);
    }
}

/**
 * Renders avatars for assigned contacts after task HTML is in DOM.
 * @param {Object} task - Task object with assignedTo array
 */
function renderTaskAvatars(task) {
    if (!task.assignedTo || task.assignedTo.length === 0) {
        return;
    }

    task.assignedTo.forEach(contactId => {
        const contact = findContactById(contactId);
        if (contact) {
            const uniqueAvatarId = `task-${task.id}-assignedTo-${contactId}`;
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
