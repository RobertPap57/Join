let popupElements = {};

/**
 * Gets all popup DOM elements and returns them as an object.
 * @returns {Object} Object containing all popup element references.
 */
function getPopupElements() {
    return {
        popupDialog: document.getElementById('popup-dialog'),
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
        errorDialog: document.getElementById('error-dialog'),
        warningDialog: document.getElementById('warning-dialog'),
        deleteAccBtn: document.getElementById('delete-acc-btn'),
    }
}


/**
 * Initializes popup functionality by setting up elements and event listeners.
*/
function initPopup() {
    popupElements = getPopupElements();
    closePopupDialogsOnClickOutsideListener();
    closePopupDialogsOnEscListener();
    uploadBtnHoverListener();
    initImageHandler();
    enableDialogKeyboardButtons();
    trapFocusInDialogEvent();
}


/**
 * Opens a popup with the specified type and user data.
 * @param {string} type - The type of popup to open.
 * @param {Object} user - The user data for the popup.
 */
function openPopup(type, user) {
    setUpPopup(type, user);
    showPopup(type);
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
 * Shows the popup with animation based on the popup type.
*/
function showPopup(type) {
    const popupDialog = popupElements.popupDialog;
    if (!popupDialog) return;
    if (type === 'add-contact' || type === 'edit-contact') {
        openDialog(popupDialog, true);
    } else {
        openDialog(popupDialog, false);
    }

}


/**
 * Hides the popup with animation if the dialog has animate class.
 */
function hidePopup() {
    const popupDialog = popupElements.popupDialog;
    if (!popupDialog) return;
    closeDialog(popupDialog);
}



/**
 * Adds click outside listeners to dialogs and closes them.
 */
function closePopupDialogsOnClickOutsideListener() {
    closeDialogOnClickOutside(popupElements.errorDialog, () => closeToastDialog('errorDialog'));
    closeDialogOnClickOutside(popupElements.warningDialog, () => closeToastDialog('warningDialog'));
    closeDialogOnClickOutside(popupElements.popupDialog, () => closePopup());
}


/**
 * Adds ESC key listeners to dialogs and closes them on ESC.
 */
function closePopupDialogsOnEscListener() {
    closeDialogOnEsc(popupElements.errorDialog, () => closeToastDialog('errorDialog'));
    closeDialogOnEsc(popupElements.warningDialog, () => closeToastDialog('warningDialog'));
    closeDialogOnEsc(popupElements.popupDialog, () => closePopup());
}


/**
 * Opens a toast dialog modal and applies a slide-in animation.
 * @param {string} key - The key used to retrieve the toast dialog element from `popupElements`.
 */
function openToastDialog(key) {
    const toastDialog = popupElements[key];
    if (!toastDialog.open) toastDialog.showModal();
    setTimeout(() => {
        toastDialog.classList.add('toast-dialog-slide-in');
    }, 50);
};


/**
 * Closes the toast dialog for the given key.
 * @param {string} key - The key identifying the toast dialog element in popupElements.
 */
function closeToastDialog(key) {
    const toastDialog = popupElements[key];
    toastDialog.classList.remove('toast-dialog-slide-in');
    setTimeout(() => {
        toastDialog.close();
    }, 125);
}


/**
 * Opens a delete user confirmation message.
 * @param {string} id - User ID to delete
 */
async function openDeleteUserMsg(id) {
    openToastDialog('warningDialog');
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
    initHeader();
    sessionStorage.setItem('currentUser', JSON.stringify(user));
    await updateData('/users', user.id, user);
}


/**
 * Deletes a user from the system and logs out.
 * @param {string} id - User ID to delete
*/
async function deleteUser(id) {
    await deleteData('/users', id);
    closeErrorMsg('warningDialog');
    closePopup();
    logOut();
}