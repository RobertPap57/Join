let isDragging = false, startX, scrollLeft, lastX, velocity = 0, inertiaId;
let dragThreshold = 5;
let currentDragDistance = 0;
let attachments = [];
const attachmentsList = document.getElementById('attachmentsList');
const errorMsg = document.getElementById('error-msg');
let viewerInstance = null;


function startDrag(e) {
    isDragging = true;
    currentDragDistance = 0;
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
    
    currentDragDistance = Math.abs(walk);
    
    velocity = getPageX(e) - lastX;
    lastX = getPageX(e);
    attachmentsList.scrollLeft = scrollLeft + walk;
}

function stopDrag() {
    const wasDragging = currentDragDistance > dragThreshold;
    isDragging = false;
    removeDragListeners();
    startInertia();
    
    if (wasDragging) {
        setTimeout(() => {
            currentDragDistance = 0;
        }, 50);
    } else {
        currentDragDistance = 0;
    }
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
    return types.includes(file.type) || exts.some(ext => name.endsWith(ext));
}

async function handleFiles(files) {
    for (const file of files) {
        if (!file.type.startsWith('image/')) continue;
        const base64 = await compressImage(file, 800, 800, 0.7);
        const size = Math.round((base64.length * 3 / 4) / 1024);
        attachments.push({
            filename: file.name,
            fileType: file.type,
            base64: base64,
            size: size
        });
        attachmentsList.innerHTML += attachmentItemHtml(base64, file.name);
        attachmentsList.scrollLeft = attachmentsList.scrollWidth;
    }
    updateAttachmentItemClicks();
    updateViewer();
}

function updateAttachmentItemClicks() {
    const items = attachmentsList.querySelectorAll('.attachment-item');
    items.forEach((item) => {
        item.onclick = null;
        item.addEventListener('click', (e) => {
            if (currentDragDistance > dragThreshold) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
            // Let Viewer.js handle the click
        });
    });
}

function updateViewer() {
    if (viewerInstance) {
        viewerInstance.destroy();
    }
    viewerInstance = new Viewer(attachmentsList, {
        url(image) {
            return image.src;
        },
        filter(image) {
            return image.tagName === 'IMG';
        },
        title(image) {
            const src = image.src;
            const att = attachments.find(a => a.base64 === src);
            if (att) {
                return `${att.filename} | ${att.fileType} | ${att.size} KB`;
            }
            return '';
        },
        ready() {}
    });
}

function attachmentItemHtml(base64, filename) {
    return `
        <li class="attachment-item">
            <img src="${base64}" draggable="false" alt="">
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
            // Reset input so same file can be selected again if needed
            input.value = '';
        });
    }
});

function deleteAttachment(index) {
    attachments.splice(index, 1);
    attachmentsList.innerHTML = '';
    attachments.forEach(attachment => {
        attachmentsList.innerHTML += attachmentItemHtml(attachment.base64, attachment.filename);
    });
    updateAttachmentItemClicks();
    updateViewer();
}

function deleteAllAttachments() {
    attachments = [];
    attachmentsList.innerHTML = '';
    updateViewer();
}
