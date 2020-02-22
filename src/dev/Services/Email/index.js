/**
 * @name Email
 * @service
 * @description Performs all email-related operations.
 * 
 */

const DataQueries = require('data-queries');
const Utilities = require('utilities');
const MSGraph = require('ms-graph');
const Errors = require('errors');
const Status = require('status');

/**
 * @typedef {import('../../../TypeDefs/Email').HubMessage} Email
 */

module.exports = {
	
	/**
	 * @name ReturnEmailQueueData
	 * @function
	 * @async
	 * @description Return all emails from the email queue 
	 * (all docs from the 'emailQueue' collection).
	 */

	ReturnEmailQueueData: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve all documents from the emailQueue document collection
			DataQueries.ReturnAllDocsFromCollection('emailQueue')
				// if the promise is resolved with the docs, then resolve this promise with the docs
				.then((result) => {
					resolve(result);
				})
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => {
					reject(error);
				});
		}),
	
	/**
	 * @name ReturnEmailArchiveData
	 * @function
	 * @async
	 * @description Return all emails from the email archive 
	 * (all docs from the 'emailArchive' collection).
	 */

	ReturnEmailArchiveData: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve all documents from the emailArchive document collection
			DataQueries.ReturnAllDocsFromCollection('emailArchive')
				// if the promise is resolved with the docs, then resolve this promise with the docs
				.then((result) => {
					resolve(result);
				})
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => {
					reject(error);
				});
		}),
	
	/**
	 * @name ReturnEmailSettingsData
	 * @function
	 * @async
	 * @description Return all email settings 
	 * (all docs from the 'emailSettings' collection).
	 */

	ReturnEmailSettingsData: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve all documents from the emailSettings document collection
			DataQueries.ReturnAllDocsFromCollection('emailSettings')
				// if the promise is resolved with the docs, then resolve this promise with the docs
				.then((result) => {
					resolve(result);
				})
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => {
					reject(error);
				});
		}),
	
	/**
	 * @name ReturnEmailSendingStatus
	 * @function
	 * @async
	 * @description Return the setting indicating whether or not emails should be sent at this time.
	 * This setting can be set to false in database to prevent emails from being sent.
	 */

	ReturnEmailSendingStatus: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve all email settings
			module.exports.ReturnEmailSettingsData()
				// if the promise is resolved with the settings
				.then((settings) => {
					// resolve this promise with the requested setting
					resolve({
						error: settings.error,
						sendingStatus: settings.docs[0].sendingStatus,
					});
				})
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => {
					reject(error);
				});
		}),
	
	/**
	 * @name ReturnEmailQueueProcessingStatus
	 * @function
	 * @async
	 * @description Return the setting indicating whether or not email the email queue 
	 * should be processed.This setting can be set to false in database to prevent queued emails
	 * from being sent.
	 */

	ReturnEmailQueueProcessingStatus: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve all email settings
			module.exports.ReturnEmailSettingsData()
				// if the promise is resolved with the settings
				.then((settings) => {
					// resolve this promise with the requested setting
					resolve({
						error: settings.error,
						queueProcessingStatus: settings.docs[0].queueProcessingStatus,
					});
				})
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => {
					reject(error);
				});
		}),
	
	/**
	 * @name ReturnEmailWhitelistedDomains
	 * @function
	 * @async
	 * @description Return the setting indicating the domains from which requests are accepted.
	 * Add a domain to this setting in database to allow requests from an additional domain.
	 */

	ReturnEmailWhitelistedDomains: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve all email settings
			module.exports.ReturnEmailSettingsData()
				// if the promise is resolved with the settings
				.then((settings) => {
					// resolve this promise with the requested setting
					resolve({
						error: settings.error,
						whitelistedDomains: settings.docs[0].whitelistedDomains,
					});
				})
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => {
					reject(error);
				});
		}),
	
	/**
	 * @name ProcessEmailQueue
	 * @function
	 * @async
	 * @description If settings indicate that it's ok to process 
	 * the email queue right now, then, if there are emails in the queue,
	 * send array of emails to SendEachEmailFromArray().
	 * If settings indicate that it's not ok to process 
	 * the email queue right now, then do nothing.
	 * Return an error only if settings or queue cannot be reached or 
	 * queued emails cannot be sent.
	 */

	ProcessEmailQueue: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve queue processing status
			module.exports.ReturnEmailQueueProcessingStatus()
				// if the promise is resolved with a result
				.then((settingResult) => {
					// if there was no problem with retrieving the setting and 
					// 		it's ok to process the email queue right now
					if (!settingResult.error && settingResult.queueProcessingStatus) {
						// get a promise to retrieve the docs
						module.exports.ReturnEmailQueueData()
							// if the promise is resolved with the docs
							.then((emailQueueResults) => {
								// if there are emails to be sent
								if (emailQueueResults.docs.length > 0) {
									// get a promise to attempt to send each email
									module.exports.SendEachEmailFromArray(emailQueueResults.docs)
										// if the promise is resolved with a result
										.then((emailSendingResults) => {
											// resolve this promise with result and metadata
											resolve({
												error: false,
												emailSendingResults,
												status: Status.ReturnStatusMessage(10),
											});
										})
										// if the promise is rejected with an error
										.catch((emailSendingError) => {
											// reject this promise
											const errorToReport = {
												error: true,
												emergencyError: true,
												emailSendingError,
												status: Status.ReturnStatusMessage(11),
											};
											Errors.ProcessError(errorToReport);
											reject(errorToReport);
										});
								// if there are no emails to be sent
								} else {
									// resolve this promise with no error or metadata
									resolve({
										error: false,
										status: Status.ReturnStatusMessage(12),
									});
								}
							})
							// if the promise is rejected with an error
							.catch((emailQueueError) => {
								// reject this promise
								const errorToReport = {
									error: true,
									emergencyError: true,
									mongoDBError: true,
									mongoDBErrorDetails: emailQueueError,
									status: Status.ReturnStatusMessage(13),
								};
								Errors.ProcessError(errorToReport);
								reject(errorToReport);
							});
					// if there was no problem with retrieving the setting but 
					// 		it's not ok to process the email queue right now
					} else if (
						!settingResult.error &&
						!settingResult.queueProcessingStatus
					) {
						resolve({
							error: false,
							status: Status.ReturnStatusMessage(14),
						});
					// if we can't even retrieve the setting
					} else if (!settingResult.error) {
						// reject this promise
						const errorToReport = {
							error: true,
							emergencyError: true,
							graphError: false,
							mongoDBError: true,
							mongoDBErrorDetails: settingResult,
							status: Status.ReturnStatusMessage(16),
						};
						Errors.ProcessError(errorToReport);
						reject(errorToReport);
					}
				})
				// if the promise is rejected with an error
				.catch((settingError) => {
					// reject this promise
					const errorToReport = {
						error: true,
						emergencyError: true,
						graphError: false,
						mongoDBError: true,
						mongoDBErrorDetails: settingError,
						status: Status.ReturnStatusMessage(17),
					};
					Errors.ProcessError(errorToReport);
					reject(errorToReport);
				});
		}),
	
	/**
	 * @name SendEachEmailFromArray
	 * @function
	 * @async
	 * @description For each email in an array, attempt to send the email.
	 * @param {object[]} emailArray - array of objects, each comprising data for one email
	 */

	SendEachEmailFromArray: (emailArray) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// start constructing result, defaulting to no errors
			const emailArraySendingResult = {
				error: false,
				emailArraySendingError: false,
				quantityEmailsInArray: emailArray.length,
				quantityEmailsAttempted: 0,
				quantityEmailsSent: 0,
			};
			// iterate over the array of emails
			emailArray.forEach((emailValue, emailIndex) => {
				// make sure the email is a string
				// set up email var
				let email;
				// if emailValue is not a string
				if (typeof (emailValue) !== 'string') {
					// convert it to a string and assign to email var
					email = JSON.stringify(emailValue);
				// if emailValue is a string
				} else {
					// just assign to email var
					email = emailValue;
				}
				// get a promise to send this email
				module.exports.SendEmail(email)
					// if the promise is resolved with a result
					.then((sendingResult) => {
						// increment emails sent
						emailArraySendingResult.quantityEmailsSent += 1;
						// if this was the last emailValue in the array
						if (
							(emailIndex + 1) === emailArraySendingResult.quantityEmailsInArray
						) {
							if (emailArraySendingResult.error) {
								reject(emailArraySendingResult);
							} else {
								resolve(emailArraySendingResult);
							}
						}
					})
					// if the promise was rejected with an error
					.catch((sendingError) => {
						// set errors to true
						emailArraySendingResult.error = true;
						emailArraySendingResult.emailArraySendingError = true;
						// create error collection, if it doesn't exist
						if (!emailArraySendingResult.errorCollection) {
							emailArraySendingResult.errorCollection = [];
						}
						// push error to collection
						emailArraySendingResult.errorCollection.push(sendingError);
						// if the error was not a transport error
						if (!sendingError.graphError) {
							// increment emails sent
							emailArraySendingResult.quantityEmailsSent += 1;
						}
						// if this was the last email in the array
						if (
							(emailIndex + 1) === emailArraySendingResult.quantityEmailsInArray
						) {
							if (emailArraySendingResult.error) {
								reject(emailArraySendingResult);
							} else {
								resolve(emailArraySendingResult);
							}
						}
					});
			});
		}),

	
	/**
	 * @name AddEmailToQueue
	 * @function
	 * @async
	 * @description Add the email to the queue, i.e., the doc to the 'emailQueue' collection.
	 * @param {...Email} incomingEmail - {@link Email} object
	 */

	AddEmailToQueue: (incomingEmail) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// preserve function parameter
			const email = Utilities.ReturnCopyOfObject(incomingEmail);
			// add a timestamp to the email
			email.queuedTime = Utilities.ReturnFormattedDateTime('nowUTC', null, null);
			// get a promise to insert the document
			DataQueries.InsertDocIntoCollection(email, 'emailQueue')
				// if the promise is resolved with the result, then resolve this promise with the result
				.then((result) => {
					resolve(result);
				})
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => {
					reject(error);
				});
		}),
	
	/**
	 * @name AddEmailToArchive
	 * @function
	 * @async
	 * @description Add the email to the archive, i.e., the doc to the 'emailArchive' collection.
	 * @param {...Email} incomingEmail - {@link Email} object
	 */

	AddEmailToArchive: (incomingEmail) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// preserve function parameter
			const email = Utilities.ReturnCopyOfObject(incomingEmail);
			// add a timestamp to the email
			email.archivedTime = Utilities.ReturnFormattedDateTime('nowUTC', null, null);
			// get a promise to insert the document
			DataQueries.InsertDocIntoCollection(email, 'emailArchive')
				// if the promise is resolved with the result, then resolve this promise with the result
				.then((result) => {
					resolve(result);
				})
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => {
					reject(error);
				});
		}),
	
	/**
	 * @name ReplaceQueuedEmail
	 * @function
	 * @async
	 * @description Replace one email in the queue, i.e., one doc in the 'emailQueue' collection.
	 * @param {string} emailID - ID of email to replace, i.e., of doc to overwrite
	 * @param {...Email} incomingEmail - {@link Email} object
	 */

	ReplaceQueuedEmail: (emailID, incomingEmail) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to overwrite the document
			DataQueries.OverwriteDocInCollection(emailID, incomingEmail, 'emailQueue')
				// if the promise is resolved with the counts, then resolve this promise with the counts
				.then((result) => {
					resolve(result);
				})
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => {
					reject(error);
				});
		}),
	
	/**
	 * @name ReplaceArchivedEmail
	 * @function
	 * @async
	 * @description Replace one email in the archive, i.e., one doc in the 'emailArchive' collection.
	 * @param {string} emailID - ID of email to replace, i.e., of doc to overwrite
	 * @param {...Email} incomingEmail - {@link Email} object
	 */

	ReplaceArchivedEmail: (emailID, incomingEmail) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to overwrite the document
			DataQueries.OverwriteDocInCollection(emailID, incomingEmail, 'emailArchive')
				// if the promise is resolved with the counts, then resolve this promise with the counts
				.then((result) => {
					resolve(result);
				})
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => {
					reject(error);
				});
		}),
	
	/**
	 * @name ReplaceAllEmailSettings
	 * @function
	 * @async
	 * @description Replace email settings object in database, i.e., doc in 'emailSettings' queue.
	 * @param {object} newSettings - object comprising new email settings
	 */

	ReplaceAllEmailSettings: (newSettings) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve all email settings
			module.exports.ReturnEmailSettingsData()
				// if the promise is resolved with the settings
				.then((existingSettings) => {
					// get a promise to overwrite the document
					DataQueries.OverwriteDocInCollection(existingSettings.docs[0]._id, newSettings, 'emailSettings')
						// if the promise is resolved with the counts, then resolve this promise with the counts
						.then((result) => {
							resolve(result);
						})
						// if the promise is rejected with an error, then reject this promise with an error
						.catch((error) => {
							reject(error);
						});
				})
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => {
					reject(error);
				});
		}),
	
	/**
	 * @name ReplaceOneEmailSetting
	 * @function
	 * @async
	 * @description Replace one email setting in database, i.e., one property of 
	 * doc in 'emailSettings' queue.
	 * @param {object} newSingleSettingObject - object comprising new email setting property
	 */

	ReplaceOneEmailSetting: (newSingleSettingObject) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve all email settings
			module.exports.ReturnEmailSettingsData()
				// if the promise is resolved with the settings
				.then((existingSettings) => {
					// preserve function parameter
					const newSettings = Utilities.ReturnCopyOfObject(existingSettings.docs[0]);
					// get an array containing the property key of newSingleSettingObject; 
					// 		iterate over the array
					Object.keys(newSingleSettingObject).forEach((newSingleSettingKey) => {
						// in the new settings, replace the relevant setting with 
						// 		the value passed to this function
						newSettings[newSingleSettingKey] = newSingleSettingObject[newSingleSettingKey];
					});
					// get a promise to overwrite the document
					DataQueries.OverwriteDocInCollection(existingSettings.docs[0]._id, newSettings, 'emailSettings')
						// if the promise is resolved with the counts, then resolve this promise with the counts
						.then((result) => {
							resolve(result);
						})
						// if the promise is rejected with an error, then reject this promise with an error
						.catch((error) => {
							reject(error);
						});
				})
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => {
					reject(error);
				});
		}),
	
	/**
	 * @name DeleteQueuedEmail
	 * @function
	 * @async
	 * @description Delete one email from the queue, i.e., one doc in the 'emailQueue' collection.
	 * @param {string} emailID - ID of email to delete, i.e., of doc to remove
	 */

	DeleteQueuedEmail: (emailID) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to delete all documents
			DataQueries.DeleteDocFromCollection(emailID, 'emailQueue')
				// if the promise is resolved with the docs, then resolve this promise with the docs
				.then((result) => {
					resolve(result);
				})
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => {
					reject(error);
				});
		}),
	
	/**
	 * @name DeleteArchivedEmail
	 * @function
	 * @async
	 * @description Delete one email from the archive, i.e., one doc in the 'emailArchive' collection.
	 * @param {string} emailID - ID of email to delete, i.e., of doc to remove
	 */

	DeleteArchivedEmail: (docID) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// if there is a docID
			if (docID !== null) {
				// get a promise to delete all documents
				DataQueries.DeleteDocFromCollection(docID, 'emailArchive')
					// if the promise is resolved with the docs, then resolve this promise with the docs
					.then((result) => {
						resolve(result);
					})
					// if the promise is rejected with an error, then reject this promise with an error
					.catch((error) => {
						reject(error);
					});
				// if there is no real docID, resolve this promise with a non-error
			} else {
				resolve({
					error: false,
					mongoDBError: false,
				});
			}
		}),
	
	/**
	 * @name SendEmail
	 * @function
	 * @async
	 * @description If settings indicate that it's ok to send email right now,
	 * then send one email to MSGraph service. If Graph is 
	 * successful in sending, add email to archive (and remove from queue, 
	 * as appropriate). If Graph is not successful in sending, add email to 
	 * queue.
	 * If settings indicate that it's not ok to send email right now,
	 * then just add the email to the queue if it's not already in there.
	 * Return an error only if we cannot at least queue the email. We don't 
	 * bother requester if we cannot send but can queue.
	 * Requester may examine the response details to determine whether 
	 * the email was sent or queued.
	 * @param {...Email} incomingEmail - {@link Email} object
	 */

	SendEmail: (incomingEmail) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve sending status
			module.exports.ReturnEmailSendingStatus()
				// if the promise is resolved with a result
				.then((settingResult) => {
					// copy to preserve function parameter
					const email = Utilities.ReturnCopyOfObject(JSON.parse(incomingEmail));
					// if the email does not have a received time
					if (!email.receivedTime) {
					// add a received timestamp to the email
						email.receivedTime = Utilities.ReturnFormattedDateTime('nowUTC', null, null);
					}
					// if there was no problem with retrieving the setting and 
					// 		it's ok to send email right now
					if (!settingResult.error && settingResult.sendingStatus) {
						// get a promise to send email to Graph
						MSGraph.SendEmailToGraph(email)
						// if the promise is resolved with a result
							.then((graphResults) => {
								// set up container for promises for async operations
								const emailQueueAndArchivePromises = [
								// add to container promise to add email to archive
									module.exports.AddEmailToArchive(email),
								];
								// if the email has an _id property, indicating it came from the email queue
								if (email._id) {
								// push to promise container promise to delete email from queue
									emailQueueAndArchivePromises.push(
										module.exports.DeleteQueuedEmail(email._id),
									);
								}
								// get a promise that will fulfill when the 
								// 		other promises have been fulfilled
								Promise.all(emailQueueAndArchivePromises)
								// if all promises were resolved
									.then((queueAndArchiveResults) => {
										resolve({
											error: false,
											email: incomingEmail,
											status: Status.ReturnStatusMessage(1),
										});
									})
									// if any promise was rejected
									.catch((queueOrArchiveError) => {
										// reject this promise
										const errorToReport = {
											error: true,
											graphError: false,
											mongoDBError: queueOrArchiveError,
											email: incomingEmail,
											status: Status.ReturnStatusMessage(2),
										};
										Errors.ProcessError(errorToReport);
										reject(errorToReport);
									});
							})
							// if the promise is rejected with an error
							.catch((graphError) => {
								// if this email is not already in the queue
								if (!email.queuedTime) {
									// get a promise to add email to queue
									module.exports.AddEmailToQueue(email)
										// if the promise is resolved with a result
										.then((addToQueueResult) => {
										// reject this promise
											reject({
												error: true,
												graphError: true,
												graphErrorDetails: graphError,
												mongoDBError: false,
												email: incomingEmail,
												status: Status.ReturnStatusMessage(3),
											});
										})
										// if the promise is rejected with an error
										.catch((addToQueueError) => {
											// reject this promise
											const errorToReport = {
												error: true,
												emergencyError: true,
												graphError: true,
												graphErrorDetails: graphError,
												mongoDBError: true,
												mongoDBErrorDetails: addToQueueError,
												email: incomingEmail,
												status: Status.ReturnStatusMessage(4),
											};
											Errors.ProcessError(errorToReport);
											reject(errorToReport);
										});
								// if email came from the queue
								} else {
									// reject this promise
									const errorToReport = {
										error: true,
										graphError: true,
										graphErrorDetails: graphError,
										mongoDBError: false,
										email: incomingEmail,
										status: Status.ReturnStatusMessage(5),
									};
									Errors.ProcessError(errorToReport);
									reject(errorToReport);
								}
							});
					// if there was no problem with retrieving the setting but 
					// 		it's not ok to send email right now, and
					// 		this email is not already in the queue
					} else if (
						!settingResult.error && 
						!settingResult.sendingStatus && 
						!email.queuedTime
					) {
						// get a promise to add email to queue
						module.exports.AddEmailToQueue(email)
							// if the promise is resolved with a result
							.then((addToQueueResult) => {
								// resolve this promise with an error object
								resolve({
									error: false,
									email: incomingEmail,
									status: Status.ReturnStatusMessage(6),
								});
							})
							// if the promise is rejected with an error
							.catch((addToQueueError) => {
								// reject this promise
								const errorToReport = {
									error: true,
									emergencyError: true,
									graphError: false,
									mongoDBError: true,
									mongoDBErrorDetails: addToQueueError,
									email: incomingEmail,
									status: Status.ReturnStatusMessage(7),
								};
								Errors.ProcessError(errorToReport);
								reject(errorToReport);
							});
					// if there was no problem with retrieving the setting but 
					// 		it's not ok to send email right now, and
					// 		this email is already in the queue
					} else if (
						!settingResult.error &&
						!settingResult.sendingStatus &&
						email.queuedTime
					) {
						// resolve this promise with an error object
						resolve({
							error: false,
							graphError: false,
							mongoDBError: false,
							email: incomingEmail,
							status: Status.ReturnStatusMessage(8),
						});
					// if we can't even retrieve the setting
					} else if (!settingResult.error) {
						// reject this promise
						const errorToReport = {
							error: true,
							emergencyError: true,
							graphError: false,
							mongoDBError: true,
							mongoDBErrorDetails: settingResult,
							email: incomingEmail,
							status: Status.ReturnStatusMessage(9),
						};
						Errors.ProcessError(errorToReport);
						reject(errorToReport);
					}
				})
				// if the promise is rejected with an error
				.catch((settingError) => {
					// reject this promise
					const errorToReport = {
						error: true,
						emergencyError: true,
						graphError: false,
						mongoDBError: true,
						mongoDBErrorDetails: settingError,
						email: incomingEmail,
						status: Status.ReturnStatusMessage(15),
					};
					Errors.ProcessError(errorToReport);
					reject(errorToReport);
				});
		}),
};
