let imageDialog;
let viewerImg;
let viewerTitle;
let currentIndex = 0;
let currentAttachments = [];
let currentZoomLevel = 1;
const MIN_ZOOM = 0.3;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.2;
let isDraggingImage = false;
let dragStartX = 0;
let dragStartY = 0;
let currentX = 0;
let currentY = 0;


/**
 * Opens the image viewer dialog for a given attachment index.
 * It sets up the viewer state and then shows the current image.
 * @param {number} index The index of the attachment to open in the viewer.
 */
function openImageViewer(index) {
    setupViewerState(index);
    showCurrentImage();
}


/**
 * Sets up the viewer state for a given attachment index.
 * It sets the current attachments array, current index, and DOM elements for the viewer.
 * It also resets the viewer zoom level, image position, and adds event listeners for the viewer.
 * @param {number} index The index of the attachment to open in the viewer.
 */
function setupViewerState(index) {
    currentAttachments = attachments;
    currentIndex = index;
    viewerImg = document.getElementById('viewer-img');
    imageDialog = document.getElementById('image-viewer-dialog');
    viewerTitle = document.getElementById('viewer-title');
    if (!viewerImg || !imageDialog || !viewerTitle) return;
    viewerImg.classList.remove('slide-in-left', 'slide-in-right');
    imageDialog.classList.remove('slide-down');
    currentZoomLevel = 1;
    applyZoom();
    resetImagePosition();
    imageViewerEventListeners();
}


/**
 * Shows the currently selected attachment in the image viewer dialog.
 * It sets the image src, alt, and title, and shows the dialog.
 * If the viewer elements or the current attachment are not available, it does nothing.
 * @returns {void}
 */
function showCurrentImage() {
    if (!viewerImg || !imageDialog) return;
    const attachment = currentAttachments[currentIndex];
    if (!attachment) return;
    viewerTitle.innerHTML = `${attachment.name} / ${attachment.size}KB`;
    viewerImg.src = attachment.base64;
    viewerImg.alt = attachment.name;
    imageDialog.showModal();
}


/**
 * Handles the click event to open an image viewer for an attachment.
 * Prevents opening if the click is on the download button or if dragging is in progress.
 *
 * @param {Event} event - The click event object.
 * @param {number} index - The index of the attachment to view.
 */
function openViewer(event, index) {
    if (event.target.closest('.download-attachment-btn')) return;
    if (isDragging) {
        event.preventDefault();
        event.stopPropagation();
        return;
    }
    openImageViewer(index);
}


/**
 * Closes the image viewer dialog with a slide-down animation.
 */
function closeImageViewer() {
    if (imageDialog) {
        imageDialog.classList.add('slide-down');
        setTimeout(() => {
            imageDialog.close();
        }, 280);
    }
}


/**
 * Advances to the next image in the currentAttachments array and triggers a rightward animation.
 */
function showNextImage() {
    currentIndex = (currentIndex + 1) % currentAttachments.length;
    animateImage('right');
}


/**
 * Displays the previous image in the attachments list and triggers a left animation.
 */
function showPreviousImage() {
    currentIndex = (currentIndex - 1 + currentAttachments.length) % currentAttachments.length;
    animateImage('left');
}


/**
 * Animates the image transition in the viewer based on the given direction.
 * Resets zoom and image position, updates image and title, and applies slide-in animation.
 *
 * @param {'left'|'right'} direction - The direction to animate the image ('left' or 'right').
 */
function animateImage(direction) {
    viewerImg.classList.remove('slide-in-left', 'slide-in-right');
    void viewerImg.offsetWidth;
    currentZoomLevel = 1;
    applyZoom();
    resetImagePosition();
    if (currentAttachments[currentIndex]) {
        viewerTitle.innerHTML = `${currentAttachments[currentIndex].name} / ${currentAttachments[currentIndex].size}KB`;
        viewerImg.src = currentAttachments[currentIndex].base64;
        viewerImg.classList.add(direction === 'right' ? 'slide-in-right' : 'slide-in-left');
    }
}


/**
 * Adds event listeners for image viewer interactions, including dragging the image
 * and closing the viewer when clicking outside the image.
 */
