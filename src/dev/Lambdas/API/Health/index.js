/**
 * @name Health
 * @api
 * @description Handles all health-related requests.
 */

const Health = require('health');

module.exports = {

	/**
	 * @name HandleHealthCheckRequest
	 * @function
	 * @async
	 * @description Handle request to check system health.
	 */

	HandleHealthCheckRequest: (event, context) => 
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to 
			Health.ReturnHealth()
				// if the promise is resolved with a result
				.then((healthResult) => {
					// resolve this promise with the result and metadata
					resolve({
						statusCode: 200,
						headers: {
							'Access-Control-Allow-Origin': '*',
							'Access-Control-Allow-Credentials': true,
						},
						body: JSON.stringify({
							healthResult,
							event,
							context,
						}),
					});
				})
				// if the promise is rejected with an error
				.catch((healthError) => {
					// reject this promise with the error and metadata
					resolve({
						statusCode: 500,
						headers: {
							'Access-Control-Allow-Origin': '*',
							'Access-Control-Allow-Credentials': true,
						},
						body: JSON.stringify({
							healthError,
							event,
							context,
						}),
					});
				});
		}),

};
