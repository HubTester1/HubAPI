/**
 * @name Hub Messages
 * @api
 * @description Handles all Hub Messages-related requests.
 */

const HubMessages = require('hub-messages');
const Access = require('access');
const Response = require('response');
// ++++++++++++++++++++++++++
const DataQueries = require('data-queries');
const Utilities = require('utilities');
const moment = require('moment');

/**
 * @typedef {import('../../../TypeDefs/HubMessage').HubMessage} HubMessage
 */

module.exports = {


	/**
	 * @name ReturnHubMessagesSettings
	 * @function
	 * @description Return all Hub Messages settings
	 * (all docs from the 'hubMessagesSettings' collection).
	 */

	ReturnHubMessagesSettings: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve the documents
			DataQueries.ReturnAllDocsFromCollection('hubMessagesSettings')
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
		}),

	/**
	 * @name ReturnHubMessagesWhitelistedDomains
	 * @function
	 * @async
	 * @description Return the setting indicating the domains from which requests are accepted.
	 */

	ReturnHubMessagesWhitelistedDomains: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve all email settings
			module.exports.ReturnHubMessagesSettings()
				// if the promise is resolved with the settings
				.then((settings) => {
					// resolve this promise with the requested setting
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
		}),

	/**
	 * @name ReturnNextMessageIDAndIterate
	 * @function
	 * @async
	 * @description Return the next message ID and then add 1 to it.
	 */

	ReturnNextMessageIDAndIterate: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve all documents from the hcMessagesSettings document collection
			DataQueries.ReturnAllDocsFromCollection('hubMessagesSettings')
				// if the promise is resolved with the docs
				.then((result) => {
					// get a promise to 
					module.exports.IterateNextMessageID(result.docs[0])
						// if the promise is resolved with a result
						.then((iterationResult) => {
							// resolve this promise with the ID
							resolve({
								error: false,
								docs: { 
									nextMessageID: result.docs[0].nextMessageID,
								},
							});
						})
						// if the promise is rejected with an error
						.catch((iterationError) => {
							// reject this promise with the error
							reject({
								error: false,
								docs: {
									nextMessageID: result.docs[0].nextMessageID,
									iterationError,
								},
							});
						});
				})
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => { reject(error); });
		}),

	/**
	 * @name IterateNextMessageID
	 * @function
	 * @async
	 * @description Add 1 to the next message ID.
	 */

	IterateNextMessageID: (existingSettings) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to 
			const newNextMessageID = existingSettings.nextMessageID + 1;
			// get a promise to replace the settings in the hcMessagesSettings document collection
			DataQueries
				.UpdateSpecificFieldInSpecificDocsInCollection(
					'hubMessagesSettings',
					'_id',
					existingSettings._id,
					true,
					'nextMessageID',
					newNextMessageID,
				)
				// if the promise is resolved with a result
				.then((result) => {
					// then resolve this promise with the result
					resolve(result);
				})
				// if the promise is rejected with an error
				.catch((error) => {
					// reject this promise with the error
					reject(error);
				});
		}),

	// ---------------------


	/**
	 * @name ReturnSpecifiedMessages
	 * @function
	 * @async
	 * @description Return messages specified by options param
	 * @todo Create message options model and doc param
	 */

	ReturnSpecifiedMessages: (options = {}) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// start off query object
			const queryObject = {};
			// if there's an expiration option
			if (options.expiration) {
				// if expiration option is unexpired
				if (options.expiration === 'unexpired') {
					// specify querying for messages where expiration is 
					// 		greater than or equal to now
					queryObject.messageExpiration = { $gte: new Date() };
				}
				// if expiration option is expired
				if (options.expiration === 'expired') {
					// specify querying for messages where expiration is 
					// 		less than now
					queryObject.messageExpiration = { $lt: new Date() };
				}
			}
			// if there's an tag option
			if (options.tag) {
				// specify querying for messages with specified tag
				queryObject.messageTag = options.tag;
			}
			// get a promise to 
			DataQueries.ReturnSpecifiedLimitedDocsFromCollectionSorted(
				'hubMessages',
				queryObject,
				'messageCreated',
				'descending',
				parseInt(options.limit, 10),
			)
				// if the promise is resolved with a result
				.then((result) => {
					// then resolve this promise with the result
					const messagesWithPinnedFirst =
						module.exports.ReturnAnyMessageSetPinnedFirst(result.docs);
					resolve({
						error: false,
						mongoDBError: false,
						docs: messagesWithPinnedFirst,
					});
				})
				// if the promise is rejected with an error
				.catch((error) => {
					// construct a custom error
					const errorToReport = {
						error: true,
						mongoDBError: true,
						mongoDBErrorDetails: error,
					};
					// add error to Twitter
					// nesoErrors.ProcessError(errorToReport);
					// reject this promise with the error
					reject(errorToReport);
				});
		}),

	ReturnAnyMessageSetPinnedFirst: (messagesArray) => {
		// set up container arrays
		const messagesNotPinned = [];
		const messagesPinned = [];
		let allMessages = [];
		// for each message
		messagesArray.forEach((message) => {
			// if this message has a pinnedUntil property and
			// 		the pinnedUntil datetime is in the future
			if (
				message.pinnedUntil && 
				moment(message.pinnedUntil).isAfter(moment())
			) {
				// push this message to the messagesPinned array
				messagesPinned.push(message);
				// if this message has no pinnedUntil property OR 
				// 		the pinnedUntil dateime is NOT in the future
			} else {
				// push this message to the messagesNotPinned array
				messagesNotPinned.push(message);
			}
		});
		// concatenate message arrays, with pinned messages first
		allMessages = messagesPinned.concat(messagesNotPinned);
		// return array of messages, with pinned messages first
		return allMessages;
	},

	/**
	 * @name AddMessage
	 * @function
	 * @async
	 * @description Adds a message to the database.
	 * @param {...HubMessage} incomingMessage - {@link HubMessage} object
	 */

	AddMessage: (incomingMessage) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// preserve function parameter
			const incomingMessageCopy = 
				Utilities.ReturnUniqueObjectGivenAnyValue(incomingMessage);
			// weed out some unnecessary image data
			const imagesConverted = [];
			incomingMessageCopy.newMessageImages.forEach((imageValue) => {
				imagesConverted.push(imageValue.name);
			});
			const messageToInsert = {
				messageID: incomingMessageCopy.newMessageID,
				messageTag: incomingMessageCopy.newMessageTags[0].name,
				messageSubject: incomingMessageCopy.newMessageSubject,
				messageBody: incomingMessageCopy.newMessageBody,
				messageImages: imagesConverted,
				messageCreated: new Date(),
				messageCreator: incomingMessageCopy.newMessageCreator,
				messageModified: new Date(),
			};
			if (incomingMessageCopy.newMessageExpirationDate === '') {
				messageToInsert.messageExpiration = moment().add(180, 'days').toDate();
			} else {
				messageToInsert.messageExpiration =
					moment(incomingMessageCopy.newMessageExpirationDate).toDate();
			}

			// get a promise to retrieve all documents from the hcMessagesSettings document collection
			DataQueries.InsertDocIntoCollection(messageToInsert, 'hubMessages')
				// if the promise is resolved with the docs, then resolve this promise with the docs
				.then((result) => { resolve(result); })
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => { reject(error); });
		}),

	/**
	 * @name UpdateMessage
	 * @function
	 * @async
	 * @description Updates a message already in the database.
	 * @param {object} incomingMessage - object comprising new message
	 */

	UpdateMessage: (incomingMessage) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// preserve function parameter
			const incomingMessageCopy =
				Utilities.ReturnUniqueObjectGivenAnyValue(incomingMessage);
			// weed out some unnecessary image data
			const imagesConverted = [];
			incomingMessageCopy.newMessageImages.forEach((imageValue) => {
				imagesConverted.push(imageValue.name);
			});
			const messagePropsToSet = [
				{ key: 'messageTag', value: incomingMessageCopy.newMessageTags[0].name },
				{ key: 'messageSubject', value: incomingMessageCopy.newMessageSubject },
				{ key: 'messageBody', value: incomingMessageCopy.newMessageBody },
				{ key: 'messageImages', value: imagesConverted },
				{
					key: 'messageExpiration',
					value: moment(incomingMessageCopy.newMessageExpirationDate).toDate(),
				},
				{
					key: 'messageModified',
					value: new Date(),
				},
			];
			// get a promise to retrieve all documents from the hcMessagesSettings document collection
			DataQueries
				.UpdateSpecificFieldsInSpecificDocsInCollection('hubMessages', 'messageID', incomingMessageCopy.newMessageID, false, messagePropsToSet)
				// if the promise is resolved with the docs, then resolve this promise with the docs
				.then((result) => { resolve(result); })
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => { reject(error); });
		}),


	// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++

	/**
	 * @name HandleSettingsRequest
	 * @function
	 * @async
	 * @description Handle request for settings.
	 */

	HandleSettingsRequest: (event, context) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to check access
			Access.ReturnRequesterCanAccess(
				event,
				HubMessages.ReturnHubMessagesWhitelistedDomains,
			)
				// if the promise is resolved with a result
				.then((accessResult) => {
					// get a promise to return health status
					HubMessages.ReturnHubMessagesSettings()
						// if the promise is resolved with a result
						.then((settingsResult) => {
							// send indicative response
							Response.HandleResponse({
								statusCode: 200,
								responder: resolve,
								content: {
									payload: settingsResult.docs,
									event,
									context,
								},
							});
						})
						// if the promise is rejected with an error
						.catch((settingsError) => {
							// send indicative response
							Response.HandleResponse({
								statusCode: 500,
								responder: resolve,
								content: {
									error: settingsError,
									event,
									context,
								},
							});
						});
				})
				// if the promise is rejected with an error
				.catch((accessError) => {
					// send indicative response
					Response.HandleResponse({
						statusCode: 401,
						responder: resolve,
						content: {
							error: accessError,
							event,
							context,
						},
					});
				});
		}),

	/**
	 * @name HandleMessagesRequest
	 * @function
	 * @async
	 * @description Handle request for messages.
	 */

	HandleMessagesRequest: (event, context) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to check access
			Access.ReturnRequesterCanAccess(
				event,
				HubMessages.ReturnHubMessagesWhitelistedDomains,
			)
				// if the promise is resolved with a result
				.then((accessResult) => {
					// get a promise to return health status
					module.exports.ReturnSpecifiedMessages(
						event.queryStringParameters,
					)
						// if the promise is resolved with a result
						.then((messagesResult) => {
							// send indicative response
							Response.HandleResponse({
								statusCode: 200,
								responder: resolve,
								content: {
									payload: messagesResult.docs,
									event,
									context,
								},
							});
						})
						// if the promise is rejected with an error
						.catch((messagesError) => {
							// send indicative response
							Response.HandleResponse({
								statusCode: 500,
								responder: resolve,
								content: {
									error: messagesError,
									event,
									context,
								},
							});
						});
				})
				// if the promise is rejected with an error
				.catch((accessError) => {
					// send indicative response
					Response.HandleResponse({
						statusCode: 401,
						responder: resolve,
						content: {
							error: accessError,
							event,
							context,
						},
					});
				});
		}),

	/**
	 * @name HandleAddMessageRequest
	 * @function
	 * @async
	 * @description Handle request to add message. Message object is in event.body.
	 */
	
	HandleAddMessageRequest: (event, context) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to check access
			Access.ReturnRequesterCanAccess(
				event,
				HubMessages.ReturnHubMessagesWhitelistedDomains,
			)
				// if the promise is resolved with a result
				.then((accessResult) => {
					// get a promise to return health status
					module.exports.AddMessage(
						event.body,
					)
						// if the promise is resolved with a result
						.then((addMessageResult) => {
							// send indicative response
							Response.HandleResponse({
								statusCode: 200,
								responder: resolve,
								content: {
									payload: addMessageResult.docs,
									event,
									context,
								},
							});
						})
						// if the promise is rejected with an error
						.catch((addMessageError) => {
							// send indicative response
							Response.HandleResponse({
								statusCode: 500,
								responder: resolve,
								content: {
									error: addMessageError,
									event,
									context,
								},
							});
						});
				})
				// if the promise is rejected with an error
				.catch((accessError) => {
					// send indicative response
					Response.HandleResponse({
						statusCode: 401,
						responder: resolve,
						content: {
							error: accessError,
							event,
							context,
						},
					});
				});
		}),

	/**
	 * @name HandleUpdateMessageRequest
	 * @function
	 * @async
	 * @description Handle request to update message. Message object is in event.body.
	 */

	HandleUpdateMessageRequest: (event, context) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to check access
			Access.ReturnRequesterCanAccess(
				event,
				HubMessages.ReturnHubMessagesWhitelistedDomains,
			)
				// if the promise is resolved with a result
				.then((accessResult) => {
					// get a promise to return health status
					module.exports.UpdateMessage(
						event.body,
					)
						// if the promise is resolved with a result
						.then((updateMessageResult) => {
							// send indicative response
							Response.HandleResponse({
								statusCode: 200,
								responder: resolve,
								content: {
									payload: updateMessageResult.docs,
									event,
									context,
								},
							});
						})
						// if the promise is rejected with an error
						.catch((updateMessageError) => {
							// send indicative response
							Response.HandleResponse({
								statusCode: 500,
								responder: resolve,
								content: {
									error: updateMessageError,
									event,
									context,
								},
							});
						});
				})
				// if the promise is rejected with an error
				.catch((accessError) => {
					// send indicative response
					Response.HandleResponse({
						statusCode: 401,
						responder: resolve,
						content: {
							error: accessError,
							event,
							context,
						},
					});
				});
		}),

	/**
	 * @name HandleNextMessageIDRequest
	 * @function
	 * @async
	 * @description Handle request for the next message ID.
	 */

	HandleNextMessageIDRequest: (event, context) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to check access
			Access.ReturnRequesterCanAccess(
				event,
				HubMessages.ReturnHubMessagesWhitelistedDomains,
			)
				// if the promise is resolved with a result
				.then((accessResult) => {
					// get a promise to return health status
					module.exports.ReturnNextMessageIDAndIterate()
						// if the promise is resolved with a result
						.then((settingsResult) => {
							// send indicative response
							Response.HandleResponse({
								statusCode: 200,
								responder: resolve,
								content: {
									payload: settingsResult.docs,
									event,
									context,
								},
							});
						})
						// if the promise is rejected with an error
						.catch((settingsError) => {
							// send indicative response
							Response.HandleResponse({
								statusCode: 500,
								responder: resolve,
								content: {
									error: settingsError,
									event,
									context,
								},
							});
						});
				})
				// if the promise is rejected with an error
				.catch((accessError) => {
					// send indicative response
					Response.HandleResponse({
						statusCode: 401,
						responder: resolve,
						content: {
							error: accessError,
							event,
							context,
						},
					});
				});
		}),

};