function imageViewerEventListeners() {
    viewerImg.addEventListener('mousedown', startDraggingImage);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', endDrag);
    if (imageDialog) {
        imageDialog.addEventListener('mousedown', (event) => {
            if (event.target === imageDialog) {
                closeImageViewer();
            }
        });
        closeDialogOnEsc(imageDialog, closeImageViewer);
    }
}


/**
 * Downloads the currently displayed image in the viewer.
 */
function downloadCurrentImage() {
    if (!currentAttachments || currentAttachments.length === 0) return;
    const currentAttachment = currentAttachments[currentIndex];
    if (!currentAttachment || !currentAttachment.base64) return;
    const downloadLink = document.createElement('a');
    downloadLink.href = currentAttachment.base64;
    downloadLink.download = currentAttachment.name || `image-${currentIndex}.jpg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}


/**
 * Zooms in on the currently displayed image.
 */
function zoomIn() {
    if (currentZoomLevel < MAX_ZOOM) {
        currentZoomLevel += ZOOM_STEP;
        applyZoom();
    }
}


/**
 * Zooms out of the currently displayed image.
 */
function zoomOut() {
    if (currentZoomLevel > MIN_ZOOM) {
        currentZoomLevel -= ZOOM_STEP;
        applyZoom();
        resetImagePosition();
    }
}


/**
 * Applies the current zoom level to the image.
 */
function applyZoom() {
    if (!viewerImg) return;
    applyTransform();
    updateZoomButtonStates();
}


/**
 * Handles the dragging movement with boundary constraints.
 * @param {MouseEvent} e - The mouse event
 */
function drag(e) {
    if (!isDraggingImage) return;
    e.preventDefault();
    let newX = e.clientX - dragStartX;
    let newY = e.clientY - dragStartY;
    const boundedPosition = applyDragBounds(newX, newY);
    currentX = boundedPosition.x;
    currentY = boundedPosition.y;
    applyTransform();
}


/**
 * Ends the image dragging operation.
 */
function endDrag() {
    isDraggingImage = false;
    viewerImg.style.cursor = 'grab';
}


/**
 * Applies boundary constraints to the dragged position.
 * @param {number} x - The x position
 * @param {number} y - The y position
 * @returns {Object} Object with bounded x and y positions
 */
function applyDragBounds(x, y) {
    const { maxX, maxY } = getViewerDimensions();
    if (maxX > 0) {
        x = Math.min(Math.max(x, -maxX), maxX);
    } else {
        x = 0;
    }
    if (maxY > 0) {
        y = Math.min(Math.max(y, -maxY), maxY);
    } else {
        y = 0;
    }
    return { x, y };
}


/**
 * Gets dimensions needed for boundary calculations.
 * @returns {Object} Object containing dimension information
 */
function getViewerDimensions() {
    const container = document.querySelector('.viewer-container');
    const containerRect = container.getBoundingClientRect();
    const imgRect = viewerImg.getBoundingClientRect();
    return {
        containerRect,
        imgRect,
        maxX: (imgRect.width - containerRect.width) / 2,
        maxY: (imgRect.height - containerRect.height) / 2
    };
}


/**
 * Initiates dragging of the zoomed image.
 * @param {MouseEvent} e - The mouse event
 */
function startDraggingImage(e) {
    isDraggingImage = true;
    dragStartX = e.clientX - currentX;
    dragStartY = e.clientY - currentY;
    viewerImg.style.cursor = 'grabbing';
}


/**
 * Resets the image position to center.
 */
function resetImagePosition() {
    currentX = 0;
    currentY = 0;
    applyTransform();
}


/**
 * Applies zoom and position transform to the image.
 */
function applyTransform() {
    viewerImg.style.transform = `scale(${currentZoomLevel}) translate(${currentX / currentZoomLevel}px, ${currentY / currentZoomLevel}px)`;
}


/**
 * Updates the state of zoom buttons based on current zoom level.
 */
function updateZoomButtonStates() {
    const zoomInBtn = document.getElementById('zoom-in-btn');
    const zoomOutBtn = document.getElementById('zoom-out-btn');
    if (zoomInBtn) {
        zoomInBtn.disabled = currentZoomLevel >= MAX_ZOOM;
    }
    if (zoomOutBtn) {
        zoomOutBtn.disabled = currentZoomLevel <= MIN_ZOOM;
    }
}
