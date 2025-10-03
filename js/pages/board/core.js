let searchQuery = '';

/**
 * Initializes the board page with necessary setup and data loading.
 */
async function initBoard() {
    await includeHTML();
    checkScreenOrientation();
    checkForCurrentUser() ? "" : redirectTo('login.html');
    initHeader();
    highlightLink('board');
    initPopup();
    await getTasks();
    await getContacts();
    setupBoard();
}

/**
 * Sets up the board page with necessary setup and event listeners.
 */
function setupBoard() {
    renderTasks();
    initHorizontalScroll('.task-container');
    setupSearchFunctionality();
    closeDetaliedTaskDialogListeners();
    enableAutoScrollOnDrag();
    preventFormSubmitOnEnter();
}


window.addEventListener('resize', () => {
    renderTasks();
});


/**
 * Sets up search functionality for task filtering.
 */
function setupSearchFunctionality() {
    const searchInput = document.querySelector('input[name="search"]');
    const searchForm = document.querySelector('.search-form');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearchInput);
    }
    if (searchForm) {
        searchForm.addEventListener('submit', handleSearchSubmit);
    }
}


/**
 * Handles search input events and filters tasks in real-time.
 * @param {Event} event - The input event
 */
function handleSearchInput(event) {
    searchQuery = event.target.value;
    renderTasks();
}


/**
 * Handles search form submission and prevents page reload.
 * @param {Event} event - The form submit event
 */
function handleSearchSubmit(event) {
    event.preventDefault();
    const searchInput = document.querySelector('input[name="search"]');
    if (searchInput) {
        searchQuery = searchInput.value;
        renderTasks();
    }
}


/**
 * Filters tasks based on current search query.
 * @returns {Array} Array of tasks matching the search criteria
 */
function getFilteredTasks() {
    let result = tasks;
    if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        result = tasks.filter(task => {
            const titleMatch = task.title.toLowerCase().includes(query);
            const descMatch = task.description.toLowerCase().includes(query);
            return titleMatch || descMatch;
        });
    }
    return result.sort((a, b) => a.timestamp - b.timestamp);
}


/**
 * Shows search error styling when no results found.
 */
function showSearchError() {
    const searchInput = document.querySelector('input[name="search"]');
    const errorMessage = document.querySelector('.search-error-message');
    if (searchInput) {
        searchInput.style.borderColor = '#FF8190';
    }
    if (errorMessage) {
        errorMessage.style.display = 'block';
    }
}


/**
 * Hides search error styling when results found or input empty.
 */
function hideSearchError() {
    const searchInput = document.querySelector('input[name="search"]');
    const errorMessage = document.querySelector('.search-error-message');
    if (searchInput) {
        searchInput.style.borderColor = '';
    }
    if (errorMessage) {
        errorMessage.style.display = 'none';
    }
}


/**
 * Shows empty message for containers that have no task cards.
 */
function showEmptyContainer() {
    containerIds.forEach((id) => {
        const container = document.getElementById(id);
        if (container && !container.querySelector('.task-card')) {
            const formattedName = id
                .replace(/-/g, ' ')
                .replace(/^\w/, c => c.toUpperCase());
            container.innerHTML = `<span class="empty-task-container d-flex-center">No tasks ${formattedName}</span>`;
        }
    });
}


/**
 * Renders tasks in the task containers based on the current search query.
 * Shows empty message for containers that have no task cards, and search error styling when no results found.
 * Hides search error styling when results found or input empty.
 */
function renderFilteredTasks() {
    const filteredTasks = getFilteredTasks();
    if (filteredTasks.length === 0 && searchQuery.trim() !== '') {
        showEmptyContainer();
        showSearchError();
        return;
    } else {
        hideSearchError();
    }
    filteredTasks.forEach(task => {
        renderTaskInContainer(task);
    });
}


/**
 * Returns the color code associated with a given category.
 *
 * @param {string} category - The name of the category.
 * @returns {string} The hex color code for the specified category.
 */
function getCategoryColor(category) {
    return category === 'Technical Task' ? '#1FD7C1' : '#0038FF';
}


/**
 * Finds a contact by ID in the contacts array.
 * @param {string} contactId - The ID of the contact to find
 * @returns {Object|null} The contact object or null if not found
 */
function findContactById(contactId) {
    const contact = contacts.find(c => c.id === contactId);
    if (contact) return contact;
    if (currentUser && currentUser.id === contactId) return currentUser;
    return null;
}


