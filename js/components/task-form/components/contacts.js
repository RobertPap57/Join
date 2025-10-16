const selectedContacts = [];
let sorteredContacts = [];
let filteredContacts = [];


/**
 * Sets up the assigned to dropdown functionality.
 */
function setupAssignedToDropdown() {
    const contactsList = document.getElementById('contacts-list');
    const arrowDown = contactsList.querySelector('.arrow-down');
    const assignedToList = document.getElementById('assigned-to-list');
    const input = contactsList.querySelector('.select-btn-input');
    setupAssignedDropdownToggles(contactsList, arrowDown, input);
    preventAssignedDropdownClose(assignedToList);
    setupAssignedDropdownClose(contactsList, assignedToList, input)
}


/**
 * Sets up all toggle events for the assigned dropdown.
 * @param {Element} contactsList - Contacts list container element
 * @param {Element} arrowDown - Arrow down element
 * @param {Element} input - Input element
 */
function setupAssignedDropdownToggles(contactsList, arrowDown, input) {
    setupArrowToggle(contactsList, arrowDown, input);
    setupInputToggle(contactsList, input);
    setupDivToggle(contactsList, input);
}


/**
 * Smoothly scrolls the window to bring the specified dropdown into view.
 * @param {HTMLElement} contactsList - The dropdown element to scroll to.
 */
function scrollWindowToDropdown(contactsList) {
    setTimeout(() => {
        const rect = contactsList.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const targetY = rect.top + scrollTop - 100;
        window.scrollTo({
            top: targetY,
            behavior: 'smooth'
        });
    }, 60);
}


/**
 * Smoothly scrolls the dialog with id 'task-form-dialog' to bring the specified dropdown into view.
 * @param {HTMLElement} contactsList - The dropdown element inside the dialog.
 */
function scrollDialogToDropdown(contactsList) {
    setTimeout(() => {
        const dialog = document.getElementById('task-form-dialog');
        if (!dialog) return;
        const dialogRect = dialog.getBoundingClientRect();
        const itemRect = contactsList.getBoundingClientRect();
        const offsetTop = itemRect.top - dialogRect.top + dialog.scrollTop - 100;
        dialog.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }, 100);
}


/**
 * Scrolls to the specified dropdown either in a dialog or in the window.
 * Chooses the appropriate scroll method based on whether the dialog exists.
 * @param {HTMLElement} contactsList - The dropdown element to scroll to.
 */
function scrollToDropdown(contactsList) {
    const dialog = document.getElementById('task-form-dialog');
    if (dialog) scrollDialogToDropdown(contactsList);
    else scrollWindowToDropdown(contactsList);
}


/**
 * Toggles the visibility of selected contacts div.
 * @param {boolean} isOpen - Whether dropdown is open
 */
function toggleSelectedContactsList(isOpen) {
    const selectedContactsDiv = document.querySelector('.selected-contacts-list');
    const contactsList = document.getElementById('contacts-list');
    if (contactsList) contactsList.ariaExpanded = isOpen ? 'true' : 'false';
    if (selectedContactsDiv) {
        selectedContactsDiv.style.display = isOpen ? 'none' : 'flex';
    }
}


/**
 * Sets up arrow toggle functionality for dropdown.
 * @param {Element} contactsList - Contacts list container element
 * @param {Element} arrowDown - Arrow down element
 * @param {Element} input - Input element
 */
function setupArrowToggle(contactsList, arrowDown, input) {
    bindEventListenerOnce(arrowDown, 'click', (event) => {
        event.stopPropagation();
        const isOpen = contactsList.classList.toggle('show-menu');
        toggleBlueBorder(contactsList, isOpen);
        toggleSelectedContactsList(isOpen);
        if (isOpen) {
            input.focus();
            scrollToDropdown(contactsList);
        }
    }, 'arrowDownClickAssigned');
}


/**
 * Sets up input click toggle functionality.
 * @param {Element} contactsList - Contacts list container element
 * @param {Element} input - Input element
 */
function setupInputToggle(contactsList, input) {
    bindEventListenerOnce(input, 'click', (event) => {
        event.stopPropagation();
        contactsList.classList.add('show-menu', 'blue-border');
        toggleSelectedContactsList(true);
        input.focus();
        scrollToDropdown(contactsList);
    }, 'inputFocusAssigned');
}


