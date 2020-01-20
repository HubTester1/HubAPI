/**
 * @name People
 * @cron
 * @description Perform all cron jobs to retrieve and process data for People API
 */

const DataQueries = require('data-queries');
const UltiPro = require('ultipro');
const MSGraph = require('ms-graph');
const Utilities = require('utilities');

/**
 * @name AddAllUltiProEmployeesToDatabase
 * @function
 * @async
 * @description Get all employees via UltiPro service. Insert into peopleUltiProRaw collection.
 */

exports.AddAllUltiProActiveEmployeesToDatabase = (event, context) =>
	// return a new promise
	new Promise((resolve, reject) => {
		UltiPro.ReturnAllEmployeesFromUltiPro()
			// if the promise is resolved with the result, then resolve this promise with the result
			.then((queryResult) => {
				const allActiveEmployees = [];
				queryResult.allEmployees.forEach((employee) => {
					if (employee.isActive) {
						allActiveEmployees.push({
							account: Utilities
								.ReturnAccountFromUserAndDomain(employee.emailAddress),
							firstName: employee.firstName,
							lastName: employee.lastName,
							preferredName: employee.preferredName,
							email: employee.emailAddress,
							phone: employee.workPhone,
							jobTitle: employee.alternateJobTitle,
							mosEmployeeID: employee.employeeNumber,
							upEmployeeID: employee.employeeId,
							upSupervisorId: employee.supervisorId,
							projectCode: employee.projectCode,
							orgLevel1Code: employee.orgLevel1Code,
							orgLevel2Code: employee.orgLevel2Code,
							orgLevel3Code: employee.orgLevel3Code,
							orgLevel4Code: employee.orgLevel4Code,
							jobGroupCode: employee.jobGroupCode,
						});
					}
				});
				// get a promise to retrieve all documents from the emailQueue document collection
				DataQueries.InsertDocIntoCollection(allActiveEmployees, 'peopleRawUltiPro')
					// if the promise is resolved with the result, then resolve this promise with the result
					.then((insertResult) => {
						resolve({
							statusCode: 200,
							body: JSON.stringify(insertResult),
						});
					})
					// if the promise is rejected with an error, then reject this promise with an error
					.catch((error) => {
						reject({
							statusCode: 500,
							body: JSON.stringify(error),
						});
					});
			})
			// if the promise is rejected with an error, then reject this promise with an error
			.catch((error) => {
				reject({
					statusCode: 500,
					body: JSON.stringify(error),
				});
			});
	});
exports.AddAllMSGraphUserPhonesToDatabase = (event, context) =>
	// return a new promise
	new Promise((resolve, reject) => {
		MSGraph.ReturnAllSpecifiedDataFromGraph('users?$select=userPrincipalName,businessPhones')
			// if the promise is resolved with the result, then resolve this promise with the result
			.then((queryResult) => {
				// set up container to hold all users with phones
				const usersWithPhones = [];
				queryResult.allValues.forEach((user) => {
					if (user.businessPhones[0] && user.businessPhones[0].substring(0, 3) === '617') {
						usersWithPhones.push({
							account: Utilities
								.ReturnAccountFromUserAndDomain(user.userPrincipalName),
							phone: user.businessPhones[0],
						});
					}
				});
				// get a promise to retrieve all documents from the emailQueue document collection
				DataQueries.InsertDocIntoCollection(usersWithPhones, 'peopleRawMSGraphUserPhones')
					// if the promise is resolved with the result, then resolve this promise with the result
					.then((insertResult) => {
						resolve({
							statusCode: 200,
							body: JSON.stringify(insertResult),
						});
					})
					// if the promise is rejected with an error, then reject this promise with an error
					.catch((insertError) => {
						reject({
							statusCode: 500,
							body: JSON.stringify(insertError),
						});
					});
			})
			// if the promise is rejected with an error, then reject this promise with an error
			.catch((error) => {
				reject({
					statusCode: 500,
					body: JSON.stringify(error),
				});
			});
	});

/* exports.AddAllMSGraphUsersToDatabase = (event, context) =>
	// return a new promise
	new Promise((resolve, reject) => {
		MSGraph.ReturnAllSpecifiedDataFromGraph('users')
			// if the promise is resolved with the result, then resolve this promise with the result
			.then((queryResult) => {
				// get a promise to retrieve all documents from the emailQueue document collection
				DataQueries.InsertDocIntoCollection(queryResult.allValues, 'peopleRawMSGraphUsers')
					// if the promise is resolved with the result, then resolve this promise with the result
					.then((insertResult) => {
						resolve({
							statusCode: 200,
							body: JSON.stringify(insertResult),
						});
					})
					// if the promise is rejected with an error, then reject this promise with an error
					.catch((insertError) => {
						reject({
							statusCode: 500,
							body: JSON.stringify(insertError),
						});
					});
			})
			// if the promise is rejected with an error, then reject this promise with an error
			.catch((error) => {
				reject({
					statusCode: 500,
					body: JSON.stringify(error),
				});
			});
	});
exports.AddAllMSGraphGroupsToDatabase = (event, context) =>
	// return a new promise
	new Promise((resolve, reject) => {
		MSGraph.ReturnAllSpecifiedDataFromGraph('groups')
			// if the promise is resolved with the result, then resolve this promise with the result
			.then((queryResult) => {
				// get a promise to retrieve all documents from the emailQueue document collection
				DataQueries.InsertDocIntoCollection(queryResult.allValues, 'peopleRawMSGraphGroups')
					// if the promise is resolved with the result, then resolve this promise with the result
					.then((insertResult) => {
						resolve({
							statusCode: 200,
							body: JSON.stringify(insertResult),
						});
					})
					// if the promise is rejected with an error, then reject this promise with an error
					.catch((insertError) => {
						reject({
							statusCode: 500,
							body: JSON.stringify(insertError),
						});
					});
			})
			// if the promise is rejected with an error, then reject this promise with an error
			.catch((error) => {
				reject({
					statusCode: 500,
					body: JSON.stringify(error),
				});
			});
	}); */

