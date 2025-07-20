/**
 * File attachment management for Add Task
 * Handles drag & drop, file validation, compression, and attachment UI
 */

let isDragging = false, startX, scrollLeft, lastX, velocity = 0, inertiaId;
let attachments = [];
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
 * Handles drag over event for file drop functionality.
 * @param {Event} event - Drag event
 */
function handleDragOver(event) {
    event.preventDefault();
}

/**
 * Handles drag leave event for file drop functionality.
 * @param {Event} event - Drag event
 */
function handleDragLeave(event) {
    event.preventDefault();
}

/**
 * Handles file drop event and processes allowed files.
 * @param {Event} event - Drop event
 */
function handleDrop(event) {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    const allowed = files.filter(isAllowedFile);
    if (allowed.length) {
        handleFiles(allowed);
    }
}

/**
 * Validates if a file is allowed based on type and size.
 * @param {File} file - File to validate
 * @returns {boolean} True if file is allowed, false otherwise
 */
function isAllowedFile(file) {
    const types = ['image/jpeg', 'image/png'];
    const exts = ['.jpg', '.jpeg', '.png'];
    const name = file.name.toLowerCase();
    const maxSize = 10 * 1024 * 1024;
    if (!types.includes(file.type) && !exts.some(ext => name.endsWith(ext))) {
        changeErrorMsg('format');
        showErrorMessage();
        return false;
    }
    if (file.size > maxSize) {
        changeErrorMsg('size');
        showErrorMessage();
        return false;
    }
    return true;
}

/**
 * Processes multiple files by compressing and adding them to attachments.
 * @param {File[]} files - Array of files to process
 */
async function handleFiles(files) {
    for (const file of files) {
        if (!isAllowedFile(file)) continue;
        const base64 = await compressImage(file, 800, 800, 0.7);
        const size = Math.round((base64.length * 3 / 4) / 1024);
        const attachment = {
            filename: file.name,
            base64: base64,
            size: size
        };
        attachments.push(attachment);
        renderAttachments();
        attachmentsList.scrollLeft = attachmentsList.scrollWidth;
    }
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
 * Compresses an image file to specified dimensions and quality.
 * @param {File} file - The image file to compress
 * @param {number} maxWidth - Maximum width for the compressed image
 * @param {number} maxHeight - Maximum height for the compressed image
 * @param {number} quality - Compression quality (0-1)
 * @returns {Promise<string>} Promise resolving to base64 encoded compressed image
 */
function compressImage(file, maxWidth = 800, maxHeight = 800, quality = 0.8) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => processImageForCompression(event, maxWidth, maxHeight, quality, resolve, reject);
        reader.onerror = () => reject('Fehler beim Lesen der Datei.');
        reader.readAsDataURL(file);
    });
}

/**
 * Processes the image data for compression.
 * @param {Event} event - FileReader load event
 * @param {number} maxWidth - Maximum width for the compressed image
 * @param {number} maxHeight - Maximum height for the compressed image
 * @param {number} quality - Compression quality (0-1)
 * @param {Function} resolve - Promise resolve function
 * @param {Function} reject - Promise reject function
 */
function processImageForCompression(event, maxWidth, maxHeight, quality, resolve, reject) {
    const img = new Image();
    img.onload = () => {
        const dimensions = calculateNewDimensions(img.width, img.height, maxWidth, maxHeight);
        const compressedBase64 = createCompressedCanvas(img, dimensions.width, dimensions.height, quality);
        resolve(compressedBase64);
    };
    img.onerror = () => reject('Fehler beim Laden des Bildes.');
    img.src = event.target.result;
}

/**
 * Calculates new dimensions while maintaining aspect ratio.
 * @param {number} width - Original width
 * @param {number} height - Original height
 * @param {number} maxWidth - Maximum allowed width
 * @param {number} maxHeight - Maximum allowed height
 * @returns {Object} New dimensions with width and height properties
 */
function calculateNewDimensions(width, height, maxWidth, maxHeight) {
    if (width > maxWidth || height > maxHeight) {
        if (width > height) {
            height = (height * maxWidth) / width;
            width = maxWidth;
        } else {
            width = (width * maxHeight) / height;
            height = maxHeight;
        }
    }
    return { width, height };
}

/**
 * Creates a compressed canvas from image data.
 * @param {HTMLImageElement} img - Source image element
 * @param {number} width - Target width
 * @param {number} height - Target height
 * @param {number} quality - Compression quality (0-1)
 * @returns {string} Base64 encoded compressed image
 */
function createCompressedCanvas(img, width, height, quality) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, width, height);
    return canvas.toDataURL('image/jpeg', quality);
}

/**
 * Shows error message modal with slide-in animation.
 */
function showErrorMessage() {
    const errorModal = document.querySelector('.error-modal');
    const errorContainer = document.querySelector('.error-msg');
    errorModal.classList.add('d-flex-visible');
    setTimeout(() => {
        errorContainer.classList.add('error-msg-slide-in');
    }, 100);
}

/**
 * Closes error message modal with slide-out animation.
 */
function closeErrorMsg() {
    const errorModal = document.querySelector('.error-modal');
    const errorContainer = document.querySelector('.error-msg');
    errorContainer.classList.remove('error-msg-slide-in');
    setTimeout(() => {
        errorModal.classList.remove('d-flex-visible');
    }, 100);
}

/**
 * Changes the error message content based on error type.
 * @param {string} message - Error type ('format' or 'size')
 */
function changeErrorMsg(message) {
    const errorParagraph = document.querySelector('.error-msg p');
    errorParagraph.innerHTML = getErrorMsgHtml(message);
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

// Initialize file input listener when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('attachmentsinput');
    if (input) {
        input.addEventListener('change', function () {
            const files = Array.from(input.files || []);
            const allowed = files.filter(isAllowedFile);
            if (allowed.length) {
                handleFiles(allowed);
            }
            input.value = '';
        });
    }
});
