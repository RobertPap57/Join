/**
 * Initializes the header section by displaying the current user's profile avatar,
 * setting up the user's initials in the font size, and closing any open submenus.
*/
function initHeader() {
    displayProfileAvatar(currentUser, 'header-avatar');
    setupInitialsFS();
    closeSubMenuListeners();
    positionateSubMenu();
}


/**
 * Opens the sub-menu dialog and applies visual effects to the header avatar.
 * Adds a 'header-hovered' class to the avatar if it exists.
 * Displays the sub-menu dialog using showModal().
 * On mobile devices (window width <= 767px), adds a 'visible' class to the sub-menu after the next animation frame.
 */
function openSubMenu() {
    const subMenu = document.getElementById('sub-menu');
    const avatar = document.getElementById('header-avatar');
    if (avatar) avatar.classList.add('header-hovered');
    positionateSubMenu();
    subMenu.showModal();
    if (window.innerWidth <= 767) {
        requestAnimationFrame(() => {
            subMenu.classList.add('visible');
        });
    }
}


/**
 * Positions the sub-menu dialog relative to its parent element.
 * If the window's inner height exceeds 1920 pixels, adjusts the 'right' style property
 * of the sub-menu dialog to align it with the right edge of the parent element,
 * adding a 20px offset.
 * Assumes the parent element has the class 'header-content' and the sub-menu dialog
 * has the ID 'sub-menu'.
 */
function positionateSubMenu() {
    const parent = document.querySelector('.header-content');
    const dialog = document.getElementById('sub-menu');
    const rect = parent?.getBoundingClientRect();
    if (window.innerWidth > 1920) {
        dialog.style.right = ((window.innerWidth - rect.right) + 20) + "px";
    }
}


/**
 * Attaches event listeners to the sub-menu element to handle closing.
 * - Closes the sub-menu when clicking outside of it.
 * - Closes the sub-menu when pressing the Escape key.
 */
function closeSubMenuListeners() {
    const subMenu = document.getElementById('sub-menu');
    closeDialogOnClickOutside(subMenu, closeSubMenu);
    closeDialogOnEsc(subMenu, closeSubMenu);
}

/**
 * Closes the sub-menu in the header component.
 * Removes the 'header-hovered' class from the avatar element if present.
 * For mobile devices (window width <= 767px), removes the 'visible' class from the sub-menu
 * and closes it after a 300ms delay. For larger screens, closes the sub-menu immediately.
 */
function closeSubMenu() {
    const subMenu = document.getElementById('sub-menu');
    const avatar = document.getElementById('header-avatar');
    if (avatar) avatar.classList.remove('header-hovered');
    if (window.innerWidth <= 767) {
        subMenu.classList.remove('visible');
        setTimeout(() => {
            subMenu.close();
        }, 300);
    } else subMenu.close();
}


/**
 * Hides the header actions by adding the 'd-none' class to the element with id 'header-actions'.
*/
function hideHeaderActions() {
    document.getElementById('header-actions').classList.add('d-none');
}


/**
 * Hides the help icon element.
*/
function hideHelpIcon() {
    document.getElementById('help-icon').classList.add('d-none');
}


/**
 * Toggles the 'single-digit-font' CSS class on the header avatar element
 * based on the length of its inner text. If the avatar's text is a single
 * character, the class is added; otherwise, it is removed.
*/
function setupInitialsFS() {
    const headerAvatar = document.getElementById('header-avatar');
    if (headerAvatar && headerAvatar.innerText.length === 1) {
        headerAvatar.classList.add('single-digit-font');
    } else {
        headerAvatar.classList.remove('single-digit-font');
    }
}


/**
 * Logs out the current user by removing 'currentUser' and 'greeting' from sessionStorage,
 * then redirects the user to the login page.
*/
function logOut() {
    sessionStorage.removeItem('currentUser');
    sessionStorage.removeItem('greeting');
    redirectTo('login.html');
}


window.addEventListener('resize', () => {
    positionateSubMenu();
});