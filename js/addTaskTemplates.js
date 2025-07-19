const selectedContacts = [];
const subtasks = [];
let newTask = {};
let filteredContacts = contacts;
let tempTasks = [];
const svgMappings = {
    'urgent': './assets/img/icons_add_task/urgent.svg',
    'urgent-active': './assets/img/icons_add_task/urgent-white.svg',
    'medium': './assets/img/icons_add_task/medium.svg',
    'medium-active': './assets/img/icons_add_task/medium-white.svg',
    'low': './assets/img/icons_add_task/low.svg',
    'low-active': './assets/img/icons_add_task/low-white.svg'
};

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
    if (!window._assignedToDropdownListenerAdded) {
        document.addEventListener('click', (event) => {
            if (
                !contactsList.contains(event.target) &&
                !assignedToList.contains(event.target)
            ) {
                contactsList.classList.remove('show-menu');
                contactsList.classList.remove('blue-border');
                toggleSelectedContactsDiv(false);
            }
        });
        window._assignedToDropdownListenerAdded = true;
    }
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

    selectBtnInput.addEventListener('click', () => handleFilter(selectBtnInput));
    selectBtnInput.addEventListener('input', () => handleFilter(selectBtnInput));

}

/**
 * Handle filter and render contacts based on input value.
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
        assignedToList.innerHTML += `
            <li class="list-item assigned-to ${isSelected ? 'checked' : ''}" data-id="${contact.id}">
                <div class="list-item-name">
                    <div class="cicle" style="background-color: ${contact.color}">${createNameInitials(contact.name)}</div>
                    <span>${contact.name}</span>
                </div>
                <img class="checkbox ${isSelected ? 'checked' : ''}" src="./assets/img/icons_add_task/${isSelected ? 'checkedbox' : 'checkbox'}.svg" alt="">
            </li>
        `;
    });
    selectListItems();
}

/**
 * Add event listeners to list items for selection.
 */
function selectListItems() {
    const listItems = document.querySelectorAll('.list-item.assigned-to');

    listItems.forEach((item, i) => {
        item.addEventListener('click', () => {
            const img = item.querySelector('.checkbox');
            item.classList.toggle('checked');
            img.classList.toggle('checked');

            const contact = filteredContacts[i];
            if (item.classList.contains('checked')) {
                if (!selectedContacts.includes(contact)) {
                    selectedContacts.push(contact);
                }
                img.src = './assets/img/icons_add_task/checkedbox.svg';
            } else {
                const index = selectedContacts.indexOf(contact);
                if (index !== -1) {
                    selectedContacts.splice(index, 1);
                }
                img.src = './assets/img/icons_add_task/checkbox.svg';
            }
            renderSelectedContactsBelow();
        });
    });
}

/**
 * Render the selected contacts below the input field.
 */
/**
 * Renders the selected contacts below the input field.
 */
function renderSelectedContactsBelow() {
    const selectedContactsDiv = document.querySelector('.selected-contacts-div');
    selectedContactsDiv.innerHTML = '';
    selectedContacts.forEach(contact => {
        selectedContactsDiv.innerHTML += `
            <div class="cicle" style="background-color: ${contact.color}">${createNameInitials(contact.name)}</div>
        `;
    });
}

/**
 * Add event listeners to priority buttons to change their state.
 */
function changePrioBtn() {
    const buttons = document.querySelectorAll('.prio-btn');
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            handlePriorityButtonClick(button, buttons);
        });
    });
}

/**
 * Handles individual priority button click.
 * @param {Element} button - Clicked button element
 * @param {NodeList} buttons - All priority buttons
 */
function handlePriorityButtonClick(button, buttons) {
    buttons.forEach(btn => {
        const prio = btn.id;
        const img = btn.querySelector('img');
        if (btn === button) {
            toggleButtonState(btn, prio, img);
        } else {
            deactivateButton(btn, prio, img);
        }
    });
}

/**
 * Toggles button active state.
 * @param {Element} btn - Button element
 * @param {string} prio - Priority type
 * @param {Element} img - Image element
 */
function toggleButtonState(btn, prio, img) {
    if (btn.classList.contains('active')) {
        btn.classList.remove('active');
        img.src = svgMappings[prio];
    } else {
        btn.classList.add('active');
        img.src = svgMappings[`${prio}-active`];
    }
}

/**
 * Deactivates a priority button.
 * @param {Element} btn - Button element
 * @param {string} prio - Priority type
 * @param {Element} img - Image element
 */
function deactivateButton(btn, prio, img) {
    btn.classList.remove('active');
    img.src = svgMappings[prio];
}

/**
 * Change the SVG icon on hover for the clear button.
 */
