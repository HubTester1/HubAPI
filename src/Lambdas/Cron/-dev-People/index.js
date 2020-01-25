/**
 * @name People
 * @cron
 * @description Perform all cron jobs to retrieve and process data for People API
 */

const DataQueries = require('data-queries');
const UltiPro = require('ultipro');
const MSGraph = require('ms-graph');
const Utilities = require('utilities');

// ----- SETTINGS, PERMISSION, UTILITIES

/**
 * @name ReturnPeopleSettings
 * @function
 * @async
 * @description Return people settings from db.
 */

exports.ReturnPeopleSettings = () => 
	// return a new promise
	new Promise((resolve, reject) => {
		// get a promise to retrieve all documents
		DataQueries.ReturnAllDocsFromCollection('peopleSettings')
		// if the promise is resolved with the docs
			.then((result) => {
				// resolve this promise with the docs
				resolve(result);
			})
			// if the promise is rejected with an error
			.catch((error) => {
				// reject this promise with an error
				reject(error);
			});
	});

/**
 * @name ReturnPeopleProcessingPermitted
 * @function
 * @async
 * @description Return whether or not people processing is currently permitted.
 * Changing this property in db will disallow or reallow people data processing.
 */

exports.ReturnPeopleProcessingPermitted = () =>
	// return a new promise
	new Promise((resolve, reject) => {
		// get a promise to retrieve all settings
		exports.ReturnPeopleSettings()
			// if the promise is resolved with the settings
			.then((settings) => {
				resolve({
					error: settings.error,
					dataProcessingPermitted: settings.docs[0].dataProcessingPermitted,
				});
			})
			// if the promise is rejected with an error
			.catch((error) => {
				// reject this promise with an error
				reject(error);
			});
	});


/**
 * @name ReturnPeopleWhitelistedDomains
 * @function
 * @async
 * @description Return the domains that are whitelisted for the People API.
 */

exports.ReturnPeopleWhitelistedDomains = () =>
	// return a new promise
	new Promise((resolve, reject) => {
		// get a promise to retrieve all settings
		exports.ReturnPeopleSettings()
			// if the promise is resolved with the settings
			.then((settings) => {
				resolve({
					error: settings.error,
					whitelistedDomains: settings.docs[0].whitelistedDomains,
				});
			})
			// if the promise is rejected with an error
			.catch((error) => {
				// reject this promise with an error
				reject(error);
			});
	});

/**
 * @name ReturnUserNameWeightRelativeToAnother
 * @function
 * @description Used in alphabetizing sets of people by last name.
 */

exports.ReturnUserNameWeightRelativeToAnother = (a, b) => {
	if (a.lastName < b.lastName) {
		return -1;
	}
	if (a.lastName > b.lastName) {
		return 1;
	}
	if (a.firstName < b.firstName) {
		return -1;
	}
	if (a.firstName > b.firstName) {
		return 1;
	}
	return 0;
};

// ----- DATA PROCESSING

/**
 * @name AddAllUltiProActiveEmployeesToDatabase
 * @function
 * @async
 * @description Get all active employees via UltiPro service. 
 * Insert into 'peopleRawUltiProActiveEmployees' collection.
 */

