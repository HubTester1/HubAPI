/**
 * @name Status
 * @service
 * @description Return shorthand summaries of operations results. 
 * Include a unique ID so we can trace the exact origin of the message.
 */

module.exports = {

	/**
	 * @name ReturnStatusMessage
	 * @function
	 * @description Given a message ID, return a status message.
	 * @param {number} messageID - ID of message to return, e.g., 14
	 * @param {string} token - additional text to be used in message, e.g., 'name of error is X'
	 */

	ReturnStatusMessage: (messageID, token) => {
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
		case 15:
			messageToReturn = '15 - email settings unavailable';
			break;
		case 16:
			messageToReturn = '16 - email settings unavailable';
			break;
		case 17:
			messageToReturn = '17 - email settings unavailable';
			break;
		case 18:
			messageToReturn = `18 - domain whitelist retrieval failed for ${token}`;
			break;
		case 19:
			messageToReturn = '19 - accessToken and origin missing';
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
			break; */
		default:
			break;
		}
		return messageToReturn;
	},
	
};
