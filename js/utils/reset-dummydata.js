/**
 * This file is only for resetting dummy data in the Firebase database purposes
 */

const dummyContacts = {
	"0": {
		"id": "0",
		"name": "Anton Mayer",
		"email": "antom@gmail.com",
		"phone": "+49 1111 11 111 1",
		"color": "#FF70AA",
		"image": "../assets/images/profile-photos/anton.jpg"
	},

	"1": {
		"name": "Tatjana Wolf",
		"email": "wolf@gmail.com",
		"phone": "+49 2222 222 22 2",
		"id": "1",
		"color": "#FFC700",
		"image": "../assets/images/profile-photos/tatjana.jpg"
	},

	"2": {
		"name": "Benedikt Ziegler",
		"email": "benedikt@gmail.com",
		"phone": "+49 3333 333 33 3",
		"id": "2",
		"color": "#6E52FF",
	},

	"3": {
		"name": "David Eisenberg",
		"email": "davidberg@gmail.com",
		"phone": "+49 4444 444 44 4",
		"id": "3",
		"color": "#FC71FF",
	},

	"4": {
		"name": "Eva Fischer",
		"email": "eva@gmail.com",
		"phone": "+49 5555 555 55 5",
		"id": "4",
		"color": "#FFBB2B",
	},

	"5": {
		"name": "Emmanuel Mauer",
		"email": "emmanuelma@gmail.com",
		"phone": "+49 6666 666 66 6",
		"id": "5",
		"color": "#1FD7C1",
	},

	"6": {
		"name": "Marcel Bauer",
		"email": "bauer@gmail.com",
		"phone": "+49 7777 777 77 7",
		"id": "6",
		"color": "#462F8A",
	},

	"7": {
		"name": "Sofia Müller",
		"email": "sofia@gmail.com",
		"phone": "+49 8888 888 88 8",
		"id": "7",
		"color": "#00BEE8",
		"image": "../assets/images/profile-photos/sofia.jpg"
	},

	"8": {
		"name": "Anja Schulz",
		"email": "schulz@gmail.com",
		"phone": "+49 9999 999 99 9",
		"id": "8",
		"color": "#9327FF",
	},

	"me": {
		"name": "Robert Pap",
		"email": "info@robert-pap.de",
		"phone": "+49 173 5326667",
		"id": "me",
		"color": "#3dcfb6",
		"image": "../assets/images/profile-photos/me.jpg"
	},

};


const dummyTasks = {
	"0": {
		"id": "0",
		"title": "Kochwelt Page & Recipe Recommender",
		"description": "Build start page with recipe recommendation.",
		"category": "User Story",
		"status": "in-progress",
		"dueDate": "2026-07-31",
		"priority": "medium",
		"subtasks": [
			{
				"id": "0",
				"content": "Implement Recipe Recommendation",
				"completed": true,
			},
			{
				"id": "1",
				"content": "Start Page Layout",
				"completed": false,
			},
		],
		"assignedTo": ["0", "5", "6"],
		"timestamp": 1723957140000
	},

	"1": {
		"id": "1",
		"title": "CSS Architecture Planning",
		"description": "Define CSS naming conventions and structure.",
		"category": "Technical Task",
		"status": "done",
		"dueDate": "2026-07-31",
		"priority": "urgent",
		"subtasks": [
			{
				"id": "0",
				"content": "Establish CSS Methodology",
				"completed": true,
			},
			{
				"id": "1",
				"content": "Setup Base Styles",
				"completed": true,
			},
		],
		"assignedTo": ["7", "2"],
		"timestamp": 1723957140000
	},

	"2": {
		"id": "2",
		"title": "HTML Base Template Creation",
		"description": "Create reusable HTML base templates.",
		"category": "Technical Task",
		"status": "await-feedback",
		"dueDate": "2026-07-31",
		"priority": "low",
		"subtasks": [],
		"assignedTo": ["3", "2", "8"],
		"timestamp": 1723957140000
	},

	"3": {
		"id": "3",
		"title": "Daily Kochwelt Recipe",
		"description": "Implement daily recipe and portion calculator.",
		"category": "User Story",
		"status": "await-feedback",
		"dueDate": "2026-07-31",
		"priority": "medium",
		"subtasks": [],
		"assignedTo": ["4", "8", "1"],
		"timestamp": 1723957140000
	},

	"4": {
		"id": "4",
		"title": "Contact Form & Imprint",
		"description": "Create a contact form and imprint page.",
		"category": "User Story",
		"status": "to-do",
		"dueDate": "2026-07-31",
		"priority": "urgent",
		"subtasks": [
			{
				"id": "0",
				"content": "Create contact form",
				"completed": false,
			},
			{
				"id": "1",
				"content": "Set up imprint page",
				"completed": false,
			},
		],
		"assignedTo": ["8", "3", "4"],
		"timestamp": 1723957140000
	},
};


const dummyUsers = {
	"guest": {
		name: 'Guest',
		email: 'guest@join.de',
		id: 'guest',
		color: '#00BEE8',
		password: 'guest'
	},
	"me": {
		name: 'Robert',
		email: 'robert@join.de',
		id: 'me',
		color: '#00BEE8',
		password: 'Robert'
	}
}

/**
 * Resets the Firebase database to initial dummy data for tasks, users, and contacts.
 * @returns {Promise<void>} Resolves when all dummy data has been uploaded.
 */
async function resetDatabase() {
	await putData("/tasks", dummyTasks);
	await putData("/users", dummyUsers);
	await putData("/contacts", dummyContacts);
}
