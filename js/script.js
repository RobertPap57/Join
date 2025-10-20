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


/** Initializes the index page by redirecting to summary if logged in, otherwise to login. */
function initIndex() {
	checkForCurrentUser() ? redirectTo('pages/summary.html') : redirectTo('pages/login.html');
}


/** Updates the favicon based on the user's system color scheme (light or dark). */
function updateFavicon() {
	favicon.href = '../assets/images/logos/logo-black.svg';
	const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
	favicon.href = isDarkMode ? '../assets/images/logos/logo-white.svg' : '../assets/images/logos/logo-black.svg';
}


/**
 * Loads and injects HTML into elements with the `w3-include-html` attribute for shared components.
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
 * Loads the current user from sessionStorage or returns a default user object.
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


/** Redirects the browser to the last visited page. */
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


/** Toggles the "portrait-warning" overlay on mobile/tablet devices in landscape mode. */
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
 * Creates uppercase initials from a given name (e.g., "John Doe" → "JD"), removing "(You)" if present.
 * @param {string} name - The full name to convert.
 * @returns {string} The uppercase initials.
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
 * Sends data to the specified path using a PUT request.
 * @param {string} [path=""] - The endpoint path.
 * @param {Object} [data={}] - The data to send as JSON.
 * @returns {Promise<void>} Resolves when the request completes.
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
* Attaches an event listener to an element only once, preventing duplicate bindings using a unique key in the element's dataset.
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
 * Prevents Enter key from submitting forms, except in textareas.
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


/** Displays the loader overlay. */
function showLoader() {
	const loader = document.getElementById('loader-overlay');
	if (loader) loader.style.display = 'flex';
}


/** Hides the loader overlay with a fade-out delay. */
function hideLoader() {
	const loader = document.getElementById('loader-overlay');
	if (loader) {
		setTimeout(() => {
			loader.classList.add('hidden');
			setTimeout(() => {
				loader.style.display = 'none';
			}, 700);
		}, 500);
	}
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
document.addEventListener('DOMContentLoaded', () => {
	updateFavicon();
	window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateFavicon);
});
window.addEventListener('resize', checkScreenOrientation);
window.addEventListener("orientationchange", checkScreenOrientation);