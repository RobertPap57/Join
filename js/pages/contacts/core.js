/**
 * Core initialization and main logic for Contacts page
 */

/**
 * Initializes the contacts by including HTML, highlighting contacts, reading data, loading tasks, updating header profile initials, and rendering contacts.
 * @returns {Promise<void>} A promise that resolves when all the initialization steps are completed.
 */
async function initContacts() {
    await includeHTML();
    checkOrientation();
    checkForCurrentUser() ? "" : redirectTo('login.html');
    initHeader();
    highlightLink('contacts');
    await getContacts();
    renderContacts();
    initPopup();
}

/**
 * Renders contacts if there are any, otherwise displays a message.
 */
function renderContacts() {
    checkIfArrayIsEmpty();
    const sortedContacts = contacts.sort((a, b) => a.name.localeCompare(b.name));
    renderSortedContacts(sortedContacts);
}

/**
 * Checks if the contacts array is empty and updates the contacts list container accordingly.
 */
function checkIfArrayIsEmpty() {
    if (contacts.length === 0) {
        const contactsListContainer = document.getElementById('contacts-list');
        contactsListContainer.innerHTML = '<p class="no-contacts">No contacts</p>';
        return;
    }
}

/**
 * Renders the sorted contacts in the contacts list container, with each contact
 * separated by a separator line based on the first letter of their name.
 * @param {Array<Object>} sortedContacts - The array of contacts to be rendered.
 */
function renderSortedContacts(sortedContacts) {
    const contactsListContainer = document.getElementById('contacts-list');
    contactsListContainer.innerHTML = '';
    let currentLetter = '';

    sortedContacts.forEach(contact => {
        const firstLetter = contact.name.charAt(0).toUpperCase();
        if (firstLetter !== currentLetter) {
            currentLetter = firstLetter;
            contactsListContainer.innerHTML += getContactsSeparatorHtml(currentLetter);
        }
        contactsListContainer.innerHTML += getContactsListHtml(contact);
        displayProfileAvatar(contact, `avatar-${contact.id}`);
    });
}

/**
 * Slides the toast message notification.
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
