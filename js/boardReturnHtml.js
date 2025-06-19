/**
 * Renders the progress bar and completion status for a task.
 *
 * Calculates the number of completed subtasks and total subtasks of the given task.
 * Returns HTML markup representing a progress bar and completion status if there are subtasks,
 * otherwise returns an empty string.
 *
 * @param {object} task - The task object for which progress is to be rendered.
 * @returns {string} HTML markup representing the progress bar and completion status.
 */
function renderProgress(task) {
    const completedSubtasks = task.subTasks ? task.subTasks.filter(subtask => subtask.completet).length : 0;
    const totalSubtasks = task.subTasks ? task.subTasks.length : 0;
    if (totalSubtasks == 0) {
        return ``

    } else {
        return `
        <div class="progress boardFlex">
            <div class="progressBarContainer">
                <div id="progressBar${task.id}" class="progressBar"></div>
            </div>
            <p class="amountSubtasks">${completedSubtasks}/${totalSubtasks}</p>
        </div>
    `;
    }
}

/**
 * Generates HTML markup for rendering a task card.
 *
 * Constructs HTML markup representing a task card based on the provided task object.
 * Includes category label, dropdown menu for task actions, task title, description,
 * progress bar, assigned badges, priority indicator, and other dynamic elements.
 *
 * @param {object} task - The task object containing details to render in the card.
 * @returns {string} HTML markup representing the task card.
 */
function renderCardHtml(task) {
    const color = (task.category === 'User Story') ? 'Blue' : 'Green';
    const assignedToArray = Array.isArray(task.assignedTo) ? task.assignedTo : [];
    const dropdownOptions = renderDropdownOptions(task.id, task.status);
    const badgesHtml = renderBadges(assignedToArray);
    const progressHtml = renderProgress(task);

    return `
    <div draggable="true" ondragstart="startDragging(${task.id})" id="taskCard${task.id}" class="taskCard">
        <div class="taskCardTop">
            <label class="category${color}">${task.category}</label>
            <div class="dropdown">
                <button onclick="toggleDropdown('dropdown-content-${task.id}')" class="dropdown-btn">
                    <div class="dropdownBtnContainer"><img src="assets/img/icons/contacts_sub_menu.svg" alt="Dropdown Arrow"></div>
                </button>
                <div id="dropdown-content-${task.id}" class="dropdown-content">
                    ${dropdownOptions}
                </div>
            </div>
        </div>
        <div class="cardBody" onclick="openDialog(); renderCardBig(${task.id})">
            <p class="titleCard">${task.title}</p>
            <p class="descriptionCard">${task.description}</p>
            <div>
                ${progressHtml}
                <div class="footerCard boardFlex">
                    <div class="profileBadges">
                        ${badgesHtml}
                    </div>
                    <div class="prioImg">
                        <img src="assets/img/icons/${task.priority}.svg" alt="">
                    </div>
                </div>
            </div>
        </div>
    </div>`;
}

/**
 * Generates HTML markup for rendering a badge representing a contact.
 *
 * Constructs HTML markup for a badge representing a contact, styled with the contact's
 * initials and background color.
 *
 * @param {object} contact - The contact object containing details to render in the badge.
 * @returns {string} HTML markup representing the badge.
 */
function renderBadge(contact) {
    return `<div class="badgeImg" style="background-color: ${contact.color}">${createNameInitials(contact.name)}</div>`;
}

/**
 * Renders the top section of a large task card in a dialog.
 *
 * Constructs HTML markup for the top section of a large task card based on the
 * task details at the specified index `i`. Updates the dialog content with the
 * rendered HTML.
 *
 * @param {number} i - The index of the task in the tasks array.
 */
function renderCardBigTop(i) {
    document.getElementById('dialogContent').innerHTML = `
    <div class="taskCardBig">
        <p class="titelCardBig">${tasks[i].title}</p>
        <p class="descriptionCardBig cardTextBlack">${tasks[i].description}</p>
        <div class="dateContainer boardFlex">
            <p class="date cardTextGrey">Due date:</p>
            <p class="cardTextBlack">${tasks[i].dueDate}</p>
        </div>
        <div class="prioContainer boardFlex">
            <p class="priority cardTextGrey">Priority:</p>
            <div class="boardFlex">
                <p class="prioText cardTextBlack">${capitalizeFirstLetter(tasks[i].priority)}</p>
                <img src="assets/img/icons/${tasks[i].priority}.svg" alt="">
            </div>
        </div>
        <span id="submitedTo" class="cardTextGrey">Assigned To:</span>
        <ul id="badgeContainer" class="profileBadgesBig"></ul> 
        <span class="cardTextGrey">Subtasks</span>
        <div id="subtasks" class="subtasks"></div>
    </div>
    <div class="footerCardBig boardFlex">
        <div onclick="deleteTask(${i})" class="imgDelete boardFlex"><img src="assets/img/icons/delete.svg" alt="">
            <p>Delete</p>
        </div>
        <div class="seperator"></div>
        <div onclick="renderCardEdit(${i})" class="imgEdit boardFlex"><img src="assets/img/icons/edit.svg" alt="">
            <p>Edit</p>
        </div>
    </div>`
}

