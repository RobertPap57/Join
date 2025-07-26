/**
 * Popup and modal window management
*/

let popupElements = {};


function initPopup() {
    popupElements = getPopupElements();
    closePopupOnClickOutsideListener();
    closeErrorModalOnClickOutside();
    uploadBtnHoverListener();
    initImageHandler();

}

function setUpProfileImage(user) {
    if (user) {
        if (!user.image && user.name) {
            popupElements.profileImg.innerHTML = `${createNameInitials(user.name)}`;
            popupElements.profileImg.style.backgroundColor = user.color;
            return;
        } if (user.image) {
            popupElements.profileImg.innerHTML = `<img src="${user.image}" alt="Profile picture">`;
        }
    } else {
        popupElements.profileImg.style.backgroundColor = '#D9D9D9';
        popupElements.profileImg.innerHTML = `<img src="../assets/images/components/popup/person-white.svg" alt="Profile picture" class="person-icon">`;

    }
}



function setUpPopupForm(type, user = {}) {
    const form = popupElements.popupForm;
    form.dataset.type = type;

    form.dataset.id = user.id || '';
    form.dataset.color = user.color || '';
    form.dataset.image = user.image || '';
    form.dataset.password = user.password || '';

    form.elements['name'].value = user.name || '';
    form.elements['email'].value = user.email || '';
    form.elements['phone'].value = user.phone || '';
}

async function handleSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);

    const formValues = {
        id: form.dataset.id || '',
        color: form.dataset.color || getRandomColor(),
        image: form.dataset.image || '',
        password: form.dataset.password || '',
        name: formData.get('name')?.trim() || '',
        email: formData.get('email')?.trim() || '',
        phone: formData.get('phone')?.trim() || '',
    };
    console.log('Form Values:', formValues);
    const type = form.dataset.type;
    await setUpSubmitActions(type, formValues);
}


async function setUpSubmitActions(type, user) {
    switch (type) {
        case 'add-contact':
            await addContact(user);
            break;
        case 'edit-contact':
            await updateContact(user);
            break;
        case 'my-account':
            openPopup('edit-account', user);
            break;
        case 'edit-account':
            await updateUser(user);
            openPopup('my-account', user);
            break;
    }
}

function setUpSecondaryButtonAction(type, user) {
    const btn = popupElements.secondaryBtn;
    switch (type) {
        case 'add-contact': btn.onclick = () => {
            closePopup();
        };
            break;
        case 'edit-contact': btn.onclick = async () => {
            await deleteContact(user.id);
        };
            break;
        default: btn.onclick = async () => {
            await openDeleteUserMsg(user.id);
        };
            break;
    }
}



function setUpPopup(type, user) {
    setUpTitle(type);
    setUpPopupForm(type, user);
    setUpSecondaryButtonAction(type, user)
    setUpProfileImage(user);
    setInputsUneditable(type);
    setUpButtons(type);
    if (type !== 'my-account') {
        initFormValidation();
        updateButtonState();
    }
}

function openPopup(type, user) {
    setUpPopup(type, user);
    showPopup();
}

function closePopup() {
    hidePopup();
    clearInputs();
    clearFormValidation();
}


function getPopupElements() {
    return {
        popupModal: document.getElementById('popup-modal'),
        popupWindow: document.getElementById('popup-window'),
        popupForm: document.getElementById('popup-form'),
        title: document.getElementById('popup-title'),
        profileImg: document.getElementById('popup-profile-img'),
        uploadBtn: document.getElementById('popup-upload-btn'),
        filepicker: document.getElementById('filepicker'),
        name: document.getElementById('name'),
        email: document.getElementById('email'),
        phone: document.getElementById('phone'),
        secondaryBtn: document.getElementById('popup-secondary-btn'),
        primaryBtn: document.getElementById('popup-primary-btn'),
        errorModal: document.getElementById('error-modal'),
        errorMsg: document.getElementById('error-msg'),
        warningMsg: document.getElementById('warning-msg'),
    }
}

function uploadBtnHoverListener() {
    const photoIcon = popupElements.uploadBtn.querySelector('img');
    popupElements.uploadBtn.addEventListener("mouseenter", () => {
        photoIcon.src = "../assets/images/components/popup/photo-white.svg";
    });
    popupElements.uploadBtn.addEventListener("mouseleave", () => {
        photoIcon.src = "../assets/images/components/popup/photo.svg";
    });
}


function setUpTitle(type) {
    switch (type) {
        case 'add-contact':
            popupElements.title.innerHTML = `<h1>Add contact</h1><p>Tasks are better with a team!</p>`;
            break;
        case 'my-account':
            popupElements.title.innerHTML = `<h1>My account</h1>`;
            break;
        case 'edit-contact':
            popupElements.title.innerHTML = `<h1>Edit contact</h1>`;
            break;
        case 'edit-account':
            popupElements.title.innerHTML = `<h1>Edit account</h1>`;
            break;
    }
}

