


let highestId = 0;


/**
 * Initializes the contacts by including HTML, highlighting contacts, reading data, loading tasks, updating header profile initials, and rendering contacts.
 *
 * @return {Promise<void>} A promise that resolves when all the initialization steps are completed.
 */
async function initContacts() {
    await includeHTML();
    checkForCurrentUser() ? "": redirectTo('login.html');
    displayProfileIconInitials();
    highlightLink('contacts');
    await getContacts();
    renderContacts();
}



/**
 * Checks if the contacts array is empty and updates the contacts list container accordingly.
 *
 * @return {void} This function does not return anything.
 */
function checkIfArrayIsEmpty() {
    if (contacts.length === 0) {
        const contactsListContainer = document.getElementById('contacts-list');
        contactsListContainer.innerHTML = '<p class="no-contacts">No contacts</p>';
        return;
    } 
}


/**
 * Renders contacts if there are any, otherwise displays a message.
 *
 * @return {void} This function does not return anything.
 */
async function renderContacts() {
    checkIfArrayIsEmpty();
    const sortedContacts = contacts.sort((a, b) => a.name.localeCompare(b.name));
    renderSortedContacts(sortedContacts);
}


/**
 * Renders the sorted contacts in the contacts list container, with each contact
 * separated by a separator line based on the first letter of their name.
 *
 * @param {Array<Object>} sortedContacts - The array of contacts to be rendered.
 * @return {void} This function does not return anything.
 */
function renderSortedContacts(sortedContacts) {
    const contactsListContainer = document.getElementById('contacts-list');
    contactsListContainer.innerHTML = '';
    let currentLetter = '';

    sortedContacts.forEach(contact => {
        const firstLetter = contact.name.charAt(0).toUpperCase();
        if (firstLetter !== currentLetter) {
            currentLetter = firstLetter;
            contactsListContainer.innerHTML += contactsSeparatorHtml(currentLetter);
        }
        contactsListContainer.innerHTML += contactsListHtml(contact);
    });
}


/**
 * Slides the contact container in and out of view.
 *
 * @param {HTMLElement} container - The container element to be slid.
 * @return {void} This function does not return anything.
 */
function slideContact(container) {
    container.classList.remove('contact-slide-in');
    container.classList.add('contact-slide-out');
    setTimeout(() => {
        container.classList.remove('contact-slide-out');
        container.classList.add('contact-slide-in');
    }, 175);
}


/**
 * Selects a contact element by its ID and adds the 'contact-selected' class to it.
 *
 * @param {string} id - The ID of the contact element to select.
 * @return {void} This function does not return a value.
 */
function selectedContact(id) {
    document.querySelectorAll('.contact').forEach(contactElement => {
        contactElement.classList.remove('contact-selected');
    });
    const selectedContactElement = document.getElementById(`${id}`);
    if (selectedContactElement) {
        selectedContactElement.classList.add('contact-selected');
    }
}


/**
 * Creates initials from the given name.
 *
 * @param {string} name - The full name to create initials from.
 * @returns {string} Initials generated from the first letters of each word in the name.
 */
function createUserInitials(name) {
    const names = name.split(' ');
    const firstNameInitial = names[0].charAt(0).toUpperCase();
    const lastNameInitial = names.length > 1 ? names[names.length - 1].charAt(0).toUpperCase() : '';
    return firstNameInitial + lastNameInitial;
}


/**
 * Displays the contact with the given ID.
 *
 * @param {number} id - The ID of the contact to display.
 * @return {Promise<void>} A promise that resolves when the contact is displayed.
 */
async function displayContact(id) {
    const contact = contacts.find(contact => contact.id === id);
    if (contact) {
        const contactDetailsContainer = document.getElementById('contact-displayed');
        contactDetailsContainer.innerHTML = displayContactHtml(contact);
        if (window.innerWidth <= 768) {
            openMobileContact();
        } else {
            selectedContact(id);
            slideContact(contactDetailsContainer);
        }
    }
}


/**
 * Sets the display style of the main container element to 'flex' to open the mobile contact view.
 *
 * @return {void} This function does not return anything.
 */
function openMobileContact() {
    document.getElementById('main-container').style.display = 'flex';
}


/**
 * Sets the display style of the main container element to 'none' to close the mobile contact view.
 *
 * @return {void} This function does not return anything.
 */
function closeMobileContact() {
    document.getElementById('main-container').style.display = 'none';
}


/**
 * Slides the toast message in and out of view.
 *
 * @return {void} This function does not return anything.
 */