/**
 * Sets up div click toggle functionality.
 * @param {Element} contactsList - Contacts list container element
 * @param {Element} input - Input element
 */
function setupDivToggle(contactsList, input) {
    bindEventListenerOnce(contactsList, 'click', (event) => {
        if (event.target.closest('.arrow-down') || event.target === input) return;
        contactsList.classList.add('show-menu', 'blue-border');
        toggleSelectedContactsList(true);
        input.focus();
        scrollToDropdown(contactsList);
    }, 'contactsListClickAssigned');
}


/**
 * Toggles blue border class based on dropdown state.
 * @param {Element} contactsList - Contacts list container element
 * @param {boolean} isOpen - Whether dropdown is open
 */
function toggleBlueBorder(contactsList, isOpen) {
    if (isOpen) {
        contactsList.classList.add('blue-border');
    } else {
        contactsList.classList.remove('blue-border');
    }
}


/**
 * Closes the assigned-to dropdown when clicking outside or pressing Escape.
 * @param {HTMLElement} contactsList - The main dropdown container
 * @param {HTMLElement} assignedToList - The dropdown list (<ul>)
 * @param {HTMLInputElement} input - The search input inside the dropdown
 */
function setupAssignedDropdownClose(contactsList, assignedToList, input) {
    bindEventListenerOnce(document, 'pointerup', (event) => {
        if (!contactsList.contains(event.target) && !assignedToList.contains(event.target)) {
            contactsList.classList.remove('show-menu', 'blue-border');
            toggleSelectedContactsList(false);
        }
    }, 'assignedDropdownClickOutside');
    bindEventListenerOnce(document, 'keydown', (event) => {
        if (event.key === 'Escape' && contactsList.classList.contains('show-menu')) {
            contactsList.classList.remove('show-menu', 'blue-border');
            toggleSelectedContactsList(false);
            input.blur();
        }
    }, 'assignedDropdownEsc');
}


/**
 * Prevents assigned dropdown from closing when clicked inside.
 * @param {Element} assignedToList - Assigned to list element
 */
function preventAssignedDropdownClose(assignedToList) {
    bindEventListenerOnce(assignedToList, 'click', (event) => {
        event.stopPropagation();
    }, 'assignedToListClickAssigned');
}


/**
 * Filter contacts based on user input.
 */
function filterContactsListener() {
    const selectBtnInput = document.querySelector('.select-btn-input');
    if (selectBtnInput) {
        bindEventListenerOnce(selectBtnInput, 'input', () => handleFilter(selectBtnInput), 'selectBtnInputInputAssigned');
    }
}


/**
 * Handle filter and render contacts based on input value.
 * @param {Element} input - Input element for filtering
 */
function handleFilter(input) {
    if (!input) {
        filteredContacts = sorteredContacts;
    } else {
        const filterValue = input.value.toLowerCase().trim();
        if (filterValue === '') {
            filteredContacts = sorteredContacts;
        } else {
            filteredContacts = sorteredContacts.filter(contact => contact.name.toLowerCase().includes(filterValue));
        }
    }
    renderContacts();
}


/**
 * Initializes the contacts by sorting them alphabetically, setting the
 * filtered contacts to the sorted contacts, and rendering the contacts.
 */
function initContacts() {
    sorteredContacts = sortContactsAlphabetically(contacts);
    filteredContacts = sorteredContacts;
    renderContacts();
}


/**
 * Render the list of filtered contacts.
 */
function renderContacts() {
    const assignedToList = document.getElementById('assigned-to-list');
    assignedToList.innerHTML = '';
    filteredContacts.forEach(contact => {
        const isSelected = selectedContacts.includes(contact);
        assignedToList.innerHTML += getContactHTML(contact, isSelected);
        displayProfileAvatar(contact, `task-form-avatar-${contact.id}`);
    });
    selectListItems();
}


/**
 * Sorts contacts alphabetically, ensuring that the current user is always
 * first in the sorted list if they are included in the contacts.
 * @param {Array<Object>} contacts - The array of contacts to be sorted.
 * @returns {Array<Object>} - The sorted array of contacts.
 */
