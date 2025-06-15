"use strict";

currentUser = loadCurrentUser();


/**
 * Initializes the summary page by including HTML content and updating greeting text.
 * 
 * This function initializes the summary page by including HTML content using the includeHTML function
 * and updating the greeting text using the updateGreetingText function, fetching data from realtime database and render the summary.html
 *
 */
async function initSummary() {
  await includeHTML();
  checkForCurrentUser() ? checkForGreeting() : redirectTo('login.html');
  displayProfileIconInitials();
  highlightLink('summary');

  await getDataFromFirebase();
  renderSummary();
}


/**
 * Object mapping image IDs to their corresponding source paths for different states.
 */
const imgIdToSrcMap = {
  summary__toDo: {
    highlight: './assets/img/icons_summary/edit_light.png',
    reset: './assets/img/icons_summary/edit_dark.png'
  },
  summary__done: {
    highlight: './assets/img/icons_summary/done_light.png',
    reset: './assets/img/icons_summary/done_dark.png'
  }
};


/**
 * Checks if the greeting has already been displayed in the session storage.
 * If not, updates the greeting text, sets the greeting animation, and marks
 * the greeting as displayed in the session storage.
 */
const checkForGreeting = () => {
  if (sessionStorage.getItem('greeting')) return;
  updateGreetingText();
  setGreetingAnimation();
  sessionStorage.setItem('greeting', 'true');
};


/**
 * Changes the image source of an element based on a specified state, 
 * if the window width is greater than 992 pixels.
 * 
 * @param {HTMLElement} element - The HTML element whose image source will be changed.
 * @param {string} state - The state to set the image to ('highlight' or 'reset').
 */
const changeIconImage = (element, state) => {
  if (window.innerWidth <= 992) return;
  const img = element.querySelector('img');
  const newSrc = imgIdToSrcMap[img?.id]?.[state];
  if (newSrc) img.src = newSrc;
};


/**
 * Clears the text content of multiple HTML elements.
 * 
 * @param {...HTMLElement} elements - The HTML elements whose text content will be cleared.
 */
const clearElementsText = (...elements) => {
  elements.forEach(element => clearText(element));
};


/**
 * Sets the text content of multiple HTML elements.
 * 
 * Calls functions to set greeting text and current user name for each element.
 * 
 * @param {...HTMLElement} elements - The HTML elements to set the text content.
 */
const setElementsText = (...elements) => {
  elements.forEach(element => {
    setGreetingText(element);
    setCurrentUserName(element);
  });
};


/**
 * Updates greeting text and current user name for desktop and mobile views.
 * 
 * Clears and then sets the greeting text and current user name for both desktop
 * and mobile elements.
 */
const updateGreetingText = () => {
  const userName = document.getElementById('user__name');
  const userNameMobile = document.getElementById('user__name-mobile');
  const greetingText = document.getElementById('greeting__text');
  const greetingTextMobile = document.getElementById('greeting__text-mobile');
  clearText(greetingText);
  clearText(greetingTextMobile);
  clearText(userName);
  clearText(userNameMobile);
  setGreetingText(greetingText);
  setGreetingText(greetingTextMobile);
  setCurrentUserName(userName);
  setCurrentUserName(userNameMobile);
};


/**
 * Checks if the database or specified path within the database is empty.
 * 
 * Asynchronously loads data from the specified path and returns a default
 * value (tasksDummy) if the result is falsy (empty or undefined).
 * 
 * @async
 * @function checkIfDatabaseIsEmpty
 * @param {string} [path=""] - The path within the database to check for data.
 * @returns {Promise<any>} A promise that resolves with the loaded data or tasksDummy if empty.
 */
const checkIfDatabaseIsEmpty = async (path = "") => {
  const result = await loadData(path);
  if (!result) {
    /* console.error("Datenbank bzw. angegebener Pfad innerhalb der Datenbank ist leer"); */
    return tasksDummy;
  }
  return result;
};


/**
 * Sets a greeting animation for mobile devices.
 * 
 * Shows and hides the overlay container to create a brief greeting animation 
 * for mobile devices when the window width is less than 1220 pixels.
 */
function setGreetingAnimation() {
  const containerMobile = document.getElementById('overlay');
  if (window.innerWidth < 1207) {
    containerMobile.classList.remove("d-none");
    setTimeout(function () {
      containerMobile.classList.add("d-none");
    }, 1800);
  }
}


/**
 * Asynchronously loads HTML content into elements with a specified attribute.
 * 
 * This function searches for all elements with the attribute `w3-include-html`,
 * fetches the HTML content from the URL specified by the attribute value and 
 * inserts the content into the element. 
 * If the fetch operation fails, it inserts a "Page not found" message into the element.
 *
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
 * Changes the source image of buttons to a highlighted version.
 * 
 * @param {Element} element - The element containing the button image.
 */
function changeIcon(element) {
  changeIconImage(element, 'highlight');
}


/**
 * Resets the source image of buttons to their original version.
 * 
 * @param {Element} element - The element containing the button image.
 */
function resetIcon(element) {
  changeIconImage(element, 'reset');
}


/**
 * Clears the text content of an HTML element.
 * 
 * @param {HTMLElement} element - The HTML element whose text content will be cleared.
 */
function clearText(element) {
  element.innerText = '';
}


/**
 * Sets the greeting text based on the current time of the day.
 * 
 * @param {HTMLElement} greetingText - The HTML element to set the greeting text into.
 */
