let attachments = [];


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
        showErrorMessage('errorMsg');
        return false;
    }
    if (file.size > maxSize) {
        changeErrorMsg('size');
        showErrorMessage('errorMsg');
        return false;
    }
    return true;
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
        reader.onerror = () => reject('Error reading the file.');
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
    img.onerror = () => reject('Error loading the file.');
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
 * Changes the error message content based on error type.
 * @param {string} message - Error type ('format' or 'size')
 */
function changeErrorMsg(message) {
    const errorParagraph = document.querySelector('.error-msg p');
    errorParagraph.innerHTML = getErrorMsgHtml(message);
}


/**
 * Returns the error message HTML based on error type.
 * @param {string} message - Error type ('format' or 'size')
 * @returns {string} Error message HTML
 */
function getErrorMsgHtml(message) {
    if (message === 'format') {
        return `This file format is not allowed!<br>
            <span>You can only upload JPEG or PNG.</span>`;
    }
    if (message === 'size') {
        return `This file size is too big!<br>
            <span>You can only upload files under 10Mb.</span>`;
    }
    return '';
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

/**
 * Processes multiple files by compressing and adding them to attachments.
 * @param {File[]} files - Array of files to process
 */
async function handleFiles(files) {
    for (const file of files) {

        const base64 = await compressImage(file, 800, 800, 0.7);
        const size = Math.round((base64.length * 3 / 4) / 1024);
        const attachment = {
            filename: file.name,
            base64: base64,
            size: size
        };
        console.log('Adding attachment:', attachment);
        
        attachments.push(attachment);
        renderAttachments();
        attachmentsList.scrollLeft = attachmentsList.scrollWidth;
    }
}



async function handleImageFile(file) {
    try {
        const base64Image = await compressImage(file, 800, 800, 0.7);
        console.log('Image file processed successfully:', base64Image);
        updatePopupProfileImage(base64Image);
        return base64Image;
    } catch (error) {
        console.error('Error compressing image:', error);
        return null;
    }
}

/**
 * Initializes the file picker for popup profile images.
 * Should be called after popup template is loaded.
 */
function initImageHandler() {
    const picker = document.getElementById('filepicker');
    if (!picker) {
        console.warn('File picker element not found');
        return;
    }
    
    console.log('File picker found, adding change event listener');
    picker.addEventListener('change', async function () {
        const file = picker.files?.[0];
        picker.value = ''; // Reset immediately to allow re-selection of the same file

        if (!file || !isAllowedFile(file)) {
            console.warn('File is not allowed:', file?.name);
            return;
        }
        
        const base64 = await handleImageFile(file);
        if (base64) {
            console.log('Base64 string returned:', base64);
            // Update the popup form dataset with the new image
            const form = document.getElementById('popup-form');
            if (form) {
                form.dataset.image = base64;
            }
        }
    });
}




