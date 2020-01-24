/**
 * @name People
 * @cron
 * @description Perform all cron jobs to retrieve and process data for People API
 */

const DataQueries = require('data-queries');
const UltiPro = require('ultipro');
const MSGraph = require('ms-graph');
const Utilities = require('utilities');

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
/**
 * @name AddAllUltiProActiveEmployeesToDatabase
 * @function
 * @async
 * @description Get all active employees via UltiPro service. 
 * Insert into peopleUltiProRaw collection.
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
						let phoneToUse = '';
						if (
							employee.workPhone &&
							employee.workPhone.replace(/ /g, '')
						) {
							phoneToUse =
								`${employee.workPhone.slice(0, 3)}-${employee.workPhone.slice(3, 6)}-${employee.workPhone.slice(6)}`;
						}

						const employeeToPush = {
							account: Utilities
								.ReturnAccountFromUserAndDomain(employee.emailAddress),
							firstName: employee.firstName,
							lastName: employee.lastName,
							preferredName: employee.preferredName,
							jobTitle: employee.alternateJobTitle,
							email: employee.emailAddress,
							phone: phoneToUse,
							mosEmployeeID: employee.employeeNumber,
							upEmployeeID: employee.employeeId,
							upSupervisorId: employee.supervisorId,
							projectCode: employee.projectCode,
							orgLevel1Code: employee.orgLevel1Code,
							orgLevel2Code: employee.orgLevel2Code,
							orgLevel3Code: employee.orgLevel3Code,
							orgLevel4Code: employee.orgLevel4Code,
							jobGroupCode: employee.jobGroupCode,
						};
						allActiveEmployees.push(employeeToPush);
					}
				});
				// get a promise to retrieve all documents from the emailQueue document collection
				DataQueries.InsertDocIntoCollection(allActiveEmployees, 'peopleRawUltiProActiveEmployees')
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
							'peopleRawMSGraphGroups',
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
				DataQueries.InsertDocIntoCollection(groupsAndAdmins, 'peopleRawMSGraphHubComponentGroupAdmins')
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

/* exports.ProcessAllPeopleBasic = (event, context) =>
	// return a new promise
	new Promise((resolve, reject) => {
		Promise.all([
			DataQueries.ReturnAllDocsFromCollection('peopleRawMOSGroupsTracked'),
			DataQueries.ReturnAllDocsFromCollection('peopleRawMOSPreferences'),
			DataQueries.ReturnAllDocsFromCollection('peopleRawMSGraphGroups'),
			DataQueries.ReturnAllDocsFromCollection('peopleRawMSGraphHubComponentGroupAdmins'),
			DataQueries.ReturnAllDocsFromCollection('peopleRawUltiPro'),
		])
			.then((queryResults) => {
				// extract results for convenience
				const groupTracking = queryResults[0];
				const preferences = queryResults[1];
				const groups = queryResults[2];
				const componentGroupAdmins = queryResults[3];
				const employees = queryResults[4];
				// set up container for all people
				const allPeople = [];
				// iterate over each employee
				employees.forEach((employee) => {
					// start the person as a copy of employee param
					const person = Utilities.ReturnCopyOfObject(employee);
					groups.forEach((group) => {
						
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
	}); */

exports.GetActiveLegacies = (event, context) =>
	// return a new promise
	new Promise((resolve, reject) => {
		Promise.all([
			DataQueries.ReturnAllDocsFromCollection('peopleRawUltiPro'),
			DataQueries.ReturnAllDocsFromCollection('peopleRawLegacyPhoneNumbers'),
		])
			.then((phoneResults) => {
				const upActiveEmps = phoneResults[0];
				const qPhones = phoneResults[1];
				const activeEmpsWLegacyNumbers = [];
				upActiveEmps.docs.forEach((upActiveEmp) => {
					// for this active employee
					qPhones.docs.forEach((qPhone) => {
						const quarkPhoneSansHyphens = qPhone.officePhone.replace(/-/g, '');
						if (
							qPhone.account === upActiveEmp.account &&
							qPhone.officePhone !== upActiveEmp.phone &&
							quarkPhoneSansHyphens !== upActiveEmp.phone
						) {
							activeEmpsWLegacyNumbers.push({
								account: qPhone.account,
								quarkPhone: quarkPhoneSansHyphens,
								ultiProPhone: upActiveEmp.phone,
							});
						}
					});
				});
				console.log(activeEmpsWLegacyNumbers);
				console.log(activeEmpsWLegacyNumbers.length);
				console.log('m5');
				// resolve(activeEmpsWLegacyNumbers);
			})
			// if the promise to get all ad users from csv was rejected with an error
			.catch((phoneError) => {
				// reject this promise with the error
				reject(phoneError);
			});
	});
const fse = require('fs-extra');
// j.steele17
// hreardo726

exports.ShowMissingNumbers = (event, context) =>
	// return a new promise
	new Promise((resolve, reject) => {
		Promise.all([
			DataQueries.ReturnAllSpecifiedDocsFromCollection(
				'peopleRawUltiProActiveEmployees', 
				{ phone: { $not: { $regex: /^617/i } } },
				{},
			),
			DataQueries.ReturnAllDocsFromCollection('peopleRawMSGraphUserPhones'),
			DataQueries.ReturnAllDocsFromCollection('peopleRawLegacyPhoneNumbers'),
			fse.readJson('src/Lambdas/Cron/-dev-People/phSuggestions.json'),
			fse.readJson('src/Lambdas/Cron/-dev-People/phIgnore.json'),
		])
			.then((readResults) => {
				const upEmployees = readResults[0].docs;
				const graphNumbers = readResults[1].docs;
				const legacyNumbers = readResults[2].docs;
				const doneNumbers = readResults[3];
				const ignoreAccounts = readResults[4];
				const toShows = [];

				// for each UP employee without a phone number
				upEmployees.forEach((upEmployee) => {
					if (upEmployee.account) {
						let thisIsDone;
						let thisIsIgnored;
						doneNumbers.forEach((doneNumber) => {
							if (doneNumber.account === upEmployee.account) {
								thisIsDone = true;
							}
						});
						ignoreAccounts.forEach((ignoreAccount) => {
							if (ignoreAccount.account === upEmployee.account) {
								thisIsIgnored = true;
							}
						});
						// if this account is not being ignored
						// 	and this number isn't yet done
						if (!thisIsDone && !thisIsIgnored) {
							let thisGraphNumber;
							let thisLegacyNumber;
							graphNumbers.forEach((graphNumber) => {
								if (graphNumber.account === upEmployee.account) {
									thisGraphNumber = graphNumber.phone;
								}
							});
							legacyNumbers.forEach((legacyNumber) => {
								if (legacyNumber.account === upEmployee.account) {
									thisLegacyNumber = legacyNumber.officePhone;
								}
							});
							// add this account to those to be logged
							const toShow = {
								account: upEmployee.account,
								firstName: upEmployee.firstName,
								lastName: upEmployee.lastName,
								employeeID: upEmployee.upEmployeeID, 
								jobTitle: upEmployee.jobTitle,
							};
							if (thisGraphNumber) {
								toShow.suggestedPhone = thisGraphNumber;
							}
							if (thisLegacyNumber) {
								toShow.suggestedPhone = thisLegacyNumber;
							}
							toShows.push(toShow);
						}
					}
				});
				// show emps without numbers
				console.log(toShows);
				console.log('m4');
				resolve({});
			})
			// if the promise to get all ad users from csv was rejected with an error
			.catch((phoneError) => {
				// reject this promise with the error
				reject(phoneError);
			});
	});