function setGreetingText(greetingText) {
  const timesOfDay = {
    morning: "Good morning,",
    afternoon: "Good afternoon,",
    evening: "Good evening,"
  };
  const currentTime = new Date().getHours();
  const greeting = currentTime < 12 ? timesOfDay.morning : (currentTime < 18 ? timesOfDay.afternoon : timesOfDay.evening);
  greetingText.innerText = greeting;
}


/**
 * Capitalizes the first character of a string.
 * 
 * @param {string} string - The string to capitalize the first character of.
 * @returns {string} The string with the first character capitalized.
 */
function capitalizeFirstChar(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}


/**
 * Sets the current user's name in the provided HTML element.
 * 
 * If a currentUser object exists, sets the inner text of the userName element
 * to the capitalized name of the currentUser.
 * 
 * @function setCurrentUserName
 * @param {HTMLElement} userName - The HTML element where the user's name will be displayed.
 * @param {object|null} currentUser - The current user object containing the user's details.
 *                                   Must have a 'name' property.
 */
function setCurrentUserName(userName) {
  if (currentUser) {
    userName.innerText = capitalizeFirstChar(currentUser['name']);
  }
}


/**
 * Retrieves data from Firebase for tasks, users, and contacts.
 * 
 * Asynchronously retrieves data from Firebase for tasks, users, and contacts,
 * ensuring each collection is populated and not empty.
 * 
 */
async function getDataFromFirebase() {
  tasks = await checkIfDatabaseIsEmpty("/tasks");
  users = await checkIfDatabaseIsEmpty("/users");
  contacts = await checkIfDatabaseIsEmpty("/contacts");
}


/**
 * Loads data asynchronously from a specified path using fetch.
 * 
 * @async
 * @function loadData
 * @param {string} [path=""] - The path to fetch data from.
 * @returns {Promise<any>} A promise that resolves with the fetched data as a JSON object.
 */
async function loadData(path = "") {
  let response = await fetch(BASE_URL + path + ".json");
  let responseToJson = await response.json();
  return responseToJson;
}


/**
 * Renders summary data based on task criteria and counts.
 * 
 * Retrieves counts for tasks based on status ('toDo', 'done', 'inProgress', 'awaitingFeedback')
 * and priority ('urgent'), then renders this data to corresponding summary elements.
 * Additionally, renders the total number of tasks and urgent tasks nearest to their due dates.
 * 
 */
function renderSummary() {
  const todo = countTasksByCriteria('status', 'toDo');
  const done = countTasksByCriteria('status', 'done');
  const progress = countTasksByCriteria('status', 'inProgress');
  const awaitingFeedback = countTasksByCriteria('status', 'awaitingFeedback');
  const urgent = countTasksByCriteria('priority', 'urgent');
  const tasksAmount = tasks.length;
  renderDataToSummary("summary__todo", todo);
  renderDataToSummary("summary__done", done);
  renderDataToSummary("summary__progress", progress);
  renderDataToSummary("summary__feedback", awaitingFeedback);
  renderDataToSummary("summary__urgent", urgent);
  renderDataToSummary("summary__tasks", tasksAmount);
  renderUrgentTasksNearestDueDate();
}


/**
 * Counts the number of tasks that match a specified criteria and value.
 * 
 * @function countTasksByCriteria
 * @param {string} criteria - The property of the task object to compare (e.g., 'status', 'priority').
 * @param {string} value - The value to compare against (case insensitive).
 * @returns {number} The count of tasks matching the criteria and value.
 */
function countTasksByCriteria(criteria, value) {
  return tasks.filter(task => task[criteria].toLowerCase() === value.toLowerCase()).length;
}


/**
 * Renders a number to a summary element identified by its ID.
 * 
 * @function renderDataToSummary
 * @param {string} id - The ID of the HTML element to render data into.
 * @param {number} number - The number to render into the element.
 */
function renderDataToSummary(id, number) {
  let element = document.getElementById(id);
  element.innerText = `${number}`;
}


/**
 * Retrieves the most urgent task based on priority and due date.
 * 
 * @function getMostUrgentTask
 * @param {Array<object>} tasks - An array of task objects to search through.
 * @returns {object|null} The most urgent task object or null if no urgent tasks exist.
 */
function getMostUrgentTask(tasks) {
  const urgentTasks = tasks.filter(task => task.priority.toLowerCase() === 'urgent');
  if (urgentTasks.length === 0) {
    return null;
  }
  return urgentTasks.reduce((earliestTask, currentTask) => {
    return new Date(currentTask.dueDate) < new Date(earliestTask.dueDate) ? currentTask : earliestTask;
  });
}


/**
 * Formats a date string into a localized date format.
 * 
 * @function formatDateString
 * @param {string} dateString - The date string to format.
 * @returns {string} The formatted date string in the format 'Month Day, Year' (e.g., 'January 1, 2024').
 */
function formatDateString(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', options);
}


/**
 * Renders the nearest due date of the most urgent task to the summary element.
 * 
 * Retrieves the most urgent task from the tasks array, formats its due date,
 * and renders the formatted date to the summary element with ID 'summary__date'.
 * If no urgent tasks are found, renders 'no urgent tasks' to the summary element
 * and logs a message to the console.
 * 
 * @function renderUrgentTasksNearestDueDate
 */
function renderUrgentTasksNearestDueDate() {
  const mostUrgentTask = getMostUrgentTask(tasks);
  if (mostUrgentTask) {
    const mostUrgentTasksDueDate = formatDateString(mostUrgentTask.dueDate);
    renderDataToSummary("summary__date", mostUrgentTasksDueDate);
  } else {
    renderDataToSummary("summary__date", 'no urgent tasks');
  }
}
