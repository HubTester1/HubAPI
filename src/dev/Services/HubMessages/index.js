/**
 * @name XXX
 * @service
 * @description XXX
 */

const DataQueries = require('data-queries');

module.exports = {

	/**
	 * @name ReturnHubMessagesSettings
	 * @function
	 * @description Return all Hub Messages settings
	 * (all docs from the 'hubMessagesSettings' collection).
	 */

	ReturnHubMessagesSettings: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve the documents
			DataQueries.ReturnAllDocsFromCollection('hubMessagesSettings')
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
	 * @name ReturnHealthWhitelistedDomains
	 * @function
	 * @async
	 * @description Return the setting indicating the domains from which requests are accepted.
	 * Add a domain to this setting in database to allow requests from an additional domain.
	 */

	ReturnHealthWhitelistedDomains: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve all email settings
			module.exports.ReturnHealthSettingsData()
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

};
