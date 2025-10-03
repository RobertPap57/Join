/**
 * Sets up keyboard drag and drop for task cards.
 * Listens for spacebar, arrow keys, and escape key to start drag and drop.
 * @param {HTMLElement} card - The task card element to set up event listeners for.
 */
function setupKeyboardDragAndDrop(card) {
    bindEventListenerOnce(card, 'keydown', (event) => {
        if (event.key === ' ') {
            event.preventDefault();
            if (!draggedTaskId) startKeyboardDrag(card);
            else dropKeyboardCard();
        } else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
            event.preventDefault();
            moveKeyboardShadow(1);
        } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
            event.preventDefault();
            moveKeyboardShadow(-1);
        } else if (event.key === 'Escape') {
            event.preventDefault();
            if (draggedTaskId) cancelDrag();
        }
    }, 'keyboardDragAndDrop');
}


/**
 * Starts drag and drop for the task card by setting up the task ID and status,
 * and adding the event listener for trapping tab while dragging.
 * @param {HTMLElement} card - The task card element to set up event listeners for.
 */
function startKeyboardDrag(card) {
    draggedTaskId = card.dataset.taskId;
    const task = tasks.find(t => t.id === draggedTaskId);
    draggedTaskStatus = task ? task.status : null;
    selectedContainerIndex = containerIds.indexOf(draggedTaskStatus);
    card.style.transform = 'rotate(5deg)';
    card.setAttribute('aria-grabbed', 'true');
    document.addEventListener("keydown", trapTabWhileDragging, true);
}


/**
 * Moves the shadow element to the task container that is direction units away from the current container.
 * @param {number} direction - The direction to move the shadow element. Positive values move the shadow element to the right, while negative values move it to the left.
 */
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


/**
 * Prevents the focus from leaving the task card while dragging by trapping the Tab key.
 * Listens for the keydown event and prevents the default action when the Tab key is pressed.
 * This function is used to prevent the focus from being lost while dragging a task card with the keyboard.
 * @param {KeyboardEvent} e - The keydown event triggered by the Tab key press.
 */
function trapTabWhileDragging(e) {
    if (e.key === "Tab") {
        e.preventDefault();
    }
}


/**
 * Drops the task card and updates the task status if it is dropped to a different container.
 * If the task card is dropped to the same container as it was dragged from, it is simply cancelled.
 * @returns {Promise<void>} Resolves when the task card is dropped and the task status is updated.
 */
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