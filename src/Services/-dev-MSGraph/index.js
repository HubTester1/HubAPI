/**
 * @name MSGraph
 * @service
 * @description Query the Microsoft Graph API
 */

const axios = require('axios');
const qs = require('qs');
const Utilities = require('utilities');


if (process.env.NODE_ENV === 'local') {
	// eslint-disable-next-line global-require
	const dotenv = require('dotenv');
	dotenv.config({ path: '../../../.env' });
}

module.exports = {

	ReturnGraphAuthorizationConfig: (page) => ({
		uri: `https://login.microsoftonline.com/${process.env.graphTenantID}/oauth2/v2.0/token`,
		body: qs.stringify({
			grant_type: 'client_credentials',
			client_id: process.env.graphClientID,
			client_secret: process.env.graphClientSecret,
			scope: 'https://graph.microsoft.com/.default',
		}),
		options: {
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			timeout: 5000,
		},
	}),
	
	ReturnGraphAccessToken: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get URI and options
			const config = module.exports.ReturnGraphAuthorizationConfig();
			// get a promise to get an access token
			axios.post(config.uri, config.body, config.options)
				// if the promise is resolved
				.then((result) => {
					// if status indicates success
					if (result.status === 200) {
						// resolve this promise with the list items
						resolve({
							error: false,
							accessToken: result.data.access_token,
						});
					// if status indicates other than success
					} else {
						// create a generic error
						const errorToReport = {
							error: true,
							msGraphError: true,
							msGraphStatus: result.status,
						};
						// reject this promise with the error
						reject(errorToReport);
					}
				})
				// if the promise is rejected with an error, 
				.catch((error) => {
					// create a generic error
					const errorToReport = {
						error: true,
						msGraphError: true,
						msGraphErrorDetails: error,
					};
					// reject this promise with an error
					reject(errorToReport);
				});
		}),

	ReturnGraphQueryConfig: (endpointToken, accessToken) => ({
		uri: `https://graph.microsoft.com/v1.0/${endpointToken}`,
		options: {
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
			timeout: 30000,
		},
	}),

	ReturnOnePageOfDataFromGraph: (config) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to an access token
			axios.get(
				config.uri,
				config.options,
			)
				// if the promise is resolved
				.then((dataResult) => {
					// if status indicates success
					if (dataResult.status === 200) {
						// resolve this promise with the list items
						resolve({
							error: false,
							onePage: dataResult.data.value,
							nextLink: dataResult.data['@odata.nextLink'],
						});
						// if status indicates other than success
					} else {
						// create a generic error
						const errorToReport = {
							error: true,
							msGraphError: true,
							msGraphURI: config.uri,
							msGraphStatus: dataResult.status,
						};
						// reject this promise with the error
						reject(errorToReport);
					}
				})
				// if the promise is rejected with an error
				.catch((dataError) => {
					// create a generic error
					const errorToReport = {
						error: true,
						msGraphError: 'data',
						msGraphErrorDetails: dataError,
					};
					// reject this promise with an error
					reject(errorToReport);
				});
		}),
		
	ReturnAllSpecifiedDataFromGraph: (endpointToken) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to get an access token
			module.exports.ReturnGraphAccessToken()
				// if the promise is resolved with the token
				.then((accessTokenResult) => {
					// if status indicates success
					const baseConfig = module.exports.ReturnGraphQueryConfig(
						endpointToken,
						accessTokenResult.accessToken,
					);
					let allValues = [];
					// set up recursive function to get all pages of employees
					const AttemptToGetOnePageOfDataFromGraph = (attemptConfig = baseConfig) => {
						// get a promise to retrieve one page of employees
						module.exports.ReturnOnePageOfDataFromGraph(attemptConfig)
							// if the promise is resolved
							.then((dataResult) => {
								// if a page of employees was returned
								if (dataResult.nextLink) {
									// add the page of employees to allEmployees
									allValues = [...allValues, ...dataResult.onePage];
									// make another attempt
									const newAttemptConfig = JSON.parse(JSON.stringify(attemptConfig));
									newAttemptConfig.uri = dataResult.nextLink;
									AttemptToGetOnePageOfDataFromGraph(newAttemptConfig);
									// if we've reached the end of the pages
								} else {
									// add the page of employees to allEmployees
									allValues = [...allValues, ...dataResult.onePage];
									// resolve this promise with all of the employees
									resolve({
										error: false,
										allValues,
									});
								}


								/* resolve({
										error: false,
										data: dataResult.data.value,
									}); */
							})
							// if the promise is rejected with an error, 
							.catch((dataError) => {
								// create a generic error
								const errorToReport = {
									error: true,
									msGraphError: 'data',
									msGraphErrorDetails: dataError,
								};
									// reject this promise with an error
								reject(errorToReport);
							});
					};
					// start the first attempt to get a page of employees
					AttemptToGetOnePageOfDataFromGraph();
				})
				// if the promise is rejected with an error, 
				.catch((tokenError) => {
					// create a generic error
					const errorToReport = {
						error: true,
						msGraphError: 'token',
						msGraphErrorDetails: tokenError,
					};
					// reject this promise with an error
					reject(errorToReport);
				});
		}),
		
	SendEmailToGraph: (emailData) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to get an access token
			module.exports.ReturnGraphAccessToken()
				// if the promise is resolved with the token
				.then((accessTokenResult) => {
					// extract sender
					const senderFormatted = 
						Utilities.ReturnTerseEmailAddressFromFriendly(emailData.from);
					const recipientsFormatted = [];
					// if to property is array
					if (typeof (emailData.to) === 'object') {
						emailData.to.forEach((recipient) => {
							recipientsFormatted.push({
								emailAddress: {
									address: Utilities.ReturnTerseEmailAddressFromFriendly(recipient),
								},
							});
						});
					}
					// if to property is string
					if (typeof (emailData.to) === 'string') {
						recipientsFormatted.push({
							emailAddress: {
								address: Utilities.ReturnTerseEmailAddressFromFriendly(emailData.to),
							},
						});
					}
					const bodyFormatted = {};
					if (emailData.html) {
						bodyFormatted.contentType = 'HTML';
						bodyFormatted.content = emailData.html;
					}
					if (emailData.text) {
						bodyFormatted.contentType = 'text';
						bodyFormatted.content = emailData.text;
					}
					const config = module.exports.ReturnGraphQueryConfig(
						`users/${senderFormatted}/sendMail`,
						accessTokenResult.accessToken,
					);
					config.body = {
						message: {
							subject: `${emailData.subject}`,
							body: bodyFormatted,
							toRecipients: recipientsFormatted,
						},
					};
					axios.post(config.uri, config.body, config.options)
						// if the promise is resolved
						.then((sendResult) => {
							// if status indicates success
							if (sendResult.status === 202) {
								// resolve this promise with the list items
								resolve({
									error: false,
									emailData,
								});
							// if status indicates other than success
							} else {
								// create a generic error
								const errorToReport = {
									error: true,
									msGraphError: true,
									msGraphURI: config.uri,
									msGraphStatus: sendResult.status,
								};
								// reject this promise with the error
								reject(errorToReport);
							}
						})
						// if the promise is rejected with an error
						.catch((sendError) => {
							// create a generic error
							const errorToReport = {
								error: true,
								msGraphError: 'send',
								msGraphErrorDetails: sendError,
							};
							// reject this promise with an error
							reject(errorToReport);
						});
				})
				// if the promise is rejected with an error, 
				.catch((tokenError) => {
					// create a generic error
					const errorToReport = {
						error: true,
						msGraphError: 'token',
						msGraphErrorDetails: tokenError,
					};
					// reject this promise with an error
					reject(errorToReport);
				});
		}),

};