exports.AddAllUltiProActiveEmployeesToDatabase = () =>
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
								`${employee.workPhone.slice(0, 3)}-${employee.workPhone.slice(3, 6)}-${employee.workPhone.trim().slice(6)}`;
						}
						const employeeToPush = {
							account: Utilities
								.ReturnAccountFromUserAndDomain(employee.emailAddress),
							firstName: 
								Utilities.ReturnSubstringPrecedingNewLineCharacters(employee.firstName),
							lastName: 
								Utilities.ReturnSubstringPrecedingNewLineCharacters(employee.lastName),
							preferredName: 
								Utilities.ReturnSubstringPrecedingNewLineCharacters(employee.preferredName),
							jobTitle: 
								Utilities.ReturnSubstringPrecedingNewLineCharacters(employee.alternateJobTitle),
							email: 
								Utilities.ReturnSubstringPrecedingNewLineCharacters(employee.emailAddress),
							phone: 
								Utilities.ReturnSubstringPrecedingNewLineCharacters(phoneToUse),
							mosEmployeeID: 
								Utilities.ReturnSubstringPrecedingNewLineCharacters(employee.employeeNumber),
							upEmployeeID: 
								Utilities.ReturnSubstringPrecedingNewLineCharacters(employee.employeeId),
							upSupervisorId: 
								Utilities.ReturnSubstringPrecedingNewLineCharacters(employee.supervisorId),
							projectCode: 
								Utilities.ReturnSubstringPrecedingNewLineCharacters(employee.projectCode),
							orgLevel1Code: 
								Utilities.ReturnSubstringPrecedingNewLineCharacters(employee.orgLevel1Code),
							orgLevel2Code: 
								Utilities.ReturnSubstringPrecedingNewLineCharacters(employee.orgLevel2Code),
							orgLevel3Code: 
								Utilities.ReturnSubstringPrecedingNewLineCharacters(employee.orgLevel3Code),
							orgLevel4Code: 
								Utilities.ReturnSubstringPrecedingNewLineCharacters(employee.orgLevel4Code),
							jobGroupCode: 
								Utilities.ReturnSubstringPrecedingNewLineCharacters(employee.jobGroupCode),
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

/**
 * @name AddTrackedMSGraphGroupsToDatabase
 * @function
 * @async
 * @description Find out from people settings which AD groups 
 * we're tracking and then get those group's info via Graph.
 * Insert into 'peopleRawMSGraphGroups' collection.
 */

exports.AddTrackedMSGraphGroupsToDatabase = () =>
	// return a new promise
	new Promise((resolve, reject) => {
		// set up var to contain all tracked groups with their members
		const allTrackedGroupsWithMembers = [];
		// set up group membership query promises container
		const allGroupMembershipQueryPromises = [];
		// get a promise to get IDs for all of the groups we're tracking
		DataQueries.ReturnAllDocsFromCollection('peopleSettings')
			// if the promise was resolved with the tracked groups
			.then((peopleSettingsResult) => {
				// for each tracked group
				peopleSettingsResult.docs[0].groupsTracked.forEach((trackedGroup) => {
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
						peopleSettingsResult.docs[0].groupsTracked
							.forEach((trackedGroupValue, trackedGroupIndex) => {
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

/**
 * @name AddHubComponentGroupAdminsToDatabase
 * @function
 * @async
 * @description Get The Hub's Component Group Admins from SPO via Graph.
 * Insert into 'peopleRawMSGraphHubComponentGroupAdmins' collection.
 */

exports.AddHubComponentGroupAdminsToDatabase = () =>
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

/**
 * @name SyncSpecifiedRawData
 * @function
 * @async
 * @description Sync (delete, fetch, insert) a specific set of raw data.
 * @param {string} dataSetToken - e.g., 'ultiProActiveEmployees', 'graphGroups', 'hubAdmins'
 */

exports.SyncSpecifiedRawData = (dataSetToken) =>
	// return a new promise
	new Promise((resolve, reject) => {
		let collectionName = '';
		switch (dataSetToken) {
		case 'ultiProActiveEmployees':
			collectionName = 'peopleRawUltiProActiveEmployees';
			break;
		case 'graphGroups':
			collectionName = 'peopleRawMSGraphGroups';
			break;
		case 'hubAdmins':
			collectionName = 'peopleRawMSGraphHubComponentGroupAdmins';
			break;
		default:
			break;
		}
		// get a promise to delete all documents
		DataQueries.DeleteAllDocsFromCollection(collectionName)
			// if the promise is resolved with the result
			.then((deletionResult) => {
				switch (dataSetToken) {
				case 'ultiProActiveEmployees':
					// get a promise to add new docs
					exports.AddAllUltiProActiveEmployeesToDatabase()
						// if the promise is resolved with the result
						.then((insertionResult) => {
							// resolve this promise with the result
							resolve(insertionResult);
						})
						// if the promise is rejected with an error, then reject this promise with an error
						.catch((insertionError) => {
							reject({
								statusCode: 500,
								body: JSON.stringify(insertionError),
							});
						});
					break;
				case 'graphGroups':
					// get a promise to add new docs
					exports.AddTrackedMSGraphGroupsToDatabase()
						// if the promise is resolved with the result
						.then((insertionResult) => {
							// resolve this promise with the result
							resolve(insertionResult);
						})
						// if the promise is rejected with an error, then reject this promise with an error
						.catch((insertionError) => {
							reject({
								statusCode: 500,
								body: JSON.stringify(insertionError),
							});
						});
					break;
				case 'hubAdmins':
					// get a promise to add new docs
					exports.AddHubComponentGroupAdminsToDatabase()
						// if the promise is resolved with the result
						.then((insertionResult) => {
							// resolve this promise with the result
							resolve(insertionResult);
						})
						// if the promise is rejected with an error, then reject this promise with an error
						.catch((insertionError) => {
							reject({
								statusCode: 500,
								body: JSON.stringify(insertionError),
							});
						});
					break;
				default:
					break;
				}
			})
			// if the promise is rejected with an error, then reject this promise with an error
			.catch((deletionError) => {
				reject({
					statusCode: 500,
					body: JSON.stringify(deletionError),
				});
			});
	});

/**
 * @name SyncAllRawData
 * @function
 * @async
 * @description Sync (delete, fetch, insert) all raw data sets.
 */

exports.SyncAllRawData = () =>
	// return a new promise
	new Promise((resolve, reject) => {
		// get promises to sync specific raw data sets
		Promise.all([
			exports.SyncSpecifiedRawData('ultiProActiveEmployees'),
			exports.SyncSpecifiedRawData('graphGroups'),
			exports.SyncSpecifiedRawData('hubAdmins'),
		])
			// if all of those promises were resolved
			.then((syncResults) => {
				// resolve this promise
				resolve({
					statusCode: 200,
					body: JSON.stringify(syncResults),
				});
			})
			// if any one promise is rejected with an error
			.catch((syncError) => {
				// reject this promise with that error
				reject({
					statusCode: 500,
					body: JSON.stringify(syncError),
				});
			});
	});

/**
 * @name ProcessAllPeopleFlat
 * @function
 * @async
 * @description Construct flat set of individual people. 
 * Insert into 'peopleFlat' collection. This is the base people data set.
 */

exports.ProcessAllPeopleFlat = (event, context) =>
	// return a new promise
	new Promise((resolve, reject) => {
		// get a promise to retrieve setting indicating whether 
		// 		people processing is permitted or not
		exports.ReturnPeopleProcessingPermitted()
			// if the promise was resolved
			.then((settingResults) => {
				// if it's ok to process people
				if (settingResults.dataProcessingPermitted === true) {
				// get a promise to sync all raw data
					exports.SyncAllRawData()
					// if the promise was resolved
						.then((syncResults) => {
						// get promises to get all of the relevant raw data
							Promise.all([
								DataQueries.ReturnAllDocsFromCollection('peopleSettings'),
								DataQueries.ReturnAllDocsFromCollection('peopleRawPreferences'),
								DataQueries.ReturnAllDocsFromCollection('peopleRawMSGraphGroups'),
								DataQueries.ReturnAllDocsFromCollection('peopleRawMSGraphHubComponentGroupAdmins'),
								DataQueries.ReturnAllDocsFromCollection('peopleRawUltiProActiveEmployees'),
							])
							// if the promise is resolved
								.then((returnDataResults) => {
								// extract results for convenience
									const groupSettings = returnDataResults[0].docs[0].groupsTracked;
									const preferences = returnDataResults[1].docs;
									const groups = returnDataResults[2].docs;
									const componentGroupAdmins = returnDataResults[3].docs;
									const employees = returnDataResults[4].docs;
									// set up container for all people
									const allPeople = [];
									// iterate over each employee
									employees.forEach((employee) => {
									// set up default manager for this employee
										let thisEmpoyeeManager = null;
										// iterate over employees again
										employees.forEach((subEmployee) => {
										// if this subEmployee's ultipro employee ID matches
										// 		this employee's supervisor's ultipro supervisor ID
											if (subEmployee.upEmployeeID === employee.upSupervisorId) {
											// set the manager for this employee to the subEmployee's account
												thisEmpoyeeManager = subEmployee.account;
											}
										});
										// construct this person from the ultipro employee data;
										// 		some of these properties are named for backward compatibility
										const thisPerson = {
											account: employee.account,
											employeeID: employee.mosEmployeeID,
											firstName: employee.firstName,
											lastName: employee.lastName,
											preferredName: employee.preferredName,
											firstInitial: employee.preferredName.slice(0, 1).toUpperCase(),
											lastInitial: employee.lastName.slice(0, 1).toUpperCase(),
											displayName: `${employee.preferredName} ${employee.lastName}`,
											title: employee.jobTitle,
											email: employee.email,
											officePhone: employee.phone,
											manager: thisEmpoyeeManager,
											department: employee.orgLevel2Code,
											division: employee.orgLevel1Code,
											orgLevel1Code: employee.orgLevel1Code,
											orgLevel2Code: employee.orgLevel2Code,
											orgLevel3Code: employee.orgLevel3Code,
											orgLevel4Code: employee.orgLevel4Code,
											jobGroupCode: employee.jobGroupCode,
										};
										// set up a container for this person's potential roles
										const rolesThisPerson = [];
										// iterate over the groups
										groups.forEach((group) => {
										// iterate over this group's members
											group.members.forEach((member) => {
											// if this group member matches this person
												if (member === thisPerson.account) {
												// iterate over all groups' settings
													groupSettings.forEach((settingsOneGroup) => {
													// if the displayName in this group's settings
													// 		matches the 
														if (settingsOneGroup.displayName === group.groupName) {
															rolesThisPerson.push(
																settingsOneGroup.roleForGroupMembers,
															);
														}
													});
												}
											});
										});
										// iterate over the component group admins
										componentGroupAdmins.forEach((componentGroup) => {
										// iterate over this component group's admins
											componentGroup.admins.forEach((componentGroupAdmin) => {
											// if this component group admin matches this person
												if (componentGroupAdmin === thisPerson.account) {
													rolesThisPerson
														.push(
															`componentGroupAdmin${  
																componentGroup.componentGroupName.replace(' ', '')}`,
														);
												}
											});
										});
										// if any roles were found for this person
										if (rolesThisPerson[0]) {
										// add them to thisPerson
											thisPerson.roles = rolesThisPerson;
										}
										// iterate over the preferences
										preferences.forEach((preferencesSet) => {
										// if this preference set's account matches this person
											if (preferencesSet.account === thisPerson.account) {
											// make a copy of this preferenc set
												const preferencesSetCopy = 
											Utilities.ReturnCopyOfObject(preferencesSet);
												// delete the _id and account properties of this preference set copy
												delete preferencesSetCopy.account;
												delete preferencesSetCopy._id;
												// set this person's preferences to the modified preference set copy
												thisPerson.preferences = preferencesSetCopy;
											}
										});

										// push this person to allPeople
										allPeople.push(thisPerson);
									});
									// get a promise to delete all documents
									DataQueries.DeleteAllDocsFromCollection('peopleFlat')
									// if the promise is resolved with the result
										.then((deletionResult) => {
										// get a promise to insert allPeople
											DataQueries.InsertDocIntoCollection(
												allPeople,
												'peopleFlat',
											)
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
										.catch((deletionError) => {
										// reject this promise with an error
											reject({
												statusCode: 500,
												body: JSON.stringify(deletionError),
											});
										});
								})
							// if the promise is rejected with an error
								.catch((returnDataError) => {
								// reject this promise with an error
									reject({
										statusCode: 500,
										body: JSON.stringify(returnDataError),
									});
								});
						})
					// if the promise is rejected with an error
						.catch((syncError) => {
						// reject this promise with the error
							reject(syncError);
						});
				// if it's NOT ok to process people
				} else {
					// reject this promise with the error
					reject({
						error: true,
						settingsError: 'dataProcessingPermitted === false',
					});
					resolve({
						statusCode: 200,
						body: JSON.stringify(insertResult),
					});
				}
			})
			// if the promise is rejected with an error
			.catch((syncError) => {
				// reject this promise with the error
				reject(syncError);
			});
	});


// ----- DATA PULLS

/**
 * @name ReturnAllPeople
 * @function
 * @async
 * @description Return all people from 'peopleFlat' collection.
 */

exports.ReturnAllPeople = () =>
	// return a new promise
	new Promise((resolve, reject) => {
		// get a promise to retrieve all documents
		DataQueries.ReturnAllDocsFromCollection('peopleFlat')
			// if the promise is resolved with the docs
			.then((result) => {
				// resolve this promise with the docs
				resolve({
					status: 200,
					body: JSON.stringify(result),
				});
			})
			// if the promise is rejected with an error
			.catch((error) => {
				// reject this promise with an error
				reject(error);
			});
	});

/**
 * @name ReturnOnePerson
 * @function
 * @async
 * @description Return one person from 'peopleFlat' collection.
 * @param {string} account - E.g., 'sp1'
 */

exports.ReturnOnePerson = (account) =>
	// return a new promise
	new Promise((resolve, reject) => {
		// get a promise to retrieve all documents
		DataQueries.ReturnOneSpecifiedDocFromCollection('peopleSettings', {
			$and: [{
				account,
			}],
		}, {})
			// if the promise is resolved with the docs
			.then((result) => {
				// resolve this promise with the docs
				resolve({
					status: 200,
					body: JSON.stringify(result),
				});
			})
			// if the promise is rejected with an error
			.catch((error) => {
				// reject this promise with an error
				reject(error);
			});
	});

/**
 * @name XXXXXXXXXXXXX
 * @function
 * @async
 * @description XXXXXXXXXXXXX
 */

/* exports.XXXXXXXXXXXXX = () =>
	// return a new promise
	new Promise((resolve, reject) => {
		// get a promise to retrieve all documents
		DataQueries.ReturnAllDocsFromCollection('peopleSettings')
			// if the promise is resolved with the docs
			.then((result) => {
				// resolve this promise with the docs
				resolve(result);
			})
			// if the promise is rejected with an error
			.catch((error) => {
				// reject this promise with an error
				reject(error);
			});
	}); */
