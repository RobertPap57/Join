/**
 * Popup and modal window management
*/

let popupElements = {};

/**
 * Gets all popup DOM elements and returns them as an object.
 * @returns {Object} Object containing all popup element references.
 */
function getPopupElements() {
    return {
        popupModal: document.getElementById('popup-modal'),
        popupWindow: document.getElementById('popup-window'),
        popupForm: document.getElementById('popup-form'),
        title: document.getElementById('popup-title'),
        profileImg: document.getElementById('popup-profile-img'),
        uploadBtn: document.getElementById('popup-upload-btn'),
        filePicker: document.getElementById('file-picker'),
        name: document.getElementById('name'),
        email: document.getElementById('email'),
        phone: document.getElementById('phone'),
        secondaryBtn: document.getElementById('popup-secondary-btn'),
        primaryBtn: document.getElementById('popup-primary-btn'),
        errorModal: document.getElementById('error-modal'),
        errorMsg: document.getElementById('error-msg'),
        warningMsg: document.getElementById('warning-msg'),
    }
}

/**
 * Initializes popup functionality by setting up elements and event listeners.
*/
function initPopup() {
    popupElements = getPopupElements();
    closePopupOnClickOutsideListener();
    closeErrorModalOnClickOutside();
    uploadBtnHoverListener();
    initImageHandler();
}

/**
 * Sets up the popup configuration and content.
 * @param {string} type - The type of popup to set up.
 * @param {Object} user - The user data for the popup.
 */
function setUpPopup(type, user) {
    setUpTitle(type);
    setUpPopupForm(type, user);
    setUpSecondaryButtonAction(type, user)
    setUpProfileImage(user);
    setInputsUneditable(type);
    setUpButtons(type);
    if (type !== 'my-account') {
        initFormValidation();
        updateButtonState();
    }
}

/**
 * Sets up the popup form with user data and type information.
 * @param {string} type - The type of popup (add-contact, edit-contact, etc.).
 * @param {Object} user - The user object with form data.
 */
function setUpPopupForm(type, user = {}) {
    const form = popupElements.popupForm;
    form.dataset.type = type;
    form.dataset.id = user.id || '';
    form.dataset.color = user.color || '';
    form.dataset.image = user.image || '';
    form.dataset.password = user.password || '';
    form.elements['name'].value = user.name || '';
    form.elements['email'].value = user.email || '';
    form.elements['phone'].value = user.phone || '';
}

/**
 * Handles form submission for popup forms.
 * @param {Event} event - The form submit event.
 */
async function handleSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const formValues = {
        id: form.dataset.id || '',
        color: form.dataset.color || getRandomColor(),
        image: form.dataset.image || '',
        password: form.dataset.password || '',
        name: formData.get('name')?.trim() || '',
        email: formData.get('email')?.trim() || '',
        phone: formData.get('phone')?.trim() || '',
    };
    const type = form.dataset.type;
    await setUpSubmitActions(type, formValues);
}

/**
 * Sets up submit actions based on popup type.
 * @param {string} type - The type of popup action.
 * @param {Object} user - The user data to process.
 */
async function setUpSubmitActions(type, user) {
    switch (type) {
        case 'add-contact':
            await addContact(user);
            break;
        case 'edit-contact':
            await updateContact(user);
            break;
        case 'my-account':
            openPopup('edit-account', user);
            break;
        case 'edit-account':
            await updateUser(user);
            openPopup('my-account', user);
            break;
    }
}

/**
 * Sets up secondary button actions based on popup type.
 * @param {string} type - The type of popup.
 * @param {Object} user - The user data.
 */
function setUpSecondaryButtonAction(type, user) {
    const btn = popupElements.secondaryBtn;
    switch (type) {
        case 'add-contact': btn.onclick = () => {
            closePopup();
        };
            break;
        case 'edit-contact': btn.onclick = async () => {
            await deleteContact(user.id);
        };
            break;
        default: btn.onclick = async () => {
            await openDeleteUserMsg(user.id);
        };
            break;
    }
}

