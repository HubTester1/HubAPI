/**
 * @name Response
 * @service
 * @description Handles responses to requests and cron initiations.
 */

const Log = require('log');

module.exports = {

	/**
	 * @name HandleResponse
	 * @function
	 * @async
	 * @description Given data and response function, log request, 
	 * use function to respond to request, and, as needed, 
	 * process error.
	 * @param {...Response} incomingResponse - {@link Response} object
	 */

	HandleResponse: ({
		processError,
		emergencyError,
		statusCode,
		responder,
		content,
	}) => {
		// set up returnValue var
		let returnValue;
		// if there's a status code
		if (statusCode) {
			// set returnValue to a Lambda function HTTP response
			returnValue = {
				statusCode,
				headers: {
					'Access-Control-Allow-Origin': '*',
				},
				body: JSON.stringify(content),
			};
		// if there's no status code
		} else {
			// set returnValue to content
			returnValue = content;
		}
		// log content
		Log.Log(content);
		// respond with return value, using responder function
		responder(returnValue);
	},
	
};
