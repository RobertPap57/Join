
/**
 * @constant {Array} selectedContacts - Array to store selected contacts.
 */
const selectedContacts = [];

/**
 * @constant {Array} subtasks - Array to store subtasks.
 */
const subtasks = [];

/**
 * @constant {Object} newTask - Object to store the new task.
 */
let newTask = {};

/**
 * @constant {Array} filteredContacts - Array to store filtered contacts.
 */
let filteredContacts = contacts;

/**
 * @constant {Array} tempTasks - Array to store temporary tasks.
 */
let tempTasks = [];

/**
 * @constant {Object} svgMappings - Object to map priority levels to their corresponding SVG file paths.
 */
const svgMappings = {
    'urgent': './assets/img/icons_add_task/urgent.svg',
    'urgent-active': './assets/img/icons_add_task/urgent-white.svg',
    'medium': './assets/img/icons_add_task/medium.svg',
    'medium-active': './assets/img/icons_add_task/medium-white.svg',
    'low': './assets/img/icons_add_task/low.svg',
    'low-active': './assets/img/icons_add_task/low-white.svg'
};

/**
 * Show the menu for select buttons.
 */
function showMenu() {
    const selectBtns = document.querySelectorAll('.select-btn.assigned-to, .select-btn.category');

    selectBtns.forEach(selectBtn => {
        selectBtn.addEventListener('click', () => {
            selectBtn.classList.toggle('show-menu');
        });
    });

    selectBtns.forEach(selectBtn => {
        selectBtn.addEventListener('focus', () => {
            selectBtn.classList.toggle('show-menu');
        });
    });
}

/**
 * Filter contacts based on user input.
 */
function filterContacts() {
    const selectBtnInput = document.querySelector('.select-btn-input');
    
    selectBtnInput.addEventListener('click', handleFilter);
    selectBtnInput.addEventListener('input', handleFilter);

    /**
     * Handle filter and render contacts based on input value.
     */
    function handleFilter() {
        const filterValue = selectBtnInput.value.toLowerCase().trim();

 
        if (filterValue === '') {
  
            filteredContacts = contacts;
        } else {
        
            filteredContacts = contacts.filter(contact => contact.name.toLowerCase().startsWith(filterValue));
        }

       
        renderContacts();
    }
}

/**
 * Render the list of filtered contacts.
 */
function renderContacts() {
    const assignedToList = document.querySelector('.list-items');
    assignedToList.innerHTML = '';

    filteredContacts.forEach(item => {
        const isSelected = selectedContacts.includes(item);
        assignedToList.innerHTML += `
            <li class="list-item assigned-to ${isSelected ? 'checked' : ''}" data-id="${item.id}">
                <div class="list-item-name">
                    <div class="cicle" style="background-color: ${item.color}">${item.initials}</div>
                    <span>${item.name}</span>
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
function renderSelectedContactsBelow() {
    const selectedContactsDiv = document.querySelector('.selected-contacts-div');
    selectedContactsDiv.innerHTML = '';
    selectedContacts.forEach(item => {
        selectedContactsDiv.innerHTML += `
            <div class="cicle" style="background-color: ${item.color}">${item.initials}</div>
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
            buttons.forEach(btn => {
                const prio = btn.id;
                const img = btn.querySelector('img');
                if (btn === button) {
                    if (btn.classList.contains('active')) {
                        btn.classList.remove('active');
                        img.src = svgMappings[prio];
                    } else {
                        btn.classList.add('active');
                        img.src = svgMappings[`${prio}-active`];
                    }
                } else {
                    btn.classList.remove('active');
                    img.src = svgMappings[prio];
                }
            });
        });
    });
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
 * Show and handle the category menu.
 */
function categoryMenu() {
    const selectBtnCategory = document.querySelector('.select-btn.category');
    const categoryDisplayed = document.getElementById('category-displayed');
    const listItems = document.querySelectorAll('.list-item.category');

    listItems.forEach(item => {
        item.addEventListener('click', () => {
            let selectedItemText = item.getAttribute('data-value');
            selectBtnCategory.classList.remove('show-menu');
            categoryDisplayed.textContent = selectedItemText;
            categoryDisplayed.dataset.selected = selectedItemText;
        });
    });

    document.addEventListener('click', (event) => {
        if (!selectBtnCategory.contains(event.target) &&
            !categoryDisplayed.contains(event.target) &&
            !Array.from(listItems).some(item => item.contains(event.target))) {
            selectBtnCategory.classList.remove('show-menu');
        }
    });
}

/**
 * Style the subtask input and buttons.
 */
function styleSubtaskInput() {
    const subtaskInput = document.querySelector('.subtask-input');
    const subtaskBtnAdd = document.querySelector('.subtask-btn.add');
    const subtaskBtnCheckCancel = document.querySelector('.check-cancel-div');
    const subtaskCancelBtn = document.querySelector('.subtask-cancel');

    subtaskBtnAdd.addEventListener('click', () => {
        subtaskBtnAdd.style.display = 'none';
        subtaskBtnCheckCancel.style.display = 'flex';
    });

    subtaskInput.addEventListener('focus', () => {
        subtaskBtnAdd.style.display = 'none';
        subtaskBtnCheckCancel.style.display = 'flex';
    });

    subtaskCancelBtn.addEventListener('click', () => {
        subtaskBtnAdd.style.display = 'flex';
        subtaskBtnCheckCancel.style.display = 'none';
    });
}

/**
 * Add a subtask to the list of subtasks.
 */
function pushSubtask() {
    const subtaskInput = document.querySelector('.subtask-input');
    const subtaskBtnCheck = document.querySelector('.subtask-check');

    function addSubtask() {
        if (subtaskInput.value !== '') {
            subtasks.push(subtaskInput.value);
            renderSubtasks();
            subtaskInput.value = '';
        }
    }

    subtaskBtnCheck.addEventListener('click', addSubtask);

    subtaskInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            addSubtask();
        }
    });
}

/**
 * Render the list of subtasks.
 */
function renderSubtasks() {
    const subtasksList = document.querySelector('.subtasks-list');
    subtasksList.innerHTML = '';
    subtasks.forEach((item, index) => {
        subtasksList.innerHTML += `
            <li class="subtask-list-item" data-index="${index}">
                <div class="li-text">
                    ${item}
                </div>
                <div class="subtask-edit-icon-div">
                    <img class="edit-subtask-btn" src="./assets/img/icons_add_task/subtask-edit.svg" alt="">
                    <div class="subtask-divider-2"></div>
                    <img class="delete-subtask-btn" src="./assets/img/icons_add_task/subtask-delete.svg" alt="">
                </div>
            </li>
        `;
    });
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

        const handleEdit = () => {
            let input = item.querySelector('.edit-subtask-input');
            if (!input) {
                let liText = item.querySelector('.li-text');
                item.innerHTML = `
                    <input class="edit-subtask-input" type="text" value="${liText.textContent.trim()}">
                    <div class="edit-subtask-button-div">
                        <span class="delete-subtask-btn edit"><img src="./assets/img/icons_add_task/subtask-delete.svg"></span>
                        <div class="subtask-divider"></div>
                        <span class="confirm-subtask-edit-btn"><img src="./assets/img/icons_add_task/subtask-check.svg"></span>
                    </div>
                `;
                item.classList.add('subtask-list-item-edit');
                deleteSubtask();
                confirmSubtaskEdit();
            }
        };

        editSubtaskBtn.addEventListener('click', handleEdit);

        item.addEventListener('dblclick', handleEdit);
    });
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

