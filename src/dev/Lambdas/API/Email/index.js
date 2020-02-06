/**
 * @name Email
 * @api
 * @description Handles all email-related requests.
 */

const Email = require('email');
const Access = require('access');
const Utilities = require('utilities');
const moment = require('moment');


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
			// get a promise to check access
			// Access.ReturnRequesterCanAccess(
			Access.ReturnRequesterCanAccess(
				event,
				Email.ReturnEmailWhitelistedDomains,
			)
				// if the promise is resolved with a result
				.then((accessResult) => {
					// preserve function parameter
					const eventBody = Utilities.ReturnCopyOfObject(event.body);
					// if there's an access token
					if (eventBody.accessToken) {
						// delete it
						delete eventBody.accessToken;
					}
					// get a promise to send the email
					Email.SendEmail(eventBody)
					// if the promise is resolved with a result
						.then((sendResult) => {
							// eslint-disable-next-line no-console
							console.log('easternTime', moment().format('dddd, MMM D YYYY, h:mm a'));
							// eslint-disable-next-line no-console
							console.log('sendResult', sendResult);
							// eslint-disable-next-line no-console
							console.log('event', event);
							// eslint-disable-next-line no-console
							console.log('context', context);
							// resolve this promise with the result and metadata
							resolve({
								statusCode: 200,
								headers: {
									'Access-Control-Allow-Origin': '*',
									'Access-Control-Allow-Credentials': true,
								},
								body: JSON.stringify({
									sendResult,
									event,
									context,
								}),
							});
						})
					// if the promise is rejected with an error
						.catch((sendError) => {
							// if there was no graph error or no mongoDB error; i.e.,
							// 		if either sending or queueing was successful
							if (!sendError.graphError || !sendError.mongoDBError) {
								// eslint-disable-next-line no-console
								console.log('sendError', sendError);
								// eslint-disable-next-line no-console
								console.log('event', event);
								// eslint-disable-next-line no-console
								console.log('context', context);
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
									body: JSON.stringify({
										sendError,
										event,
										context,
									}),
								});
							}
							// if there was a graph error and there was a queue error; i.e., 
							//		we have no way of handling the email
							if (sendError.graphError && sendError.mongoDBError) {
								// eslint-disable-next-line no-console
								console.log('sendError', sendError);
								// eslint-disable-next-line no-console
								console.log('event', event);
								// eslint-disable-next-line no-console
								console.log('context', context);
								// reject this promise with the error and metadata
								resolve({
									statusCode: 500,
									headers: {
										'Access-Control-Allow-Origin': '*',
										'Access-Control-Allow-Credentials': true,
									},
									body: JSON.stringify({
										sendError,
										event,
										context,
									}),
								});
							}
						});
				})
				// if the promise is rejected with an error
				.catch((accessError) => {
					// eslint-disable-next-line no-console
					console.log('accessError', accessError);
					// eslint-disable-next-line no-console
					console.log('event', event);
					// eslint-disable-next-line no-console
					console.log('context', context);
					// reject this promise with the error and metadata
					resolve({
						statusCode: 401,
						headers: {
							'Access-Control-Allow-Origin': '*',
							'Access-Control-Allow-Credentials': true,
						},
						body: JSON.stringify({
							accessError,
							event,
							context,
						}),
					});
				});
		}),
};
