/**
 * @name Access
 * @service
 * @description Performs all access-related operations.
 */

const Errors = require('errors');
const Status = require('status');
const Utilities = require('utilities');

module.exports = {

	/**
	 * @name ReturnRequesterCanAccess
	 * @function
	 * @description Examine event to determine if valid access token is 
	 * present or if the request was made from a whitelisted domain.
	 * @param {object} event - Standard AWS event parameter.
	 * @param {Function} whitelistFunction - Function to return whitelisted domains
	 * for the API requested; e.g., Health.ReturnHealthWhitelistedDomains
	 */

	ReturnRequesterCanAccess: (event, whitelistFunction) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// if this is a cron job
			if (
				(event.source && 
				(
					event.source === 'aws.events' || 
					event.source === 'local'
				)) ||
				(event.Records && 
				event.Records[0] && 
				event.Records[0].eventSource && 
				event.Records[0].eventSource === 'aws:s3')
			) {
				// resolve immediately
				resolve({
					error: false,
					requesterCanAccess: true,
				});
			// if this isn't a cron job
			} else {
				// set up access token and prefix var
				let accessToken;
				const accessTokenPrefix = 'Bearer ';
				// if event contains a truthy body property
				if (event.headers) {
					// ensure event.body is an object
					const eventHeaders = 
						Utilities.ReturnUniqueObjectGivenAnyValue(event.headers);
					// try to get access token plus its prefix out of eventHeaders
					const accessTokenAndPrefix = eventHeaders.Authorization;
					// if the result is a string and it contains accessTokenPrefix
					if (
						typeof (accessTokenAndPrefix) === 'string' && 
						accessTokenAndPrefix.includes(accessTokenPrefix)
					) {
						// extract the access token
						accessToken = accessTokenAndPrefix
							.slice(accessTokenAndPrefix.indexOf(accessTokenPrefix));
					}
				}
				// if an access token was sent and it contains the correct value
				if (
					accessToken && 
					Utilities.ReturnJWTPayload(accessToken).message === process.env.authJWTPayloadMessage
				) {
					// resolve this promise
					resolve({
						error: false,
						requesterCanAccess: true,
					});
				// if no access token was sent but event has an origin header
				} else if (event.headers && event.headers.origin) {				
					// get a promise to retrieve the whitelisted domains
					whitelistFunction()
						// if the promise is resolved
						.then((whitelistResult) => {
							// set up whitelisted flag and default to false
							let domainIsWhitelisted = false;
							// for each whitelisted domain
							whitelistResult.whitelistedDomains.forEach((domain) => {
								// if this whitelisted domain matches the origin header
								if (event.headers.origin === domain) {
									// change whitelisted flag to true
									domainIsWhitelisted = true;
								}
							});
							// if flag indicates domain is whitelisted
							if (domainIsWhitelisted) {
								// resolve this promise
								resolve({
									error: false,
									requesterCanAccess: true,
								});
							// if flag indicates domain is not whitelisted
							} else {
								// reject this promise
								reject({
									error: false,
									requesterCanAccess: false,
								});
							}
						})
						// if the promise is rejected with an error
						.catch((whitelistError) => {
							// reject this promise
							const errorToReport = {
								error: true,
								emergencyError: true,
								requesterCanAccess: false,
								whitelistError,
								status: Status.ReturnStatusMessage(18, whitelistFunction.name),
							};
							Errors.ProcessError(errorToReport);
							reject(errorToReport);
						});
				// if there's no access token and no origin header
				} else {
					// reject this promise
					reject({
						error: false,
						requesterCanAccess: false,
						status: Status.ReturnStatusMessage(19),
					});
				}
			}
		}),
	
	ReturnAWSCredentials: () => ({
		authMOSAPISLSAdminAccessKeyID: process.env.authMOSAPISLSAdminAccessKeyID,
		authMOSAPISLSAdminSecretAccessKey: process.env.authMOSAPISLSAdminSecretAccessKey,
	}),
	
};
