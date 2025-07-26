/**
 * Opens the sub-menu by removing the 'd-none' class from the sub-menu modal and sub-menu elements,
 * and animating the sub-menu open.
 */
function openSubMenu() {
    let subMenu = document.getElementById('sub-menu');
    let subModal = document.getElementById('sub-menu-modal');
    subModal.classList.remove('d-none');
    subMenu.classList.remove('d-none');
    setTimeout(() => {
        subMenu.classList.remove('sub-menu-close');
        subMenu.classList.add('sub-menu-open');
    }, 10);
}


/**
 * Closes the sub-menu by adding the 'sub-menu-close' class to animate its closing,
 * and adding the 'd-none' class to hide both the sub-menu modal and sub-menu elements.
 */
function closeSubMenu() {
    let subMenu = document.getElementById('sub-menu');
    let subModal = document.getElementById('sub-menu-modal');
    subMenu.classList.remove('sub-menu-open');
    subMenu.classList.add('sub-menu-close');
    setTimeout(() => {
        subModal.classList.add('d-none');
        subMenu.classList.add('d-none');
    }, 100);
}


/**
 * Handles the window click event to close the sub-menu if the click event
 * target matches the sub-menu modal element.
 * 
 * @param {Event} event - The click event object.
 */
window.onclick = function (event) {
    const subMenu = document.getElementById('sub-menu-modal');
    if (event.target === subMenu) {
        closeSubMenu();
    }
}


/**
 * Hides the header icons by adding the 'd-none' class to the element with id 'header-icons'.
 */
function hideHeaderIcons() {
    document.getElementById('header-icons').classList.add('d-none');
}


/**
 * Hides the help icon element.
 */
function hideHelpIcon() {
    document.getElementById('hide-help-icon').classList.add('d-none');
}


/**
 * Updates the header profile initials based on the current user's data.
 * Clears the inner HTML of the 'header-profile-icon' element, removes the 'initials-fsize' class,
 * and sets the initials content and adjusts the font size if necessary based on the currentUser's initials.
 * If currentUser or currentUser.initials is not defined, adds 'd-none' class to 'navLinks' element.
 */
function displayProfileIconInitials(userAvatar) {
    userAvatar.classList.remove('f-size-28');
    const initials = createNameInitials(currentUser.name);
    userAvatar.innerHTML = initials;
    if (initials.length === 1) {
        userAvatar.classList.add('f-size-28');
    }
}


function displayProfileImage(userAvatar) {
    userAvatar.innerHTML = `<img class="avatar-img" src="${currentUser.image}" alt="Profile picture">`;
}


function displayProfileAvatar() {
    let userAvatar = document.getElementById('header-avatar');
    if (userAvatar) {
        userAvatar.innerHTML = '';
        if (currentUser && currentUser.image) {
            displayProfileImage(userAvatar);
        } if (currentUser.name && !currentUser.image) {
            displayProfileIconInitials(userAvatar);
        }
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