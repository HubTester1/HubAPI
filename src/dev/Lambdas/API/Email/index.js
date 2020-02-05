/**
 * @name Email
 * @api
 * @description Handles all email-related requests.
 */

const Email = require('email');

module.exports = {

	/**
	 * @name HandleSendEmailRequest
	 * @function
	 * @async
	 * @description Handle request to send email.
	 */

	HandleSendEmailRequest: (event, context) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to send the email
			Email.SendEmail(event.body)
				// if the promise is resolved with a result
				.then((result) => {
					// resolve this promise with the result and metadata
					resolve({
						statusCode: 200,
						headers: {
							'Access-Control-Allow-Origin': '*',
							'Access-Control-Allow-Credentials': true,
						},
						body: JSON.stringify(result),
					});
				})
				// if the promise is rejected with an error
				.catch((error) => {
					// if there was no graph error or no mongoDB error; i.e.,
					// 		if either sending or queueing was successful
					if (!error.graphError || !error.mongoDBError) {
						// resolve this promise with the error and metadata; i.e.,
						// 		resolve instead of reject because we don't want to 
						// 		bother the requester with our internal problems
						// 		as long as the email was either sent or queued
						resolve({
							statusCode: 200,
							headers: {
								'Access-Control-Allow-Origin': '*',
								'Access-Control-Allow-Credentials': true,
							},
							body: JSON.stringify(error),
						});
					}
					// if there was a graph error and there was a queue error; i.e., 
					//		we have no way of handling the email
					if (error.graphError && error.mongoDBError) {
						// reject this promise with the error and metadata
						resolve({
							statusCode: 500,
							headers: {
								'Access-Control-Allow-Origin': '*',
								'Access-Control-Allow-Credentials': true,
							},
							body: JSON.stringify(error),
						});
					}
				});
		}),
};
