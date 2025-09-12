
let searchQuery = '';
const containerIds = ['to-do', 'in-progress', 'await-feedback', 'done'];
let selectedContainerIndex = null;
let draggedTaskId = null;
let draggedTaskStatus = null;
let ghostElement = null;
let cardDisabled = false;



/**
 * Initializes the board page with necessary setup and data loading.
 */
async function initBoard() {
    await includeHTML();
    checkOrientation();
    checkForCurrentUser() ? "" : redirectTo('login.html');
    initHeader();
    highlightLink('board');
    initPopup();
    await getTasks();
    await getContacts();
    renderTasks();
    initHorizontalScroll('.task-container');
    setupSearchFunctionality();
    closeDetailedTaskOnClickOutside();
    enableAutoScrollOnDrag();
    preventFormSubmitOnEnter();
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
 * Prevents drag events on all elements with the 'download-attachment-btn' class.
 * This disables dragging for download buttons to avoid unintended behavior.
 */
function blockDragOnDownloadBtn() {
    document.querySelectorAll('.download-attachment-btn').forEach(link => {
        link.addEventListener('dragstart', event => {
            event.preventDefault();
        });
    });
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
    const html = assignedToIds.map((id, index) =>
        createAvatarDiv(id, taskId, context, index, maxVisible)
    ).join('');

    const hasOverflow = context === 'card' && assignedToIds.length > maxVisible;
    return hasOverflow ? html + createOverflowAvatar(assignedToIds.length - maxVisible, maxVisible) : html;
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
    const filteredTasks = getFilteredTasks();
    if (filteredTasks.length === 0 && searchQuery.trim() !== '') {
        showEmptyContainer();
        showSearchError();
        return;
    } else {
        hideSearchError();
    }
    filteredTasks.forEach(task => {
        renderTaskInContainer(task);
    });
    showEmptyContainer();
    setupBoardEventsListeners();
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
 * Shows empty message for containers that have no task cards.
 */
function showEmptyContainer() {
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




function enableLongHoldDetection(element) {
    if (!element) return;
    if (window.matchMedia("(pointer: coarse)").matches) {
        bindEventListenerOnce(element, "touchstart", startHold, "longHold");
        bindEventListenerOnce(element, "touchend", endHold, "longHold");
        bindEventListenerOnce(element, "touchmove", endHoldIfMoving, "longHold");
    }
}

function startHold(event) {
    const element = event.currentTarget;
    clearHoldTimer(element);
    element.draggable = false;
    element.dataset.holdTimeout = setTimeout(() => {
        element.dataset.longHold = "true";
        element.draggable = true;
        element.style.transform = 'rotate(5deg)';
    }, 500);
}

function endHold(event) {
    const element = event.currentTarget;
    if (element.dataset.longHold !== "true") {
        clearHoldTimer(element);
    }
}

function endHoldIfMoving(event) {
    const element = event.currentTarget;
    if (element.dataset.longHold === "false") {
        clearHoldTimer(element);
    }
}

function clearHoldTimer(element) {
    if (element.dataset.holdTimeout) {
        clearTimeout(element.dataset.holdTimeout);
    }
    element.dataset.holdTimeout = null;
    element.dataset.longHold = "false";
    element.style.transform = "";
    element.draggable = false;
}

window.addEventListener('resize', () => {
    renderTasks();
});

/**
 * Sets up basic drag and drop for task containers.
 */
function setupBoardEventsListeners() {
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




function setupOpenTaskCardListeners(card) {
    bindEventListenerOnce(card, 'mouseup', () => openDetailedTaskView(card.dataset.taskId), 'openTaskCard');
    bindEventListenerOnce(card, 'touchend', () => openDetailedTaskView(card.dataset.taskId), 'openTaskCard');
    bindEventListenerOnce(card, 'keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            openDetailedTaskView(card.dataset.taskId);
        }
    }, 'openTaskCard');
}





function setupDragAndDrop(container, card) {
    if (container) {
        bindEventListenerOnce(container, 'dragover', handleDragOver, 'dragAndDrop');
        bindEventListenerOnce(container, 'drop', handleDrop, 'dragAndDrop');
        bindEventListenerOnce(container, 'dragenter', handleDragEnter, 'dragAndDrop');
        bindEventListenerOnce(container, 'dragleave', handleDragLeave, 'dragAndDrop');
    }
    if (card) {
        bindEventListenerOnce(card, 'dragstart', handleDragStart, 'dragAndDrop');
        bindEventListenerOnce(card, 'dragend', handleDragEnd, 'dragAndDrop');
    }
}

function setupTouchDragAndDrop(card) {
    enableLongHoldDetection(card);
    bindEventListenerOnce(card, 'touchmove', (event) => startTouchDrag(event), 'touchDragAndDrop');
    bindEventListenerOnce(card, 'touchend', (event) => touchEndDrag(event), 'touchDragAndDrop');
}

function startTouchDrag(event) {
    const element = event.currentTarget;
    if (element.dataset.longHold !== "true") return;

    event.preventDefault();

    if (!draggedTaskId) {
        draggedTaskId = element.dataset.taskId;
        const task = tasks.find(t => t.id === draggedTaskId);
        draggedTaskStatus = task ? task.status : null;
        createGhostElement(element);
    }
    moveCard(event.touches[0], element);
    detectHoverContainer(event.touches[0]);
    cardDisabled = true;
}

function createGhostElement(element) {
    if (!element) return;
    ghostElement = element.cloneNode(true);
    ghostElement.style.position = "fixed";
    ghostElement.style.pointerEvents = "none";
    ghostElement.style.opacity = "0.7";
    ghostElement.style.transform = "";
    ghostElement.style.boxShadow = "inset 0px 0px 10px 0px #F6F7F8";
    ghostElement.style.zIndex = 9999;
    document.body.appendChild(ghostElement);
}

function moveCard(touch) {
    if (!ghostElement) return;
    ghostElement.style.left = `${touch.clientX - ghostElement.offsetWidth / 2}px`;
    ghostElement.style.top = `${touch.clientY - ghostElement.offsetHeight / 2}px`;
}

function detectHoverContainer(touch) {
    const containers = document.querySelectorAll(".task-container");
    containers.forEach(container => {
        const rect = container.getBoundingClientRect();
        if (touch.clientX > rect.left && touch.clientX < rect.right &&
            touch.clientY > rect.top && touch.clientY < rect.bottom &&
            draggedTaskStatus !== container.id) {
            showShadowElement(container);
            scrollToContainerMax(container);
        } else {
            hideShadowElement(container);
        }
    });
}

function touchEndDrag(event) {
    if (event.currentTarget.dataset.longHold !== "true") {
        clearHoldTimer(event.currentTarget);
        return;
    }

    const touch = event.changedTouches[0];
    const containers = document.querySelectorAll(".task-container");
    let targetContainer = null;

    containers.forEach(container => {
        const rect = container.getBoundingClientRect();
        if (touch.clientX > rect.left && touch.clientX < rect.right &&
            touch.clientY > rect.top && touch.clientY < rect.bottom) {
            targetContainer = container;
        }
    });

    if (targetContainer && draggedTaskId) {
        if (targetContainer.id !== draggedTaskStatus) {
            updateTaskStatus(draggedTaskId, targetContainer);
        } else {
            renderTasks();
        }
    } else {
        renderTasks();
    }

    // cleanup ghost
    if (ghostElement) {
        ghostElement.remove();
        ghostElement = null;
    }
    clearHoldTimer(event.currentTarget);
    draggedTaskId = null;
    draggedTaskStatus = null;
    removeShadowElements();
    setTimeout(() => { cardDisabled = false; }, 50);
}



function setupKeyboardDragAndDrop(card) {
    bindEventListenerOnce(card, 'keydown', (event) => {
        if (event.key === ' ') {
            event.preventDefault();
            if (!draggedTaskId) {
                startKeyboardDrag(card);
            } else {
                dropKeyboardCard();
            }
        } else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
            event.preventDefault();
            moveKeyboardShadow(1);
        } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
            event.preventDefault();
            moveKeyboardShadow(-1);
        } else if (event.key === 'Escape') {
            event.preventDefault();
            if (draggedTaskId) {
                cancelDrag();
            }
        }
    }, 'keyboardDragAndDrop');
}


