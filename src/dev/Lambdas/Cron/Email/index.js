/**
 * @name Email
 * @api
 * @description Handles all email-related cron job commands.
 */

const Email = require('email');
const Access = require('access');
const Response = require('response');

module.exports = {

	/**
	 * @name HandleProcessEmailQueue
	 * @function
	 * @async
	 * @description Handle cron job command to process email queue.
	 */
	
	HandleProcessEmailQueue: (event, context) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to check access
			Access.ReturnRequesterCanAccess(
				event,
				Email.ReturnEmailWhitelistedDomains,
			)
				// if the promise is resolved with a result
				.then((accessResult) => {
					// get a promise to process email queue
					Email.ProcessEmailQueue()
						// if the promise is resolved with a result
						.then((queueResult) => {
							// send indicative response
							Response.HandleResponse({
								statusCode: 200,
								responder: resolve,
								content: {
									queueResult,
									event,
									context,
								},
							});
						})
						// if the promise is rejected with an error
						.catch((queueError) => {
							// send indicative response
							Response.HandleResponse({
								statusCode: 500,
								responder: resolve,
								content: {
									queueError,
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
