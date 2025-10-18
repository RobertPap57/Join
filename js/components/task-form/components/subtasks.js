let subtasks = [];

/**
 * Initializes and styles subtask input elements by setting up event listeners and button actions.
 */
function styleSubtaskInput() {
    const subtaskElements = getSubtaskElements()
    setupSubtaskBtnAdd(subtaskElements);
    addSubtaskClickListeners(subtaskElements);
    setupSubtaskInputListeners(subtaskElements);
    setupSubtaskCancelBtn(subtaskElements);
    setupSubtaskClickOutside(subtaskElements);
}


/**
 * Retrieves DOM elements related to subtask input and controls.
 * @returns {Object} An object containing references to subtask input and button elements.
 */
function getSubtaskElements() {
    const subtaskInput = document.querySelector('.subtask-input');
    const subtaskBtnAdd = document.querySelector('.subtask-btn.add');
    const subtaskBtnCheckCancel = document.querySelector('.check-cancel-div');
    const subtaskCancelBtn = document.querySelector('.subtask-cancel');
    const subtaskBtnCheck = document.querySelector('.subtask-check');
    return {
        subtaskInput,
        subtaskBtnAdd,
        subtaskBtnCheckCancel,
        subtaskCancelBtn,
        subtaskBtnCheck
    };
}


/**
 * Sets up the "Add Subtask" button by binding a click event listener.
 * @param {Object} subtaskElements - The elements related to subtasks.
 */
function setupSubtaskBtnAdd(subtaskElements) {
    bindEventListenerOnce(subtaskElements.subtaskBtnAdd, 'click', () =>
        toggleSubtaskActionsBtn(true, subtaskElements),
        'subtaskBtnAddClick');
}


/**
 * Sets up event listeners for the subtask input element to handle focus and keydown events.
 * @param {Object} subtaskElements - The elements related to the subtask input.
 * @param {HTMLInputElement} subtaskElements.subtaskInput - The input element for subtasks.
 */
function setupSubtaskInputListeners(subtaskElements) {
    bindEventListenerOnce(subtaskElements.subtaskInput, 'focus', () => {
        toggleSubtaskActionsBtn(true, subtaskElements);
    }, 'subtaskInputFocus');
    bindEventListenerOnce(subtaskElements.subtaskInput, 'keydown', (event) => {
        if (event.key === 'Enter') addSubtask(subtaskElements);
        if (event.key === 'Tab') toggleSubtaskActionsBtn(false, subtaskElements);
        if (event.key === 'Escape') clearSubtaskInput(subtaskElements);
    }, 'subtaskInputKeydown');
}


/**
 * Sets up a one-time click outside event listener for subtask input interactions.
 * Handles toggling subtask action buttons based on click target.
 *
 * @param {Object} subtaskElements - Elements related to the subtask input and buttons.
 */
function setupSubtaskClickOutside(subtaskElements) {
    bindEventListenerOnce(document, 'mousedown', (event) => {
        const inputContainer = document.querySelector('.subtask-input-container');
        const target = event.target.closest('button, .subtask-check') || event.target;
        if (!inputContainer.contains(target)) {
            toggleSubtaskActionsBtn(false, subtaskElements);
        }
        else if (target === subtaskElements.subtaskInput) {
            subtaskElements.subtaskInput.focus();
        }
        else if (target === subtaskElements.subtaskBtnCheck && subtaskElements.subtaskInput.value.trim() === '') {
            toggleSubtaskActionsBtn(false, subtaskElements);
        }
    }, 'subtaskInputClickOutside');
}


/**
 * Sets up the cancel button for a subtask input, clearing and refocusing the input on click.
 * @param {Object} subtaskElements - Elements related to the subtask.
 * @param {HTMLButtonElement} subtaskElements.subtaskCancelBtn - The cancel button element.
 * @param {HTMLInputElement} subtaskElements.subtaskInput - The input element for the subtask.
 */
function setupSubtaskCancelBtn(subtaskElements) {
    bindEventListenerOnce(subtaskElements.subtaskCancelBtn, 'click', () => {
        clearSubtaskInput(subtaskElements);
    }, 'subtaskCancelBtnClick');
}


