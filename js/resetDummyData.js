
const dummyUsers = {
	"0": {
		"name": "Anton Mayer",
		"email": "antom@gmail.com",
		"phone": "+49 1111 11 111 1",
		"password": "1234",
		"color": "#FF70AA",
	},

	"1": {
		"name": "Tatjana Wolf",
		"email": "wolf@gmail.com",
		"phone": "+49 2222 222 22 2",
		"password": "1234",
		"color": "#FFC700",
	},

	"2": {
		"name": "Benedikt Ziegler",
		"email": "benedikt@gmail.com",
		"phone": "+49 3333 333 33 3",
		"password": "1234",
		"color": "#6E52FF",
	},

	"3": {
		"name": "David Eisenberg",
		"email": "davidberg@gmail.com",
		"phone": "+49 4444 444 44 4",
		"password": "1234",
		"color": "#FC71FF",
	},

	"4": {
		"name": "Eva Fischer",
		"email": "eva@gmail.com",
		"phone": "+49 5555 555 55 5",
		"password": "1234",
		"color": "#FFBB2B",
	},

	"5": {
		"name": "Emmanuel Mauer",
		"email": "emmanuelma@gmail.com",
		"phone": "+49 6666 666 66 6",
		"password": "1234",
		"color": "#1FD7C1",
	},

	"6": {
		"name": "Marcel Bauer",
		"email": "bauer@gmail.com",
		"phone": "+49 7777 777 77 7",
		"password": "1234",
		"color": "#462F8A",
	},

	"7": {
		"name": "Sofia Müller",
		"email": "sofia@gmail.com",
		"phone": "+49 8888 888 88 8",
		"password": "1234",
		"color": "#00BEE8",
	},

	"8": {
		"name": "Anja Schulz",
		"email": "schulz@gmail.com",
		"phone": "+49 9999 999 99 9",
		"password": "1234",
		"color": "#9327FF",
	},

};


const dummyTasks = {
	"0": {
		"title": "Kochwelt Page & Recipe Recommender",
		"description": "Build start page with recipe recommendation.",
		"category": "User Story",
		"status": "toDo",
		"dueDate": "2024-07-31",
		"priority": "medium",
		"subTasks": [
			{
				"id": "0",
				"content": "Implement Recipe Recommendation",
				"completet": true,
			},
			{
				"id": "1",
				"content": "Start Page Layout",
				"completet": false,
			},
		],
		"assignedTo": ["0", "5", "6"],
	},

	"1": {
		"title": "CSS Architecture Planning",
		"description": "Define CSS naming conventions and structure",
		"category": "Technical Tasks",
		"status": "inProgress",
		"dueDate": "2024-07-31",
		"priority": "urgent",
		"subTasks": [
			{
				"id": "0",
				"content": "Establish CSS Methodology",
				"completet": true,
			},
			{
				"id": "1",
				"content": "Setup Base Styles",
				"completet": true,
			},
		],

		"assignedTo": ["2", "7"],
	},

	"2": {
		"title": "HTML Base Template Creation",
		"description": "Create reusable HTML base templates",
		"category": "Technical Tasks",
		"status": "awaitingFeedback",
		"dueDate": "2024-07-31",
		"priority": "low",
		"subTasks": [],
		"assignedTo": ["2", "3", "8"],
	},

	"3": {
		"title": "Daily Kochwelt Recipe",
		"description": "Implement daily recipe and portion calculator",
		"category": "User Story",
		"status": "awaitingFeedback",
		"dueDate": "2024-07-31",
		"priority": "medium",
		"subTasks": [],
		"assignedTo": ["1", "4", "8"],
	},

	"4": {
		"title": "Contact Form & Imprint",
		"description": "Create a contac form and imprint page",
		"category": "User Story",
		"status": "toDo",
		"dueDate": "2024-07-31",
		"priority": "medium",
		"subTasks": [
			{
				"id": "0",
				"content": "Create contact form",
				"completet": false,
			},
			{
				"id": "1",
				"content": "set up imprint page",
				"completet": false,
			},
		],
		"assignedTo": ["3", "4", "8"],
	},
};


const dummyContacts = removePasswordFromUsers(dummyUsers);


/**
 * Removes the password property from the user object and returns the resulting object.
 * This function is used to prevent the password from being stored in the database.
 * @param {object} user - The user object to have its password removed.
 * @returns {object} A new object with all properties of the user object except for the password property.
 */
function removePasswordProperty(user) {
	const { password, ...rest } = user;
	return rest;
}


/**
 * Creates a new object with the same keys as the provided users object, but removes the password property from each user.
 * 
 * @param {Object} users - The object containing user data.
 * @returns {Object} A new object containing the same user data, but without passwords.
 */
function removePasswordFromUsers(users) {
	const cleanedUsers = {};
	for (const key in users) {
		cleanedUsers[key] = removePasswordProperty(users[key]);
	}
	return cleanedUsers;
}


/**
 * Resets the Firebase database to initial dummy data for tasks, users, and contacts.
*
* @async
* @function resetDatabase
 * @returns {Promise<void>} Resolves when all dummy data has been uploaded.
 */
async function resetDatabase() {
	await putData("/tasks", dummyTasks);
	await putData("/users", dummyUsers);
	await putData("/contacts", dummyContacts);
}