function changeSvgOnHover() {
    const clearBtn = document.getElementById('clear-btn');
    const cancelIcon = document.getElementById('cancel-icon');

    clearBtn.addEventListener('mouseover', () => {
        cancelIcon.src = './assets/img/icons_add_task/cancel-hover.svg';
    });

    clearBtn.addEventListener('mouseout', () => {
        cancelIcon.src = './assets/img/icons_add_task/cancel.svg';
    });
}

/**
 * Show and handle the category dropdown.
 */
function showCategoryDropdown() {
    const selectBtnCategory = document.querySelector('.select-btn.category');
    const categoryDisplayed = document.getElementById('category-displayed');
    const listItems = document.querySelectorAll('.list-item.category');
    const categoryList = document.querySelector('.list-items.category');

    setupCategoryDropdownToggles(selectBtnCategory);
    preventCategoryDropdownClose(categoryList);
    setupCategorySelection(listItems, selectBtnCategory, categoryDisplayed);
    addCategoryDropdownOutsideListener(selectBtnCategory, categoryList);
}

/**
 * Sets up category dropdown toggle functionality.
 * @param {Element} selectBtnCategory - Category select button element
 */
function setupCategoryDropdownToggles(selectBtnCategory) {
    const arrowDown = selectBtnCategory.querySelector('.arrow-down');
    arrowDown.addEventListener('click', (event) => {
        event.stopPropagation();
        selectBtnCategory.classList.toggle('show-menu');
    });
    selectBtnCategory.addEventListener('click', (event) => {
        event.stopPropagation();
        selectBtnCategory.classList.toggle('show-menu');
    });
}

/**
 * Prevents category dropdown from closing when clicked inside.
 * @param {Element} categoryList - Category list element
 */
function preventCategoryDropdownClose(categoryList) {
    if (categoryList) {
        categoryList.addEventListener('click', (event) => {
            event.stopPropagation();
        });
    }
}

/**
 * Sets up category selection functionality.
 * @param {NodeList} listItems - Category list items
 * @param {Element} selectBtnCategory - Category select button
 * @param {Element} categoryDisplayed - Category display element
 */
function setupCategorySelection(listItems, selectBtnCategory, categoryDisplayed) {
    listItems.forEach(item => {
        item.addEventListener('click', () => {
            let selectedItemText = item.getAttribute('data-value');
            selectBtnCategory.classList.remove('show-menu');
            categoryDisplayed.textContent = selectedItemText;
            categoryDisplayed.dataset.selected = selectedItemText;
        });
    });
}

/**
 * Adds outside click listener for category dropdown.
 * @param {Element} selectBtnCategory - Category select button
 * @param {Element} categoryList - Category list element
 */
function addCategoryDropdownOutsideListener(selectBtnCategory, categoryList) {
    if (!window._categoryDropdownListenerAdded) {
        document.addEventListener('click', (event) => {
            if (
                !selectBtnCategory.contains(event.target) &&
                !(categoryList && categoryList.contains(event.target))
            ) {
                selectBtnCategory.classList.remove('show-menu');
            }
        });
        window._categoryDropdownListenerAdded = true;
    }
}

/**
 * Style the subtask input and buttons.
 */
function styleSubtaskInput() {
    const subtaskInput = document.querySelector('.subtask-input');
    const subtaskBtnAdd = document.querySelector('.subtask-btn.add');
    const subtaskBtnCheckCancel = document.querySelector('.check-cancel-div');
    const subtaskCancelBtn = document.querySelector('.subtask-cancel');
    const subtaskBtnCheck = document.querySelector('.subtask-check');

    setupSubtaskBtnAdd(subtaskBtnAdd, subtaskBtnCheckCancel, subtaskInput);
    setupSubtaskBtnCheck(subtaskBtnCheck, subtaskBtnAdd, subtaskBtnCheckCancel, subtaskInput);
    setupSubtaskInputFocus(subtaskInput, subtaskBtnAdd, subtaskBtnCheckCancel, subtaskBtnCheck, subtaskCancelBtn);
    setupSubtaskCancelBtn(subtaskCancelBtn, subtaskInput);
}

/**
 * Sets up subtask add button functionality.
 * @param {Element} subtaskBtnAdd - Add button element
 * @param {Element} subtaskBtnCheckCancel - Check/cancel buttons container
 * @param {Element} subtaskInput - Subtask input element
 */
function setupSubtaskBtnAdd(subtaskBtnAdd, subtaskBtnCheckCancel, subtaskInput) {
    subtaskBtnAdd.addEventListener('click', () => {
        subtaskBtnAdd.style.display = 'none';
        subtaskBtnCheckCancel.style.display = 'flex';
        subtaskInput.focus();
    });
}