/**
 * Clears the value of the subtask input field and sets focus to it.
 * @param {Object} subtaskElements - Contains references to subtask input elements.
 */
function clearSubtaskInput(subtaskElements) {
    subtaskElements.subtaskInput.value = '';
    subtaskElements.subtaskInput.focus();
}


/**
 * Adds a new subtask to the subtasks list if the input is not empty.
 * @param {Object} subtaskElements - Elements related to the subtask input and actions.
 */
function addSubtask(subtaskElements) {
    if (subtaskElements.subtaskInput.value.trim() !== '') {
        const newSubtask = {
            id: createUniqueId(),
            content: subtaskElements.subtaskInput.value,
            completed: false
        };
        subtasks.push(newSubtask);
        renderSubtasks();
        subtaskElements.subtaskInput.focus();
        subtaskElements.subtaskInput.value = '';
    } else {
        toggleSubtaskActionsBtn(false, subtaskElements);
    }
}


/**
 * Toggles the visibility and focus of subtask action buttons and input.
 *
 * @param {boolean} state - If true, shows check/cancel buttons and focuses input; if false, shows add button and blurs input.
 * @param {Object} subtaskElements - Elements related to subtask actions.
 * @param {HTMLElement} subtaskElements.subtaskBtnAdd - The "add subtask" button element.
 * @param {HTMLElement} subtaskElements.subtaskBtnCheckCancel - The "check/cancel" button element.
 * @param {HTMLElement} subtaskElements.subtaskInput - The subtask input element.
 */
function toggleSubtaskActionsBtn(state, subtaskElements) {
    if (state) {
        subtaskElements.subtaskBtnAdd.style.display = 'none';
        subtaskElements.subtaskBtnCheckCancel.style.display = 'flex';
        subtaskElements.subtaskInput.focus();
    } else {
        subtaskElements.subtaskBtnAdd.style.display = 'flex';
        subtaskElements.subtaskBtnCheckCancel.style.display = 'none';
    }
}


/**
 * Adds event listeners to subtask elements for adding subtasks via button click or Enter key.
 * @param {Object} subtaskElements - The elements related to subtasks (button and input).
 */
function addSubtaskClickListeners(subtaskElements) {
    bindEventListenerOnce(subtaskElements.subtaskBtnCheck, 'click', () =>
        addSubtask(subtaskElements), 'subtaskBtnCheckAddSubtask');
}


/**
 * Renders the list of subtasks in the DOM.
 * Shows or hides the subtasks list based on its content.
 * Initializes edit and delete functionality for each subtask.
 */
function renderSubtasks() {
    const subtasksList = document.querySelector('.subtasks-list');
    togleInputEditFlag(false);
    subtasksList.innerHTML = '';
    if (subtasks.length === 0) {
        subtasksList.classList.add('d-none');
    } else {
        subtasksList.classList.remove('d-none');
        subtasks.forEach((item) => {
            const li = document.createElement('li');
            li.className = 'subtask-list-item';
            li.dataset.id = item.id;
            li.innerHTML = getSubtaskListItemHTML(item);
            subtasksList.prepend(li);
        });
    }
    editSubTask();
    deleteSubtask();
}


/**
 * Attaches edit event listeners to each subtask list item.
 * Listens for click on edit button and double-click on the item itself to trigger editing.
 */
function editSubTask() {
    const subtaskListItems = document.querySelectorAll('.subtask-list-item');
    subtaskListItems.forEach(item => {
        const editSubtaskBtn = item.querySelector('.edit-subtask-btn');
        bindEventListenerOnce(editSubtaskBtn, 'click', () => editSubtaskItem(item), 'editSubtaskBtnClick_' + item.getAttribute('data-id'));
        bindEventListenerOnce(item, 'dblclick', () => editSubtaskItem(item), 'editSubtaskItemDblClick_' + item.getAttribute('data-id'));
    });
}


/**
 * Enables editing mode for a subtask list item.
 * Replaces the item's content with an input field and sets up edit actions.
 * @param {HTMLElement} item - The subtask list item to edit.
 */
