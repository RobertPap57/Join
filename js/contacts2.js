

async function deleteContact(id) {
    contacts = contacts.filter(contact => contact.id !== id);
    const container = document.getElementById('contact-displayed');
    await hideContactDisplay(container);
    closePopUpWindow('edit-contact', 'modal', 'pop-up-open', 'pop-up-close');
    await deleteData("contacts", id);
    renderContacts();

}


/**
* Hides the contact display by removing the appropriate CSS classes from the container element.
* If the window width is less than or equal to 768 pixels, the 'contact-slide-out' class is removed
* and the mobile contact is closed. Otherwise, the 'contact-slide-in' class is removed and the
* 'contact-slide-out' class is added. Then, the container content is cleared.
*
* @param {HTMLElement} container - The container element to hide the contact display.
* @return {Promise<void>} - A promise that resolves when the contact display is hidden.
*/
async function hideContactDisplay(container) {
    if (window.innerWidth <= 768) {
        container.classList.remove('contact-slide-out');
        closeMobileContact();
    } else {
        container.classList.remove('contact-slide-in');
        container.classList.add('contact-slide-out');
    }
    await clearContainerContent(container);
}


/**
* Clears the content of a container element after a delay.
*
* @param {HTMLElement} container - The container element to clear.
* @return {Promise<void>} - A promise that resolves when the content is cleared.
*/
function clearContainerContent(container) {
    return new Promise(resolve => {
        setTimeout(() => {
            container.innerHTML = '';
            resolve();
        }, 75);
    });
}


/**
* Scrolls the contacts container to the specified contact element.
*
* @param {string} id - The id of the contact element to scroll to.
*/
function scrollToContact(id) {
    const contactsContainer = document.querySelector('.contacts-container');
    const contactElement = document.getElementById(`${id}`);

    if (contactElement && contactsContainer) {
        const { contactTopRelativeToContainer, contactBottomRelativeToContainer, containerHeight } = calculatePositions(contactsContainer, contactElement);

        if (contactTopRelativeToContainer < 0) {
            scrollToSmooth(contactsContainer, contactsContainer.scrollTop + contactTopRelativeToContainer);
        } else if (contactBottomRelativeToContainer > containerHeight) {
            scrollToSmooth(contactsContainer, contactsContainer.scrollTop + (contactBottomRelativeToContainer - containerHeight) + 14);
        } else {
            const offset = (containerHeight - contactElement.clientHeight) / 2;
            scrollToSmooth(contactsContainer, contactTopRelativeToContainer - offset);
        }
    }
}


/**
* Calculates the position of the element relative to its container.
*
* @param {Element} container - The container element.
* @param {Element} element - The element whose position is being calculated.
* @return {Object} An object containing the top position relative to the container, the bottom position relative to the container, and the container height.
*/
function calculatePositions(container, element) {
    const contactRect = element.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    const contactTopRelativeToContainer = contactRect.top - containerRect.top;
    const contactBottomRelativeToContainer = contactTopRelativeToContainer + contactRect.height;
    const containerHeight = containerRect.height;

    return { contactTopRelativeToContainer, contactBottomRelativeToContainer, containerHeight };
}


/**
* Scrolls the element smoothly to the specified position.
*
* @param {Element} element - The element to scroll.
* @param {number} top - The top position to scroll to.
*/
function scrollToSmooth(element, top) {
    element.scrollTo({ top: top, behavior: 'smooth' });
}


/**
* Adds event listeners to all input elements with the class 'input'.
*
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
* Adds event listeners to all input elements with the class 'input'.
* This function is called when the DOM content is fully loaded.
*
* @return {void}
*/
document.addEventListener('DOMContentLoaded', function () {
    addInputEventListeners();
});


/**
* Clears the values of all input fields with the class 'input'.
*
* @return {void}
*/
function clearInputs() {
    const inputs = document.querySelectorAll('.input input');
    inputs.forEach(function (input) {
        input.value = '';
    });
}


/**
* Generates a random hexadecimal color code.
*
* @return {string} A random hexadecimal color code.
*/
function randomColors() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}


/**
* Opens a pop-up window by removing 'd-none' class from modal and pop-up window elements.
*
* @param {string} windowId - The id of the pop-up window element.
* @param {string} modalId - The id of the modal element.
* @param {string} classOpen - The class to add to pop-up window to open it.
* @param {string} classClose - The class to remove from pop-up window to close it.
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
* Closes the pop-up window by changing classes and adding a timeout.
*
* @param {string} windowId - The id of the pop-up window element.
* @param {string} modalId - The id of the modal element.
* @param {string} classOpen - The class to remove from pop-up window.
* @param {string} classClose - The class to add to pop-up window.
* @return {void} No return value.
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
* Handles the click event on the modal and mobile modal to close the pop-up windows.
*
* @param {Event} event - The click event.
* @return {void} This function does not return anything.
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


/**
* Deselects all mobile contact elements by removing the 'contact-selected' class.
*/
function deselectContactOnMobile() {
    const selectedContact = document.querySelectorAll('.contact');
    if (window.innerWidth <= 768) {
        selectedContact.forEach(contactElement => {
            contactElement.classList.remove('contact-selected');
        })
    }
}


/**
* Adjusts the main container display based on the window width.
*
* @return {void} This function does not return anything.
*/
function adjustMainContainerDisplay() {
    const mainContainer = document.getElementById('main-container');
    if (window.innerWidth > 768) {
        mainContainer.style.display = 'flex';
    } else {
        mainContainer.style.display = 'none';
    }
}


/**
* Validates an email address based on specific criteria and sets a custom validity message.
*
* @param {string} id - The ID of the email input element.
* @return {void} This function does not return anything.
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
* Attaches event listeners to the window object for click and resize events.
* The click event listener calls the closeModalOnClick function.
* The resize event listener calls the deselectContactOnMobile and adjustMainContainerDisplay functions.
*
* @return {void} This function does not return anything.
*/
window.addEventListener('click', closeModalOnClick);
window.addEventListener('resize', deselectContactOnMobile);
window.addEventListener('resize', adjustMainContainerDisplay);