/**
 * Renders HTML for a subtask item in the detailed task view.
 * 
 * @param {Object} subtask - The subtask object containing id, completet, and content.
 * @returns {string} - The HTML string for the subtask item.
 */
function renderCardBigSubHtml(subtask, taskId) {
    return `
    <ul class="subtasksItem">
        <li>
            <input type="checkbox" id="subtask${subtask.id}" ${subtask.completet ? 'checked' : ''} onchange="handleSubtaskChange(${tasks[taskId].id}, ${subtask.id}, this)">
            <label for="subtask${subtask.id}">${subtask.content}</label>
        </li>
    </ul> `
}

/**
 * Renders HTML for a badge representing a contact in the detailed task view.
 * 
 * @param {Object} contact - The contact object containing color, initials, and name.
 * @returns {string} - The HTML string for the badge representing the contact.
 */
function renderCardBigAssignedToHtml(contact) {
    return `
    <li>
        <div class="badgeContainer">
            <span class="badgeImg" style="background-color: ${contact.color}">${createNameInitials(contact.name)}</span>
            <span>${contact.name}</span>
        </div>
    </li>`
}

/**
 * Generates HTML markup for rendering the header of a large task card.
 *
 * Constructs HTML markup representing the header of a large task card based on the
 * task category and color provided.
 *
 * @param {number} i - The index of the task in the tasks array.
 * @param {string} color - The color class to apply to the category label.
 * @returns {string} HTML markup representing the header of the large task card.
 */
function renderCardBigHeaderHtml(i, color) {
    return `
     <label class="categoryBig${color}">${tasks[i].category}</label>
    <span onclick="closeDialogBtn()" class="closeBtn closeEdit">
        <img src="assets/img/icons/close.svg" alt="">
    </span>
    `}

/**
 * Generates HTML markup for rendering the header of an edit task card.
 *
 * Constructs HTML markup representing the header of an edit task card, including
 * a close button for dismissing the dialog.
 *
 * @returns {string} HTML markup representing the header of the edit task card.
 */
function renderCardEditHeaderHtml() {
    return `   
                   <span onclick="closeDialogBtn()" class="closeBtn closeEdit">
                       <img src="assets/img/icons/close.svg" alt="">
                   </span>
       `}

/**
 * Generates HTML for editing task details in the dialog box.
 * 
 * @param {number} i - The index of the task.
 * @returns {string} - The HTML string for editing task details.
 */
function renderCardEditHtml(i) {
    return `
    <div class="titleEdit">
        <p class="cardTextGrey">Title</p>
        <input id="editedTitle" class="cardTextBlack inputEdit margin-bottom-4" type="text" value="${tasks[i].title}">
        <div id="edit-task-title-required" class="field-required-msg margin-edit-task-inputs">This field is required</div>
    </div>
    <div class="descriptionEdit">
        <p class="cardTextGrey">Description</p>
        <div class="textareaContainer">
            <textarea id="editedDescription" class="cardTextGrey" placeholder="">${tasks[i].description}</textarea>
        </div>
    </div>
    <div class="dueDateEdit">
        <p class="cardTextGrey">Due Date</p>
        <div>
            <input id="editedDate" onclick="getMinDate()" class="cardTextBlack inputEdit margin-bottom-4" type="date"  value="${tasks[i].dueDate}">
            <div id="edit-task-duo-date-required" class="field-required-msg margin-edit-task-inputs">This field is required. Please choose a date that is in the future.</div>
        </div>
    </div>
    <div class="priorityEdit">
        <p class="cardTextGrey">Priority</p>
        <div class="prio-buttons prioBtn">
            <button type="button" value="urgent" class="prio-btn prioEdit urgent">Urgent<img src="./assets/img/icons_add_task/urgent.svg" alt=""></button>
            <button type="button" value="medium" class="prio-btn prioEdit medium">Medium<img src="./assets/img/icons_add_task/medium-white.svg" alt=""></button>
            <button type="button" value="low" class="prio-btn prioEdit low">Low<img src="./assets/img/icons_add_task/low.svg" alt=""></button>
        </div>
    </div>
    <div class="assignedEdit">
        <p class="cardTextGrey">Assigned to</p>
        <div class="dropdown-container">
            <div onclick="showDropdown()" id="dropDownContact" class="select-btn">
                <input onkeyup="filterContactEdit(${i})" id="searchContacts" class="select-btn-input selectBtnIn" type="text" Placeholder="Select contacts to assign">
                <span class="arrow-down">
                    <img src="./assets/img/icons_add_task/chevron.svg" alt="">
                </span>
            </div>
            <ul id="listContacts" class="list-items">
            </ul>
            <div class="selected-contacts-div selectedContactsContainer">
            </div>
        </div>
    </div>
    <div id="profileBadgesEdit" class="profileBadgesEdit boardFlex">
    </div>
    <div class="form-group">
        <p class="cardTextGrey">Subtasks</p>
        <div class="subtask-input-container subtaskContainer">
            <input onclick="styleSubtaskInputEdit()" id="subtaskInput" class="form-input subtask-input subtaskInputEdit" type="text" placeholder="Add new subtask">
            <div id="addSubtaskBtn" class="subtask-btn add" onclick="hideInputTools()">
                <img onclick="styleSubtaskInputEdit()"  src="./assets/img/icons_add_task/add.svg" alt="">
            </div>
            <div id="cancelDiv" class="subtask-btn check-cancel-div">
                <div onclick="emptyInput()" id="subtaskCancel" class="subtask-cancel" >
                    <img onclick="emptyInput()" src="./assets/img/icons_add_task/subtask-close.svg" alt="">
                </div>
                <div class="subtask-divider"></div>
                    <div id="pushSubtaskEditBtn" class="subtask-check subtaskChekEdit">
                        <img src="./assets/img/icons_add_task/subtask-check.svg" alt="">
                    </div>
                </div>
            </div>
            <div class="display-subtasks-container">
                <ul id="subtaskList" class="subtasks-list">
                 </ul>
            </div>
        </div>
    </div>
    <div class="footerCardEdit boardFlex">
        <div class="okBtnContainer">
            <button onclick="saveEditValidation(${i})" class="addBtn">Ok<img src="assets/img/icons/check.svg" alt=""></button>
        </div>
    </div>
   `
}