function slideToastMsg() {
    let container = document.getElementById('toast-msg')
    setTimeout(() => {
        container.classList.remove('toast-msg-slide-out');
        container.classList.add('toast-msg-slide-in');
    }, 500);
    setTimeout(() => {
        container.classList.remove('toast-msg-slide-in');
        container.classList.add('toast-msg-slide-out');
    }, 2000);

}


/**
 * Asynchronously adds a new contact to the database and updates the UI after successful addition.
 *
 * @return {Promise<void>} A Promise that resolves when the contact is successfully added and the UI is updated.
 *                       
 * @throws {Error} If an error occurs during the process of creating a new contact or saving it to the database.
 */
async function addContact() {
  
        const newContact = await createNewContact();
        await saveContactToDatabase(newContact);
        await updateUIAfterAddingContact(newContact);
    
}


/**
 * Creates a new contact object with the provided name, email, and phone.
 *
 * @return {object} The newly created contact object containing id, name, email, phone, color, and initials.
 */
async function createNewContact() {
    const name = document.getElementById('new-name').value;
    const email = document.getElementById('new-email').value;
    const phone = document.getElementById('new-phone').value;
    const initials = createUserInitials(name);
    highestId += 1;
    
    return {
        id: highestId,
        name: name,
        email: email,
        phone: phone,
        color: randomColors(),
        initials: initials,
    };
}


/**
 * Saves a new contact to the database.
 *
 * @param {object} newContact - The new contact to be saved.
 * @return {Promise<void>} A Promise that resolves after the contact is successfully saved.
 */
async function saveContactToDatabase(newContact) {
    contacts.push(newContact);
    await updateDataBase(contacts, 'contacts');
}


/**
 * Updates the UI after adding a new contact.
 *
 * @param {object} newContact - The new contact to be added.
 * @return {Promise<void>} A Promise that resolves after updating the UI.
 */
async function updateUIAfterAddingContact(newContact) {
    await renderContacts();
    await displayContact(newContact.id);
    closePopUpWindow('add-contact', 'modal', 'pop-up-open', 'pop-up-close');
    scrollToContact(newContact.id);
    slideToastMsg();
}


/**
 * Updates the database with the given array and array name.
 *
 * @param {Array} array - The array to be updated in the database.
 * @param {string} arrayName - The name of the array in the database.
 * @return {Promise<void>} A Promise that resolves when the database update is complete.
 */
async function updateDataBase(array, arrayName) {
    await fetch(`${BASE_URL}/${arrayName}.json`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(array)
    }); 
}


/**
 * Edits a contact by finding the contact with the given ID, populating the edit contact container with the contact's details, opening the edit contact pop-up window, and adding input event listeners.
 *
 * @param {number} id - The ID of the contact to edit.
 * @return {void} This function does not return anything.
 */
function editContact(id) {
    const contact = contacts.find(contact => contact.id === id);
    if (!contact) return;
    const editContactContainer = document.getElementById('edit-contact');
    editContactContainer.innerHTML = editContactHtml(contact);
    openPopUpWindow('edit-contact', 'modal', 'pop-up-open', 'pop-up-close');
    addInputEventListeners()
}


/**
 * Updates a contact in the database with the given ID.
 *
 * @param {number} id - The ID of the contact to update.
 * @return {Promise<void>} A Promise that resolves when the contact is successfully updated.
 */
async function updateContact(id) {
        const updatedValues = getUpdatedContactValues();
        if (!updatedValues) return;
        updateContactLocally(id, updatedValues);
        await updateDataBase(contacts, 'contacts');
        await renderContacts();
        await displayContact(id);
        closePopUpWindow('edit-contact', 'modal', 'pop-up-open', 'pop-up-close');
  
}


/**
 * Retrieves the updated values of a contact from the HTML form.
 *
 * @return {Object} An object containing the updated values of the contact, including the name, email, phone, and initials.
 */
function getUpdatedContactValues() {
    const name = document.getElementById('edit-name').value;
    const email = document.getElementById('edit-email').value;
    const phone = document.getElementById('edit-phone').value;
    const initials = createUserInitials(name);
    return { name, email, phone, initials };
}


/**
 * Updates the contact locally based on the provided id and new contact details.
 *
 * @param {type} id - Description of the id parameter
 * @param {type} name - Description of the name parameter
 * @param {type} email - Description of the email parameter
 * @param {type} phone - Description of the phone parameter
 * @param {type} initials - Description of the initials parameter
 * @return {type} Description of the return value
 */
function updateContactLocally(id, { name, email, phone, initials }) {
    const contact = contacts.find(contact => contact.id === id);
    if (contact) {
        contact.name = name;
        contact.email = email;
        contact.phone = phone;
        contact.initials = initials;
    }
}