/**
 * Sets up subtask check button functionality.
 * @param {Element} subtaskBtnCheck - Check button element
 * @param {Element} subtaskBtnAdd - Add button element
 * @param {Element} subtaskBtnCheckCancel - Check/cancel buttons container
 * @param {Element} subtaskInput - Subtask input element
 */
function setupSubtaskBtnCheck(subtaskBtnCheck, subtaskBtnAdd, subtaskBtnCheckCancel, subtaskInput) {
    subtaskBtnCheck.addEventListener('click', () => {
        if (subtaskInput.value.trim() === '') {
            subtaskBtnAdd.style.display = 'flex';
            subtaskBtnCheckCancel.style.display = 'none';
            subtaskInput.blur();
        } else {
            subtaskInput.focus();
        }
    });
}

/**
 * Sets up subtask input focus functionality.
 * @param {Element} subtaskInput - Subtask input element
 * @param {Element} subtaskBtnAdd - Add button element
 * @param {Element} subtaskBtnCheckCancel - Check/cancel buttons container
 * @param {Element} subtaskBtnCheck - Check button element
 * @param {Element} subtaskCancelBtn - Cancel button element
 */
function setupSubtaskInputFocus(subtaskInput, subtaskBtnAdd, subtaskBtnCheckCancel, subtaskBtnCheck, subtaskCancelBtn) {
    let ignoreBlur = false;
    setupIgnoreBlur(subtaskBtnCheck, subtaskCancelBtn, () => ignoreBlur = true);
    subtaskInput.addEventListener('focus', () => {
        subtaskBtnAdd.style.display = 'none';
        subtaskBtnCheckCancel.style.display = 'flex';
    });
    subtaskInput.addEventListener('blur', () => {
        handleSubtaskInputBlur(ignoreBlur, () => ignoreBlur = false, subtaskInput, subtaskBtnAdd, subtaskBtnCheckCancel);
    });
}

/**
 * Sets up ignore blur functionality for buttons.
 * @param {Element} subtaskBtnCheck - Check button element
 * @param {Element} subtaskCancelBtn - Cancel button element
 * @param {Function} setIgnoreBlur - Function to set ignore blur flag
 */
function setupIgnoreBlur(subtaskBtnCheck, subtaskCancelBtn, setIgnoreBlur) {
    [subtaskBtnCheck, subtaskCancelBtn].forEach(btn => {
        btn.addEventListener('mousedown', setIgnoreBlur);
    });
}

/**
 * Handles subtask input blur event.
 * @param {boolean} ignoreBlur - Whether to ignore blur
 * @param {Function} resetIgnoreBlur - Function to reset ignore blur flag
 * @param {Element} subtaskInput - Subtask input element
 * @param {Element} subtaskBtnAdd - Add button element
 * @param {Element} subtaskBtnCheckCancel - Check/cancel buttons container
 */
function handleSubtaskInputBlur(ignoreBlur, resetIgnoreBlur, subtaskInput, subtaskBtnAdd, subtaskBtnCheckCancel) {
    if (ignoreBlur) {
        resetIgnoreBlur();
        subtaskInput.focus();
    } else {
        subtaskBtnAdd.style.display = 'flex';
        subtaskBtnCheckCancel.style.display = 'none';
    }
}

/**
 * Sets up subtask cancel button functionality.
 * @param {Element} subtaskCancelBtn - Cancel button element
 * @param {Element} subtaskInput - Subtask input element
 */
function setupSubtaskCancelBtn(subtaskCancelBtn, subtaskInput) {
    subtaskCancelBtn.addEventListener('click', () => {
        subtaskInput.value = '';
        subtaskInput.focus();
    });
}

/**
 * Add a subtask to the list of subtasks.
 */
function addSubtask() {
    const subtaskInput = document.querySelector('.subtask-input');
    if (subtaskInput.value !== '') {
        subtasks.push(subtaskInput.value);
        renderSubtasks();
        subtaskInput.value = '';
    }
}

/**
 * Sets up subtask push functionality with event listeners.
 */
function pushSubtask() {
    const subtaskInput = document.querySelector('.subtask-input');
    const subtaskBtnCheck = document.querySelector('.subtask-check');

    subtaskBtnCheck.addEventListener('click', addSubtask);

    subtaskInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            addSubtask();
        }
    });
}

/**
 * Generates HTML for a subtask list item.
 * @param {string} item - Subtask text
 * @param {number} index - Index in subtasks array
 * @returns {string} HTML string for subtask list item
 */
