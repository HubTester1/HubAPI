/**
 * @name Email
 * @api
 * @description Handles all email-related cron job commands.
 */

const Email = require('email');
const Cron = require('cron');

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
			// resolve this promise with the result and metadata
			// get a promise to process email queue
			Email.ProcessEmailQueue()
				// if the promise is resolved with a result
				.then((queueResult) => {
					// get a promise to record in cron log
					Cron.Log({
						process: 'ProcessEmailQueue',
						status: 'success',
						result: queueResult,
						event,
						context,
					})
						// if the promise is resolved with a result
						.then((cronResult) => {
							// resolve this promise with the result and metadata
							resolve({
								statusCode: 200,
								headers: {
									'Access-Control-Allow-Origin': '*',
									'Access-Control-Allow-Credentials': true,
								},
								body: JSON.stringify({
									cronResult,
									event,
									context,
								}),
							});
						})
						// if the promise is rejected with an error
						.catch((cronError) => {
							// resolve this promise with the error and metadata
							resolve({
								statusCode: 500,
								headers: {
									'Access-Control-Allow-Origin': '*',
									'Access-Control-Allow-Credentials': true,
								},
								body: JSON.stringify({
									cronError,
									event,
									context,
								}),
							});
						});
				})
				// if the promise is rejected with an error
				.catch((queueError) => {
					// get a promise to record in cron log
					Cron.Log({
						process: 'ProcessEmailQueue',
						status: 'error',
						result: queueError,
					})
						// if the promise is resolved with a result
						.then((cronResult) => {
							// resolve this promise with the error and metadata
							resolve({
								statusCode: 500,
								headers: {
									'Access-Control-Allow-Origin': '*',
									'Access-Control-Allow-Credentials': true,
								},
								body: JSON.stringify({
									cronResult,
									event,
									context,
								}),
							});
						})
						// if the promise is rejected with an error
						.catch((cronError) => {
							// resolve this promise with the error and metadata
							resolve({
								statusCode: 500,
								headers: {
									'Access-Control-Allow-Origin': '*',
									'Access-Control-Allow-Credentials': true,
								},
								body: JSON.stringify({
									cronError,
									event,
									context,
								}),
							});
						});
				});
		}),
};
