const BASE_URL = "https://join-database-6441e-default-rtdb.europe-west1.firebasedatabase.app/";

let users = [];
let contacts = [];
let tasks = [];
let currentUser = loadCurrentUser();
let isTabbing = false;


/**
 * Fetches the users from the database and assigns them to the global users variable.
 * @returns {Promise<void>} Resolves when the users are fetched and assigned to the global variable.
 */
async function getUsers() {
	users = await getData("/users");
}


/**
 * Fetches the tasks from the database and assigns them to the global tasks variable.
 * @returns {Promise<void>} Resolves when the tasks are fetched and assigned to the global variable.
 */
async function getTasks() {
	tasks = await getData("/tasks");
}


/**
 * Fetches the contacts from the database and assigns them to the global contacts variable.
 * @returns {Promise<void>} Resolves when the contacts are fetched and assigned to the global variable.
 */
async function getContacts() {
	contacts = await getData("/contacts");
}


/**
 * Initializes the index page by checking for a logged-in user.
 * Redirects to the summary page if a user exists, otherwise to the login page.
 */
function initIndex() {
	checkForCurrentUser() ? redirectTo('pages/summary.html') : redirectTo('pages/login.html');
}


/**
 * Updates the favicon based on the user's system color scheme (light or dark).
 */
function updateFavicon() {
	favicon.href = '../assets/images/logos/logo-black.svg';
	const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
	favicon.href = isDarkMode ? '../assets/images/logos/logo-white.svg' : '../assets/images/logos/logo-black.svg';
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
		return false;
	}
	try {
		const userJSON = JSON.parse(userString);
		return true;
	} catch (error) {
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
 * Determines if the current device is a mobile or tablet.
 * @returns {boolean} True if the device is a mobile or tablet, otherwise false.
 */
function isMobileOrTablet() {
	const ua = navigator.userAgent;
	const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
	const isSmallScreen = Math.min(window.screen.width, window.screen.height) <= 1024;
	const isMobileOS = /Mobi|Android|iPhone|iPad|iPod/i.test(ua);
	return isTouchDevice && (isMobileOS || isSmallScreen);
}


/**
 * Checks if the current window orientation is landscape.
 * @returns {boolean} True if the orientation is landscape, otherwise false.
 */
function isLandscape() {
	return window.matchMedia("(orientation: landscape)").matches;
}


/**
 * Shows or hides the "portrait-warning" overlay based on device type and screen orientation.
 * Displays the overlay if on a mobile/tablet device in landscape mode.
 */
function checkScreenOrientation() {
	const overlay = document.getElementById("landscape-warning");
	if (!overlay) return;
	if (isMobileOrTablet() && isLandscape()) {
		overlay.classList.remove("d-none");
	} else {
		overlay.classList.add("d-none");
	}
}



/**
 * Generates a unique identifier string based on the current timestamp and a random component.
 * @returns {string} A unique ID string.
*/
function createUniqueId() {
	return Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
}


/**
 * Capitalizes the first letter of the given string and converts the rest to lowercase.
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
				userAvatar.innerHTML = `<img src="${user.image}" alt="${user.name}">`;
			} if (user.name && !user.image) {
				userAvatar.innerHTML = createNameInitials(user.name);
				userAvatar.style.backgroundColor = user.color
				userAvatar.ariaLabel = user.name;
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


/**
 * Attaches an event listener to an element only once for a specific event and handler.
 * Ensures the same handler is not bound multiple times by using a unique key stored in the element's dataset.
*
* @param {HTMLElement} element - The DOM element to bind the event listener to.
* @param {string} event - The event type to listen for (e.g., 'click', 'mouseover').
* @param {Function} handler - The event handler function to execute when the event occurs.
* @param {string} boundKey - A unique key to identify this binding in the element's dataset.
*/
function bindEventListenerOnce(element, event, handler, boundKey) {
	element._boundEvents = element._boundEvents || {};
	const key = `${event}_${boundKey}`;
	if (element._boundEvents[key]) return;
	element._boundEvents[key] = true;
	element.addEventListener(event, handler);
}


/**
 * Prevents form submission when the Enter key is pressed inside any input field,
 * except for textarea elements, for all forms on the page.
 * Attaches a keydown event listener to each form element.
 */
function preventFormSubmitOnEnter() {
	document.querySelectorAll("form").forEach((form) => {
		form.addEventListener("keydown", (e) => {
			if (e.key === "Enter" && e.target.tagName !== "TEXTAREA") {
				e.preventDefault();
				e.stopPropagation();
				e.target.dispatchEvent(new MouseEvent("click", {
					bubbles: false,
					cancelable: true,
					view: window
				}));
			}
		});
	});
}


window.addEventListener('keydown', e => {
	if (e.key === 'Tab') {
		document.body.classList.add('user-is-tabbing');
		isTabbing = true;
	}
});


window.addEventListener('mousedown', () => {
	if (isTabbing) {
		document.body.classList.remove('user-is-tabbing');
		isTabbing = false;
	}
});


window.addEventListener('resize', checkScreenOrientation);
window.addEventListener("orientationchange", checkScreenOrientation);