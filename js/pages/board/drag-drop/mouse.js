/**
 * Sets up drag and drop event listeners for task cards and task containers.
 * Listens for 'dragover', 'drop', 'dragenter', and 'dragleave' events on containers.
 * Listens for 'dragstart' and 'dragend' events on task cards.
 * @param {HTMLElement} container - The task container element to set up event listeners for.
 * @param {HTMLElement} card - The task card element to set up event listeners for.
 */
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
