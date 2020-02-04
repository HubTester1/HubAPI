/**
 * @name Health
 * @api
 * @description XXX
 */

const DataQueries = require('data-queries');

module.exports = {

	/**
	 * @name XXX
	 * @function
	 * @async
	 * @description XXX
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
	 * @name XXX
	 * @function
	 * @async
	 * @description XXX
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
	 * @name XXX
	 * @function
	 * @async
	 * @description XXX
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
	 * @name XXX
	 * @function
	 * @async
	 * @description XXX
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
