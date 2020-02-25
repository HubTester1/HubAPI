/**
 * @name Access
 * @api
 * @description XXX
 */

const Access = require('access');
const Response = require('response');
const DataQueries = require('data-queries');

module.exports = {

	/**
	 * @name ReturnAccessSettingsData
	 * @function
	 * @async
	 * @description Return all access settings 
	 * (all docs from the 'accessSettings' collection).
	 */

	ReturnAccessSettingsData: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve the documents
			DataQueries.ReturnAllDocsFromCollection('accessSettings')
				// if the promise is resolved with the docs
				.then((result) => {
					// resolve this promise with the docs
					resolve(result);
				})
				// if the promise is rejected with an error
				.catch((error) => {
					// reject this promise with an error
					reject(error);
				});
		}),

	/**
	 * @name ReturnAccessWhitelistedDomains
	 * @function
	 * @async
	 * @description Return the setting indicating the domains from which requests are accepted.
	 * Add a domain to this setting in database to allow requests from an additional domain.
	 */

	ReturnAccessWhitelistedDomains: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve all email settings
			module.exports.ReturnAccessSettingsData()
				// if the promise is resolved with the settings
				.then((settings) => {
					// resolve this promise with the requested setting
					resolve({
						error: settings.error,
						whitelistedDomains: settings.docs[0].whitelistedDomains,
					});
				})
				// if the promise is rejected with an error
				.catch((error) => {
					// reject this promise with an error
					reject(error);
				});
		}),


	/**
	 * @name HandleAWSCredentialsRequest
	 * @function
	 * @description Handle request to retrieve AWS credentials.
	 */

	HandleAWSCredentialsRequest: (event, context, callback) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to check access
			Access.ReturnRequesterCanAccess(
				event,
				module.exports.ReturnAccessWhitelistedDomains,
			)
				// if the promise is resolved with a result
				.then((accessResult) => {
					// send indicative response
					Response.HandleResponse({
						statusCode: 200,
						responder: resolve,
						content: {
							payload: {
								authMOSAPISLSAdminAccessKeyID:
									process.env.authMOSAPISLSAdminAccessKeyID,
								authMOSAPISLSAdminSecretAccessKey:
									process.env.authMOSAPISLSAdminSecretAccessKey,
							},
							event,
							context,
						},
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
