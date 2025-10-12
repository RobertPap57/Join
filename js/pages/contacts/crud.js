/**
 * Adds a new contact to the list of contacts by creating a new contact object, saving the contact to the database, and updating the UI after adding the contact.
 * @param {Object} contact - The contact object to be added.
 * @returns {Promise<void>} A promise that resolves when the contact is successfully added.
 */
async function addContact(contact) {
    await saveContactToDatabase(contact);
}


/**
 * Saves a new contact to the database.
 * @param {Object} newContact - The new contact to be saved.
 * @returns {Promise<void>} A Promise that resolves after the contact is successfully saved.
 */
async function saveContactToDatabase(newContact) {
    const contactWithId = await addData('contacts', newContact);
    if (contactWithId) {
        contacts.push(contactWithId);
        updateUIAfterAddingContact(contactWithId)
    } 
}


/**
 * Updates the UI after adding a new contact.
 * @param {Object} newContact - The new contact to be added.
 * @returns {Promise<void>} A Promise that resolves after updating the UI.
 */
async function updateUIAfterAddingContact(newContact) {
    renderContacts();
    closePopup();
    displayContact(newContact.id);
    scrollToContact(newContact.id);
    slideToastMsg();
}


/**
 * Edits a contact by finding the contact with the given ID, populating the edit contact container with the contact's details, opening the edit contact pop-up window, and adding input event listeners.
 * @param {number} id - The ID of the contact to edit.
 */
function editContact(id) {
    const contact = contacts.find(contact => contact.id === id);
    if (!contact) return;
    openPopup('edit-contact', contact);
}


/**
 * Updates a contact by finding the contact with the given ID, updating the contact's information locally and in the database, rendering the updated contact in the UI, and closing the edit contact pop-up window.
 * @param {Object} contact - The contact object to update.
 * @returns {Promise<void>} A Promise that resolves after updating the contact.
 */
async function updateContact(contact) {
    if (!contact) return;
    await updateData("/contacts", contact.id, contact);
    contacts.filter(c => c.id === contact.id).forEach(c => {
        Object.assign(c, contact);
    });
    renderContacts();
    displayContact(contact.id);
    scrollToContact(contact.id);
    closePopup();
}


/**
 * Deletes a contact by ID from the contacts array and database, then updates the UI.
 * @param {number} id - The ID of the contact to delete.
 * @returns {Promise<void>}
 */
async function deleteContact(id) {
    contacts = contacts.filter(contact => contact.id !== id);
    const container = document.getElementById('contact-displayed');
    await hideContactDisplay(container);
    closePopup();
    await deleteData("/contacts", id);
    renderContacts();
}