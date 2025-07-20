/**
 * Priority selection and category dropdown functionality for Add Task
 * Handles priority button interactions and category selection
 */

// SVG mappings for priority buttons
const svgMappings = {
    'urgent': 'assets/images/global/urgent.svg',
    'urgent-active': 'assets/images/global/urgent-white.svg',
    'medium': 'assets/images/global/medium.svg',
    'medium-active': 'assets/images/global/medium-white.svg',
    'low': 'assets/images/global/low.svg',
    'low-active': 'assets/images/global/low-white.svg'
};

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
        } else {
            button.classList.remove('active');
            img.src = svgMappings[prio];
        }
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
 * Reset the category display to the default text.
 */
function resetCategory() {
    const categoryDisplayed = document.getElementById('category-displayed');
    categoryDisplayed.textContent = "Select task category";
}
