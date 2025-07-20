/**
 * Popup and modal window management
 * Handles opening, closing, and managing popup windows and modals
 */

/**
 * Opens a pop-up window by setting the display to 'flex' and adding classes for animation.
 * @param {string} windowId - The ID of the pop-up element to open.
 * @param {string} modalId - The ID of the modal element to manage.
 * @param {string} classOpen - The CSS class to add when opening.
 * @param {string} classClose - The CSS class to remove when opening.
 * @return {void}
 */
function openPopUpWindow(windowId, modalId, classOpen, classClose) {
    let popUpWindow = document.getElementById(windowId);
    let modal = document.getElementById(modalId);
    modal.classList.remove('d-none');
    popUpWindow.classList.remove('d-none');
    setTimeout(() => {
        popUpWindow.classList.remove(classClose);
        popUpWindow.classList.add(classOpen);
    }, 10);
}

/**
 * Closes a pop-up window by adding the close class and removing the open class.
 * @param {string} windowId - The ID of the pop-up element to close.
 * @param {string} modalId - The ID of the modal element to manage.
 * @param {string} classOpen - The CSS class to remove when closing.
 * @param {string} classClose - The CSS class to add when closing.
 * @return {void}
 */
function closePopUpWindow(windowId, modalId, classOpen, classClose) {
    let popUpWindow = document.getElementById(windowId);
    let modal = document.getElementById(modalId);
    popUpWindow.classList.remove(classOpen);
    popUpWindow.classList.add(classClose);
    setTimeout(() => {
        modal.classList.add('d-none');
        popUpWindow.classList.add('d-none');
    }, 110);
    clearInputs();
}

/**
 * Prevents event bubbling when clicking inside popup content.
 * @param {Event} event - The click event to stop propagation for.
 * @return {void}
 */
function doNotClose(event) {
    event.stopPropagation();
}

/**
 * Adds input event listeners to form fields for validation.
 * @return {void}
 */
function addInputEventListeners() {
    const inputs = document.querySelectorAll('.input input');
    inputs.forEach(function (input) {
        const container = input.parentElement;
        input.addEventListener('focus', function () {
            container.classList.add('input-active');
        });
        input.addEventListener('blur', function () {
            container.classList.remove('input-active');
        });
        input.addEventListener('input', function () {
            container.classList.add('input-active');
        });
    });
}

/**
 * Validates individual input fields and updates their styling.
 * @param {Event} event - The input event containing the target element.
 * @return {void}
 */
function validateInput(event) {
    const input = event.target;
    const value = input.value.trim();
    
    if (input.type === 'email') {
        if (value && !validateEmail(value)) {
            input.classList.add('invalid');
        } else {
            input.classList.remove('invalid');
        }
    } else {
        if (value === '') {
            input.classList.add('invalid');
        } else {
            input.classList.remove('invalid');
        }
    }
}

/**
 * Validates an email address based on specific criteria and sets a custom validity message.
 * @param {string} id - The ID of the email input element.
 * @return {void}
 */
function validateEmail(id) {
    const emailElement = document.getElementById(id);
    const email = emailElement.value;
    const validations = [
        { condition: email.indexOf('@') < 1, message: 'Die E-Mail-Adresse muss ein @-Symbol enthalten.\n' },
        { condition: email.lastIndexOf('.') <= email.indexOf('@') + 1, message: 'Die E-Mail-Adresse muss einen Punkt (.) nach dem @-Symbol enthalten.\n' },
        { condition: email.lastIndexOf('.') === email.length - 1, message: 'Die E-Mail-Adresse darf nicht mit einem Punkt (.) enden.\n' },
        { condition: !/^[a-zA-Z0-9._%+-]+@/.test(email), message: 'Der lokale Teil der E-Mail-Adresse enthält ungültige Zeichen.\n' },
        { condition: !/[a-zA-Z]{2,}$/.test(email.split('.').pop()), message: 'Die Top-Level-Domain muss mindestens zwei Buchstaben lang sein.\n' }
    ];
    const errorMessage = validations.reduce((msg, val) => val.condition ? msg + val.message : msg, '');
    emailElement.setCustomValidity(errorMessage);
}

/**
 * Validates the form inputs for adding or editing a contact.
 * @return {boolean} True if all inputs are valid, false otherwise.
 */
function validateContactForm() {
    const name = document.getElementById('new-name')?.value || document.getElementById('edit-name')?.value;
    const email = document.getElementById('new-email')?.value || document.getElementById('edit-email')?.value;

    if (!name || !email) {
        showToastMessage('Name and email are required');
        return false;
    }

    if (!validateEmail(email)) {
        showToastMessage('Please enter a valid email address');
        return false;
    }

    return true;
}

/**
 * Shows a toast message to the user.
 * @param {string} message - The message to display in the toast.
 * @return {void}
 */
function showToastMessage(message) {
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

/**
 * Slides the toast message notification.
 * @return {void}
 */
function slideToastMsg() {
    let container = document.getElementById('toast-msg')
    setTimeout(() => {
        container.classList.remove('toast-msg-slide-out');
        container.classList.add('toast-msg-slide-in');
    }, 500);
    setTimeout(() => {
        container.classList.remove('toast-msg-slide-in');
        container.classList.add('toast-msg-slide-out');
    }, 2000);
}

/**
 * Clears the values of all input fields with the class 'input'.
 * @return {void}
 */
function clearInputs() {
    const inputs = document.querySelectorAll('.input input');
    inputs.forEach(function (input) {
        input.value = '';
    });
}

/**
 * Handles the click event on the modal and mobile modal to close the pop-up windows.
 * @param {Event} event - The click event.
 * @return {void}
 */
function closeModalOnClick(event) {
    const modal = document.getElementById('modal');
    const mobileModal = document.getElementById('mobile-modal');
    const addContactContent = document.getElementById('add-contact');
    const editContactContent = document.getElementById('edit-contact');
    const subMenuContent = document.getElementById('contact-sub-menu');
    if (event.target === modal) {
        if (!addContactContent.classList.contains('d-none')) {
            closePopUpWindow('add-contact', 'modal', 'pop-up-open', 'pop-up-close');
        }
        if (!editContactContent.classList.contains('d-none')) {
            closePopUpWindow('edit-contact', 'modal', 'pop-up-open', 'pop-up-close');
        }
    }
    if (event.target === mobileModal) {
        if (!subMenuContent.classList.contains('d-none')) {
            closePopUpWindow('contact-sub-menu', 'mobile-modal', 'sub-menu-open', 'sub-menu-close');
        }
    }
}

document.addEventListener('DOMContentLoaded', function () {
    addInputEventListeners();
});

window.addEventListener('click', closeModalOnClick);
