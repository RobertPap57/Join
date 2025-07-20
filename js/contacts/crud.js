/**
 * Contact CRUD operations and data management
 * Handles adding, editing, updating, and deleting contacts
 */

/**
 * Adds a new contact to the list of contacts by creating a new contact object, saving the contact to the database, and updating the UI after adding the contact.
 * @return {Promise<void>} A promise that resolves when the contact is successfully added.
 */
async function addContact() {
    const newContact = createNewContactObject();
    await saveContactToDatabase(newContact);
    await updateUIAfterAddingContact(newContact);
}

/**
 * Creates a new contact object with the provided name, email, and phone.
 * @return {object} The newly created contact object containing id, name, email, phone, color, and initials.
 */
function createNewContactObject() {
    const name = document.getElementById('new-name').value;
    const email = document.getElementById('new-email').value;
    const phone = document.getElementById('new-phone').value;

    return {
        name: name,
        email: email,
        phone: phone,
        color: getRandomColor(),
    };
}

/**
 * Saves a new contact to the database.
 * @param {object} newContact - The new contact to be saved.
 * @return {Promise<void>} A Promise that resolves after the contact is successfully saved.
 */
async function saveContactToDatabase(newContact) {
    await addData('contacts', newContact);
    contacts.push(newContact);
}

/**
 * Updates the UI after adding a new contact.
 * @param {object} newContact - The new contact to be added.
 * @return {Promise<void>} A Promise that resolves after updating the UI.
 */
async function updateUIAfterAddingContact(newContact) {
    renderContacts();
    displayContact(newContact.id);
    closePopUpWindow('add-contact', 'modal', 'pop-up-open', 'pop-up-close');
    scrollToContact(newContact.id);
    slideToastMsg();
}

/**
 * Edits a contact by finding the contact with the given ID, populating the edit contact container with the contact's details, opening the edit contact pop-up window, and adding input event listeners.
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
 * Updates a contact by finding the contact with the given ID, updating the contact's information locally and in the database, rendering the updated contact in the UI, and closing the edit contact pop-up window.
 * @param {number} id - The ID of the contact to update.
 * @return {Promise<void>} A Promise that resolves after updating the contact.
 */
async function updateContact(id) {
    const updatedValues = getUpdatedContactValues();
    if (!updatedValues) return;
    updateContactLocally(id, updatedValues);
    await updateData("contacts", id, updatedValues);
    renderContacts();
    displayContact(id);
    closePopUpWindow('edit-contact', 'modal', 'pop-up-open', 'pop-up-close');
}

/**
 * Retrieves the updated values of a contact from the edit contact pop-up window form.
 * @return {Object} An object containing the updated values of the contact.
 */
function getUpdatedContactValues() {
    const name = document.getElementById('edit-name').value;
    const email = document.getElementById('edit-email').value;
    const phone = document.getElementById('edit-phone').value;
    return { name, email, phone };
}

/**
 * Updates the contact information locally in the contacts array by matching the given ID and modifying the contact's name, email, and phone properties.
 * @param {number} id - The ID of the contact to be updated.
 * @param {Object} updatedValues - An object containing the updated contact values.
 * @param {string} updatedValues.name - The updated name of the contact.
 * @param {string} updatedValues.email - The updated email of the contact.
 * @param {string} updatedValues.phone - The updated phone number of the contact.
 * @return {void} This function does not return anything.
 */
function updateContactLocally(id, { name, email, phone }) {
    const contact = contacts.find(contact => contact.id === id);
    if (contact) {
        contact.name = name;
        contact.email = email;
        contact.phone = phone;
    }
}

/**
 * Deletes a contact by ID from the contacts array and database, then updates the UI.
 * @param {number} id - The ID of the contact to delete.
 * @return {Promise<void>}
 */
async function deleteContact(id) {
    contacts = contacts.filter(contact => contact.id !== id);
    const container = document.getElementById('contact-displayed');
    await hideContactDisplay(container);
    closePopUpWindow('edit-contact', 'modal', 'pop-up-open', 'pop-up-close');
    await deleteData("contacts", id);
    renderContacts();
}