/**
 * Generates HTML markup for rendering an editable subtask input field with buttons.
 *
 * Constructs HTML markup representing an editable subtask input field with delete and confirm buttons.
 * The input field is pre-filled with the provided content.
 *
 * @param {string} content - The content to pre-fill in the subtask input field.
 * @param {number} index - The index of the subtask for identifying purposes.
 * @returns {string} HTML markup representing the editable subtask input field with buttons.
 */
function renderSubtaskEditHtml(content, index) {
    return `
            <input class="edit-subtask-input" type="text" value="${content}">
            <div class="edit-subtask-button-div">
                <span onclick="deleteSubtaskEdit(${index})" class="delete-subtask-btn edit"><img src="./assets/img/icons_add_task/subtask-delete.svg"></span>
                <div class="subtask-divider"></div>
                <span class="confirm-subtask-edit-btn"><img src="./assets/img/icons_add_task/subtask-check.svg"></span>
            </div>
                `
}

/**
 * Generates HTML markup for rendering an unedited subtask item with edit and delete icons.
 *
 * Constructs HTML markup representing an unedited subtask item within a list, displaying
 * the subtask content with edit and delete icons.
 *
 * @param {object} item - The subtask object containing content to display.
 * @param {number} index - The index of the subtask for identifying purposes.
 * @returns {string} HTML markup representing the unedited subtask item with icons.
 */
function renderEditSubtasksUneditedHtml(item, index) {
    return `
            <li class="subtask-list-item" data-index="${index}">
                <div class="li-text">
                    ${item.content} 
                </div>
                <div class="subtask-edit-icon-div">
                    <img  class="edit-subtask-btn" src="./assets/img/icons_add_task/subtask-edit.svg" alt="">
                    <div class="subtask-divider-2"></div>
                    <img onclick="deleteSubtaskEdit(${index})" class="delete-subtask-btn" src="./assets/img/icons_add_task/subtask-delete.svg" alt="">
                </div>
            </li>
        `
}

/**
 * Generates HTML markup for rendering a contact item in an edit contacts list.
 *
 * Constructs HTML markup representing a contact item within a list, including
 * the contact's initials, name, and a checkbox indicating assignment status.
 *
 * @param {object} contact - The contact object containing details to display.
 * @param {boolean} isAssigned - Flag indicating if the contact is assigned to a task.
 * @param {string} checkedClass - Additional class for styling based on assignment status.
 * @returns {string} HTML markup representing the contact item in the edit contacts list.
 */
function renderContactsEditHtml(contact, isAssigned, checkedClass) {
    return ` <li class="list-item assigned-to contactListItems ${checkedClass}"  data-contact-id="${contact.id}">
                <div class="list-item-name">
                    <div class="cicle" style="background-color: ${contact.color}">${contact.initials}</div>
                    <span>${contact.name}</span>
                </div>
                <img class="checkbox" src="./assets/img/icons_add_task/${isAssigned ? 'checkedbox' : 'checkbox'}.svg" alt="">
            </li>
`;
}