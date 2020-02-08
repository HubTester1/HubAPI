/**
 * @name TEMP MIGRATION
 * @service
 * @description Temporary service, to migrate data from Neso.
 */

const axios = require('axios');
// const Utilities = require('utilities');
const DataQueries = require('data-queries');

module.exports = {

	ReturnMessageImageArray: (messageImages) => {
		const imagesToReturn = [];
		messageImages.forEach((imageObject) => {
			const newImageObject = {
				error: imageObject.error,
				name: imageObject.name,
				key: imageObject.key,
				urlLarge: imageObject.urlLarge
					.replace(
						'https://neso.mos.org:443/images/hcMessages/',
						'https://bmos.sharepoint.com/HubMessagesAssets/',
					),
				urlSmall: imageObject.urlSmall
					.replace(
						'https://neso.mos.org:443/images/hcMessages/',
						'https://bmos.sharepoint.com/HubMessagesAssets/',
					),
			};
			imagesToReturn.push(newImageObject);
		});
		return imagesToReturn;
	},

	MigrateMessages: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to 
			axios.get('https://neso.mos.org/hcMessages/descending/limit4')
				// if the promise is resolved with a result
				.then((messagesResults) => {
					// set up var to receive all messages
					const allMessagesToInsert = [];
					// iterate over the results and push them to allListItems
					messagesResults.data.docs.forEach((messageValue) => {
						const messageFormatted = {
							messageID: messageValue.messageID,
							messageTags: messageValue.messageTags,
							messageSubject: messageValue.messageSubject,
							messageBody: messageValue.messageBody,
							messageImages: 
								module.exports.ReturnMessageImageArray(messageValue.messageImages),
							messageCreated: new Date(messageValue.messageCreated),
							messageCreator: messageValue.messageCreator,
							messageModified: new Date(messageValue.messageModified),
							messageExpiration: new Date(messageValue.messageExpiration),
						};
						allMessagesToInsert.push(messageFormatted);
					});
					// sort messages according to modified property
					// allMessagesToInsert.sort((a, b) => {
					// 	if (moment(a.modified).isBefore(moment(b.modified))) {
					// 		return 1;
					// 	}
					// 	return -1;
					// });
					// resolve this promise with the requested items
					// get a promise to 
					DataQueries.InsertDocIntoCollection(allMessagesToInsert, 'hubMessages')
					// if the promise is resolved with a result
						.then((result) => {
							// then resolve this promise with the result
							resolve({
								error: result.error,
								mongoDBError: result.mongoDBError,
								mongoDBErrorDetails: result.mongoDBErrorDetails,
								docCount: result.docs.length,

							});
						})
					// if the promise is rejected with an error
						.catch((error) => {
							// reject this promise with the error
							reject(error);
						});
				})
				// if the promise is rejected with an error
				.catch((error) => {
					// reject this promise with the error
					reject(error);
				});
		}),
	
};