function sortContactsAlphabetically(contacts) {
    addCurentUserToContacts();
    return [...contacts].sort((a, b) => {
        const aIsCurrent = a.name.includes('(You)');
        const bIsCurrent = b.name.includes('(You)');
        if (aIsCurrent && !bIsCurrent) return -1;
        if (!aIsCurrent && bIsCurrent) return 1;
        return a.name.localeCompare(b.name);
    });
}


/**
 * Adds the current user to the contacts list, appending '(You)' to their name.
 * This is used to make it clear that the current user is included in the assigned contacts.
 * @private
 */
function addCurentUserToContacts() {
    if (currentUser && filteredContacts.every(contact => contact.id !== currentUser.id)) {
        const thisCurrentUser = currentUser;
        thisCurrentUser.name = currentUser.name + ' (You)';
        contacts.push(thisCurrentUser);
    }
}


/**
 * Add event listeners to list items for selection.
 */
function selectListItems() {
    const listItems = document.querySelectorAll('.list-item.assigned-to');
    listItems.forEach((item, i) => {
        bindEventListenerOnce(item, 'click', () => handleContactSelection(item, i), `listItemClickAssigned-${i}`);
    });
}

/**
 * Handles selection/deselection of a contact list item.
 * @param {Element} item - The clicked list item element
 * @param {number} i - Index of the contact in filteredContacts
 */
function handleContactSelection(item, i) {
    const img = item.querySelector('.checkbox');
    item.classList.toggle('checked');
    img.classList.toggle('checked');
    const contact = filteredContacts[i];
    if (item.classList.contains('checked')) {
        addContactToSelected(contact);
        img.src = '../assets/images/pages/add-task/checkbox-checked.svg';
        item.ariaSelected = "true";
    } else {
        removeContactFromSelected(contact);
        img.src = '../assets/images/global/checkbox.svg';
        item.ariaSelected = "false";
    }
    renderSelectedContactsBelow();
}


/**
 * Adds a contact to selectedContacts if not already present.
 * @param {Object} contact
 */
function addContactToSelected(contact) {
    if (!selectedContacts.includes(contact)) {
        selectedContacts.push(contact);
    }
}

/**
 * Removes a contact from selectedContacts if present.
 * @param {Object} contact
 */
function removeContactFromSelected(contact) {
    const index = selectedContacts.indexOf(contact);
    if (index !== -1) {
        selectedContacts.splice(index, 1);
    }
}


/**
 * Renders the selected contacts below the input field.
 */
function renderSelectedContactsBelow() {
    const selectedContactsDiv = document.querySelector('.selected-contacts-list');
    selectedContactsDiv.innerHTML = '';
    selectedContacts.forEach(contact => {
        selectedContactsDiv.innerHTML += getSelectedContactHTML(contact);
        displayProfileAvatar(contact, `selected-task-form-avatar-${contact.id}`);
    });
}

/**
 * Deselect all list items and update the display.
 */
function deselectContacts() {
    const listItems = document.querySelectorAll('.list-item.assigned-to');
    listItems.forEach((item, i) => {
        if (item.classList.contains('checked')) {
            const img = item.querySelector('.checkbox');
            item.classList.remove('checked');
            img.classList.remove('checked');
            item.ariaSelected = "false";
            img.src = '../assets/images/global/checkbox.svg';
            const contact = filteredContacts[i];
            const index = selectedContacts.indexOf(contact);
            if (index !== -1) {
                selectedContacts.splice(index, 1);
            }
        }
    });
    closeContactList();
    renderSelectedContactsBelow();
}

/**
 * Close the contact list menu.
 */
function closeContactList() {
    document.getElementById('contacts-list').classList.remove('show-menu');
}


/**
 * Close the contact list when clicking outside of it.
 */
function closeContactListOnOutsideClick() {
    bindEventListenerOnce(document, 'click', function (event) {
        const selectBtnContainer = document.getElementById('contacts-list');
        const listItemsContainer = document.querySelector('.list-items');
        if (selectBtnContainer.getAttribute('aria-expanded') !== 'true') return;
        if (!selectBtnContainer.contains(event.target) &&
            !listItemsContainer.contains(event.target)) {
            closeContactList();
        }
    }, 'documentClickAssigned');
}
