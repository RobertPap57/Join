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


function setImageViewerAttachments(attachments) {
    currentAttachments = attachments;
}

function openImageViewer(index) {
    currentIndex = index;
    viewerImg = document.getElementById('viewer-img');
    imageDialog = document.getElementById('image-viewer-dialog');
    viewerTitle = document.getElementById('viewer-title');
    viewerImg.classList.remove('slide-in-left', 'slide-in-right');
    imageDialog.classList.remove('slide-down');
    currentZoomLevel = 1;
    applyZoom();
    resetImagePosition();
    imageViewerEventListeners();
    if (viewerImg) {
        if (currentAttachments[currentIndex]) {
            viewerTitle.innerHTML = `${currentAttachments[currentIndex].name} / ${currentAttachments[currentIndex].size}KB`;
            viewerImg.src = currentAttachments[currentIndex].base64;
            imageDialog.showModal();
        }
    }
}

function closeImageViewer() {
    if (imageDialog) {
        imageDialog.classList.add('slide-down');
        setTimeout(() => {
            imageDialog.close();
        }, 280);
    }
}

function showNextImage() {
    currentIndex = (currentIndex + 1) % currentAttachments.length;
    animateImage('right');
}

function showPreviousImage() {
    currentIndex = (currentIndex - 1 + currentAttachments.length) % currentAttachments.length;
    animateImage('left');
}

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
    }
}

/**
 * Downloads the currently displayed image in the viewer.
 */
function downloadCurrentImage() {
    if (!currentAttachments || currentAttachments.length === 0) {
        return;
    }

    const currentAttachment = currentAttachments[currentIndex];
    if (!currentAttachment || !currentAttachment.base64) {
        return;
    }

    // Create an anchor element and trigger download
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

    // Calculate new position
    let newX = e.clientX - dragStartX;
    let newY = e.clientY - dragStartY;

    // Apply bounds
    const boundedPosition = applyDragBounds(newX, newY);

    // Update current position
    currentX = boundedPosition.x;
    currentY = boundedPosition.y;

    // Apply transform
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

    // Apply horizontal bounds
    if (maxX > 0) {
        x = Math.min(Math.max(x, -maxX), maxX);
    } else {
        x = 0;
    }

    // Apply vertical bounds
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