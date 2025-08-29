
/**
 * Header component functionality and sub-menu management
*/

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
 *
 * Assumes the parent element has the class 'header-content' and the sub-menu dialog
 * has the ID 'sub-menu'.
 */
function positionateSubMenu() {
    const parent = document.querySelector('.header-content');
    const dialog = document.getElementById('sub-menu');
    const rect = parent.getBoundingClientRect();
    if (window.innerHeight > 1920) {
        dialog.style.right = ((window.innerWidth - rect.right) + 20) + "px";
    }
}

/**
 * Attaches a click event listener to the sub-menu element that handles closing the sub-menu.
 * Removes the 'header-hovered' class from the avatar if present.
 * For mobile viewports (width <= 767px), hides the sub-menu with a delay before closing the dialog.
 * For larger viewports, closes the dialog immediately.
*/
function closeSubMenu() {
    const subMenu = document.getElementById('sub-menu');
    const avatar = document.getElementById('header-avatar');
    subMenu.addEventListener('click', (event) => {
        if (avatar) avatar.classList.remove('header-hovered');
        if (window.innerWidth <= 767) {
            subMenu.classList.remove('visible');
            setTimeout(() => {
                closeDialogOnClickOutside(event, subMenu);
            }, 300);
        } else closeDialogOnClickOutside(event, subMenu);
    });
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
 * Initializes the header section by displaying the current user's profile avatar,
 * setting up the user's initials in the font size, and closing any open submenus.
*/
function initHeader() {
    displayProfileAvatar(currentUser, 'header-avatar');
    setupInitialsFS();
    closeSubMenu();
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