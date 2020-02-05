/**
 * @name Health
 * @service
 * @description Performs all health-related operations.
 */

const DataQueries = require('data-queries');

module.exports = {
	

	/**
	 * @name ReturnHealthSettingsData
	 * @function
	 * @async
	 * @description Return all health settings 
	 * (all docs from the 'healthSettings' collection).
	 */

	ReturnHealthSettingsData: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve the documents
			DataQueries.ReturnAllDocsFromCollection('healthSettings')
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

	/**
	 * @name ReturnHealthFromDB
	 * @function
	 * @async
	 * @description Return health flag
	 * (all docs from the 'health' collection).
	 */
	
	ReturnHealthFromDB: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve all documents
			DataQueries.ReturnAllDocsFromCollection('health')
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
	 * @name ReturnHealth
	 * @function
	 * @async
	 * @description Return health status.
	 * Most / all client requests will be prevented if 'healthy'
	 * is set to false; clients should check for system health
	 * prior to implicitly promising users normal affordances.
	 *(This is separate from ReturnHealthFromDB() because we may want to
	 * check health in different or additional ways in the future.)
	 */
	
	ReturnHealth: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve health setting from DB
			module.exports.ReturnHealthFromDB()
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
	
};