function setInputsUneditable(type) {
    const readOnly = type === 'my-account' ? true : false;
    const inputs = document.querySelectorAll('.popup-input input');
    inputs.forEach(input => {
        input.readOnly = readOnly;
    });
}


function setUpButtons(type) {
    setUpPrimaryButton(type);
    setUpSecondaryButton(type);
    setUpButtonIcon(type);
    popupElements.secondaryBtn.classList.toggle('popup-secondary-btn', type === 'add-contact');
    popupElements.uploadBtn.classList.toggle('d-none', type === 'my-account');
    popupElements.primaryBtn.classList.remove('button-disabled');
}

function setUpPrimaryButton(type) {
    switch (type) {
        case 'add-contact':
            popupElements.primaryBtn.innerHTML = `<p>Create contact</p>`;
            break;
        case 'my-account':
            popupElements.primaryBtn.innerHTML = `<p>Edit</p>`;
            break;
        default:
            popupElements.primaryBtn.innerHTML = `<p>Save</p>`;
            break;
    }
}

function setUpSecondaryButton(type) {
    switch (type) {
        case 'add-contact':
            popupElements.secondaryBtn.innerHTML = `<p>Cancel</p>`;
            break;
        case 'my-account':
            popupElements.secondaryBtn.innerHTML = `<p>Delete my account</p>`;
            break;
        case 'edit-account':
            popupElements.secondaryBtn.innerHTML = `<p>Delete my account</p>`;
            break;
        default:
            popupElements.secondaryBtn.innerHTML = `<p>Delete</p>`;
            break;
    }
}

function setUpButtonIcon(type) {
    if (type !== 'my-account') {
        popupElements.primaryBtn.innerHTML += `<div class="popup-icon-container d-flex-center">
                    <img src="../assets/images/global/check-white.svg" alt="check">
                    </div>`;
    } if (type === 'add-contact') {
        popupElements.secondaryBtn.innerHTML += `<div class="popup-icon-container d-flex-center">
                    <img src="../assets/images/global/close.svg" alt="close">
                    </div>`;
    } else return;
}






function showPopup() {
    popupElements.popupModal.classList.remove('d-none');
    popupElements.popupWindow.classList.remove('d-none');
    setTimeout(() => {
        popupElements.popupWindow.classList.remove('popup-close');
        popupElements.popupWindow.classList.add('popup-open');
    }, 10);
}

function hidePopup() {
    popupElements.popupWindow.classList.remove('popup-open');
    popupElements.popupWindow.classList.add('popup-close');
    setTimeout(() => {
        popupElements.popupModal.classList.add('d-none');
        popupElements.popupWindow.classList.add('d-none');
    }, 110);
}

function clearInputs() {
    const inputs = document.querySelectorAll('.popup-input input');
    inputs.forEach(input => input.value = '');
}

function closePopupOnClickOutsideListener() {
    popupElements.popupModal.addEventListener('click', (event) => {
        if (event.target === popupElements.popupModal) {
            closePopup();
        }
    });
}


async function updateUser(user) {
    currentUser = user;
    sessionStorage.setItem('currentUser', JSON.stringify(user));
    await updateData('/users', user.id, user);
}

async function deleteUser(id) {
    await deleteData('/users', id);
    closeErrorMsg('warningMsg');
    closePopup();
    logOut();
}

async function openDeleteUserMsg(id) {
    showErrorMessage('warningMsg');
    const deleteButton = document.getElementById('delete-acc-btn');
    deleteButton.onclick = async () => {
        await deleteUser(id);
    };
}

/**
 * Updates the popup profile image with the provided base64 image
 * @param {string} base64Image - Base64 encoded image string
 */
function updatePopupProfileImage(base64Image) {
    if (popupElements.profileImg && base64Image) {
        popupElements.profileImg.innerHTML = `<img src="${base64Image}" alt="Profile picture">`;
        popupElements.profileImg.style.backgroundColor = '';
    }
}

/**
 * Shows error message modal with slide-in animation.
 */
function showErrorMessage(key) {

    const errorContainer = popupElements[key];
    popupElements.errorModal.classList.remove('d-none');
    setTimeout(() => {
        errorContainer.classList.add('error-msg-slide-in');
    }, 100);
};

/**
 * Closes error message modal with slide-out animation.
 */
function closeErrorMsg(key) {
    const errorContainer = popupElements[key];
    errorContainer.classList.remove('error-msg-slide-in');
    setTimeout(() => {
        popupElements.errorModal.classList.add('d-none');
    }, 100);
}

function closeErrorModalOnClickOutside() {

    if (!popupElements.errorModal) {
        console.error('Error modal not found in the DOM.');
        return;
    }

    popupElements.errorModal.addEventListener('click', (event) => {

        if (event.target === popupElements.errorModal) {
            closeErrorMsg('errorMsg');
            closeErrorMsg('warningMsg');
        }
    });
}