/**
 * Sets up all popup buttons based on the popup type.
 * @param {string} type - The type of popup.
*/
function setUpButtons(type) {
    setUpPrimaryButton(type);
    setUpSecondaryButton(type);
    setUpButtonIcon(type);
    popupElements.secondaryBtn.classList.toggle('popup-secondary-btn', type === 'add-contact');
    popupElements.uploadBtn.classList.toggle('d-none', type === 'my-account');
    popupElements.primaryBtn.classList.remove('button-disabled');
}

/**
 * Sets up the primary button text and behavior based on popup type.
 * @param {string} type - The type of popup.
*/
function setUpPrimaryButton(type) {
    switch (type) {
        case 'add-contact':
            popupElements.primaryBtn.innerHTML = `<p>Create contact</p>`;
            break;
        case 'my-account':
            popupElements.primaryBtn.innerHTML = `<p>Edit</p>`;
            break;
        default:
            popupElements.primaryBtn.innerHTML = `<p>Save</p>`;
            break;
    }
}

/**
 * Sets up the secondary button text based on popup type.
 * @param {string} type - The type of popup.
*/
function setUpSecondaryButton(type) {
    switch (type) {
        case 'add-contact':
            popupElements.secondaryBtn.innerHTML = `<p>Cancel</p>`;
            break;
        case 'my-account':
            popupElements.secondaryBtn.innerHTML = `<p>Delete my account</p>`;
            break;
        case 'edit-account':
            popupElements.secondaryBtn.innerHTML = `<p>Delete my account</p>`;
            break;
        default:
            popupElements.secondaryBtn.innerHTML = `<p>Delete</p>`;
            break;
    }
}

/**
 * Sets up button icons based on popup type.
 * @param {string} type - The type of popup.
*/
function setUpButtonIcon(type) {
    if (type !== 'my-account') {
        popupElements.primaryBtn.innerHTML += `<div class="popup-icon-container d-flex-center">
            <img src="../assets/images/global/check-white.svg" alt="check">
            </div>`;
    } if (type === 'add-contact') {
        popupElements.secondaryBtn.innerHTML += `<div class="popup-icon-container d-flex-center">
            <img src="../assets/images/global/close.svg" alt="close">
            </div>`;
    } else return;
}

/**
 * Sets up hover effects for the upload button.
*/
function uploadBtnHoverListener() {
    const photoIcon = popupElements.uploadBtn.querySelector('img');
    popupElements.uploadBtn.addEventListener("mouseenter", () => {
        photoIcon.src = "../assets/images/components/popup/photo-white.svg";
    });
    popupElements.uploadBtn.addEventListener("mouseleave", () => {
        photoIcon.src = "../assets/images/components/popup/photo.svg";
    });
}

/**
 * Sets up the popup title based on the popup type.
 * @param {string} type - The type of popup.
*/
function setUpTitle(type) {
    switch (type) {
        case 'add-contact':
            popupElements.title.innerHTML = `<h1>Add contact</h1><p>Tasks are better with a team!</p>`;
            break;
        case 'my-account':
            popupElements.title.innerHTML = `<h1>My account</h1>`;
            break;
        case 'edit-contact':
            popupElements.title.innerHTML = `<h1>Edit contact</h1>`;
            break;
        case 'edit-account':
            popupElements.title.innerHTML = `<h1>Edit account</h1>`;
            break;
    }
}

/**
 * Sets up the profile image display based on user data.
 * @param {Object} user - The user object containing image, name, and color properties.
 */
function setUpProfileImage(user) {
    if (user) {
        if (!user.image && user.name) {
            popupElements.profileImg.innerHTML = `${createNameInitials(user.name)}`;
            popupElements.profileImg.style.backgroundColor = user.color;
            return;
        } if (user.image) {
            popupElements.profileImg.innerHTML = `<img class="profile-image" src="${user.image}" alt="Profile picture">`;
        }
    } else {
        popupElements.profileImg.style.backgroundColor = '#D9D9D9';
        popupElements.profileImg.innerHTML = `<img src="../assets/images/components/popup/person-white.svg" alt="Profile picture" class="person-icon">`;

    }
}

