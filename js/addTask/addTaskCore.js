/**
 * Core initialization and main functionality for Add Task page
 * Contains the main init function and core task operations
 */

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
    checkForCurrentUser() ? "" : redirectTo('login.html');
    displayProfileIconInitials();
    highlightLink('add-task');
    await getContacts();
    handleFilter();
    filterContacts();
    setMinDateToToday();
    showAssignedToDropdown();
    showCategoryDropdown();
    changeSvgOnHover();
    changePrioBtn();
    styleSubtaskInput();
    pushSubtask();
    closeContactListOnOutsideClick();
    preventFormSubmitOnEnter();
    preventDefaultValidation();
}

/**
 * Save the task and push it to the database.
 */
async function saveTask() {
    const taskData = gatherTaskData();
    const newTask = createTaskObject(taskData);
    await addData('tasks', newTask);
    showTaskAddedMessage();
}

/**
 * Gathers all task data from the form.
 * @returns {Object} Object containing all task form data
 */
function gatherTaskData() {
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const dueDate = document.getElementById('due-date-input').value;
    const category = document.getElementById('category-displayed').textContent;
    const priority = getSelectedPriority();
    const assignedTo = selectedContacts.map(item => item.id);
    const newSubtasks = subtasks.map((item) => ({
        content: item,
        completed: false,
    }));

    return { title, description, dueDate, category, priority, assignedTo, newSubtasks };
}

/**
 * Creates a new task object from task data.
 * @param {Object} taskData - Task form data
 * @returns {Object} New task object
 */
function createTaskObject(taskData) {
    return {
        title: taskData.title,
        description: taskData.description,
        category: taskData.category,
        status: 'todo',
        dueDate: taskData.dueDate,
        priority: taskData.priority,
        subTasks: taskData.newSubtasks,
        assignedTo: taskData.assignedTo,
        attachments: attachments
    };
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
    }, 50);
    setTimeout(() => {
        redirectTo('board.html');
    }, 1200); 
}
