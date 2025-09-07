let isDragging = false, startX, scrollLeft, lastX, velocity = 0, inertiaId;
let currentDragContainer = null;


/**
 * Initializes scroll functionality for all attachments lists.
 */
function initHorizontalScroll(container) {
    const dragContainers = document.querySelectorAll(container);
    dragContainers.forEach(dragContainer => {
        bindEventListenerOnce(dragContainer, 'mousedown', (e) => startDrag(e, dragContainer), 'horizontalScroll');
        bindEventListenerOnce(dragContainer, 'touchstart', (e) => startDrag(e, dragContainer), 'horizontalScroll');
    });
}

/**
 * Starts the drag operation for the attachments list.
 * @param {Event} e - Mouse or touch event
 * @param {HTMLElement} attachmentsList - The specific attachments list element
 */
function startDrag(e, dragContainer) {
    currentDragContainer = dragContainer;
    startX = getPageX(e) - dragContainer.offsetLeft;
    scrollLeft = dragContainer.scrollLeft;
    lastX = getPageX(e);
    stopInertia();
    addDragListeners();

}

/**
 * Handles the drag movement for the attachments list.
 * @param {Event} e - Mouse or touch event
 */
function dragMove(e) {
    if (!currentDragContainer) return;
    const moveDistance = Math.abs(getPageX(e) - lastX);
    if (!isDragging && moveDistance > 5) {
        isDragging = true;
    } if (isDragging) {
        const x = getPageX(e) - currentDragContainer.offsetLeft;
        const walk = (x - startX) * -1;
        velocity = getPageX(e) - lastX;
        lastX = getPageX(e);
        currentDragContainer.scrollLeft = scrollLeft + walk;
    }
}

/**
 * Stops the drag operation and starts inertia scrolling.
 */
function stopDrag() {
    setTimeout(() => { isDragging = false; }, 0); 
    removeDragListeners();
    inertia();
}

/**
 * Handles inertia scrolling animation.
 */
function inertia() {
    if (Math.abs(velocity) < 0.5 || !currentDragContainer) return;
    currentDragContainer.scrollLeft -= velocity;
    velocity *= 0.95;
    inertiaId = requestAnimationFrame(inertia);
}

/**
 * Stops the inertia scrolling animation.
 */
function stopInertia() {
    if (inertiaId) cancelAnimationFrame(inertiaId);
}

/**
 * Gets the X coordinate from mouse or touch event.
 * @param {Event} e - Mouse or touch event
 * @returns {number} X coordinate
 */
function getPageX(e) {
    return e.touches ? e.touches[0].pageX : e.pageX;
}

/**
 * Adds event listeners for drag operations.
 */
function addDragListeners() {
    document.addEventListener('mousemove', dragMove);
    document.addEventListener('mouseup', stopDrag);
    document.addEventListener('touchmove', dragMove);
    document.addEventListener('touchend', stopDrag);
}

/**
 * Removes event listeners for drag operations.
 */
function removeDragListeners() {
    document.removeEventListener('mousemove', dragMove);
    document.removeEventListener('mouseup', stopDrag);
    document.removeEventListener('touchmove', dragMove);
    document.removeEventListener('touchend', stopDrag);
}