/**
 * Updates the popup profile image with the provided base64 image
 * @param {string} base64Image - Base64 encoded image string
*/
function updatePopupProfileImage(base64Image) {
    if (popupElements.profileImg && base64Image) {
        popupElements.profileImg.innerHTML = `<img class="profile-image" src="${base64Image}" alt="Profile picture">`;
        popupElements.profileImg.style.backgroundColor = '';
    }
}

/**
* Sets input fields as editable or read-only based on popup type.
* @param {string} type - The type of popup.
*/
function setInputsUneditable(type) {
    const readOnly = type === 'my-account' ? true : false;
    const inputs = document.querySelectorAll('.popup-input input');
    inputs.forEach(input => {
        input.readOnly = readOnly;
    });
}

/**
 * Clears all input values in popup form fields.
*/
function clearInputs() {
    const inputs = document.querySelectorAll('.popup-input input');
    inputs.forEach(input => input.value = '');
}

/**
 * Opens a popup with the specified type and user data.
 * @param {string} type - The type of popup to open.
 * @param {Object} user - The user data for the popup.
 */
function openPopup(type, user) {
    setUpPopup(type, user);
    showPopup();
}

/**
 * Closes the popup and cleans up form data.
 */
function closePopup() {
    hidePopup();
    clearInputs();
    clearFormValidation();
}

/**
 * Shows the popup with animation.
*/
function showPopup() {
    popupElements.popupModal.classList.remove('d-none');
    popupElements.popupWindow.classList.remove('d-none');
    setTimeout(() => {
        popupElements.popupWindow.classList.remove('popup-close');
        popupElements.popupWindow.classList.add('popup-open');
    }, 10);
}

/**
 * Hides the popup with animation.
 */
function hidePopup() {
    popupElements.popupWindow.classList.remove('popup-open');
    popupElements.popupWindow.classList.add('popup-close');
    setTimeout(() => {
        popupElements.popupModal.classList.add('d-none');
        popupElements.popupWindow.classList.add('d-none');
    }, 110);
}

/**
 * Sets up event listener to close popup when clicking outside the popup window.
*/
function closePopupOnClickOutsideListener() {
    popupElements.popupModal.addEventListener('click', (event) => {
        if (event.target === popupElements.popupModal) {
            closePopup();
        }
    });
}

/**
 * Shows error message modal with slide-in animation.
*/
function showErrorMessage(key) {
    const errorContainer = popupElements[key];
    popupElements.errorModal.classList.remove('d-none');
    setTimeout(() => {
        errorContainer.classList.add('error-msg-slide-in');
    }, 100);
};

/**
 * Closes error message modal with slide-out animation.
*/
function closeErrorMsg(key) {
    const errorContainer = popupElements[key];
    errorContainer.classList.remove('error-msg-slide-in');
    setTimeout(() => {
        popupElements.errorModal.classList.add('d-none');
    }, 100);
}

/**
 * Sets up event listener to close error modal when clicking outside.
*/
function closeErrorModalOnClickOutside() {
    if (!popupElements.errorModal) {
        console.error('Error modal not found in the DOM.');
        return;
    }
    popupElements.errorModal.addEventListener('click', (event) => {
        if (event.target === popupElements.errorModal) {
            closeErrorMsg('errorMsg');
            closeErrorMsg('warningMsg');
        }
    });
}

/**
 * Opens a delete user confirmation message.
 * @param {string} id - User ID to delete
 */
async function openDeleteUserMsg(id) {
    showErrorMessage('warningMsg');
    const deleteButton = document.getElementById('delete-acc-btn');
    deleteButton.onclick = async () => {
        await deleteUser(id);
    };
}

/**
 * Updates the current user data in storage and display.
 * @param {Object} user - User object with updated information
*/
async function updateUser(user) {
    currentUser = user;
    displayHeaderAvatar();
    sessionStorage.setItem('currentUser', JSON.stringify(user));
    await updateData('/users', user.id, user);
}

/**
 * Deletes a user from the system and logs out.
 * @param {string} id - User ID to delete
*/
async function deleteUser(id) {
    await deleteData('/users', id);
    closeErrorMsg('warningMsg');
    closePopup();
    logOut();
}