function startKeyboardDrag(card) {
    draggedTaskId = card.dataset.taskId;
    const task = tasks.find(t => t.id === draggedTaskId);
    draggedTaskStatus = task ? task.status : null;
    selectedContainerIndex = containerIds.indexOf(draggedTaskStatus);
    card.style.transform = 'rotate(5deg)';
    card.setAttribute('aria-grabbed', 'true');
    document.addEventListener("keydown", trapTabWhileDragging, true);
}

function moveKeyboardShadow(direction) {
    if (draggedTaskId == null || selectedContainerIndex == null) return;
    const oldContainer = document.getElementById(containerIds[selectedContainerIndex]);
    hideShadowElement(oldContainer);
    selectedContainerIndex += direction;
    if (selectedContainerIndex < 0) selectedContainerIndex = 0;
    if (selectedContainerIndex >= containerIds.length) selectedContainerIndex = containerIds.length - 1;
    const newContainer = document.getElementById(containerIds[selectedContainerIndex]);
    if (newContainer.id !== draggedTaskStatus) {
        showShadowElement(newContainer);
        scrollToContainerMax(newContainer);
        scrollBoardRowIntoView(newContainer);
    }
}

function trapTabWhileDragging(e) {
    if (e.key === "Tab") {
        e.preventDefault();
    }
}


