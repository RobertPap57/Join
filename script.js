const BASE_URL = "https://join-database-6441e-default-rtdb.europe-west1.firebasedatabase.app/";

let users = [];
let contacts = [];
let tasks = [];
let currentUser = loadCurrentUser();


/**
 * Fetches the users from the database and assigns them to the global users variable.
 *
 * @async
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
* @returns {Promise<void>} Resolves when the contacts are fetched and assigned to the global variable.
*/
async function getContacts() {
	contacts = await getData("/contacts");
	console.log(contacts);
}



/**
 * Initializes the index page by checking for a logged-in user.
 * Redirects to the summary page if a user exists, otherwise to the login page.
*/
function initIndex() {
	checkForCurrentUser() ? redirectTo('summary.html') : redirectTo('login.html');
}



/**
 * Updates the favicon based on the user's system color scheme (light or dark).
*/
function updateFavicon() {
	favicon.href = 'assets/images/logos/logo-black.svg';
	const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
	favicon.href = isDarkMode ? 'assets/images/logos/logo-white.svg' : 'assets/images/logos/logo-black.svg';
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
* @returns {Object} The current user object or a default fallback user object.
*/
function loadCurrentUser() {
	const defaultUser = {
		name: '',
		email: '',
		id: '',
		color: '',
		password: '',
	};
	const user = sessionStorage.getItem('currentUser');
	return user ? JSON.parse(user) : defaultUser;
}


/**
 * Checks if a valid current user is stored in sessionStorage.
*
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
 * @param {string} page - The path or filename of the page to redirect to.
*/
function redirectTo(page) {
	window.location.href = page;
}

/**
 * Hides the help icon element.
 */
function hideHelpIcon() {
	document.getElementById('hide-help-icon').classList.add('d-none');
}


/**
 * Redirects the browser to the last visited page.
 * 
 * This function changes the current location of the browser
 *
 */
function goBack() {
	window.history.back();
}


/**
 * Checks the screen orientation and toggles a warning element if in landscape on small screens.
*/
function checkOrientation() {
	const warning = document.getElementById('landscape-warning');
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
	window.addEventListener('resize', checkOrientation);
});



/**
 * Creates a string of initials from a name string.
 * 
 * The function takes a string of a user's name and returns a string of their
 * initials. The returned string is made up of the first letter of the first
 * name, followed by the first letter of the last name if it exists.
 * @param {string} name - The user's name as a string.
 * @return {string} The user's initials as a string.
 */
function createNameInitials(name) {
	const cleanName = name.replace(/\s*\(You\)$/, '').trim();
	const names = cleanName.split(' ');
	const firstNameInitial = names[0].charAt(0).toUpperCase();
	const lastNameInitial = names.length > 1 ? names[names.length - 1].charAt(0).toUpperCase() : '';
	return firstNameInitial + lastNameInitial;
}

/**
 * Generates a random hexadecimal color code.
*
* @return {string} A random hexadecimal color code.
*/
function getRandomColor() {
	const letters = '0123456789ABCDEF';
	let color = '#';
	for (let i = 0; i < 6; i++) {
		color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
}



/**
 * Filters out any null or non-object values from the provided data object.
 *
 * @param {object} data - The object from which to filter null or non-object values.
 * @return {array} An array of key-value pairs where the value is an object.
 */
function filterNullObjects(data) {
	return Object.entries(data)
		.filter(([_, obj]) => obj && typeof obj === 'object');
}


/**
 * Adds an 'id' property to each object in the array of entries returned by
 * filterNullObjects.
 *
 * @param {Array} entries - The array of key-value pairs from filterNullObjects.
 * @returns {Array} The array of objects with an 'id' property added to each.
 */

function putIdInObject(entries) {
	return entries.map(([id, obj]) => ({ id, ...obj }));
}


/**
 * Fetches data from the database and returns it as an array of objects with IDs.
 *
 * @async
 * @param {string} path - The database path from which to fetch data.
 * @returns {Promise<Array<Object>>} An array of data objects, each with an `id` property. Returns an empty array if no data is found or an error occurs.
 */
async function getData(path = "") {
	try {
		const response = await fetch(BASE_URL + path + ".json");
		const data = await response.json();
		if (!data) return [];
		return putIdInObject(filterNullObjects(data));

	} catch (error) {
		console.error(error);
		return [];
	}
}


/**
 * Sends a POST request to add new data to the database.
*
* @async
* @param {string} path - The database path where the data should be stored.
* @param {Object} data - The data object to be stored.
* @returns {Promise<Object|null>} The saved data object with the generated `id` property, or `null` if an error occurs.
 */
async function addData(path = "", data = {}) {
	try {
		const response = await fetch(BASE_URL + path + ".json", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(data),
		});
		if (!response.ok) {
			throw new Error("Network response was not ok");
		}
		const responseToJson = await response.json();
		data.id = responseToJson.name;
		return data;
	} catch (error) {
		console.error(error);
		return null;
	}
}


/**
 * Updates specific data at a given path and ID in the database using PATCH.
 *
 * @async
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


/**
 * Overwrites data at the specified Firebase path using HTTP PUT.
 * This is typically used to reset or replace entire collections with dummy data.
 *
 * @async
 * @function putData
 * @param {string} path - The Firebase path (e.g., "/users").
 * @param {Object|Array} data - The data to store at the specified path.
 * @returns {Promise<void>} Resolves when the operation completes and logs the response.
 */
async function putData(path = "", data = {}) {
	await fetch(BASE_URL + path + ".json", {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(data),
	});

}