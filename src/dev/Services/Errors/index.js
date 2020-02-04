/**
 * @name Errors
 * @service
 * @description Handles everything related to errors
 */

const Twitter = require('twitter');
const moment = require('moment');

module.exports = {

	/**
	 * @name AddErrorToTwitter
	 * @function
	 * @async
	 * @description Given error data, construct Tweet and send it to Twitter.
	 */

	AddErrorToTwitter: (errorData) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// try to post error to twitter
			try {
				// construct tweet based on errorData
				let errorTweet = moment().format('ddd, MM/DD, h:mm a');
				errorTweet += ' - ';
				if (errorData.emergencyError) {
					errorTweet += 'Emergency Error: ';
					if (errorData.emergencyErrorDetails) {
						errorTweet += `${errorData.emergencyErrorDetails}.`;
					} else {
						errorTweet += 'No details available.';
					}
				} else {
					errorTweet += 'Standard Error.';
				}
				// get a twitter client using neso's twitter settings
				const twitterClient = new Twitter({
					consumer_key: process.env.hubHelpTwitterConsumerKey,
					consumer_secret: process.env.hubHelpTwitterConsumerSecret,
					access_token_key: process.env.hubHelpTwitterAccessTokenKey,
					access_token_secret: process.env.hubHelpTwitterAccessTokenSecret,
				});
				// attempt post error to Twitter
				twitterClient.post('statuses/update', {
					status: errorTweet,
				}, (tweetingError, tweet, response) => {
					// if there was an error posting to twitter
					if (tweetingError) {
						// construct custom error object
						const twitterErrorData = {
							error: true,
							twitterError: true,
							twitterErrorDetails: tweetingError,
						};
						// resolve the promise with the error data
						resolve(twitterErrorData);
					} else {
						resolve({
							error: false,
							twitterError: false,
						});
					}
				});
			} catch (tweetingError) {
				// construct custom error object
				const twitterErrorData = {
					error: true,
					twitterError: true,
					twitterErrorDetails: tweetingError,
				};
				// resolve the promise with the error data
				resolve(twitterErrorData);
			}
		}),

	/**
	 * @name ProcessError
	 * @function
	 * @async
	 * @description Given error data, send data to AddErrorToTwitter(). 
	 * (This is separate from AddErrorToTwitter() because we may want to 
	 * process errors in different or additional ways.)
	 */

	ProcessError: (errorData) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to add error to Twitter
			module.exports.AddErrorToTwitter(errorData)
				// if the promise is resolved with the result
				.then((result) => {
					// resolve this promise with the result
					resolve(result);
				})
				// if the promise is rejected with an error
				.catch((error) => {
					// reject this promise with an error
					reject(error);
				});
		}),

	/**
	 * @name ReturnErrorMessage
	 * @function
	 * @description Given a message ID, return an error message.
	 * @param {number} messageID - ID of message to return, e.g., 14
	 */

	ReturnErrorMessage: (messageID) => {
		let messageToReturn = '';
		switch (messageID) {
		case 1:
			messageToReturn = '1 - email sent and archived';
			break;
		case 2:
			messageToReturn = '2 - email sent, queue or archival error';
			break;
		case 3:
			messageToReturn = '3 - email sending error but queued';
			break;
		case 4:
			messageToReturn = '4 - email sending error and not queued';
			break;
		case 5:
			messageToReturn = '5 - email sending error but queued';
			break;
		case 6:
			messageToReturn = '6 - email sending disabled but email queued';
			break;
		case 7:
			messageToReturn = '7 - email sending disabled and email not queued';
			break;
		case 8:
			messageToReturn = '8 - email sending disabled but email queued';
			break;
		case 9:
			messageToReturn = '9 - email settings unavailable';
			break;
		case 10:
			messageToReturn = '10 - queued emails sent';
			break;
		case 11:
			messageToReturn = '11 - queued emails not sent';
			break;
		case 12:
			messageToReturn = '12 - no queued emails';
			break;
		case 13:
			messageToReturn = '13 - email queue unavailable';
			break;
		case 14:
			messageToReturn = '14 - queue processing disabled';
			break;
		/* case XXX:
			messageToReturn = 'XXXXXXXXXXXX';
			break;
		case XXX:
			messageToReturn = 'XXXXXXXXXXXX';
			break;
		case XXX:
			messageToReturn = 'XXXXXXXXXXXX';
			break;
		case XXX:
			messageToReturn = 'XXXXXXXXXXXX';
			break;
		case XXX:
			messageToReturn = 'XXXXXXXXXXXX';
			break;
		case XXX:
			messageToReturn = 'XXXXXXXXXXXX';
			break;
		case XXX:
			messageToReturn = 'XXXXXXXXXXXX';
			break;
		case XXX:
			messageToReturn = 'XXXXXXXXXXXX';
			break;
		case XXX:
			messageToReturn = 'XXXXXXXXXXXX';
			break;
		case XXX:
			messageToReturn = 'XXXXXXXXXXXX';
			break;
		case XXX:
			messageToReturn = 'XXXXXXXXXXXX';
			break;
		case XXX:
			messageToReturn = 'XXXXXXXXXXXX';
			break;
		case XXX:
			messageToReturn = 'XXXXXXXXXXXX';
			break;
		case XXX:
			messageToReturn = 'XXXXXXXXXXXX';
			break;
		case XXX:
			messageToReturn = 'XXXXXXXXXXXX';
			break; */
		default:
			break;
		}
		return messageToReturn;
	},
	
};