function editSubtaskItem(item) {
    let input = item.querySelector('.edit-subtask-input');
    if (!input) {
        togleInputEditFlag(true);
        let liText = item.querySelector('.li-text');
        item.innerHTML = getEditSubtaskHTML(liText.textContent.trim());
        item.classList.add('subtask-list-item-edit');
        input = item.querySelector('.edit-subtask-input');
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
        deleteSubtask();
        setupSubtaskEditActions();
    }
}


/**
 * Attaches click event listeners to all subtask delete buttons.
 * Removes the corresponding subtask from the list and re-renders subtasks on delete.
 */
function deleteSubtask() {
    const subtaskListItems = document.querySelectorAll('.subtask-list-item');
    subtaskListItems.forEach(item => {
        const deleteSubtaskBtn = item.querySelector('.delete-subtask-btn');
        const subtaskId = item.getAttribute('data-id');
        const handler = () => {
            const index = subtasks.findIndex(subtask => subtask.id === subtaskId);
            if (index !== -1) {
                subtasks.splice(index, 1);
                renderSubtasks();
            }
        };
        bindEventListenerOnce(deleteSubtaskBtn, 'click', handler, 'deleteSubtaskBtnClick_' + subtaskId);
    });
}


/**
 * Sets up event listeners for editing subtasks in the subtask list.
 * Finds all editable subtask list items and attaches edit listeners.
 */
function setupSubtaskEditActions() {
    const subtaskListItemsEdit = document.querySelectorAll('.subtask-list-item-edit');
    subtaskListItemsEdit.forEach(item => {
        const confirmSubtaskEditBtn = item.querySelector('.confirm-subtask-edit-btn');
        const subtaskId = item.getAttribute('data-id');
        const input = item.querySelector('.edit-subtask-input');
        subtaskEditListeners(confirmSubtaskEditBtn, input, subtaskId);
    });
}


/**
 * Adds event listeners for editing a subtask, including confirm, cancel, and close actions.
 *
 * @param {HTMLElement} confirmSubtaskEditBtn - The button to confirm subtask edit.
 * @param {HTMLInputElement} input - The input field for editing the subtask.
 * @param {string|number} subtaskId - The unique identifier for the subtask.
 */
function subtaskEditListeners(confirmSubtaskEditBtn, input, subtaskId) {
    bindEventListenerOnce(confirmSubtaskEditBtn, 'click', () => confirmSubtaskEdit(input, subtaskId), 'confirmSubtaskEditBtnClick_' + subtaskId);
    bindEventListenerOnce(input, 'keydown', (event) => {
        if (event.key === 'Enter') { confirmSubtaskEdit(input, subtaskId) }
    }, 'confirmSubtaskEditBtnEnter_' + subtaskId);
    bindEventListenerOnce(document, 'mousedown', (event) => {
        const editInputContainer = document.querySelector('.subtask-list-item-edit');
        if (editInputContainer && !editInputContainer.contains(event.target)) { renderSubtasks(); }
    }, 'closeSubtaskEditOnClick_' + subtaskId);
    bindEventListenerOnce(input, 'keydown', (event) => {
        if (event.key === 'Escape') { renderSubtasks(); }
    }, 'closeSubtaskEditOnEsc_' + subtaskId);
}


/**
 * Updates the content of a subtask if the input value is not empty and re-renders the subtasks.
 *
 * @param {HTMLInputElement} input - The input element containing the new subtask content.
 * @param {string|number} subtaskId - The unique identifier of the subtask to edit.
 */
function confirmSubtaskEdit(input, subtaskId) {
    if (input.value !== '') {
        const subtask = subtasks.find(s => s.id === subtaskId);
        if (subtask) {
            subtask.content = input.value;
            togleInputEditFlag(false);
            renderSubtasks();
        }
    }
}


/**
 * Toggles the edit mode of the subtask container element.
 * If the state is true, sets the edit mode to true.
 * If the state is false, sets the edit mode to false after a delay of 100ms.
 * @param {boolean} state - The state to toggle the edit mode to.
 */
function togleInputEditFlag(state) {
    const subtaskContainer = document.querySelector('.subtask-input-container');
    if (state === true) {
        subtaskContainer._editMode = true;
    } else {
        setTimeout(() => subtaskContainer._editMode = false, 100);
    }
}
