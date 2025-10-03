/**
 * Sets up event listeners for touch drag and drop operations on a task card.
 * Enables long hold detection on the task card, and sets up event listeners for touchmove and touchend events.
 * The touchmove event is used to start the drag operation, and the touchend event is used to end the drag operation.
 * @param {HTMLElement} card - The task card element to set up event listeners for.
 */
function setupTouchDragAndDrop(card) {
    enableLongHoldDetection(card);
    bindEventListenerOnce(card, 'touchmove', (event) => startTouchDrag(event), 'touchDragAndDrop');
    bindEventListenerOnce(card, 'touchend', (event) => touchEndDrag(event), 'touchDragAndDrop');
}


/**
 * Starts the drag operation for a task card when the user starts touching the card.
 * Prevents default touch behavior, sets the long hold state to false, and sets the dragged task ID and status.
 * Creates a ghost element of the task card, moves the ghost element to the user's touch position, and enables the hover container detection.
 * Enables the card to be disabled while dragging.
 * @param {TouchEvent} event - The touch event object from the touchmove event.
 */
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


/**
 * Moves the ghost element of the task card to the user's touch position.
 * This function is used during the drag operation to update the position of the ghost element.
 * @param {Touch} touch - The touch event object from the touchmove event, which contains the user's touch position.
 */
function moveCard(touch) {
    if (!ghostElement) return;
    ghostElement.style.left = `${touch.clientX - ghostElement.offsetWidth / 2}px`;
    ghostElement.style.top = `${touch.clientY - ghostElement.offsetHeight / 2}px`;
}


/**
 * Detects whether the user is hovering over a task container while dragging a task card.
 * If the user is hovering over a different container than the origin, it shows the shadow element of the container and scrolls the container to the maximum position.
 * If the user is not hovering over a different container than the origin, it hides the shadow element of the container.
 * @param {Touch} touch - The touch event object from the touchmove event, which contains the user's touch position.
 */
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


/**
 * Handles touch end event for task cards.
 * Checks if the long hold operation is true, gets the target container element, handles the drop event, and cleans up the drag operation.
 * @param {TouchEvent} event - The touch event object from the touchend event.
 */
function touchEndDrag(event) {
    if (!checkLongHold(event)) return;
    const touch = event.changedTouches[0];
    const targetContainer = getTouchTargetContainer(touch);
    handleDrop(targetContainer);
    cleanupDrag(event);
}


/**
 * Checks if the long hold operation is true on a given element.
 * If the long hold operation is not true, it clears the long hold timer.
 * @param {TouchEvent|DragEvent} event - The touch event object from the touchend event or drag event.
 * @returns {boolean} True if the long hold operation is true, false otherwise.
 */
function checkLongHold(event) {
    if (event.currentTarget.dataset.longHold !== "true") {
        clearHoldTimer(event.currentTarget);
        return false;
    }
    return true;
}


/**
 * Gets the target container element that is being hovered over by the user's touch.
 * It loops through all task container elements, checks if the user's touch position is within the bounds of the container, and returns the target container element.
 * @param {Touch} touch - The touch event object from the touchmove event, which contains the user's touch position.
 * @returns {HTMLElement|null} The target container element, or null if no container is being hovered over.
 */
function getTouchTargetContainer(touch) {
    let target = null;
    document.querySelectorAll(".task-container").forEach(container => {
        const rect = container.getBoundingClientRect();
        if (touch.clientX > rect.left && touch.clientX < rect.right &&
            touch.clientY > rect.top && touch.clientY < rect.bottom) {
            target = container;
        }
    });
    return target;
}


/**
 * Handles drop event for task containers.
 * Updates task status when dropped in a different container.
 * If the task card is dropped to the same container as it was dragged from, it is simply cancelled.
 * @param {HTMLElement} targetContainer - The target container element that the task card was dropped in.
 */
function handleDrop(targetContainer) {
    if (targetContainer && draggedTaskId) {
        if (targetContainer.id !== draggedTaskStatus) {
            updateTaskStatus(draggedTaskId, targetContainer);
        } else renderTasks();
    } else renderTasks();
}


/**
 * Cleans up the drag operation by removing the ghost element, clearing the long hold timer, and resetting dragged task ID and status.
 * Hides shadow elements, disables the task card while dragging, and resets the long hold state to false.
 * @param {TouchEvent|DragEvent} event - The touch event object from the touchend event or drag event.
 */
function cleanupDrag(event) {
    if (ghostElement) { ghostElement.remove(); ghostElement = null; }
    clearHoldTimer(event.currentTarget);
    draggedTaskId = null;
    draggedTaskStatus = null;
    removeShadowElements();
    setTimeout(() => { cardDisabled = false; }, 50);
}


/**
 * Creates a ghost element of the task card for drag indication during drag operations.
 * Clones the task card element, sets up its styles to be fixed, semi-transparent, and with a box shadow,
 * and appends it to the document body.
 * @param {HTMLElement} element - The task card element to clone and set up its styles.
 */
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
