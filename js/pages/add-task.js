/**
 * Initializes the addition of tasks by loading contacts data, including HTML, highlighting the add task section,
 * updating the header profile initials, filtering contacts, showing the menu, changing SVG on hover, changing priority buttons,
 * categorizing menu, styling subtask input, pushing subtasks, closing the contact list on outside click, preventing form submission on enter,
 * and preventing default validation.
 *
 * @return {Promise<void>} A promise that resolves when the initialization is complete.
 */
async function initAddTask() {
    await includeHTML();
    checkScreenOrientation();
    checkForCurrentUser() ? "" : redirectTo('login.html');
    initHeader();
    highlightLink('add-task');
    await getContacts();
    initPopup();
    initTaskForm('add-task');
    preventFormSubmitOnEnter();
}