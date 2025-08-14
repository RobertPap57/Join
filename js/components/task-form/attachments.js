/**
 * File attachment management for Add Task
 * Handles drag & drop, file validation, compression, and attachment UI
 */

let isDragging = false, startX, scrollLeft, lastX, velocity = 0, inertiaId;
let currentDragContainer = null;


/**
 * Initializes drag functionality for all attachments lists.
 */
function initAttachmentDrag() {
    const dragContainers = document.querySelectorAll('.attachments-list');
    dragContainers.forEach(dragContainer => {
        dragContainer.addEventListener('mousedown', (e) => startDrag(e, dragContainer));
        dragContainer.addEventListener('touchstart', (e) => startDrag(e, dragContainer));
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
    isDragging = false;
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

/**
 * Renders all attachments in all attachments lists.
 */
function renderAttachments() {
    const attachmentsLists = document.querySelectorAll('.attachments-list');
    attachmentsLists.forEach(attachmentsList => {
        attachmentsList.innerHTML = '';
        const buttonType = attachmentsList.id === 'detailed-task-attachments-list' ? 'download' : 'delete';
        attachments.forEach((attachment, index) => {
            attachmentsList.innerHTML += getAttachmentHtml(attachment, index, buttonType);
        });
    });
    updateDeleteAllButtonVisibility();
    updateAttachmentsWrapperVisibility();
    initAttachmentDrag();
}

/**
 * Updates the visibility of the delete all button based on attachments count.
 */
function updateDeleteAllButtonVisibility() {
    const deleteAllBtns = document.querySelectorAll('.delete-attachments-btn');
    deleteAllBtns.forEach(deleteAllBtn => {
        if (deleteAllBtn) {
            deleteAllBtn.style.display = attachments.length === 0 ? 'none' : 'flex';
        }
    });
}

/**
 * Updates the visibility of the attachments wrapper based on attachments count.
 */
function updateAttachmentsWrapperVisibility() {
    const wrappers = document.querySelectorAll('.attachments-list-wrapper');
    wrappers.forEach(wrapper => {
        if (wrapper) {
            wrapper.style.display = attachments.length === 0 ? 'none' : 'block';
        }
    });
}

/**
 * Deletes a specific attachment from the attachments array.
 * @param {number} index - Index of attachment to delete
 */
function deleteAttachment(index) {
    if (!isDragging) {
        attachments.splice(index, 1);
        renderAttachments();
    }
}


/**
 * Deletes all attachments and updates the UI.
 */
function deleteAllAttachments() {
    attachments = [];
    const attachmentsLists = document.querySelectorAll('.attachments-list');
    attachmentsLists.forEach(attachmentsList => {
        attachmentsList.innerHTML = '';
    });
    updateDeleteAllButtonVisibility();
    updateAttachmentsWrapperVisibility();
}

/**
 * Converts an array of attachment objects into an object suitable for Firebase storage,
 * assigning each attachment a unique ID as the key.
 *
 * @param {Array<{name: string, size: number, base64: string}>} attachments - The array of attachment objects to convert.
 * @returns {Object<string, {id: string, name: string, size: number, base64: string}>} 
 *   An object where each key is a unique ID and each value is the corresponding attachment data.
 */
function attachmentsToFirebaseObject(attachments) {
    const obj = {};
    attachments.forEach(attachment => {
        const id = createUniqueId();
        obj[id] = {
            id: attachments.id || id,
            name: attachment.name,
            size: attachment.size,
            base64: attachment.base64
        };
    });
    return obj;
}

function resetAttachments() {
    attachments = [];
    renderAttachments();
    updateDeleteAllButtonVisibility();
    updateAttachmentsWrapperVisibility();
}

