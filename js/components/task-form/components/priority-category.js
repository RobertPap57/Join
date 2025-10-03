const svgMappings = {
    'urgent': '../assets/images/global/urgent.svg',
    'urgent-active': '../assets/images/global/urgent-white.svg',
    'medium': '../assets/images/global/medium.svg',
    'medium-active': '../assets/images/global/medium-white.svg',
    'low': '../assets/images/global/low.svg',
    'low-active': '../assets/images/global/low-white.svg'
};

/**
 * Add event listeners to priority buttons to change their state.
 */
function changePrioBtn() {
    const buttons = document.querySelectorAll('.prio-btn');
    buttons.forEach(button => {
        bindEventListenerOnce(
            button,
            'click',
            () => handlePriorityButtonClick(button, buttons),
            'prioBtnClick'
        );
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
        btn.ariaChecked = "false";
    } else {
        btn.classList.add('active');
        img.src = svgMappings[`${prio}-active`];
        btn.ariaChecked = "true";
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
    btn.ariaChecked = "false";
}

/**
 * Gets the selected priority from priority buttons.
 * @returns {string} Selected priority value
 */
function getSelectedPriority() {
    const priorityBtns = document.querySelectorAll('.prio-btn');
    let priority;
    priorityBtns.forEach(item => {
        if (item.classList.contains('active')) {
            priority = item.id;
        }
    });
    return priority;
}

/**
 * Set the medium priority button as active.
 */
function selectMediumPriority() {
    const buttons = document.querySelectorAll('.prio-btn');
    buttons.forEach(button => {
        const prio = button.id;
        const img = button.querySelector('img');
        if (prio === 'medium') {
            button.classList.add('active');
            img.src = svgMappings['medium-active'];
            button.ariaChecked = "true";
        } else {
            button.classList.remove('active');
            img.src = svgMappings[prio];
            button.ariaChecked = "false";
        }
    });
}

/**
 * Enables or disables the category dropdown based on the provided type.
 *
 * @param {string} type - The context in which the dropdown is used. 
 *                        If 'edit-task', the dropdown is disabled and the arrow is hidden.
 *                        Otherwise, the dropdown is enabled and the arrow is shown.
 */
function disableCategoryDropdown(type) {
    const selectBtnCategory = document.querySelector('.select-btn.category');
    const arrowDown = document.getElementById('category-btn');
    if (type === 'edit-task') {
        selectBtnCategory.classList.add('unclickable');
        selectBtnCategory.tabIndex = -1;
        arrowDown.classList.add('d-none');
    } else {
        selectBtnCategory.classList.remove('unclickable');
        selectBtnCategory.tabIndex = 0;
        arrowDown.classList.remove('d-none');
    }
}

/**
 * Show and handle the category dropdown.
 */
function setupCategoryDropdown() {
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
    bindEventListenerOnce(arrowDown, 'click',
        (event) => {
            event.stopPropagation();
            selectBtnCategory.classList.toggle('show-menu');
            selectBtnCategory.ariaExpanded = selectBtnCategory.classList.contains('show-menu') ? "true" : "false";
        }, 'arrowDownClick');
    bindEventListenerOnce(selectBtnCategory, 'click',
        (event) => {
            event.stopPropagation();
            selectBtnCategory.classList.toggle('show-menu');
            selectBtnCategory.ariaExpanded = selectBtnCategory.classList.contains('show-menu') ? "true" : "false";
        }, 'selectBtnCategoryClick');
}

/**
 * Prevents category dropdown from closing when clicked inside.
 * @param {Element} categoryList - Category list element
 */
function preventCategoryDropdownClose(categoryList) {
    if (categoryList) {
        bindEventListenerOnce(
            categoryList,
            'click',
            (event) => event.stopPropagation(),
            'categoryListClick'
        );
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
        bindEventListenerOnce(
            item,
            'click',
            () => {
                let selectedItemText = item.getAttribute('data-value');
                selectBtnCategory.classList.remove('show-menu');
                selectBtnCategory.ariaExpanded = "false";
                categoryDisplayed.textContent = selectedItemText;
                categoryDisplayed.dataset.selected = selectedItemText;
            },
            'categoryItemClick'
        );
    });
}

/**
 * Adds outside click listener for category dropdown.
 * @param {Element} selectBtnCategory - Category select button
 * @param {Element} categoryList - Category list element
 */
function addCategoryDropdownOutsideListener(selectBtnCategory, categoryList) {
    bindEventListenerOnce(document, 'click', (event) => {
        if (event.target.closest('#category-container') || event.target.closest('#category-btn')) {
            return;
        }
        if (!selectBtnCategory.contains(event.target) &&
            !(categoryList && categoryList.contains(event.target))) {
            selectBtnCategory.classList.remove('show-menu');
            selectBtnCategory.ariaExpanded = "false";
        }
    }, 'categoryOutsideClick');
}

/**
 * Reset the category display to the default text.
 */
function resetCategory() {
    const categoryDisplayed = document.getElementById('category-displayed');
    const categoryContainer = document.getElementById('category-container');
    categoryContainer.classList.remove('show-menu');
    categoryContainer.classList.ariaExpanded = "false";
    categoryDisplayed.textContent = "Select task category";
}
