const BASE_URL = "https://join-database-6441e-default-rtdb.europe-west1.firebasedatabase.app/";

let users = [];
let contacts = [];
let tasks = [];
let currentUser = loadCurrentUser();


/**
 * Fetches the users from the database and assigns them to the global users variable.
 *
 * @async
 * @function getUsers
 * @returns {Promise<void>} Resolves when the users are fetched and assigned to the global variable.
 */
async function getUsers() {
	users = await getData("/users");
	console.log(users);
	
}

/**
 * Fetches the tasks from the database and assigns them to the global tasks variable.
 *
 * @async
 * @function getTasks
 * @returns {Promise<void>} Resolves when the tasks are fetched and assigned to the global variable.
 */

async function getTasks() {
	tasks = await getData("/tasks");
	console.log(tasks);
}

/**
 * Fetches the contacts from the database and assigns them to the global contacts variable.
*
* @async
* @function getContacts
* @returns {Promise<void>} Resolves when the contacts are fetched and assigned to the global variable.
*/
async function getContacts() {
	contacts = await getData("/contacts");
	console.log(contacts);
}


/**
 * Creates initials from a given name.
 *
 * Splits the provided name into words and generates initials by taking the first letter of the first and last words.
 * If the name consists of only one word, only the initial of that word is returned.
 * @function createNameInitials
 * @param {string} name - The full name from which to create initials.
 * @returns {string} The concatenated initials from the first and last words in uppercase.
 */

function createNameInitials(name) {
	const names = name.split(' ');
	const firstNameInitial = names[0].charAt(0).toUpperCase();
	const lastNameInitial = names.length > 1 ? names[names.length - 1].charAt(0).toUpperCase() : '';
	return firstNameInitial + lastNameInitial;
}

/**
 * Initializes the index page by checking for a logged-in user.
 * Redirects to the summary page if a user exists, otherwise to the login page.
 *
 * @function initIndex
 */
function initIndex() {
	checkForCurrentUser() ? redirectTo('summary.html') : redirectTo('login.html');
}



/**
 * Updates the favicon based on the user's system color scheme (light or dark).
 *
 * @function updateFavicon
 */
function updateFavicon() {
	favicon.href = './assets/img/favicon/logo_white.png';
	const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
	favicon.href = isDarkMode ? './assets/img/favicon/logo_white.png' : './assets/img/favicon/logo_black.png';
}


/**
 * Adds event listeners after the DOM content is fully loaded.
 * Updates the favicon immediately and when the color scheme changes.
 */
document.addEventListener('DOMContentLoaded', () => {
	updateFavicon();
	window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateFavicon);
});


/**
 * Dynamically loads and injects HTML content into elements with the `w3-include-html` attribute.
 * Used for including shared HTML components like headers or sidebars.
 *
 * @async
 * @function includeHTML
 * @returns {Promise<void>} Resolves after all HTML includes are processed.
 */
async function includeHTML() {
	let includeElements = document.querySelectorAll("[w3-include-html]");
	for (let i = 0; i < includeElements.length; i++) {
		const element = includeElements[i];
		let file = element.getAttribute("w3-include-html");
		let resp = await fetch(file);
		if (resp.ok) {
			element.innerHTML = await resp.text();
		} else {
			element.innerHTML = "Page not found";
		}
	}
}


/**
 * Loads the current user from sessionStorage.
 * Returns a default user object if no user is found.
 *
 * @function loadCurrentUser
 * @returns {Object} The current user object or a default fallback user object.
 */
function loadCurrentUser() {
	const defaultUser = {
		name: '',
		email: '',
		id: '',
		color: '',
		initials: '',
		password: '',
	};
	const user = sessionStorage.getItem('currentUser');
	return user ? JSON.parse(user) : defaultUser;
}


/**
 * Checks if a valid current user is stored in sessionStorage.
 *
 * @function checkForCurrentUser
 * @returns {boolean} True if a valid user exists, false otherwise.
 */
function checkForCurrentUser() {
	const userString = sessionStorage.getItem('currentUser');
	if (!userString) {
		console.warn('No current user exists - please log in or sign up');
		return false;
	}
	try {
		const userJSON = JSON.parse(userString);
		return true;
	} catch (error) {
		console.error('Error parsing JSON from Session Storage', error);
		return false;
	}
}


/**
 * Redirects the browser to the specified page.
 *
 * @function redirectTo
 * @param {string} page - The path or filename of the page to redirect to.
 */
function redirectTo(page) {
	window.location.href = page;
}


/**
 * Checks the screen orientation and toggles a warning element if in landscape on small screens.
 *
 * @function checkOrientation
 */
function checkOrientation() {
	const warning = document.getElementById('landscapeWarning');
	if ((window.innerWidth) < 933) {
		if (window.innerHeight < window.innerWidth) {
			warning.classList.add('visible');
		} else {
			warning.classList.remove('visible');
		}
	} else {
		warning.classList.remove('visible');
	}
}


/**
 * Adds event listeners to check orientation on window load and resize.
 */
document.addEventListener('DOMContentLoaded', function () {
	window.addEventListener('load', checkOrientation);
	window.addEventListener('resize', checkOrientation);
});


/**
 * Sends a POST request to add new data to the database.
 *
 * @async
 * @function addData
 * @param {string} path - The database path where the data should be stored.
 * @param {Object} data - The data object to be stored.
 * @returns {Promise<Object|null>} The saved data object with the generated `id` property, or `null` if an error occurs.
 */
async function addData(path = "", data = {}) {
	try {
		const response = await fetch(BASE_URL + path + ".json", {
			method: "POST",
			header: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(data),
		});
		if (!response.ok) {
			throw new Error("Network response was not ok");
		}
		const responseToJson = await response.json();
		data.id = responseToJson.name;
		console.log(data);
		return data;
	} catch (error) {
		console.error(error);
		return null;
	}
}


/**
 * Fetches data from the database and returns it as an array of objects with IDs.
 *
 * @async
 * @function getData
 * @param {string} path - The database path from which to fetch data.
 * @returns {Promise<Array<Object>>} An array of data objects, each with an `id` property. Returns an empty array if no data is found or an error occurs.
 */
async function getData(path = "") {
	try {
		const response = await fetch(BASE_URL + path + ".json");
		const data = await response.json();
		if (!data) return [];
		return Object.entries(data).map(([id, obj]) => ({ id, ...obj }));
	} catch (error) {
		console.error(error);
		return [];
	}
}


/**
 * Updates specific data at a given path and ID in the database using PATCH.
 *
 * @async
 * @function updateData
 * @param {string} path - The database path where the data is located.
 * @param {string} id - The unique ID of the data object to update.
 * @param {Object} data - The partial data object with fields to update.
 * @returns {Promise<void>} Resolves when the data is updated, or logs an error.
 */
async function updateData(path = "", id = "", data = {}) {
	try {
		await fetch(BASE_URL + path + "/" + id + ".json", {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(data),
		});
	} catch (error) {
		console.error(error);
	}
}


/**
 * Deletes data from the database at the specified path and ID.
 *
 * @async
 * @function deleteData
 * @param {string} path - The database path where the data is located.
 * @param {string} id - The unique ID of the data object to delete.
 * @returns {Promise<void>} Resolves when the data is deleted, or logs an error.
 */
async function deleteData(path = "", id = "") {
	try {
		await fetch(BASE_URL + path + "/" + id + ".json", {
			method: 'DELETE',
		});
	} catch (error) {
		console.error(error);
	}
}