async function dropKeyboardCard() {
    if (draggedTaskId == null || selectedContainerIndex == null) return;
    const container = document.getElementById(containerIds[selectedContainerIndex]);
    const containerStatus = container.id;
    if (containerStatus !== draggedTaskStatus) {
        await updateTaskStatus(draggedTaskId, container);
    } else {
        cancelDrag();
        return;
    }
    cancelDrag();
}


/**
 * Handles drag start event for task cards.
 * Stores the dragged task ID and status, applies visual rotation effect.
 * @param {DragEvent} event - The drag start event
 */
function handleDragStart(event) {
    if (window.matchMedia("(pointer: coarse)").matches) return;
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
        const containerStatus = event.currentTarget.id;
        if (containerStatus !== draggedTaskStatus) {
            showShadowElement(event.currentTarget);
            scrollToContainerMax(event.currentTarget);
            scrollBoardRowIntoView(event.currentTarget);
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
    stopDrag();
    if (draggedTaskId) {
        const container = event.currentTarget;
        const containerStatus = container.id;
        if (containerStatus !== draggedTaskStatus) {
            await updateTaskStatus(draggedTaskId, container);
        }
        draggedTaskId = null;
        removeShadowElements();
    }
}

function cancelDrag() {
    draggedTaskId = null;
    draggedTaskStatus = null;
    selectedContainerIndex = null;
    removeShadowElements();
    document.removeEventListener("keydown", trapTabWhileDragging, true);
    const cards = document.querySelectorAll('.task-card');
    cards.forEach(card => {
        card.style.transform = '';
        card.removeAttribute('aria-grabbed');
    });
}


function scrollToContainerMax(container, smooth = true) {
    if (window.innerWidth > 1400) {
        container.scrollTo({
            top: container.scrollHeight,
            behavior: smooth ? 'smooth' : 'auto'
        });
    } else {
        container.scrollTo({
            left: container.scrollWidth,
            behavior: smooth ? 'smooth' : 'auto'
        });
    }
}

function enableAutoScrollOnDrag() {
    document.addEventListener('dragover', scrollOnDragMove);
    document.addEventListener('touchmove', scrollOnDragMove);
}

function scrollOnDragMove(e) {
    const y = e.clientY || (e.touches && e.touches[0].clientY);
    const windowHeight = window.innerHeight;
    const distBottom = windowHeight - y;
    const distTop = y;
    if (distBottom < 150) {
        const extraSpeed = (150 - distBottom) * 1;
        const speed = 100 + extraSpeed;
        window.scrollBy({ top: speed, behavior: 'auto' });
    }
    if (distTop < 250) {
        const extraSpeed = (250 - distTop) * 1;
        const speed = 100 + extraSpeed;
        window.scrollBy({ top: -speed, behavior: 'auto' });
    }
}

function scrollBoardRowIntoView(container) {
    if (!container || window.innerWidth > 1400) return;
    const rect = container.getBoundingClientRect();
    const viewHeight = window.innerHeight;
    if (rect.bottom > viewHeight) {
        window.scrollBy({
            top: rect.bottom - viewHeight + 20,
            behavior: "smooth"
        });
    }
    if (rect.top < 96) {
        window.scrollBy({
            top: rect.top - 96,
            behavior: "smooth"
        });
    }
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
    const searchInput = document.querySelector('input[name="search"]');
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
    const searchInput = document.querySelector('input[name="search"]');
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
    let result = tasks;
    if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        result = tasks.filter(task => {
            const titleMatch = task.title.toLowerCase().includes(query);
            const descMatch = task.description.toLowerCase().includes(query);
            return titleMatch || descMatch;
        });
    }
    return result.sort((a, b) => a.timestamp - b.timestamp);
}

/**
 * Shows search error styling when no results found.
 */
function showSearchError() {
    const searchInput = document.querySelector('input[name="search"]');
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
    const searchInput = document.querySelector('input[name="search"]');
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
    if (cardDisabled) return;
    dialog = document.getElementById('detailed-task-dialog');
    const task = tasks.find(t => t.id === taskId);
    if (!task || isDragging) return;
    dialog.innerHTML = getDetailedTaskHTML(task);
    renderTaskSubtasks(task);
    renderTaskAvatars(task, 'modal');
    attachments = task.attachments ? Object.values(task.attachments) : [];
    renderAttachments();
    dialog.showModal();
    blockDragOnDownloadBtn();
}

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
        // Update the task card to reflect subtask progress changes
        renderTasks();
    } catch (error) {
        console.error('Error saving subtask changes:', error);
    }
}

function closeDetailedTaskOnClickOutside() {
    const dialog = document.getElementById('detailed-task-dialog');
    closeDialogOnClickOutside(dialog, () => {
        dialog.close();
    });
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
    styleSubtaskInput();
    initHorizontalScroll('.attachments-list');
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