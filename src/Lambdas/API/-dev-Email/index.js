/**
 * @name Email
 * @api
 * @description XXX
 */

const DataQueries = require('data-queries');
const Utilities = require('utilities');
const MSGraph = require('ms-graph');


/**
 * @name XXX
 * @function
 * @async
 * @description XXX
 */

module.exports = {

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

	ProcessEmailQueue: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve all email queue data
			module.exports.ReturnEmailQueueData()
				// if the promise is resolved with the docs
				.then((emailQueueData) => {
					// start constructing result, defaulting to no errors
					const emailQueueProcessingResult = {
						error: false,
						emailQueueProcessingError: false,
						quantityEmailsInQueue: emailQueueData.docs.length,
						quantityEmailsSent: 0,
					};
					// if there are emails to be sent
					if (emailQueueData.docs.length > 0) {
						// get a promise to attempt to send each email
						module.exports.SendEachEmailFromArray(emailQueueData.docs)
							// when the promise to attempt to send each email is resolved
							.then((emailArraySendingResult) => {
								// parse the result and store in this function's result
								emailQueueProcessingResult.error = emailArraySendingResult.error;
								emailQueueProcessingResult.emailQueueProcessingError =
									emailArraySendingResult.emailArraySendingError;
								emailQueueProcessingResult.quantityEmailsSent =
									emailArraySendingResult.quantityEmailsSent;
								if (typeof (emailArraySendingResult.errorCollection) !== 'undefined') {
									emailQueueProcessingResult.errorCollection =
										emailArraySendingResult.errorCollection;
								}
								// resolve this promise with the result
								resolve(emailQueueProcessingResult);
							});
					// if there are no emails to be sent
					} else {
						// resolve this promise with a message
						resolve(emailQueueProcessingResult);
					}
				})
				// if the promise to retrieve all email queue data is rejected with an error, 
				// 		then reject this promise with the error
				.catch((error) => {
					reject(error);
				});
		}),

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
				// get a promise to send this emailValue
				module.exports.SendEmail(emailValue)
					// when the promise to send this emailValue is resolved
					.then((sendEmailResult) => {
						// if there was a transport or mongoDB error
						if (sendEmailResult.error === true) {
							// make sure error is true and collect errors, creating collection if it doesn't exist
							emailArraySendingResult.error = true;
							emailArraySendingResult.emailArraySendingError = true;
							if (typeof (emailArraySendingResult.errorCollection) === 'undefined') {
								emailArraySendingResult.errorCollection = [];
							}
							emailArraySendingResult.errorCollection.push(sendEmailResult);
							// if the error was not a transport error
							if (typeof (sendEmailResult.transportError) === 'undefined') {
								// increment emails sent
								emailArraySendingResult.quantityEmailsSent += 1;
							}
						// if there was NOT a transport or mongoDB error
						} else {
							// increment emails sent
							emailArraySendingResult.quantityEmailsSent += 1;
						}
						// if this was the last emailValue in the array
						if ((emailIndex + 1) === emailArraySendingResult.quantityEmailsInArray) {
							resolve(emailArraySendingResult);
						}
					});
			});
		}),

	AddEmailToQueue: (incomingEmail) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// preserve function parameter
			const email = Utilities.ReturnCopyOfObject(incomingEmail);
			// add a timestamp to the email
			email.queuedTime = Utilities.ReturnFormattedDateTime('nowUTC', null, null);
			// get a promise to retrieve all documents from the emailQueue document collection
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

	AddEmailToArchive: (incomingEmail) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// preserve function parameter
			const email = Utilities.ReturnCopyOfObject(incomingEmail);
			// add a timestamp to the email
			email.nesoArchivedTime = Utilities.ReturnFormattedDateTime('nowUTC', null, null);
			// get a promise to retrieve all documents from the emailQueue document collection
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

	ReplaceQueuedEmail: (emailID, email) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to replace the email in the emailQueue document collection
			DataQueries.OverwriteDocInCollection(emailID, email, 'emailQueue')
				// if the promise is resolved with the counts, then resolve this promise with the counts
				.then((result) => {
					resolve(result);
				})
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => {
					reject(error);
				});
		}),

	ReplaceArchivedEmail: (emailID, email) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to replace the email in the emailQueue document collection
			DataQueries.OverwriteDocInCollection(emailID, email, 'emailArchive')
				// if the promise is resolved with the counts, then resolve this promise with the counts
				.then((result) => {
					resolve(result);
				})
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => {
					reject(error);
				});
		}),

	ReplaceAllEmailSettings: (newSettings) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve all email settings
			module.exports.ReturnEmailSettingsData()
				// if the promise is resolved with the settings
				.then((existingSettings) => {
					// get a promise to replace the settings in the emailSettings document collection
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

	ReplaceOneEmailSetting: (newSingleSettingObject) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve all email settings
			module.exports.ReturnEmailSettingsData()
				// if the promise is resolved with the settings
				.then((existingSettings) => {
					// get a new version of all settings
					const newSettings = existingSettings.docs[0];
					// get an array containing the property key of newSingleSettingObject; 
					// 		iterate over the array
					Object.keys(newSingleSettingObject).forEach((newSingleSettingKey) => {
						// in the new settings, replace the relevant setting with 
						// 		the value passed to this function
						newSettings[newSingleSettingKey] = newSingleSettingObject[newSingleSettingKey];
					});
					// get a promise to replace the settings in the emailSettings document collection
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

	DeleteQueuedEmail: (docID) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve all documents from the emailQueue document collection
			DataQueries.DeleteDocFromCollection(docID, 'emailQueue')
				// if the promise is resolved with the docs, then resolve this promise with the docs
				.then((result) => {
					resolve(result);
				})
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => {
					reject(error);
				});
		}),

	DeleteArchivedEmail: (docID) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// if there is a docID
			if (docID !== null) {
				// get a promise to retrieve all documents from the emailQueue document collection
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
	 * @todo - get email from event or context properly
	 */
	
	SendEmail: (event, context) =>
	// return a new promise
		new Promise(((resolve, reject) => {
		// preserve function parameter
			const email = Utilities.ReturnCopyOfObject(event);
			// add a timestamp to the email
			email.receivedTime = Utilities.ReturnFormattedDateTime('nowUTC', null, null);
			// get a promise to send to Graph
			MSGraph.SendEmailToGraph(email)
				// if the promise
				.then((graphResults) => {
					resolve(graphResults);
					/* // if the email has no ID (because it didn't come from the queue), create a placeholder;
					// 		this allows us to structure the following code more simply (always only waiting
					// 		on two promise resolutions, rather than sometimes one and sometimes two)
					if (typeof (email._id) === 'undefined') {
						email._id = null;
					}
					// get promises to async delete email from queue and async add email to archive
					Promise.all([
						module.exports.DeleteQueuedEmail(email._id),
						module.exports.AddEmailToArchive(email),
					])
						// when all promises have resolved
						.then((deleteAndArchiveResults) => {
						// extract results for convenience
							const deleteResults = deleteAndArchiveResults[0];
							const archiveResults = deleteAndArchiveResults[1];
							// if there was no deletion error and no archive error
							if (deleteResults.error !== true && archiveResults.error !== true) {
							// resolve the SendEmail promise with a message
								resolve({
									error: false,
									transportError: transportResults.transportError,
									mongoDBError: false,
									messageId: transportResults.messageId,
									email: transportResults.email,
								});
							} else {
							// start constructing result
								const emailSendingResult = {
									error: true,
									transportError: transportResults.transportError,
									mongoDBError: true,
									messageId: transportResults.messageId,
									email: transportResults.email,
								};
								// if there was a deletion error
								if (deleteResults.error !== true) {
									emailSendingResult.errorCollection = [];
									emailSendingResult.errorCollection.push(deleteResults);
								}
								// if there was an archive error
								if (archiveResults.error !== true) {
									if (typeof (emailSendingResult.errorCollection) === 'undefined') {
										emailSendingResult.errorCollection = [];
									}
									emailSendingResult.errorCollection.push(archiveResults);
								}
								// process error
							// nesoErrors.ProcessError(emailSendingResult);
								// resolve the SendEmail promise with a message
								resolve(emailSendingResult);
							}
						}); */
				})
				// if the promise to transport to SMTP server is rejected with a result
				.catch((transportResults) => {
					// if this email did not come from the queue (i.e., don't queue already-queued emails)
					if (typeof (email.nesoQueuedTime) === 'undefined') {
						// get a promise to add email to queue
						module.exports.AddEmailToQueue(transportResults.email)
							// if the promise to add email to queue is resolved with a result
							.then((addToQueueResult) => {
								// construct a custom error
								const errorToReport = {
									error: true,
									transportError: transportResults.transportError,
									transportErrorDetails: transportResults.transportErrorDetails,
									mongoDBError: addToQueueResult.mongoDBError,
									email: transportResults.email,
								};
								/* // process error
							nesoErrors.ProcessError(errorToReport); */
								// resolve the SendEmail promise with a message
								resolve(errorToReport);
							})
							// if the promise to add email to queue is rejected with an error
							.catch((addToQueueResult) => {
								// construct a custom error
								const errorToReport = {
									error: true,
									transportError: transportResults.transportError,
									transportErrorDetails: transportResults.transportErrorDetails,
									emergencyError: true,
									emergencyErrorDetails: 'Transport error and queue error',
									mongoDBError: addToQueueResult.mongoDBError,
									mongoDBErrorDetails: addToQueueResult.mongoDBErrorDetails,
									email: transportResults.email,
								};
								/* // process error
							nesoErrors.ProcessError(errorToReport); */
								// resolve the SendEmail promise with a message
								resolve(errorToReport);
							});
					// if email came from the queue
					} else {
						// construct a custom error
						const errorToReport = {
							error: true,
							transportError: transportResults.transportError,
							transportErrorDetails: transportResults.transportErrorDetails,
							email: transportResults.email,
						};
						/* // process error
					nesoErrors.ProcessError(errorToReport); */
						// resolve the SendEmail promise with a message
						resolve(errorToReport);
					}
				});
		})),

};
