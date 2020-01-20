/**
 * @name MSGraph
 * @service
 * @description Query the Microsoft Graph API
 */

const axios = require('axios');
const qs = require('qs');
// const { Client } = require('@microsoft/microsoft-graph-client');
// const { Auth } = require('./auth.ts');

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
			// get a promise to an access token
			axios.post(config.uri, config.body, config.options)
				// if the promise is resolved
				.then((result) => {
					// console.log('token');
					// console.log(result.data.access_token);
					// console.log(result.status);
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
					// console.log('token error');
					// console.log(error);
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
			timeout: 5000,
		},
	}),
	
	ReturnDataFromGraph: (endpointToken) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to get an access token
			module.exports.ReturnGraphAccessToken()
				// if the promise is resolved with the token
				.then((accessTokenResult) => {
					// console.log('accessTokenResult');
					// console.log(accessTokenResult.accessToken);
					// if status indicates success
					const config = module.exports.ReturnGraphQueryConfig(
						endpointToken,
						accessTokenResult.accessToken,
					);
					// console.log('config');
					// console.log(config);
					// get a promise to an access token
					axios.get(
						config.uri, 
						config.options,
					)
						// if the promise is resolved
						.then((dataResult) => {
							// console.log('usersResult');
							// console.log(result.data.access_token);
							// console.log(usersResult.status);
							// if status indicates success
							if (dataResult.status === 200) {
								// resolve this promise with the list items
								// console.log(usersResult.data.value);
								resolve({
									error: false,
									data: dataResult.data.value,
								});
								// if status indicates other than success
							} else {
								// create a generic error
								const errorToReport = {
									error: true,
									msGraphError: true,
									msGraphEndpoint: endpointToken,
									msGraphStatus: dataResult.status,
								};
									// reject this promise with the error
								reject(errorToReport);
							}
						})
						// if the promise is rejected with an error, 
						.catch((dataError) => {
							// console.log('dataError');
							// console.log(dataError);
							// create a generic error
							const errorToReport = {
								error: true,
								msGraphError: 'data',
								msGraphErrorDetails: dataError,
							};
								// reject this promise with an error
							reject(errorToReport);
						});
				})
				// if the promise is rejected with an error, 
				.catch((tokenError) => {
					// console.log('error');
					// console.log(error);
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
