/**
 * @name Email
 * @service
 * @description Performs all email-related operations.
 * 
 * @todo cron log
 * @todo sending status
 * @todo queue processing status
 * @todo error handling
 * @todo access through domain or token
 */

/**
 * @typedef {import('../../TypeDefs/email').default} Email
 */

const DataQueries = require('data-queries');
const Utilities = require('utilities');
const MSGraph = require('ms-graph');

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
	 * @description Return the setting indicating the domains from which email requests are accepted.
	 * Add a domain to this setting in database to all requests from an additional domain.
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
	 * @description For each email in the queue, attempt to send the email (including
	 * archiving and deleting from queue).
	 */

	ProcessEmailQueue: () =>
		// return a new promise
		new Promise((resolve, reject) => {
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
								});
							})
							// if the promise is rejected with an error
							.catch((emailSendingError) => {
								// reject this promise with error and metadata
								reject({
									error: true,
									emailSendingError,
								});
							});
						// if there are no emails to be sent
					} else {
						// resolve this promise with no error or metadata
						resolve({
							error: false,
							queueProcessingResult: 'nothing in queue',
						});
					}
				})
				// if the promise is rejected with an error
				.catch((emailQueueError) => {
					// reject this promise with error and metadata
					reject({
						error: true,
						mongoDBError: true,
						mongoDBErrorDetails: emailQueueError,
					});
				});
		}),
	
	/**
	 * @name SendEachEmailFromArray
	 * @function
	 * @async
	 * @description For each email in an array, attempt to send the email.
	 * @param {Array} emailArray - array of objects, each comprising data for one email
	 */

	SendEachEmailFromArray: (emailArray) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// set up container for sending promises
			const sendingPromises = [];
			// iterate over the array of emails
			emailArray.forEach((emailValue, emailIndex) => {
				// push to container a promise to send this emailValue
				sendingPromises.push(module.exports.SendEmail(emailValue));
			});
			// get a promise that will fulfill when the other promises have been fulfilled
			Promise.all(sendingPromises)
				// if all promises were resolved
				.then((sendingResults) => {
					// resolve this promise with results and metadata
					resolve({
						error: false,
						sendingResults,
						emailArray,
					});
				})
				// if any promise was rejected
				.catch((sendingError) => {
					// reject this promise with error and metadata
					reject({
						error: true,
						sendingError,
						emailArray,
					});
				});
		}),
	
	/**
	 * @name AddEmailToQueue
	 * @function
	 * @async
	 * @description Add the email to the queue, i.e., the doc to the 'emailQueue' collection.
	 * @param {Email} incomingEmail
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
	 * @param {Email} incomingEmail
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
	 * @param {Email} incomingEmail
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
	 * @param {Email} incomingEmail
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
	 * @description Send one email to MSGraph service. If Graph is 
	 * successful in sending, add email to archive (and remove from queue, 
	 * as appropriate). If Graph is not successful in sending, add email to 
	 * queue.
	 * @param {Email} incomingEmail
	 */

	SendEmail: (incomingEmail) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// copy to preserve function parameter
			const email = Utilities.ReturnCopyOfObject(JSON.parse(incomingEmail));
			// if the email does not have a received time
			if (!email.receivedTime) {
				// add a received timestamp to the email
				email.receivedTime = Utilities.ReturnFormattedDateTime('nowUTC', null, null);
			}
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
					// get a promise that will fulfill when the other promises have been fulfilled
					Promise.all(emailQueueAndArchivePromises)
						// if all promises were resolved
						.then((queueAndArchiveResults) => {
							resolve({
								error: false,
								email: incomingEmail,
							});
						})
						// if any promise was rejected
						.catch((queueOrArchiveError) => {
							// reject this promise with a message
							reject({
								error: true,
								graphError: false,
								mongoDBError: queueOrArchiveError,
								email: incomingEmail,
							});
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
								// reject this promise with an error object
								reject({
									error: true,
									graphError: true,
									graphErrorDetails: graphError,
									mongoDBError: false,
									email: incomingEmail,
								});
							})
							// if the promise is rejected with an error
							.catch((addToQueueError) => {
								// reject this promise with an error object
								reject({
									error: true,
									graphError: true,
									graphErrorDetails: graphError,
									mongoDBError: true,
									mongoDBErrorDetails: addToQueueError,
									email: incomingEmail,
								});
							});
						// if email came from the queue
					} else {
						// reject this promise with an error object
						reject({
							error: true,
							graphError: true,
							graphErrorDetails: graphError,
							mongoDBError: false,
							email: incomingEmail,
						});
					}
				});
		}),
};
