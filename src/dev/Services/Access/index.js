/**
 * @name Access
 * @service
 * @description Performs all access-related operations.
 */

const DataQueries = require('data-queries');

module.exports = {

	/**
	 * @name XXX
	 * @function
	 * @description XXX
	 * @param {XXX} XXX
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
	
};
