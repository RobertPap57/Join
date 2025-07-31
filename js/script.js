/**
 * Main application script with core utilities and database functions
 */

const BASE_URL = "https://join-database-6441e-default-rtdb.europe-west1.firebasedatabase.app/";

let users = [];
let contacts = [];
let tasks = [];
let currentUser = loadCurrentUser();

/**
 * Fetches the users from the database and assigns them to the global users variable.
 * @returns {Promise<void>} Resolves when the users are fetched and assigned to the global variable.
 */
async function getUsers() {
	users = await getData("/users");
	console.log(users);
}

/**
 * Fetches the tasks from the database and assigns them to the global tasks variable.
 * @returns {Promise<void>} Resolves when the tasks are fetched and assigned to the global variable.
 */
async function getTasks() {
	tasks = await getData("/tasks");
	console.log(tasks);
}

/**
 * Fetches the contacts from the database and assigns them to the global contacts variable.
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
	favicon.href = '/assets/images/logos/logo-black.svg';
	const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
	favicon.href = isDarkMode ? '/assets/images/logos/logo-white.svg' : '/assets/images/logos/logo-black.svg';
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
 * Redirects the browser to the last visited page.
 */
function goBack() {
	window.history.back();
}

/**
 * Checks the screen orientation and toggles a warning element if in landscape on small screens.
 */
function checkOrientation() {
	const warning = document.getElementById('landscape-warning');
	if (!warning) return;
	const isSmallScreen = window.innerWidth < 933;
	const isLandscape = window.innerWidth > window.innerHeight;
	if (isSmallScreen && isLandscape) {
		warning.classList.remove('d-none');
	} else {
		warning.classList.add('d-none');
	}
}

/**
 * Adds event listeners to check orientation on window load and resize.
*/
document.addEventListener('DOMContentLoaded', () => {
	checkOrientation();
	window.addEventListener('resize', checkOrientation);
});

/**
 * Generates a unique identifier string based on the current timestamp and a random component.
 *
 * @returns {string} A unique ID string.
 */
function createUniqueId() {
	return Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
}

/**
 * Capitalizes the first letter of the given string and converts the rest to lowercase.
 *
 * @param {string} str - The string to capitalize.
 * @returns {string} The string with the first letter capitalized and the rest in lowercase.
 */
function capitalizeFirstLetter(string) {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

/**
 * Creates a string of initials from a name string.
 * The function takes a string of a user's name and returns a string of their
 * initials. The returned string is made up of the first letter of the first
 * name, followed by the first letter of the last name if it exists.
 * @param {string} name - The user's name as a string.
 * @returns {string} The user's initials as a string.
 */
function createNameInitials(name) {
	const cleanName = name.replace(/\s*\(You\)$/, '').trim();
	const names = cleanName.split(' ');
	const firstNameInitial = names[0].charAt(0).toUpperCase();
	const lastNameInitial = names.length > 1 ? names[names.length - 1].charAt(0).toUpperCase() : '';
	return firstNameInitial + lastNameInitial;
}

/**
 * Returns a random color from a predefined set of hex color codes.
 * @returns {string} A random color hex code from the allowed list.
 */
function getRandomColor() {
	const colors = [
		'#9747FF', '#FF7A00', '#FF5EB3', '#6E52FF',
		'#00BEE8', '#1FD7C1', '#FF745E', '#FFA35E',
		'#FC71FF', '#FFC701', '#0038FF', '#C3FF2B',
		'#FFE62B', '#FF4646', '#FFBB2B'
	];
	const index = Math.floor(Math.random() * colors.length);
	return colors[index];
}

/**
 * Displays a profile avatar for a user in the specified DOM element.
 * @param {Object} user - The user object containing name, image, and color properties.
 * @param {string} userAvatarId - The ID of the DOM element where the avatar should be displayed.
 */
function displayProfileAvatar(user, userAvatarId) {
	const userAvatar = document.getElementById(userAvatarId);
	if (userAvatar) {
		userAvatar.innerHTML = '';
		if (user) {
			if (user && user.image) {
				userAvatar.innerHTML = `<img src="${user.image}" alt="Profile picture">`;
			} if (user.name && !user.image) {
				userAvatar.innerHTML = createNameInitials(user.name);
				userAvatar.style.backgroundColor = user.color
			}
		}
	}
}

/**
 * Fetches data from the database and returns it as an array of objects.
 * @param {string} path - The database path from which to fetch data.
 * @returns {Promise<Array<Object>>} An array of data objects. Returns an empty array if no data is found or an error occurs.
 */
async function getData(path = "") {
	try {
		const response = await fetch(BASE_URL + path + ".json");
		const data = await response.json();
		if (!data) return [];
		return Object.values(data).filter(obj => obj && typeof obj === 'object');
	} catch (error) {
		console.error(error);
		return [];
	}
}

/**
 * Sends a POST request to add new data to the database.
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
		const generatedId = responseToJson.name;
		await updateData(path, generatedId, { id: generatedId });
		return { ...data, id: generatedId };
	} catch (error) {
		console.error(error);
		return null;
	}
}

/**
 * Updates specific data at a given path and ID in the database using PATCH.
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
