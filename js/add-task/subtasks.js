/**
 * Subtask management functionality for Add Task
 * Handles subtask creation, editing, deletion, and UI interactions
 */


const subtasks = [];

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
