let imageDialog;
let viewerImg;
let viewerTitle;
let currentIndex = 0;
let currentAttachments = [];
let currentZoomLevel = 1;
const MIN_ZOOM = 0.3;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.2;


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

    if (currentAttachments[currentIndex]) {
        viewerTitle.innerHTML = `${currentAttachments[currentIndex].name} / ${currentAttachments[currentIndex].size}KB`;
        viewerImg.src = currentAttachments[currentIndex].base64;
        viewerImg.classList.add(direction === 'right' ? 'slide-in-right' : 'slide-in-left');
    }
}

function imageViewerEventListeners() {
    document.getElementById('next-btn').addEventListener('click', showNextImage);
    document.getElementById('prev-btn').addEventListener('click', showPreviousImage);
    document.getElementById('viewer-download-btn').addEventListener('click', downloadCurrentImage);
    document.getElementById('zoom-in-btn').addEventListener('click', zoomIn);
    document.getElementById('zoom-out-btn').addEventListener('click', zoomOut);
    if (imageDialog) {
        imageDialog.addEventListener('click', (event) => {
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
    }
}

/**
 * Applies the current zoom level to the image.
 */
function applyZoom() {
    if (!viewerImg) return;

    viewerImg.style.transform = `scale(${currentZoomLevel})`;
    updateZoomButtonStates();
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