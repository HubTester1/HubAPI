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
	
	HandleProcessEmailQueue: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to process email queue
			Email.ProcessEmailQueue()
				// if the promise is resolved with a result
				.then((queueResult) => {
					// get a promise to record in cron log
					Cron.Log({
						process: 'ProcessEmailQueue',
						status: 'success',
						result: queueResult,
					})
						// if the promise is resolved with a result
						.then((cronResult) => {
							// then resolve this promise with the result
							resolve(cronResult);
						})
						// if the promise is rejected with an error
						.catch((error) => {
							// reject this promise with the error
							reject(error);
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
							// then resolve this promise with the result
							resolve(cronResult);
						})
						// if the promise is rejected with an error
						.catch((error) => {
							// reject this promise with the error
							reject(error);
						});
				});
		}),
};
