




/**
 * Handles the click event on the modal and mobile modal to close the pop-up windows.
 * @param {Event} event - The click event.
 * @return {void}
 */
function closeModalOnClick(event) {
    const modal = document.getElementById('modal');
    const mobileModal = document.getElementById('mobile-modal');
    const addContactContent = document.getElementById('add-contact');
    const editContactContent = document.getElementById('edit-contact');
    const subMenuContent = document.getElementById('contact-sub-menu');
    if (event.target === modal) {
        if (!addContactContent.classList.contains('d-none')) {
            closePopUpWindow('add-contact', 'modal', 'pop-up-open', 'pop-up-close');
        }
        if (!editContactContent.classList.contains('d-none')) {
            closePopUpWindow('edit-contact', 'modal', 'pop-up-open', 'pop-up-close');
        }
    }
    if (event.target === mobileModal) {
        if (!subMenuContent.classList.contains('d-none')) {
            closePopUpWindow('contact-sub-menu', 'mobile-modal', 'sub-menu-open', 'sub-menu-close');
        }
    }
}

window.addEventListener('click', closeModalOnClick);
