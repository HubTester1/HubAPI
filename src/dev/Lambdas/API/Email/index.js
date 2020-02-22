/**
 * @name Email
 * @api
 * @description Handles all email-related requests.
 */

const Email = require('email');
const Access = require('access');
const Utilities = require('utilities');
const Response = require('response');

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
							// send indicative response
							Response.HandleResponse({
								statusCode: 200,
								responder: resolve,
								content: {
									payload: sendResult,
									event,
									context,
								},
							});
						})
					// if the promise is rejected with an error
						.catch((sendError) => {
							// if there was no graph error or no mongoDB error; i.e.,
							// 		if either sending or queueing was successful
							if (!sendError.graphError || !sendError.mongoDBError) {
								// send indicative response
								// resolve this promise with the error and metadata; i.e.,
								// 		resolve instead of reject because we don't want to 
								// 		bother the requester with our internal problems
								// 		as long as the email was either sent or queued
								Response.HandleResponse({
									statusCode: 200,
									responder: resolve,
									content: {
										error: sendError,
										event,
										context,
									},
								});
							}
							// if there was a graph error and there was a queue error; i.e., 
							//		we have no way of handling the email
							if (sendError.graphError && sendError.mongoDBError) {
								// send indicative response
								Response.HandleResponse({
									statusCode: 500,
									responder: resolve,
									content: {
										error: sendError,
										event,
										context,
									},
								});
							}
						});
				})
				// if the promise is rejected with an error
				.catch((accessError) => {
					// send indicative response
					Response.HandleResponse({
						statusCode: 401,
						responder: resolve,
						content: {
							error: accessError,
							event,
							context,
						},
					});
				});
		}),
};
