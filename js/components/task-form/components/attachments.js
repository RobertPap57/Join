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
    initHorizontalScroll('.attachments-list');
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
function deleteAttachment(index, event) {
    if (isDragging) {
        event.preventDefault();
        event.stopPropagation();
        return;
    }
    attachments.splice(index, 1);
    renderAttachments();

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


/**
 * Clears all attachments and updates the UI.
 */
function resetAttachments() {
    attachments = [];
    renderAttachments();
    updateDeleteAllButtonVisibility();
    updateAttachmentsWrapperVisibility();
}


/**
 * Downloads a file from base64 data.
 * @param {string} base64Data - Base64 file data.
 * @param {string} fileName - Name for the downloaded file.
 * @param {Event} event - Triggering event.
 */
async function downloadBase64File(base64Data, fileName, event) {
    if (isDragging) {
        event.preventDefault();
        event.stopPropagation();
        return;
    }
    const res = await fetch(base64Data);
    const blob = await res.blob();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(link.href);
}
