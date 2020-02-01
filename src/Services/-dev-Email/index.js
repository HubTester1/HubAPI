/**
 * @name Email
 * @service
 * @description Performs all email-related operations.
 */

const DataQueries = require('data-queries');
const Utilities = require('utilities');
const MSGraph = require('ms-graph');

module.exports = {
	
	/**
	 * @name XXX
	 * @function
	 * @async
	 * @description XXX
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
	 * @name XXX
	 * @function
	 * @async
	 * @description XXX
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
	 * @name XXX
	 * @function
	 * @async
	 * @description XXX
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
	 * @name XXX
	 * @function
	 * @async
	 * @description XXX
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
	 * @name XXX
	 * @function
	 * @async
	 * @description XXX
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
	 * @name XXX
	 * @function
	 * @async
	 * @description XXX
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
	 * @name XXX
	 * @function
	 * @async
	 * @description XXX
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
	 * @name XXX
	 * @function
	 * @async
	 * @description XXX
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
	 * @name XXX
	 * @function
	 * @async
	 * @description XXX
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
	 * @name XXX
	 * @function
	 * @async
	 * @description XXX
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
	 * @name XXX
	 * @function
	 * @async
	 * @description XXX
	 */

	ReplaceQueuedEmail: (emailID, email) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to overwrite the document
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
	
	/**
	 * @name XXX
	 * @function
	 * @async
	 * @description XXX
	 */

	ReplaceArchivedEmail: (emailID, email) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to overwrite the document
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
	
	/**
	 * @name XXX
	 * @function
	 * @async
	 * @description XXX
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
	 * @name XXX
	 * @function
	 * @async
	 * @description XXX
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
	 * @name XXX
	 * @function
	 * @async
	 * @description XXX
	 */

	DeleteQueuedEmail: (docID) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to delete all documents
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
	
	/**
	 * @name XXX
	 * @function
	 * @async
	 * @description XXX
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
	 * @name XXX
	 * @function
	 * @async
	 * @description XXX
	 */

	SendEmail: (emailData) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// copy to preserve function parameter
			const email = Utilities.ReturnCopyOfObject(JSON.parse(emailData));
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
								email: emailData,
							});
						})
						// if any promise was rejected
						.catch((queueOrArchiveError) => {
							// reject this promise with a message
							reject({
								error: true,
								graphError: false,
								mongoDBError: queueOrArchiveError,
								email: emailData,
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
									email: emailData,
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
									email: emailData,
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
							email: emailData,
						});
					}
				});
		}),
};
