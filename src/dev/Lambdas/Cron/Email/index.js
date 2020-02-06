/**
 * @name Email
 * @api
 * @description Handles all email-related cron job commands.
 */

const Email = require('email');
// const Cron = require('cron');
const moment = require('moment');

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
					// eslint-disable-next-line no-console
					console.log('easternTime', moment().format('dddd, MMM D YYYY, h:mm a'));
					// eslint-disable-next-line no-console
					console.log('queueResult', queueResult);
					// eslint-disable-next-line no-console
					console.log('event', event);
					// eslint-disable-next-line no-console
					console.log('context', context);
					/* // get a promise to record in cron log
					Cron.Log({
						process: 'ProcessEmailQueue',
						status: 'success',
						result: queueResult,
						event,
						context,
					})
						// if the promise is resolved with a result
						.then((cronResult) => { */
					// resolve this promise with the result and metadata
					resolve({
						statusCode: 200,
						headers: {
							'Access-Control-Allow-Origin': '*',
							'Access-Control-Allow-Credentials': true,
						},
						body: JSON.stringify({
							queueResult,
							event,
							context,
						}),
					});
					/* })
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
						}); */
				})
				// if the promise is rejected with an error
				.catch((queueError) => {
					// eslint-disable-next-line no-console
					console.log('queueError', queueError);
					// eslint-disable-next-line no-console
					console.log('event', event);
					// eslint-disable-next-line no-console
					console.log('context', context);
					/* // get a promise to record in cron log
					Cron.Log({
						process: 'ProcessEmailQueue',
						status: 'error',
						result: queueError,
					})
						// if the promise is resolved with a result
						.then((cronResult) => { */
					// resolve this promise with the error and metadata
					resolve({
						statusCode: 500,
						headers: {
							'Access-Control-Allow-Origin': '*',
							'Access-Control-Allow-Credentials': true,
						},
						body: JSON.stringify({
							queueError,
							event,
							context,
						}),
					});
					/* })
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
						}); */
				});
		}),
};
