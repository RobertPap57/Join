/**
 * Attaches an event listener to a dialog element to handle the Escape key press event.
 * When the Escape key is pressed, it will prevent the default dialog close behavior and call the provided onClose callback instead.
 * However, if the subtask input is in edit mode or if the category or assigned-to dropdowns are expanded, it will not close the dialog.
 * @param {HTMLElement} dialog - The dialog element to attach the event listener to.
 * @param {Function} onClose - The callback function to execute when the dialog is requested to close.
 */
function closeTaskFormDialogOnEsc(dialog, onClose) {
    if (!dialog) return;
    bindEventListenerOnce(dialog, 'keydown', (e) => {
        if (e.key === 'Escape') {
            e.preventDefault();
            if (!allowTaskFormDialogCloseOnEsc()) {
                return;
            }
            onClose();
            enableScroll();
        }
    }, 'close_dialog_on_esc');
}


/**
 * Sets up event listeners to close the task form dialog when clicking outside of it or pressing the Escape key.
 * @param {HTMLElement} dialog - The task form dialog element to set up event listeners for.
 */
function setupTaskFormDialogClosingListeners(dialog) {
    closeDialogOnClickOutside(dialog, () => {
        closeDialog(dialog);
    });
    closeTaskFormDialogOnEsc(dialog, () => {
        closeDialog(dialog);
    });
}


/**
 * Closes the task form dialog by calling closeDialog with the task form dialog element.
 * This function is a wrapper around closeDialog that provides a more convenient way to close the task form dialog.
 */
function closeTaskFormDialog() {
    const dialog = document.getElementById('task-form-dialog');
    closeDialog(dialog);
    enableScroll();
}


/**
 * Checks if the dialog can be closed by pressing the Escape key.
 * Returns true if the dialog can be closed, false otherwise.
 * The dialog cannot be closed if the subtask input is in edit mode or if the category or assigned-to dropdowns are expanded.
 * @returns {boolean} - True if the dialog can be closed by pressing the Escape key, false otherwise.
 */
function allowTaskFormDialogCloseOnEsc() {
    const subtaskContainer = document.querySelector('.subtask-input-container');
    const categoryDropdown = document.getElementById('category-container');
    const assignedDropdown = document.getElementById('contacts-list');
    if (subtaskContainer?._editMode) return false;
    if (categoryDropdown?.getAttribute('aria-expanded') === 'true') return false;
    if (assignedDropdown?.getAttribute('aria-expanded') === 'true') return false;
    else return true;

}


/**
 * Opens the detailed task dialog for a given task.
 * If the window width is greater than 1023px, it will open in a non-mobile dialog.
 * Otherwise, it will open in a mobile dialog.
 * @param {HTMLElement} dialog - The detailed task dialog element to open.
 */
function openDetaliedTaskDialog(dialog, edit = false) {
    if (window.innerWidth > 1023 || edit) {
        openDialog(dialog, false);
    } else {
        openDialog(dialog, true);
    }
}


/**
 * Attaches event listeners to the detailed task dialog to close it when clicking outside of it or pressing the Escape key.
 * When the detailed task dialog is requested to close, it will call the closeDialog function with the detailed task dialog element.
 */
function closeDetaliedTaskDialogListeners() {
    const dialog = document.getElementById('detailed-task-dialog');
    if (!dialog) return;
    closeDialogOnClickOutside(dialog, () => closeDialog(dialog));
    closeDialogOnEsc(dialog, () => closeDialog(dialog));
}


/**
 * Closes the detailed task dialog by calling closeDialog with the detailed task dialog element.
 * This function is a wrapper around closeDialog that provides a more convenient way to close the detailed task dialog.
 */
function closeDetaliedTaskDialog() {
    const dialog = document.getElementById('detailed-task-dialog');
    closeDialog(dialog);
    enableScroll();
}


/**
 * Handles the task form dialog and detailed task dialog when the edit task button is clicked.
 * Closes the task form dialog and opens the detailed task dialog with the specified task ID.
 * If the window width is less than 1023px, it will add an animation class to the detailed task dialog after a 10ms delay.
 * @param {string|number} taskId - The ID of the task to edit.
 */
function handleDialogsOnEditTask(taskId) {
    const editDialog = document.querySelector('.task-form-dialog-edit');
    const detailDialog = document.getElementById('detailed-task-dialog');
    editDialog.classList.remove('animate-dialog');
    closeTaskFormDialog();
    if (window.innerWidth < 1023) {
        showDetailedTask(taskId, edit = true);
        setTimeout(() => {
            detailDialog.classList.add('animate-dialog');
        }, 10);
    } else {
        showDetailedTask(taskId);
    }

}
