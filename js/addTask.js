actStatus = "";


/**
 * Initializes the addition of tasks by loading contacts data, including HTML, highlighting the add task section,
 * updating the header profile initials, filtering contacts, showing the menu, changing SVG on hover, changing priority buttons,
 * categorizing menu, styling subtask input, pushing subtasks, closing the contact list on outside click, preventing form submission on enter,
 * and preventing default validation.
 *
 * @return {Promise<void>} A promise that resolves when the initialization is complete.
 */
async function initAddTask() {
    contacts = await loadData('/contacts');
    await includeHTML();
    checkForCurrentUser() ? "" : redirectToLogin();
    highlightAddTask();
    updateHeaderProfileInitials();
    filterContacts();
    showMenu();
    changeSvgOnHover();
    changePrioBtn();
    categoryMenu();
    styleSubtaskInput();
    pushSubtask();
    closeContactListOnOutsideClick();
    preventFormSubmitOnEnter();
    preventDefaultValidation();
}

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
    }, 100);
    setTimeout(() => {
        redirectToBoard()
    }, 2000);

}

/**
 * Retrieves the 'status' parameter from the URL and sets the global variable 'actStatus' accordingly.
 * If the 'status' parameter is missing, it sets 'actStatus' to 'toDo'.
 *
 * @return {void}
 */
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');

    if (status) {
        actStatus = status;
    } else {
        actStatus = 'toDo'; 
    }
});