function getSubtaskListItemHTML(item, index) {
    return `
        <li class="subtask-list-item" data-index="${index}">
            <p class="li-text"> 
            ${item}
            </p>
            <div class="subtask-edit-icon-div">
                <div class="edit-subtask-btn">
                    <img src="./assets/img/icons_add_task/subtask-edit.svg" alt="edit">
                </div>
                <div class="subtask-divider-2"></div>
                <div class="delete-subtask-btn">
                    <img src="./assets/img/icons_add_task/subtask-delete.svg" alt="delete">
                </div>
            </div>
        </li>
    `;
}

/**
 * Renders the list of subtasks.
 */
function renderSubtasks() {
    const subtasksList = document.querySelector('.subtasks-list');
    subtasksList.innerHTML = '';
    if (subtasks.length === 0) {
        subtasksList.classList.add('d-none');
    } else {
        subtasksList.classList.remove('d-none');
        subtasks.forEach((item, index) => {
            subtasksList.innerHTML += getSubtaskListItemHTML(item, index);
        });
    }
    editSubTask();
    deleteSubtask();
}

/**
 * Edit a subtask in the list.
 */
function editSubTask() {
    const subtaskListItems = document.querySelectorAll('.subtask-list-item');
    subtaskListItems.forEach(item => {
        const editSubtaskBtn = item.querySelector('.edit-subtask-btn');
        const handleEdit = () => editSubtaskItem(item);
        editSubtaskBtn.addEventListener('click', handleEdit);
        item.addEventListener('dblclick', handleEdit);
    });
}

/**
 * Edits a specific subtask item.
 * @param {Element} item - Subtask list item element
 */
function editSubtaskItem(item) {
    let input = item.querySelector('.edit-subtask-input');
    if (!input) {
        let liText = item.querySelector('.li-text');
        item.innerHTML = getEditSubtaskHTML(liText.textContent.trim());
        item.classList.add('subtask-list-item-edit');
        deleteSubtask();
        confirmSubtaskEdit();
    }
}

/**
 * Generates HTML for editing a subtask.
 * @param {string} text - Current subtask text
 * @returns {string} HTML string for edit mode
 */
function getEditSubtaskHTML(text) {
    return `
        <input class="edit-subtask-input" type="text" value="${text}">
        <div class="edit-subtask-button-div">
            <span class="delete-subtask-btn edit"><img src="./assets/img/icons_add_task/subtask-delete.svg"></span>
            <div class="subtask-divider"></div>
            <span class="confirm-subtask-edit-btn"><img src="./assets/img/icons_add_task/subtask-check.svg"></span>
        </div>
    `;
}

/**
 * Delete a subtask from the list.
 */
function deleteSubtask() {
    const subtaskListItems = document.querySelectorAll('.subtask-list-item');

    subtaskListItems.forEach((item, index) => {
        const deleteSubtaskBtn = item.querySelector('.delete-subtask-btn');
        deleteSubtaskBtn.addEventListener('click', () => {
            subtasks.splice(index, 1);
            renderSubtasks();
        });
    });
}

/**
 * Confirm and save the edited subtask.
 */
function confirmSubtaskEdit() {
    const subtaskListItemsEdit = document.querySelectorAll('.subtask-list-item-edit');

    subtaskListItemsEdit.forEach(item => {
        const confirmSubtaskEditBtn = item.querySelector('.confirm-subtask-edit-btn');
        confirmSubtaskEditBtn.addEventListener('click', () => {
            const index = item.getAttribute('data-index');
            const input = item.querySelector('.edit-subtask-input');
            if (input.value !== '') {
                subtasks[index] = input.value;
                renderSubtasks();
            }
        });
    });
}



/**
 * event listener for the date input to change the color of the placeholder
 */

const dateInput = document.getElementById('due-date-input');

/**
 * Sets minimum date to today for date picker.
 */
function setMinDateToToday() {
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    dateInput.setAttribute('min', todayString);
}



dateInput.addEventListener('focus', () => {
    dateInput.classList.remove('color-grey');
});

dateInput.addEventListener('blur', () => {
    if (!dateInput.value) {
        dateInput.classList.add('color-grey');
    }
});

const assignedToList = document.getElementById('assigned-to-list');
assignedToList.addEventListener('click', (event) => {
    event.stopPropagation();
});

/**
 * Shows a task added message by adding a CSS class to the element with the class 'task-added-msg'.
 * After 3 seconds, it adds another CSS class to slide in the message. After another 2 seconds, it redirects to the board.
 *
 * @return {void} 
 */
function showTaskAddedMessage() {
    const messageElement = document.querySelector('.task-added-msg');
    messageElement.classList.add('d-flex-visible');
    setTimeout(() => {
        messageElement.classList.add('task-added-msg-slide-in');
    }, 50);
    setTimeout(() => {
        redirectTo('board.html');
    }, 1200);

}