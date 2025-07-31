let imageDialog = document.getElementById('image-viewer-dialog');
let viewerImg = document.getElementById('viewer-img');
let currentIndex = 0;
let currentAttachments = [];


function setImageViewerAttachments(attachments) {
    currentAttachments = attachments;
}

function openImageViewer(index) {
    console.log('Opening image viewer for index:', index);
    currentIndex = index;
    viewerImg = document.getElementById('viewer-img');
    imageDialog = document.getElementById('image-viewer-dialog');
    imageViewerEventListeners();
    console.log(viewerImg, imageDialog,);
    if (viewerImg) {

        if (currentAttachments[currentIndex]) {

            viewerImg.src = currentAttachments[currentIndex].base64;
            imageDialog.showModal();
        }
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

    // Force reflow to restart animation
    void viewerImg.offsetWidth;

    if (currentAttachments[currentIndex]) {
        viewerImg.src = currentAttachments[currentIndex].base64;
        viewerImg.classList.add(direction === 'right' ? 'slide-in-right' : 'slide-in-left');
    }
}

function imageViewerEventListeners() {
    document.getElementById('next-btn').addEventListener('click', showNextImage);
    document.getElementById('prev-btn').addEventListener('click', showPreviousImage);
    if (imageDialog) {
        imageDialog.addEventListener('click', (event) => {
            if (event.target === imageDialog) {
                imageDialog.close();
            }
        });
    }
}