/**
 * Contact assignment and filtering functionality for Add Task
 * Handles dropdown behavior, contact selection, and filtering
 */

const selectedContacts = [];
let filteredContacts = contacts;

/**
 * Sets up the assigned to dropdown functionality.
 */
function showAssignedToDropdown() {
    const contactsList = document.getElementById('contacts-list');
    const arrowDown = contactsList.querySelector('.arrow-down');
    const assignedToList = document.getElementById('assigned-to-list');
    const input = contactsList.querySelector('.select-btn-input');
    setupAssignedDropdownToggles(contactsList, arrowDown, input);
    preventAssignedDropdownClose(assignedToList);
    addAssignedDropdownOutsideListener(contactsList, assignedToList);
    
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
 * Scrolls to dropdown position when opened.
 * @param {Element} contactsList - Contacts list container element
 */
function scrollToDropdown(contactsList) {
    setTimeout(() => {
        const rect = contactsList.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const targetY = rect.top + scrollTop - 100;
        window.scrollTo({
            top: targetY,
            behavior: 'smooth'
        });
    }, 100);
}

/**
 * Toggles the visibility of selected contacts div.
 * @param {boolean} isOpen - Whether dropdown is open
 */
function toggleSelectedContactsDiv(isOpen) {
    const selectedContactsDiv = document.querySelector('.selected-contacts-div');
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
    arrowDown.addEventListener('click', (event) => {
        event.stopPropagation();
        const isOpen = contactsList.classList.toggle('show-menu');
        toggleBlueBorder(contactsList, isOpen);
        toggleSelectedContactsDiv(isOpen);
        if (isOpen) {
            input.focus();
            scrollToDropdown(contactsList);
        }
    });
}

/**
 * Sets up input click toggle functionality.
 * @param {Element} contactsList - Contacts list container element
 * @param {Element} input - Input element
 */
function setupInputToggle(contactsList, input) {
    input.addEventListener('click', (event) => {
        event.stopPropagation();
        contactsList.classList.add('show-menu');
        contactsList.classList.add('blue-border');
        toggleSelectedContactsDiv(true);
        input.focus();
        scrollToDropdown(contactsList);
    });
}

/**
 * Sets up div click toggle functionality.
 * @param {Element} contactsList - Contacts list container element
 * @param {Element} input - Input element
 */
function setupDivToggle(contactsList, input) {
    contactsList.addEventListener('click', (event) => {
        if (event.target.closest('.arrow-down')) return;
        contactsList.classList.add('show-menu');
        contactsList.classList.add('blue-border');
        toggleSelectedContactsDiv(true);
        input.focus();
        scrollToDropdown(contactsList);
    });
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
 * Adds outside click listener for assigned dropdown.
 * @param {Element} contactsList - Contacts list container element
 * @param {Element} assignedToList - Assigned to list element
 */
function addAssignedDropdownOutsideListener(contactsList, assignedToList) {
    // Remove old listener if it exists
    if (window._assignedOutsideClickHandler) {
        document.removeEventListener('click', window._assignedOutsideClickHandler);
    }
    
    // Create new handler and store reference
    window._assignedOutsideClickHandler = (event) => {
        if (!contactsList.contains(event.target) && !assignedToList.contains(event.target)) {
            contactsList.classList.remove('show-menu');
            contactsList.classList.remove('blue-border');
            toggleSelectedContactsDiv(false);
        }
    };
    
    // Add the new listener
    document.addEventListener('click', window._assignedOutsideClickHandler);
}

/**
 * Prevents assigned dropdown from closing when clicked inside.
 * @param {Element} assignedToList - Assigned to list element
 */
function preventAssignedDropdownClose(assignedToList) {
    assignedToList.addEventListener('click', (event) => {
        event.stopPropagation();
    });
}

/**
 * Filter contacts based on user input.
 */
function filterContacts() {

    const selectBtnInput = document.querySelector('.select-btn-input');
    if (selectBtnInput) {
        selectBtnInput.addEventListener('click', () => handleFilter(selectBtnInput));
        selectBtnInput.addEventListener('input', () => handleFilter(selectBtnInput));
    } 
}

/**
 * Handle filter and render contacts based on input value.
 * @param {Element} input - Input element for filtering
 */
function handleFilter(input) {
    if (!input) {
        filteredContacts = contacts;
    } else {
        const filterValue = input.value.toLowerCase().trim();
        if (filterValue === '') {
            filteredContacts = contacts;
        } else {
            filteredContacts = contacts.filter(contact => contact.name.toLowerCase().startsWith(filterValue));
        }
    }
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
 * Add event listeners to list items for selection.
 */
function selectListItems() {
    const listItems = document.querySelectorAll('.list-item.assigned-to');
    listItems.forEach((item, i) => {
        item.addEventListener('click', () => handleContactSelection(item, i));
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
    } else {
        removeContactFromSelected(contact);
        img.src = '../assets/images/global/checkbox.svg';
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
    const selectedContactsDiv = document.querySelector('.selected-contacts-div');
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
    document.addEventListener('click', function (event) {
        const selectBtnContainer = document.getElementById('contacts-list');
        const listItemsContainer = document.querySelector('.list-items');

        if (!selectBtnContainer.contains(event.target) && !listItemsContainer.contains(event.target)) {
            closeContactList();
        }
    });
}
