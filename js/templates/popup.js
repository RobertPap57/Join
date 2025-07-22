/**
 * Popup and modal window management
 * Handles opening, closing, and managing popup window and modal
 */
let popupUser = {
    name: '',
    email: '',
    phone: '',
    image: '',
    id: '',
}
let popupElements = {};

function initPopup() {
    popupElements = getPopupElements();
    focusInputEventListeners();
}

function getPopupElements() {
    return {
        modal: document.getElementById('popup-modal'),
        container: document.getElementById('popup-container'),
        title: document.getElementById('popup-title'),
        profileImg: document.getElementById('popup-profile-img'),
        uploadBtn: document.getElementById('popup-upload-btn'),
        name: document.getElementById('popup-name'),
        nameValidationMsg: document.getElementById('popup-name-validation-msg'),
        email: document.getElementById('popup-email'),
        emailValidationMsg: document.getElementById('popup-email-validation-msg'),
        phone: document.getElementById('popup-phone'),
        phoneValidationMsg: document.getElementById('popup-phone-validation-msg'),
        secondary: document.getElementById('popup-secondary-btn'),
        primary: document.getElementById('popup-primary-btn'),

    }
}

function openPopUp(type) {
    modal.classList.remove('d-none');
    popUpWindow.classList.remove('d-none');
    setTimeout(() => {
        popUpWindow.classList.remove('popup-close');
        popUpWindow.classList.add('popup-open');
    }, 10);
}

function setupPopup(type) {
    switch (type) {
        case 'add-contact':
            popupElements.title.textContent = 'Add Contact';
            popupElements.approveBtn.textContent = 'Create';
            break;
        case 'edit-contact':
            popupElements.title.textContent = 'Edit Contact';
            popupElements.approveBtn.textContent = 'Save';
            break;
        default:
            break;
    }
}

function addContactSetup() {
    popupElements.title.innerHTML = `<h1>Add contact</h1><p>Tasks are better with a team!</p>`;
    popupElements.profileImg.innerHTML = `<img src="./assets/images/components/popup/person-white.svg" alt="profile">`;
    popupElements.name.value = '';
    popupElements.email.value = '';
    popupElements.phone.value = '';
    popupElements.secondary.innerHTML = `<p>Cancel</p>
                            <div class="popup-icon-container d-flex-center">
                                <img src="./assets/images/global/close.svg" alt="close">
                            </div>`;
    popupElements.primary.innerHTML = `<p><b>Create contact</b></p>
                            <div class="popup-icon-container d-flex-center">
                                <img src="./assets/images/global/check-white.svg" alt="check">
                            </div>`;
}

function myAccountSetup() {
    popupElements.title.innerHTML = `<h1>My account</h1>`;
    popupElements.profileImg.innerHTML = `${createNameInitials(currentUser.name)}`;
    popupElements.name.value = currentUser.name;
    popupElements.email.value = currentUser.email;
    popupElements.phone.value = currentUser.phone;
    popupElements.secondary.innerHTML = `<p>Delete my account</p>`;
    popupElements.primary.innerHTML = `<p><b>Edit</b></p>`;
    popupElements.uploadBtn.classList.add('d-none');
     setInputsEditable(false);
}

function setInputsEditable(editable) {
  const inputs = document.querySelectorAll('.popup-input input');
  inputs.forEach(input => {
    input.readOnly = !editable;
  });
}

function closePopUp() {
    popUpWindow.classList.remove('popup-open');
    popUpWindow.classList.add('popup-close');
    setTimeout(() => {
        modal.classList.add('d-none');
        popUpWindow.classList.add('d-none');
    }, 110);
    clearInputs();
}




function focusInputEventListeners() {
    const inputs = document.querySelectorAll('.popup-input input');
    inputs.forEach(input => {
        const container = input.parentElement;
        input.addEventListener('focus', () => {
            container.classList.add('popup-input-active');
        });
        input.addEventListener('blur', () => {
            container.classList.remove('popup-input-active');
        });
        input.addEventListener('input', () => {
            container.classList.add('popup-input-active');
        });
    });
}



function validateEmptyInputs() {
    const validationMsgs = document.querySelectorAll('.popup-validation-msg');
    const inputs = document.querySelectorAll('.popup-input input');
    inputs.forEach((input, i) => {
        const container = input.parentElement;
        const msg = validationMsgs[i];
        if (!input.value.trim()) {
            container.classList.add('popup-input-invalid');
            if (msg) {
                msg.classList.remove('d-none');
                msg.textContent = "This field is required";
            }
        } else {
            container.classList.remove('popup-input-invalid');
            if (msg) {
                msg.classList.add('d-none');
            }
        }
    });
}



function validateEmail() {
    const email = popupElements.email.value.trim();
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
    if (!isValid) {
        popupElements.emailValidationMsg.textContent = 'A valid email is required';
    } else {
        popupElements.emailValidationMsg.textContent = '';
    }
}


function clearInputs() {
    const inputs = document.querySelectorAll('.popup-input input');
    inputs.forEach(input => input.value = '');
}


function doNotClose(event) {
    event.stopPropagation();
}


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