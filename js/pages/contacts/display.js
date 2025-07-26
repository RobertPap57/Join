/**
 * Contact display and UI management
 * Handles contact visualization, validation, and user interactions
 */

/**
 * Displays a contact by ID, rendering the contact card in the display area.
 * @param {number} id - The ID of the contact to display.
 * @return {void}
 */
function displayContact(id) {
    const contact = contacts.find(contact => contact.id === id);
    if (!contact) return;
    const contactDetailsContainer = document.getElementById('contact-displayed');
    contactDetailsContainer.innerHTML = getDisplayContactHtml(contact);
    if (window.innerWidth <= 768) {
        openMobileContact();
    } else {
        selectedContact(id);
        slideContact(contactDetailsContainer);
    }
}

/**
 * Marks a contact as active by updating the visual selection state.
 * @param {number} id - The ID of the contact to mark as active.
 * @return {void}
 */
function markContactAsActive(id) {
    contacts.forEach(contact => {
        const contactElement = document.getElementById(`contact-${contact.id}`);
        if (contactElement) {
            if (contact.id === id) {
                contactElement.classList.add('contact-active');
            } else {
                contactElement.classList.remove('contact-active');
            }
        }
    });
}

/**
 * Shows the contact display container for mobile view.
 * @return {void}
 */
function showContactDisplay() {
    const container = document.getElementById('contact-displayed');
    container.style.display = 'flex';
    container.style.transform = 'translateX(0)';
}

/**
 * Hides the contact display container with animation.
 * @param {HTMLElement} container - The container element to hide.
 * @return {Promise<void>}
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
 * @param {HTMLElement} container - The container element to clear.
 * @return {Promise<void>}
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
 * Scrolls to a specific contact in the list.
 * @param {string} id - The ID of the contact to scroll to.
 * @return {void}
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
 * Shows the mobile contact deletion modal.
 * @param {number} id - The ID of the contact to delete.
 * @return {void}
 */
function showMobileDeleteModal(id) {
    const modal = document.getElementById('mobile-delete-modal');
    if (modal) {
        modal.style.display = 'flex';
        modal.dataset.contactId = id;
    }
}

/**
 * Hides the mobile contact deletion modal.
 * @return {void}
 */
function hideMobileDeleteModal() {
    const modal = document.getElementById('mobile-delete-modal');
    if (modal) {
        modal.style.display = 'none';
        delete modal.dataset.contactId;
    }
}

/**
 * Returns to the contacts list view in mobile mode.
 * @return {void}
 */
function returnToContactsList() {
    const container = document.getElementById('contact-displayed');
    hideContactDisplay(container);
}

/**
 * Slides the contact container in and out of view.
 * @param {HTMLElement} container - The container element to be slid.
 * @return {void}
 */
function slideContact(container) {
    container.classList.remove('contact-slide-in');
    container.classList.add('contact-slide-out');
    setTimeout(() => {
        container.classList.remove('contact-slide-out');
        container.classList.add('contact-slide-in');
    }, 175);
}

/**
 * Selects a contact element by its ID and adds the 'contact-selected' class to it.
 * @param {string} id - The ID of the contact element to select.
 * @return {void}
 */
function selectedContact(id) {
    document.querySelectorAll('.contact').forEach(contactElement => {
        contactElement.classList.remove('contact-selected');
    });
    const selectedContactElement = document.getElementById(`${id}`);
    if (selectedContactElement) {
        selectedContactElement.classList.add('contact-selected');
    }
}

/**
 * Sets the display style of the main container element to 'flex' to open the mobile contact view.
 * @return {void}
 */
function openMobileContact() {
    document.getElementById('main-container').style.display = 'flex';
}

/**
 * Sets the display style of the main container element to 'none' to close the mobile contact view.
 * @return {void}
 */
function closeMobileContact() {
    document.getElementById('main-container').style.display = 'none';
}

/**
 * Calculates the position of the element relative to its container.
 * @param {Element} container - The container element.
 * @param {Element} element - The element whose position is being calculated.
 * @return {Object} An object containing position calculations.
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
 * @param {Element} element - The element to scroll.
 * @param {number} top - The top position to scroll to.
 * @return {void}
 */
function scrollToSmooth(element, top) {
    element.scrollTo({ top: top, behavior: 'smooth' });
}

/**
 * Deselects all mobile contact elements by removing the 'contact-selected' class.
 * @return {void}
 */
function deselectContactOnMobile() {
    const selectedContact = document.querySelectorAll('.contact');
    if (window.innerWidth <= 768) {
        selectedContact.forEach(contactElement => {
            contactElement.classList.remove('contact-selected');
        });
    }
}

/**
 * Adjusts the main container display based on the window width.
 * @return {void}
 */
function adjustMainContainerDisplay() {
    const mainContainer = document.getElementById('main-container');
    if (window.innerWidth > 768) {
        mainContainer.style.display = 'flex';
    } else {
        mainContainer.style.display = 'none';
    }
}

window.addEventListener('resize', deselectContactOnMobile);
window.addEventListener('resize', adjustMainContainerDisplay);


