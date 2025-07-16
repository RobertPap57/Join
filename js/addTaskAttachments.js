let isDragging = false, startX, scrollLeft, lastX, velocity = 0, inertiaId;
let attachments = [];
const attachmentsList = document.getElementById('attachmentsList');


function startDrag(e) {
    isDragging = true;
    startX = getPageX(e) - attachmentsList.offsetLeft;
    scrollLeft = attachmentsList.scrollLeft;
    lastX = getPageX(e);
    stopInertia();
    addDragListeners();
}

function dragMove(e) {
    if (!isDragging) return;
    const x = getPageX(e) - attachmentsList.offsetLeft;
    const walk = (x - startX) * -1;

    velocity = getPageX(e) - lastX;
    lastX = getPageX(e);
    attachmentsList.scrollLeft = scrollLeft + walk;
}

function stopDrag() {
    isDragging = false;
    removeDragListeners();
    startInertia();
}

function startInertia() {
    inertia();
}

function inertia() {
    if (Math.abs(velocity) < 0.5) return;
    attachmentsList.scrollLeft -= velocity;
    velocity *= 0.95;
    inertiaId = requestAnimationFrame(inertia);
}

function stopInertia() {
    if (inertiaId) cancelAnimationFrame(inertiaId);
}

function getPageX(e) {
    return e.touches ? e.touches[0].pageX : e.pageX;
}

function addDragListeners() {
    document.addEventListener('mousemove', dragMove);
    document.addEventListener('mouseup', stopDrag);
    document.addEventListener('touchmove', dragMove);
    document.addEventListener('touchend', stopDrag);
}

function removeDragListeners() {
    document.removeEventListener('mousemove', dragMove);
    document.removeEventListener('mouseup', stopDrag);
    document.removeEventListener('touchmove', dragMove);
    document.removeEventListener('touchend', stopDrag);
}

function handleDragOver(event) {
    event.preventDefault();
}

function handleDragLeave(event) {
    event.preventDefault();
}






function showErrorMessage() {
    const errorModal = document.querySelector('.error-modal');
    const errorContainer = document.querySelector('.error-msg');
    errorModal.classList.add('d-flex-visible');
    setTimeout(() => {
        errorContainer.classList.add('error-msg-slide-in');
    }, 100);
   
}

function closeErrorMsg() {
    const errorModal = document.querySelector('.error-modal');
    const errorContainer = document.querySelector('.error-msg');
    errorContainer.classList.remove('error-msg-slide-in');
    setTimeout(() => {
        errorModal.classList.remove('d-flex-visible');
    }, 100);
}

function changeErrorMsg(message) {
    const errorParagraph = document.querySelector('.error-msg p');
    errorParagraph.innerHTML = '';
    const rongFormat = `This file format is not allowed!<br>
            <span>You can only upload JPEG or PNG.</span>`;
    const toBigSize = `This file size is too big!<br>
            <span>You can only upload files under 10Mb.</span>`;
    if (message === 'format') {
        errorParagraph.innerHTML = rongFormat;
    } else if (message === 'size') {
        errorParagraph.innerHTML = toBigSize;
    }
}


function handleDrop(event) {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    const allowed = files.filter(isAllowedFile);
    if (allowed.length) {
        handleFiles(allowed);
    }
}

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
    updateAttachmentItemClicks();
}

function renderAttachments() {
    attachmentsList.innerHTML = '';
    attachments.forEach((attachment, index) => {
        attachmentsList.innerHTML += attachmentItemHtml(attachment.base64, attachment.filename, index);
    });
    updateDeleteAllButtonVisibility();
    updateAttachmentsWrapperVisibility();
}

function updateDeleteAllButtonVisibility() {
    const deleteAllBtn = document.getElementById('delete-attachments-btn');
    if (deleteAllBtn) {
        deleteAllBtn.style.display = attachments.length === 0 ? 'none' : 'flex';
    }
}

function updateAttachmentsWrapperVisibility() {
    const wrapper = document.getElementById('attachments-list-wrapper');
    if (wrapper) {
        wrapper.style.display = attachments.length === 0 ? 'none' : 'block';
    }
}

function updateAttachmentItemClicks() {
    // No custom click handlers needed for attachments
}



function attachmentItemHtml(base64, filename, index) {
    return `
        <li class="attachment-item">
            <img class="attachment-img" src="${base64}" draggable="false" alt="">
            <button class="delete-attachment-btn" onclick="deleteAttachment(${index})">
                <img src="assets/img/icons_add_task/delete-white.svg" alt="Delete">
            </button>
            <span class="attachment-name" draggable="false">${filename}</span>
        </li>
    `;
}

function compressImage(file, maxWidth = 800, maxHeight = 800, quality = 0.8) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                let width = img.width;
                let height = img.height;
                if (width > maxWidth || height > maxHeight) {
                    if (width > height) {
                        height = (height * maxWidth) / width;
                        width = maxWidth;
                    } else {
                        width = (width * maxHeight) / height;
                        height = maxHeight;
                    }
                }
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
                resolve(compressedBase64);
            };
            img.onerror = () => reject('Fehler beim Laden des Bildes.');
            img.src = event.target.result;
        };
        reader.onerror = () => reject('Fehler beim Lesen der Datei.');
        reader.readAsDataURL(file);
    });
}

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

function deleteAttachment(index) {
    attachments.splice(index, 1);
    renderAttachments();
    updateAttachmentItemClicks();
}

function deleteAllAttachments() {
    attachments = [];
    attachmentsList.innerHTML = '';
    updateDeleteAllButtonVisibility();
    updateAttachmentsWrapperVisibility();
}