exports.AddTrackedMSGraphGroupsToDatabase = (event, context) =>
	// return a new promise
	new Promise((resolve, reject) => {
		// set up var to contain all tracked groups with their members
		const allTrackedGroupsWithMembers = [];
		// set up group membership query promises container
		const allGroupMembershipQueryPromises = [];
		// get a promise to get IDs for all of the groups we're tracking
		DataQueries.ReturnAllDocsFromCollection('peopleRawMOSGroupsTracked')
			// if the promise was resolved with the tracked groups
			.then((trackedGroupsQueryResult) => {
				// for each tracked group
				trackedGroupsQueryResult.docs.forEach((trackedGroup) => {
					// add to membership query promises container a promise to get the group's members
					allGroupMembershipQueryPromises
						.push(
							MSGraph.ReturnAllSpecifiedDataFromGraph(
								`groups/${trackedGroup.graphID}/transitiveMembers?$select=userPrincipalName`,
							),
						);
				});
				// when all group membership query promises are resolved
				Promise.all(allGroupMembershipQueryPromises)
					.then((allGroupMembershipQueryResults) => {
						trackedGroupsQueryResult.docs.forEach((trackedGroupValue, trackedGroupIndex) => {
							const groupToPush = {
								groupName: trackedGroupValue.displayName,
								members: [],
							};
							allGroupMembershipQueryResults[trackedGroupIndex].allValues
								.forEach((memberValue) => {
									groupToPush.members.push(
										Utilities.ReturnAccountFromUserAndDomain(memberValue.userPrincipalName),
									);
								});
							allTrackedGroupsWithMembers.push(groupToPush);
						});
						// get a promise to retrieve all documents from the emailQueue document collection
						DataQueries.InsertDocIntoCollection(
							allTrackedGroupsWithMembers, 
							'peopleRawMOSGroupsTrackedWithMembers',
						)
							// if the promise is resolved with the result
							.then((insertResult) => {
								// resolve this promise with the result
								resolve({
									statusCode: 200,
									body: JSON.stringify(insertResult),
								});
							})
							// if the promise is rejected with an error, then reject this promise with an error
							.catch((insertError) => {
								reject({
									statusCode: 500,
									body: JSON.stringify(insertError),
								});
							});
					});
			})
			// if the promise is rejected with an error
			.catch((error) => {
				// reject this promise with an error
				reject({
					statusCode: 500,
					body: JSON.stringify(error),
				});
			});
	});

exports.AddHubComponentGroupAdminsToDatabase = (event, context) =>
	// return a new promise
	new Promise((resolve, reject) => {
		// get a promise to return the items from the 'Component Group Log' list in 'hubprod' site
		MSGraph.ReturnAllSpecifiedDataFromGraph('sites/bmos.sharepoint.com,83c7fe0f-025f-43a2-986c-cb8cb6ee600f,cb940f09-8f4d-4384-a92b-24c2e4c5a290/lists/%7B8b05efe6-bb95-4943-8929-6d196007ff28%7D/items?expand=fields(select=Title,GroupAdminAccess)')
			// if the promise is resolved with the result, then resolve this promise with the result
			.then((queryResult) => {
				// set up var to contain all of the component groups and their admins
				const groupsAndAdmins = [];
				// iterate over query result
				queryResult.allValues.forEach((listItem) => {
					const groupAndAdminToPush = {
						componentGroupName: listItem.fields.Title,
						admins: [],
					};
					listItem.fields.GroupAdminAccess.forEach((groupAdminAccessPerson) => {
						groupAndAdminToPush.admins.push(
							Utilities.ReturnAccountFromUserAndDomain(groupAdminAccessPerson.Email),
						);
					});
					groupsAndAdmins.push(groupAndAdminToPush);
				});
				// get a promise to insert the component groups and their admins
				DataQueries.InsertDocIntoCollection(groupsAndAdmins, 'peopleRawMOSHubComponentGroupAdmins')
					// if the promise is resolved with the result
					.then((insertResult) => {
						// resolve this promise with the result
						resolve({
							statusCode: 200,
							body: JSON.stringify(insertResult),
						});
					})
					// if the promise is rejected with an error
					.catch((insertError) => {
						// reject this promise with an error
						reject({
							statusCode: 500,
							body: JSON.stringify(insertError),
						});
					});
			})
			// if the promise is rejected with an error
			.catch((error) => {
				// reject this promise with an error
				reject({
					statusCode: 500,
					body: JSON.stringify(error),
				});
			});
	});
