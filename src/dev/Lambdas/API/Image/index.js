/**
 * @name Image
 * @service
 * @description XXXXXXXXXXXXXXXXXXXXXXXXXXX
 */

const axios = require('axios');
const qs = require('qs');
// const parser = require('lambda-multipart-parser');
const Utilities = require('utilities');
const Response = require('response');

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

	ReturnGraphQueryConfig: (endpointToken, accessToken, contentType) => {
		const config = {
			uri: `https://graph.microsoft.com/v1.0/${endpointToken}`,
			options: {
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
				timeout: 30000,
			},
		};
		if (contentType) {
			config.options.headers['Content-Type'] = contentType;
		}
		return config;
	},

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
						// set up container for return data
						let returnData;
						// if data contains a value property
						if (dataResult.data && dataResult.data.value) {
							returnData = dataResult.data.value;
						} else {
							returnData = dataResult.data;
						}
						// resolve this promise with the list items
						resolve({
							error: false,
							onePage: returnData,
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
					let allValues;
					// set up recursive function to get all pages of employees
					const AttemptToGetOnePageOfDataFromGraph = (attemptConfig = baseConfig) => {
						// get a promise to retrieve one page of employees
						module.exports.ReturnOnePageOfDataFromGraph(attemptConfig)
							// if the promise is resolved
							.then((dataResult) => {
								// if onePage and allValues are both non-empty arrays
								if (
									typeof dataResult.onePage !== 'undefined' && 
									dataResult.onePage[0] && 
									typeof allValues !== 'undefined' && 
									allValues[0]
								) {
									// add onePage array items to allValues
									allValues = [...allValues, ...dataResult.onePage];
								// if onePage and allValues are NOT both non-empty arrays
								} else {
									// set allValues to onePage
									allValues = dataResult.onePage;
								}
								// if a nextLink was returned
								if (dataResult.nextLink) {
									// make another attempt
									const newAttemptConfig = JSON.parse(JSON.stringify(attemptConfig));
									newAttemptConfig.uri = dataResult.nextLink;
									AttemptToGetOnePageOfDataFromGraph(newAttemptConfig);
								// if we've reached the end of the pages
								} else {
									// resolve this promise with allValues
									resolve({
										error: false,
										allValues,
									});
								}
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

	// SHAREPOINT & ONEDRIVE SHORTHANDS & EXAMPLES
	
	// NO PROD
	ReturnAllDrivesInRootSite: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to get the data
			module.exports.ReturnAllSpecifiedDataFromGraph(
				'sites/bmos.sharepoint.com,1126b168-bc22-457b-b1f5-dbec6aee1011,3d7301a7-d5b8-4975-8182-c64cd5ac1bc2/drives',
			)
				// if the promise is resolved with a result
				.then((result) => {
					// then resolve this promise with the result
					resolve(result);
				})
				// if the promise is rejected with an error
				.catch((error) => {
					// reject this promise with the error
					reject(error);
				});
		}),

	ReturnDrive: (driveID) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// driveID = 'b!aLEmESK8e0Wx9dvsau4QEacBcz241XVJgYLGTNWsG8K1KDjrFWLwRKe1-plsdrQ0';
			// get a promise to get the data
			module.exports.ReturnAllSpecifiedDataFromGraph(
				`drives/${driveID}`,
			)
				// if the promise is resolved with a result
				.then((result) => {
					// then resolve this promise with the result
					resolve(result);
				})
				// if the promise is rejected with an error
				.catch((error) => {
					// reject this promise with the error
					reject(error);
				});
		}),

	ReturnAllDriveImmediateChildren: (driveID) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to get the data
			module.exports.ReturnAllSpecifiedDataFromGraph(
				`drives/${driveID}/root/children`,
			)
				// if the promise is resolved with a result
				.then((result) => {
					// then resolve this promise with the result
					resolve(result);
				})
				// if the promise is rejected with an error
				.catch((error) => {
					// reject this promise with the error
					reject(error);
				});
		}),

	ReturnAllListsInRootSite: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to get the data
			module.exports.ReturnAllSpecifiedDataFromGraph(
				'sites/bmos.sharepoint.com,1126b168-bc22-457b-b1f5-dbec6aee1011,3d7301a7-d5b8-4975-8182-c64cd5ac1bc2/lists',
			)
				// if the promise is resolved with a result
				.then((result) => {
					// then resolve this promise with the result
					resolve(result);
				})
				// if the promise is rejected with an error
				.catch((error) => {
					// reject this promise with the error
					reject(error);
				});
		}),

	ReturnList: (siteID, listID) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to get the data
			module.exports.ReturnAllSpecifiedDataFromGraph(
				`sites/${siteID}/lists/${listID}`,
			)
				// if the promise is resolved with a result
				.then((result) => {
					// then resolve this promise with the result
					resolve(result);
				})
				// if the promise is rejected with an error
				.catch((error) => {
					// reject this promise with the error
					reject(error);
				});
		}),

	ReturnListItemsMetadata: (siteID, listID) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to get the data
			module.exports.ReturnAllSpecifiedDataFromGraph(
				`sites/${siteID}/lists/${listID}/items`,
			)
				// if the promise is resolved with a result
				.then((result) => {
					// then resolve this promise with the result
					resolve(result);
				})
				// if the promise is rejected with an error
				.catch((error) => {
					// reject this promise with the error
					reject(error);
				});
		}),

	ReturnListItemContent: (siteID, listID, itemID) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// siteID = 'bmos.sharepoint.com,1126b168-bc22-457b-b1f5-dbec6aee1011,3d7301a7-d5b8-4975-8182-c64cd5ac1bc2';
			// listID = '667c546a-4102-4872-97af-15eb1ce83d85';
			// itemID = '1';
			// get a promise to get the data
			module.exports.ReturnAllSpecifiedDataFromGraph(
				`sites/${siteID}/lists/${listID}/items/${itemID}`,
			)
				// if the promise is resolved with a result
				.then((result) => {
					// then resolve this promise with the result
					resolve(result);
				})
				// if the promise is rejected with an error
				.catch((error) => {
					// reject this promise with the error
					reject(error);
				});
		}),

	CreateFolderInDrive: (driveID, parentID, folderName) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// driveID = 'b!aLEmESK8e0Wx9dvsau4QEacBcz241XVJgYLGTNWsG8K1KDjrFWLwRKe1-plsdrQ0';
			// folderName = '1007';
			// parentID = '01OO6BYSV6Y2GOVW7725BZO354PWSELRRZ';
			// get a promise to get an access token
			module.exports.ReturnGraphAccessToken()
				// if the promise is resolved with the token
				.then((accessTokenResult) => {
					const config = module.exports.ReturnGraphQueryConfig(
						`drives/${driveID}/items/${parentID}/children`,
						accessTokenResult.accessToken,
					);
					config.body = {
						name: folderName,
						folder: {},
						'@microsoft.graph.conflictBehavior': 'rename',
					};
					axios.post(config.uri, config.body, config.options)
						// if the promise is resolved
						.then((createResult) => {
							// if status indicates success
							if (createResult.status === 201) {
								// resolve this promise with the list items
								resolve({
									error: false,
									msGraphURI: config.uri,
									requestedName: folderName,
									createdName: createResult.data.name,
									createdID: createResult.data.id,
									folderData: createResult.data,
								});
								// if status indicates other than success
							} else {
								// create a generic error
								const errorToReport = {
									error: true,
									msGraphError: true,
									msGraphURI: config.uri,
									msGraphStatus: createResult.status,
								};
								// reject this promise with the error
								reject(errorToReport);
							}
						})
						// if the promise is rejected with an error
						.catch((createError) => {
							// create a generic error
							const errorToReport = {
								error: true,
								msGraphError: 'send',
								msGraphErrorDetails: createError,
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

	ReturnFolderExistsInDrive: (driveID, folderName) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// set up flag indicating that folder does not exist in drive
			let folderExists = false;
			let folderData;
			// get a promise to get the data
			module.exports.ReturnAllDriveImmediateChildren(driveID)
				// if the promise is resolved with a result
				.then((driveChildrenResult) => {
					// iterate over all drive children
					driveChildrenResult.allValues.forEach((childObject) => {
						// if this child's name matches the name of the folder in question
						if (childObject.name === folderName) {
							// change flag to indicate folder exists
							folderExists = true;
							folderData = childObject;
						}
					});
					// then resolve this promise with the result
					resolve({
						error: false,
						folderExists,
						folderData,
					});
				})
				// if the promise is rejected with an error
				.catch((driveChildrenError) => {
					// reject this promise with the error
					reject(driveChildrenError);
				});
		}),

	CreateFolderInDriveIfNonexistent: (driveID, parentID, folderName) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to get an access token
			module.exports.ReturnGraphAccessToken()
				// if the promise is resolved with the token
				.then((accessTokenResult) => {
					// get a promise to return flag indicating folder's existence
					module.exports.ReturnFolderExistsInDrive(driveID, folderName)
						// if the promise is resolved
						.then((folderExistsResult) => {
							// if flag indicates folder does not exist
							if (!folderExistsResult.folderExists) {
								// get a promise to 
								module.exports.CreateFolderInDrive(driveID, parentID, folderName)
									// if the promise is resolved with a result
									.then((createFolderResult) => {
										resolve(createFolderResult);
									})
									// if the promise is rejected with an error
									.catch((createFolderError) => {
										// reject this promise with the error
										reject(createFolderError);
									});
							} else {
								// then resolve this promise with the result
								resolve({
									error: false,
									folderData: folderExistsResult.folderData,
								});
							}
						})
						// if the promise is rejected with an error
						.catch((folderExistsError) => {
							// create a generic error
							const errorToReport = {
								error: true,
								msGraphError: 'create folder',
								msGraphErrorDetails: folderExistsError,
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

	CreateFileInDrive: (driveID, parentID, fileName, fileContent, contentType) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to get an access token
			module.exports.ReturnGraphAccessToken()
				// if the promise is resolved with the token
				.then((accessTokenResult) => {
					const config = module.exports.ReturnGraphQueryConfig(
						`drives/${driveID}/items/${parentID}:/${fileName}:/content`,
						accessTokenResult.accessToken,
						contentType,
					);
					config.body = fileContent;
					axios.put(config.uri, config.body, config.options)
						// if the promise is resolved
						.then((createResult) => {
							// if status indicates success
							if (createResult.status === 201) {
								// resolve this promise with the list items
								resolve({
									error: false,
									msGraphURI: config.uri,
									fileName,
									createResult,
								});
								// if status indicates other than success
							} else {
								// create a generic error
								const errorToReport = {
									error: true,
									msGraphError: true,
									msGraphURI: config.uri,
									msGraphStatus: createResult.status,
								};
								// reject this promise with the error
								reject(errorToReport);
							}
						})
						// if the promise is rejected with an error
						.catch((createError) => {
							// create a generic error
							const errorToReport = {
								error: true,
								msGraphError: 'send',
								msGraphErrorDetails: createError,
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


	ReceiveImage: (event, context) =>
		// return a new promise
		new Promise((resolve, reject) => {
			console.log('----------- body -----------');
			console.log(event.body);
			console.log('----------- event -----------');
			console.log(event);
			console.log('----------- context -----------');
			console.log(context);
			
			Response.HandleResponse({
				statusCode: 200,
				responder: resolve,
				content: {
					body: event.body,
					event,
					context,
				},
			});

			/* const driveID = 'b!aLEmESK8e0Wx9dvsau4QEacBcz241XVJgYLGTNWsG8K1KDjrFWLwRKe1-plsdrQ0';
			const parentID = '01OO6BYSV6Y2GOVW7725BZO354PWSELRRZ';
			const fileName = 'ducks.jpg';
			const fileContent = event.body;
			// get a promise to 
			module.exports.CreateFileInDrive(driveID, parentID, fileName, fileContent, 'image/jpeg')
			// if the promise is resolved with a result
				.then((fileResult) => {
					// send indicative response
					Response.HandleResponse({
						statusCode: 200,
						responder: resolve,
						content: {
							fileResult,
							body: event.body,
							event,
							context,
						},
					});
				})
			// if the promise is rejected with an error
				.catch((fileError) => {
					// send indicative response
					Response.HandleResponse({
						statusCode: 500,
						responder: resolve,
						content: {
							parsingResult,
							folderResult,
							fileError,
							fileCreationResults,
							body: event.body,
							event,
							context,
						},
					});
				}); */
		}),

	/* ReceiveImage: (event, context) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to 
			parser.parse(event)
				// if the promise is resolved with a result
				.then((parsingResult) => {
					const driveID = 'b!aLEmESK8e0Wx9dvsau4QEacBcz241XVJgYLGTNWsG8K1KDjrFWLwRKe1-plsdrQ0';
					const parentID = '01OO6BYSV6Y2GOVW7725BZO354PWSELRRZ';
					// const folderName = parsingResult.messageID;
					// const filesToCreate = parsingResult.files.length;
					const folderName = parsingResult.messageID;
					const filesToCreate = parsingResult.files.length;
					const fileCreationResults = [];
					// get a promise to 
					module.exports.CreateFolderInDriveIfNonexistent(driveID, parentID, folderName)
						// if the promise is resolved with a result
						.then((folderResult) => {
							parsingResult.files.forEach((fileObject) => {								
								const fileName = fileObject.filename;
								const fileContent = fileObject.content;
								const folderID = folderResult.createdID;
								// get a promise to 
								module.exports.CreateFileInDrive(driveID, folderID, fileName, fileContent, 'image/jpeg')
									// if the promise is resolved with a result
									.then((fileResult) => {
										fileCreationResults.push(fileResult);
										if (fileCreationResults.length === filesToCreate) {
											// send indicative response
											Response.HandleResponse({
												statusCode: 200,
												responder: resolve,
												content: {
													parsingResult,
													folderResult,
													fileCreationResults,
													body: event.body,
													event,
													context,
												},
											});
										}
									})
									// if the promise is rejected with an error
									.catch((fileError) => {
										// send indicative response
										Response.HandleResponse({
											statusCode: 500,
											responder: resolve,
											content: {
												parsingResult,
												folderResult,
												fileError,
												fileCreationResults,
												body: event.body,
												event,
												context,
											},
										});
									});
							});
						})
						// if the promise is rejected with an error
						.catch((folderError) => {
							// send indicative response
							Response.HandleResponse({
								statusCode: 500,
								responder: resolve,
								content: {
									parsingResult,
									folderError,
									body: event.body,
									event,
									context,
								},
							});
						});
				})
				// if the promise is rejected with an error
				.catch((parsingError) => {
					// send indicative response
					Response.HandleResponse({
						statusCode: 500,
						responder: resolve,
						content: {
							parsingError,
							body: event.body,
							event,
							context,
						},
					});
				});
		}), */


};
