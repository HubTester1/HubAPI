/**
 * @name Errors
 * @service
 * @description Handles everything related to errors
 */

module.exports = {
	
	ReturnErrorMessage: (messageID) => {
		let messageToReturn = '';
		switch (messageID) {
		case 1:
			messageToReturn = 'email sent and archived';
			break;
		case 2:
			messageToReturn = 'email sent, queue or archival error';
			break;
		case 3:
			messageToReturn = 'email sending error but queued';
			break;
		case 4:
			messageToReturn = 'email sending error and not queued';
			break;
		case 5:
			messageToReturn = 'email sending error but queued';
			break;
		case 6:
			messageToReturn = 'email sending disabled but email queued';
			break;
		case 7:
			messageToReturn = 'email sending disabled and email not queued';
			break;
		case 8:
			messageToReturn = 'email sending disabled but email queued';
			break;
		case 9:
			messageToReturn = 'email settings unavailable';
			break;
		case 10:
			messageToReturn = 'queued emails sent';
			break;
		case 11:
			messageToReturn = 'queued emails not sent';
			break;
		case 12:
			messageToReturn = 'no queued emails';
			break;
		case 13:
			messageToReturn = 'email queue unavailable';
			break;
		case 14:
			messageToReturn = 'queue processing disabled';
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
