"use strict";
const BASE_URL = "https://join-database-6441e-default-rtdb.europe-west1.firebasedatabase.app/";


/**
 * 
 * Initializes-function for summary.html 
 * - setting up the necessary event listeners.
 * 
*/
function init() {
    includeHTML();
}


/**
 * Updates the href-attribut of the link-tag in summary-html based on the user's preferred color scheme
 * to access and show dirfferent machting favicon
 * 
 * IMPORTANT: Working on firefox and edge, maybe working on Chrome (Devtools -> Rendering -> emulate prefered color scheme)
 * 
 */
function updateFavicon() {
    favicon.href = './assets/img/favicon/logo_white.png';
    const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    favicon.href = isDarkMode ? './assets/img/favicon/logo_white.png' : './assets/img/favicon/logo_black.png';
}


/**
 * Adds event listeners for the summary.html. 
 * - update href on change of preferred color scheme
 * 
 */
document.addEventListener('DOMContentLoaded', () => {
    updateFavicon();
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateFavicon);
});


/**
 * Asynchronously loads HTML content into elements with a specified attribute.
 * 
 * This function searches for all elements with the attribute `w3-include-html`,
 * fetches the HTML content from the URL specified by the attribute value and 
 * inserts the content into the element. 
 * If the fetch operation fails, it inserts a "Page not found" message into the element.
 *
 * @async
 * @function includeHTML
 * @returns {Promise<void>} A promise that resolves when all HTML content is loaded and inserted.
 * 
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
 * Default user object template.
 * 
 * Represents a default user object with empty fields.
 * 
 * @constant
 * @type {object}
 */
const defaultUser = {
    name: '',
    email: '',
    id: '',
    color: '',
    initials: '',
    password: '',
};


/**
 * Loads the current user object from session storage.
 * 
 * Retrieves the current user object from session storage,
 * parses it from JSON format, and returns it. If no user
 * object is found in session storage, returns a default user.
 * 
 * @function loadCurrentUser
 * @returns {object} The current user object loaded from session storage,
 *                   or a default user object if not found.
 */
function loadCurrentUser() {
    const user = sessionStorage.getItem('currentUser');
    return user ? JSON.parse(user) : defaultUser;
}


let currentUser = loadCurrentUser();


/**
 * Checks for the presence and validity of the current user in session storage.
 * 
 * Retrieves the user object from session storage and attempts to parse it from JSON.
 * Logs a warning if no user object is found in session storage and returns false.
 * Logs an error if JSON parsing fails and returns false.
 * 
 * @function checkForCurrentUser
 * @returns {boolean} True if a valid user object exists in session storage, otherwise false.
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
 * Redirects the browser to the login page.
 * 
 * This function changes the current location of the browser to 'login.html', effectively
 * navigating the user to the login page.
 *
 * @function redirectToLogin
 * @returns {void} This function does not return a value.
 */
function redirectToLogin() {
    window.location.href = 'login.html';
}


/**
 * Redirects the browser to the summary page.
 * 
 * This function changes the current location of the browser to 'summary.html', effectively
 * navigating the user to the summary page.
 *
 * @function redirectToSummary
 * @returns {void} This function does not return a value.
 */
function redirectToSummary() {
    window.location.href = 'summary.html';
}


/**
 * Loads data asynchronously from a specified path using fetch.
 * 
 * @async
 * @function loadData
 * @param {string} [path=""] - The path to fetch data from.
 * @returns {Promise<any>} A promise that resolves with the fetched data as a JSON object.
 */
async function loadData(path="") {
	let response = await fetch(BASE_URL + path + ".json");
	let responseToJson = await response.json();
	return responseToJson;
}


/**
 * Sends a PUT request to update data at a specified path using fetch.
 * 
 * @async
 * @function putData
 * @param {string} [path=""] - The path to send the PUT request to.
 * @param {object} [data={}] - The data to be updated, provided as an object.
 * @returns {Promise<any>} A promise that resolves with the JSON response data.
 */
async function putData(path="", data={}) {
	let response = await fetch(BASE_URL + path + ".json", {
		method: "PUT",
		header: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(data),
	});
	let responseToJson = await response.json();
	return responseToJson;
}


/**
 * Checks the orientation of the window and displays a warning if in landscape mode on small screens.
 * 
 * Retrieves the warning element by its ID ('landscapeWarning'). If the window width is less than 933 pixels,
 * it checks if the window height is less than the window width to determine landscape orientation.
 * If in landscape orientation, adds the 'visible' class to the warning element; otherwise, removes it.
 * If the window width is 933 pixels or more, hides the warning by removing the 'visible' class.
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
 * Adds event listeners for DOMContentLoaded, window load, and window resize events to invoke checkOrientation function.
 * 
 * Attaches event listeners to the document and window objects:
 * - DOMContentLoaded: Ensures the initial HTML document has been completely loaded and parsed.
 * - load: Fires when the whole page has loaded, including all dependent resources.
 * - resize: Fires when the window size changes.
 * Each event listener calls the checkOrientation function to handle orientation changes and display warnings accordingly.
 */
document.addEventListener('DOMContentLoaded', function() {
    window.addEventListener('load', checkOrientation);
    window.addEventListener('resize', checkOrientation);
});


