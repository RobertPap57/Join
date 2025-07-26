/**
 * File attachment management for Add Task
 * Handles drag & drop, file validation, compression, and attachment UI
 */

let isDragging = false, startX, scrollLeft, lastX, velocity = 0, inertiaId;
const attachmentsList = document.getElementById('attachmentsList');

/**
 * Starts the drag operation for the attachments list.
 * @param {Event} e - Mouse or touch event
 */
function startDrag(e) {
    isDragging = true;
    startX = getPageX(e) - attachmentsList.offsetLeft;
    scrollLeft = attachmentsList.scrollLeft;
    lastX = getPageX(e);
    stopInertia();
    addDragListeners();
}

/**
 * Handles the drag movement for the attachments list.
 * @param {Event} e - Mouse or touch event
 */
function dragMove(e) {
    if (!isDragging) return;
    const x = getPageX(e) - attachmentsList.offsetLeft;
    const walk = (x - startX) * -1;

    velocity = getPageX(e) - lastX;
    lastX = getPageX(e);
    attachmentsList.scrollLeft = scrollLeft + walk;
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
    if (Math.abs(velocity) < 0.5) return;
    attachmentsList.scrollLeft -= velocity;
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
 * Renders all attachments in the attachments list.
 */
function renderAttachments() {
    attachmentsList.innerHTML = '';
    attachments.forEach((attachment, index) => {
        attachmentsList.innerHTML += getAttachmentHtml(attachment.base64, attachment.filename, index);
    });
    updateDeleteAllButtonVisibility();
    updateAttachmentsWrapperVisibility();
}

/**
 * Updates the visibility of the delete all button based on attachments count.
 */
function updateDeleteAllButtonVisibility() {
    const deleteAllBtn = document.getElementById('delete-attachments-btn');
    if (deleteAllBtn) {
        deleteAllBtn.style.display = attachments.length === 0 ? 'none' : 'flex';
    }
}

/**
 * Updates the visibility of the attachments wrapper based on attachments count.
 */
function updateAttachmentsWrapperVisibility() {
    const wrapper = document.getElementById('attachments-list-wrapper');
    if (wrapper) {
        wrapper.style.display = attachments.length === 0 ? 'none' : 'block';
    }
}

/**
 * Deletes a specific attachment from the attachments array.
 * @param {number} index - Index of attachment to delete
 */
function deleteAttachment(index) {
    attachments.splice(index, 1);
    renderAttachments();
}

/**
 * Deletes all attachments and updates the UI.
 */ 
function deleteAllAttachments() {
    attachments = [];
    attachmentsList.innerHTML = '';
    updateDeleteAllButtonVisibility();
    updateAttachmentsWrapperVisibility();
}

function attachmentsToFirebaseObject(attachments) {
    const obj = {};
    attachments.forEach(attachment => {
        const id = createUniqueId();
        obj[id] = {
            id: id,
            name: attachment.name,
            size: attachment.size,
            base64: attachment.base64
        };
    }); 
    console.log(obj);
    
    return obj;
}