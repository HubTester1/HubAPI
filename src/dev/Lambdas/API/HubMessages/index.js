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
									iterationResult,
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

	/**
	 * @name ReturnAllUnexpiredMessagesByCreatedDate
	 * @function
	 * @async
	 * @description Return all unexpired messages.
	 */

	ReturnAllUnexpiredMessagesByCreatedDate: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// construct query object
			const queryObject = {};
			queryObject.messageExpiration = { $gte: new Date() };
			// get a promise to 
			DataQueries.ReturnSpecifiedDocsFromCollectionSorted(
				'hubMessages',
				queryObject,
				'messageCreated',
				'descending',
			)
				// if the promise is resolved with a result
				.then((docs) => {
					// then resolve this promise with the result
					const messagesWithPinnedFirst = 
						module.exports.ReturnMessagesWithPinnedFirst(docs);
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

	/**
	 * @name ReturnAnyMessageSetPinnedFirst
	 * @function
	 * @async
	 * @description For any set of messages, return them with the pinned messages first.
	 * @param {object[]} messagesArray - array of objects, each comprising data for one message
	 */

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
	 * @name ReturnQuantityUnexpiredMessagesByCreatedDate
	 * @function
	 * @async
	 * @description Return a specified quantity of unexpired messages.
	 * @param {number} messagesQuantity - quantity of messages to return
	 */

	ReturnQuantityUnexpiredMessagesByCreatedDate: (messagesQuantity) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to get all messages with pinned messages first
			module.exports.ReturnAllUnexpiredMessagesByCreatedDate()
				// if the promise is resolved with the messages, then resolve this promise with the docs
				.then((result) => {
					resolve({
						error: false,
						mongoDBError: false,
						docs: result.docs.slice(0, messagesQuantity),
					});
				})
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => { reject(error); });
		}),

	/**
	 * @name ReturnAllUnexpiredMessagesWithTagByCreatedDate
	 * @function
	 * @async
	 * @description Return a specified quantity of unexpired messages.
	 * @param {number} messagesQuantity - quantity of messages to return
	 */

	ReturnAllUnexpiredMessagesWithTagByCreatedDate: (name, camlName) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// note: queryObject MUST be constructed in the following way; 
			// 		attempts to "optimize" the next two lines result in errors
			const queryObject = {};
			queryObject.messageTags = [{ name, camlName }];
			queryObject.messageExpiration = { $gte: new Date() };

			// get a promise to retrieve all documents from the hcMessages document collection
			DataQueries.ReturnSpecifiedDocsFromCollectionSorted(
				'hubMessages',
				queryObject,
				'messageCreated',
				'descending',
			)
				// if the promise is resolved with the docs, then resolve this promise with the docs
				.then((result) => { resolve(result); })
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => { reject(error); });
		}),

	/**
	 * @name AddMessage
	 * @function
	 * @async
	 * @description Adds a message to the database.
	 * @param {object} incomingMessage - object comprising new message
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
				messageTags: incomingMessageCopy.newMessageTags,
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
				{ key: 'messageTags', value: incomingMessageCopy.newMessageTags },
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
									settingsResult,
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
									settingsError,
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
							accessError,
							event,
							context,
						},
					});
				});
		}),

	/**
	 * @name HandleAllUnexpiredMessagesRequest
	 * @function
	 * @async
	 * @description Handle request for all unexpired messages.
	 */

	HandleAllUnexpiredMessagesRequest: (event, context) =>
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
					module.exports.ReturnAllUnexpiredMessagesByCreatedDate()
						// if the promise is resolved with a result
						.then((messagesResult) => {
							// send indicative response
							Response.HandleResponse({
								statusCode: 200,
								responder: resolve,
								content: {
									messages: messagesResult,
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
									messagesError,
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
							accessError,
							event,
							context,
						},
					});
				});
		}),

	/**
	 * @name HandleQuantityUnexpiredMessagesRequest
	 * @function
	 * @async
	 * @description Handle request for a specified quantity of unexpired messages.
	 * Quantity is event.pathParameters.quantity.
	 */

	HandleQuantityUnexpiredMessagesRequest: (event, context) =>
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
					module.exports
						.ReturnQuantityUnexpiredMessagesByCreatedDate(
							parseInt(event.pathParameters.quantity, 10),
						)
						// if the promise is resolved with a result
						.then((messagesResult) => {
							// send indicative response
							Response.HandleResponse({
								statusCode: 200,
								responder: resolve,
								content: {
									messages: messagesResult,
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
									messagesError,
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
							accessError,
							event,
							context,
						},
					});
				});
		}),

	/**
	 * @name HandleAllUnexpiredMessagesWithTagRequest
	 * @function
	 * @async
	 * @description Handle request for all unexpired messages with a tag. 
	 * Tag name is event.pathParameters.name.
	 */

	HandleAllUnexpiredMessagesWithTagRequest: (event, context) =>
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
					module.exports
						.ReturnAllUnexpiredMessagesWithTagByCreatedDate(
							event.pathParameters.name,
						)
						// if the promise is resolved with a result
						.then((messagesResult) => {
							// send indicative response
							Response.HandleResponse({
								statusCode: 200,
								responder: resolve,
								content: {
									messages: messagesResult,
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
									messagesError,
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
							accessError,
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
									addMessageResult,
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
									addMessageError,
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
							accessError,
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
					HubMessages.ReturnHubMessagesSettings()
						// if the promise is resolved with a result
						.then((settingsResult) => {
							// send indicative response
							Response.HandleResponse({
								statusCode: 200,
								responder: resolve,
								content: {
									settingsResult,
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
									settingsError,
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
							accessError,
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
					HubMessages.ReturnHubMessagesSettings()
						// if the promise is resolved with a result
						.then((settingsResult) => {
							// send indicative response
							Response.HandleResponse({
								statusCode: 200,
								responder: resolve,
								content: {
									settingsResult,
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
									settingsError,
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
							accessError,
							event,
							context,
						},
					});
				});
		}),

};
